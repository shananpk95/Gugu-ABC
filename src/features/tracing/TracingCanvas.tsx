import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path, Polygon, Polyline } from 'react-native-svg';

import {
  beginTrace,
  createEngineState,
  directionArrow,
  moveTrace,
  endTrace,
  pointsToSvg,
  remainingGuideDots,
  samplesForProgress,
  visualStrokePath,
  type TracingEngineState,
} from '@/features/tracing/engine';
import { TRACE_VIEWBOX, type TraceLetter, type TracePoint } from '@/types/tracing';

const GUIDE_DOT = '#8A6A4A';
const FILL = '#F08A3A';
const OUTLINE = '#FBF3DC';
const CHANNEL = '#E8D3A8';
const ARROW = '#8B5A2B';

type TracingCanvasProps = {
  letter: TraceLetter;
  onHint?: (hint: string | null) => void;
  onLetterComplete?: () => void;
  onInteractionStart?: () => void;
  onStrokeActivated?: () => void;
  resetToken: number;
  showDemo: boolean;
};

type SamplePair = {
  x: number;
  y: number;
};

export function TracingCanvas({
  letter,
  onHint,
  onLetterComplete,
  onInteractionStart,
  onStrokeActivated,
  resetToken,
  showDemo,
}: TracingCanvasProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [engine, setEngine] = useState(() => createEngineState(letter));
  const engineRef = useRef(engine);
  const frameRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const strokeIndexRef = useRef(0);
  const demoProgress = useSharedValue(0);
  const demoVisible = useSharedValue(1);
  const demoSamples = useSharedValue<SamplePair[]>([]);
  const layout = useSharedValue({ scale: 1, ox: 0, oy: 0 });

  const scale = useMemo(() => {
    if (!size.width || !size.height) return 1;
    const fit = Math.min(size.width / TRACE_VIEWBOX.width, size.height / TRACE_VIEWBOX.height);
    return fit * 0.96;
  }, [size]);

  const offset = useMemo(() => {
    return {
      x: (size.width - TRACE_VIEWBOX.width * scale) / 2,
      y: (size.height - TRACE_VIEWBOX.height * scale) / 2,
    };
  }, [scale, size]);

  useEffect(() => {
    layout.value = { scale, ox: offset.x, oy: offset.y };
  }, [layout, offset.x, offset.y, scale]);

  useEffect(() => {
    demoVisible.value = showDemo ? 1 : 0;
  }, [demoVisible, showDemo]);

  useEffect(() => {
    const next = createEngineState(letter);
    engineRef.current = next;
    completedRef.current = false;
    strokeIndexRef.current = 0;
    setEngine(next);
    onHint?.(null);
    const first = next.strokes[0];
    demoSamples.value = first?.stroke.kind === 'path' ? first.samples : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letter, resetToken]);

  useEffect(() => {
    if (!showDemo || demoSamples.value.length < 2) {
      cancelAnimation(demoProgress);
      demoProgress.value = 0;
      return;
    }
    demoProgress.value = 0;
    demoProgress.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
      -1,
      false,
    );
    return () => {
      cancelAnimation(demoProgress);
    };
  }, [demoProgress, demoSamples, letter.id, resetToken, showDemo]);

  useEffect(() => {
    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
      cancelAnimation(demoProgress);
    };
  }, [demoProgress]);

  const toViewBox = useCallback(
    (x: number, y: number): TracePoint => ({
      x: (x - offset.x) / scale,
      y: (y - offset.y) / scale,
    }),
    [offset, scale],
  );

  const publish = useCallback(
    (next: TracingEngineState) => {
      engineRef.current = next;
      if (frameRef.current != null) return;
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        const current = engineRef.current;
        setEngine(current);
        onHint?.(current.hint);
        if (current.gestureActive) {
          onInteractionStart?.();
        }
        if (current.strokeIndex !== strokeIndexRef.current) {
          strokeIndexRef.current = current.strokeIndex;
          const stroke = current.strokes[current.strokeIndex];
          demoSamples.value = stroke?.stroke.kind === 'path' ? stroke.samples : [];
          if (!current.letterComplete) {
            onStrokeActivated?.();
          }
        }
        if (current.letterComplete && !completedRef.current) {
          completedRef.current = true;
          onLetterComplete?.();
        }
      });
    },
    [demoSamples, onHint, onInteractionStart, onLetterComplete, onStrokeActivated],
  );

  const onBegin = useCallback(
    (x: number, y: number) => {
      publish(beginTrace(engineRef.current, toViewBox(x, y)));
    },
    [publish, toViewBox],
  );

  const onUpdate = useCallback(
    (x: number, y: number) => {
      publish(moveTrace(engineRef.current, toViewBox(x, y)));
    },
    [publish, toViewBox],
  );

  const onEnd = useCallback(() => {
    publish(endTrace(engineRef.current));
  }, [publish]);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .shouldCancelWhenOutside(false)
        .onBegin((event) => {
          'worklet';
          runOnJS(onBegin)(event.x, event.y);
        })
        .onUpdate((event) => {
          'worklet';
          runOnJS(onUpdate)(event.x, event.y);
        })
        .onFinalize(() => {
          'worklet';
          runOnJS(onEnd)();
        }),
    [onBegin, onEnd, onUpdate],
  );

  const handStyle = useAnimatedStyle(() => {
    const points = demoSamples.value;
    if (demoVisible.value < 0.5 || points.length < 2) {
      return { opacity: 0 };
    }
    const max = points.length - 1;
    const at = demoProgress.value * max;
    const index = Math.min(max - 1, Math.max(0, Math.floor(at)));
    const local = at - index;
    const a = points[index];
    const b = points[index + 1] ?? a;
    const x = a.x + (b.x - a.x) * local;
    const y = a.y + (b.y - a.y) * local;
    const { scale: s, ox, oy } = layout.value;
    return {
      opacity: demoVisible.value,
      transform: [{ translateX: ox + x * s - 8 }, { translateY: oy + y * s - 4 }],
    };
  });

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  const active = engine.strokes[engine.strokeIndex];

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.canvas} onLayout={onLayout} collapsable={false}>
        {size.width > 0 ? (
          <Svg width={size.width} height={size.height}>
            <G transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>
              {engine.strokes.map((stroke) =>
                stroke.stroke.kind === 'path' ? (
                  <Path
                    key={`${stroke.stroke.id}-rim`}
                    d={visualStrokePath(stroke.stroke.points)}
                    fill="none"
                    stroke={OUTLINE}
                    strokeWidth={22}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <Circle
                    key={`${stroke.stroke.id}-rim`}
                    cx={stroke.samples[0].x}
                    cy={stroke.samples[0].y}
                    r={8}
                    fill="none"
                    stroke={OUTLINE}
                    strokeWidth={3}
                  />
                ),
              )}

              {engine.strokes.map((stroke) =>
                stroke.stroke.kind === 'path' ? (
                  <Path
                    key={`${stroke.stroke.id}-channel`}
                    d={visualStrokePath(stroke.stroke.points)}
                    fill="none"
                    stroke={CHANNEL}
                    strokeWidth={15}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <Circle
                    key={`${stroke.stroke.id}-channel`}
                    cx={stroke.samples[0].x}
                    cy={stroke.samples[0].y}
                    r={6}
                    fill={CHANNEL}
                  />
                ),
              )}

              {engine.strokes.map((stroke, index) => {
                const isActive = index === engine.strokeIndex && !stroke.complete;
                if (stroke.stroke.kind === 'dot') {
                  if (!stroke.complete) return null;
                  return (
                    <Circle
                      key={`${stroke.stroke.id}-fill`}
                      cx={stroke.samples[0].x}
                      cy={stroke.samples[0].y}
                      r={6}
                      fill={FILL}
                    />
                  );
                }
                if (!stroke.complete && !isActive) return null;
                if (stroke.complete) {
                  return (
                    <Path
                      key={`${stroke.stroke.id}-fill`}
                      d={visualStrokePath(stroke.stroke.points)}
                      fill="none"
                      stroke={FILL}
                      strokeWidth={13}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                }
                const fillPoints = samplesForProgress(stroke.samples, stroke.progress);
                if (fillPoints.length < 2) return null;
                return (
                  <Polyline
                    key={`${stroke.stroke.id}-fill`}
                    points={pointsToSvg(fillPoints)}
                    fill="none"
                    stroke={FILL}
                    strokeWidth={13}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })}

              {engine.strokes.map((stroke, index) => {
                const isActive = index === engine.strokeIndex && !stroke.complete && !engine.letterComplete;
                if (!isActive) return null;
                if (stroke.stroke.kind === 'dot') {
                  return (
                    <Circle
                      key={stroke.stroke.id}
                      cx={stroke.samples[0].x}
                      cy={stroke.samples[0].y}
                      r={2.8}
                      fill={GUIDE_DOT}
                      stroke="#FFF8EE"
                      strokeWidth={0.7}
                    />
                  );
                }
                return (
                  <G key={`${stroke.stroke.id}-guide`}>
                    {stroke.progress <= 0 && stroke.samples[0] ? (
                      <Circle
                        cx={stroke.samples[0].x}
                        cy={stroke.samples[0].y}
                        r={2.8}
                        fill={GUIDE_DOT}
                        stroke="#FFF8EE"
                        strokeWidth={0.7}
                      />
                    ) : null}
                    {remainingGuideDots(stroke.samples, stroke.progress, stroke.complete).map((point, dotIndex) => (
                      <Circle
                        key={`${stroke.stroke.id}-guide-${dotIndex}`}
                        cx={point.x}
                        cy={point.y}
                        r={1.35}
                        fill={GUIDE_DOT}
                      />
                    ))}
                  </G>
                );
              })}

              {active && !active.complete && active.stroke.kind === 'path'
                ? (() => {
                    const arrow = directionArrow(active.samples);
                    return arrow ? <Polygon points={arrow} fill={ARROW} /> : null;
                  })()
                : null}
            </G>
          </Svg>
        ) : null}

        <Animated.View pointerEvents="none" style={[styles.handWrap, handStyle]}>
          <Svg width={46} height={46} viewBox="0 0 46 46">
            <Ellipse cx="22" cy="34" rx="9" ry="6" fill="#E7B48A" />
            <Path
              d="M20 28 C 19 16, 21 8, 24 8 C 27 8, 28 14, 27 22 L 29 22 C 31 14, 33 13, 34 18 C 35 24, 32 29, 30 32 C 27 36, 18 36, 17 30 C 16 26, 18 24, 20 28 Z"
              fill="#F3C39A"
              stroke="#C48A5A"
              strokeWidth="1.2"
            />
            <Path d="M24 8 C 25 6, 27 6, 27 9" fill="none" stroke="#C48A5A" strokeWidth="1.2" />
          </Svg>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
  handWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 46,
    height: 46,
  },
});
