import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AlphabetOverlay } from '@/components/gugu/AlphabetOverlay';
import { BackButton } from '@/components/gugu/BackButton';
import { GuguIconButton } from '@/components/gugu/GuguIconButton';
import { SuccessCelebration } from '@/components/gugu/SuccessCelebration';
import { TracingCanvas } from '@/features/tracing/TracingCanvas';
import { TracingSceneBackground } from '@/features/tracing/TracingSceneBackground';
import { getTracingLetter, getTracingLetters } from '@/data/tracing';
import { audioManager } from '@/services/audio';
import { markTracingComplete } from '@/services/progress';
import { GuguColors } from '@/constants/gugu';
import { HomeSpace } from '@/features/home/homeLayout';
import type { LetterCase } from '@/types/tracing';

const BOY_ASPECT = 900 / 618;
const BOARD_ASPECT = 1.08;

type TracingSessionProps = {
  letterCase: LetterCase;
};

function SpeakerGlyph({ muted, size }: { muted: boolean; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3.5 9.2h3.1L11 5.8v12.4L6.6 14.8H3.5c-.6 0-1-.4-1-1V10.2c0-.6.4-1 1-1Z" fill={GuguColors.ink} />
      {!muted ? (
        <Path
          d="M14.2 8.2c1.2 1.1 1.9 2.5 1.9 3.8s-.7 2.7-1.9 3.8M16.8 6.2c1.9 1.7 3 3.7 3 5.8s-1.1 4.1-3 5.8"
          stroke={GuguColors.ink}
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <Path d="M15.2 9.2 20 14M20 9.2l-4.8 4.8" stroke={GuguColors.ink} strokeWidth="2.2" strokeLinecap="round" />
      )}
    </Svg>
  );
}

function ResetGlyph({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7.2 7.4A7 7 0 1 1 5 12" stroke={GuguColors.ink} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <Path d="M7.4 4.6v4.2H3.4" stroke={GuguColors.ink} strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function PrevGlyph({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M14.8 5.2 7.4 12 14.8 18.8"
        stroke={GuguColors.ink}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function NextGlyph({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M9.2 5.2 16.6 12 9.2 18.8"
        stroke={GuguColors.ink}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function TracingSession({ letterCase }: TracingSessionProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const letters = useMemo(() => getTracingLetters(letterCase), [letterCase]);
  const [index, setIndex] = useState(0);
  const [resetToken, setResetToken] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showDemo, setShowDemo] = useState(true);
  const [voiceOn, setVoiceOn] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [celebrateKey, setCelebrateKey] = useState(0);
  const letter = getTracingLetter(letterCase, index);
  const bounce = useSharedValue(1);
  const lastHint = useRef<string | null>(null);
  const celebrateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const celebratedRef = useRef(false);

  const padLeft = Math.max(insets.left, HomeSpace.md);
  const padRight = Math.max(insets.right, HomeSpace.md);
  const padTop = Math.max(insets.top, HomeSpace.sm);
  const padBottom = Math.max(insets.bottom, HomeSpace.md);
  const backSize = Math.min(56, Math.max(48, height * 0.1));
  const controlSize = Math.min(48, Math.max(42, height * 0.086));
  const glyph = Math.round(controlSize * 0.46);
  const leftWidth = width * 0.22;
  const boyMaxH = height * 0.62;
  const boyMaxW = leftWidth - padLeft;
  const boyHeight = Math.min(boyMaxH, boyMaxW * BOY_ASPECT);
  const boyWidth = boyHeight / BOY_ASPECT;

  const rightWidth = width - leftWidth;
  const boardAvailW = rightWidth - padRight;
  const boardAvailH = height - padTop - padBottom;
  const boardWidth = Math.min(boardAvailW * 0.98, boardAvailH * BOARD_ASPECT);
  const boardHeight = Math.min(boardAvailH, boardWidth / BOARD_ASPECT);
  const canGoPrev = index > 0;

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounce.value }],
  }));

  useEffect(() => {
    void audioManager.init().then(() => setVoiceOn(audioManager.isVoiceEnabled()));
    return () => {
      audioManager.stop();
      if (celebrateTimer.current) clearTimeout(celebrateTimer.current);
    };
  }, []);

  const clearCelebrateTimers = () => {
    if (celebrateTimer.current) {
      clearTimeout(celebrateTimer.current);
      celebrateTimer.current = null;
    }
    audioManager.cancelDrawCompletion();
  };

  const loadLetter = useCallback(
    (nextIndex: number) => {
      clearCelebrateTimers();
      celebratedRef.current = false;
      setCelebrateKey(0);
      setIndex(nextIndex);
      setCompleted(false);
      setShowDemo(true);
      lastHint.current = null;
      bounce.value = 1;
      setResetToken((value) => value + 1);
    },
    [bounce],
  );

  const onHint = useCallback((value: string | null) => {
    // Soft retry cue only — no on-board instruction text.
    if (value === 'Try again 😊' && lastHint.current !== value) {
      audioManager.playRetry();
    }
    lastHint.current = value;
  }, []);

  const onLetterComplete = useCallback(() => {
    if (celebratedRef.current) return;
    celebratedRef.current = true;
    setCompleted(true);
    setShowDemo(false);
    bounce.value = withSequence(withSpring(1.1, { damping: 7 }), withSpring(1));
    setCelebrateKey((value) => value + 1);
    void markTracingComplete(letterCase, letter.character);
    clearCelebrateTimers();
    void audioManager.playDrawCompletion(letter.character);
  }, [bounce, letter.character, letterCase]);

  const resetTrace = () => {
    clearCelebrateTimers();
    celebratedRef.current = false;
    setCelebrateKey(0);
    setCompleted(false);
    setShowDemo(true);
    lastHint.current = null;
    bounce.value = 1;
    setResetToken((value) => value + 1);
  };

  const goPrev = () => {
    if (!canGoPrev) return;
    loadLetter(index - 1);
    audioManager.playTap();
  };

  const goNext = () => {
    loadLetter((index + 1) % letters.length);
    audioManager.playTap();
  };

  const toggleVoice = () => {
    const next = !audioManager.isVoiceEnabled();
    void audioManager.setVoiceEnabled(next);
    setVoiceOn(next);
    audioManager.playTap();
  };

  return (
    <View style={styles.root}>
      <TracingSceneBackground />

      <View style={[styles.page, { paddingTop: padTop, paddingBottom: padBottom }]}>
        <View style={[styles.left, { width: leftWidth, paddingLeft: padLeft }]}>
          <BackButton size={backSize} onPress={() => router.back()} />
          <View style={styles.boyStage} pointerEvents="none">
            <Image
              source={require('@/assets/images/draw-gugu-boy.png')}
              style={{ width: boyWidth, height: boyHeight, transform: [{ scaleX: -1 }] }}
              contentFit="contain"
              accessibilityLabel="GuGu"
            />
          </View>
        </View>

        <View style={[styles.right, { paddingRight: padRight }]}>
          <View style={styles.boardWrap}>
            <Animated.View style={[styles.boardOuter, { width: boardWidth, height: boardHeight }, bounceStyle]}>
              <View style={styles.boardInner}>
                <View style={styles.boardBody}>
                  <View style={styles.drawColumn}>
                    <View style={styles.drawArea}>
                      <TracingCanvas
                        letter={letter}
                        resetToken={resetToken}
                        showDemo={showDemo && !completed}
                        onHint={onHint}
                        onLetterComplete={onLetterComplete}
                        onInteractionStart={() => setShowDemo(false)}
                        onStrokeActivated={() => setShowDemo(true)}
                      />
                    </View>
                  </View>

                  <View style={styles.controlRail}>
                    <GuguIconButton
                      size={controlSize}
                      onPress={toggleVoice}
                      accessibilityLabel={voiceOn ? 'Voice on' : 'Voice off'}>
                      <SpeakerGlyph muted={!voiceOn} size={glyph} />
                    </GuguIconButton>
                    <GuguIconButton size={controlSize} onPress={resetTrace} accessibilityLabel="Reset Trace">
                      <ResetGlyph size={glyph} />
                    </GuguIconButton>
                    <GuguIconButton
                      size={controlSize}
                      onPress={goPrev}
                      disabled={!canGoPrev}
                      accessibilityLabel="Previous Letter">
                      <PrevGlyph size={glyph} />
                    </GuguIconButton>
                    <GuguIconButton size={controlSize} onPress={goNext} accessibilityLabel="Next Letter">
                      <NextGlyph size={glyph} />
                    </GuguIconButton>
                    <GuguIconButton size={controlSize} onPress={() => setPickerOpen(true)} accessibilityLabel="Choose letter">
                      <View style={{ width: glyph + 4, height: glyph + 4, alignItems: 'center', justifyContent: 'center' }}>
                        <Image
                          source={require('@/assets/images/letter-pick-icon.png')}
                          style={{ width: glyph + 4, height: glyph + 4 }}
                          contentFit="contain"
                        />
                      </View>
                    </GuguIconButton>
                  </View>
                </View>
              </View>
            </Animated.View>
          </View>
        </View>
      </View>

      <AlphabetOverlay
        visible={pickerOpen}
        letters={letters}
        selectedIndex={index}
        onSelect={(nextIndex) => {
          loadLetter(nextIndex);
          audioManager.playTap();
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />

      <SuccessCelebration playKey={celebrateKey} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GuguColors.sky,
  },
  page: {
    flex: 1,
    flexDirection: 'row',
  },
  left: {},
  boyStage: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  right: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardWrap: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardOuter: {
    borderRadius: 32,
    backgroundColor: '#D2A06A',
    padding: 10,
    shadowColor: '#2B3A4A',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  boardInner: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: '#F6E8C8',
    overflow: 'hidden',
  },
  boardBody: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 0,
  },
  drawColumn: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
  drawArea: {
    flex: 1,
    minHeight: 0,
    paddingTop: 22,
    paddingBottom: 22,
    paddingLeft: 22,
    paddingRight: 16,
    overflow: 'hidden',
  },
  controlRail: {
    width: 62,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 10,
    paddingRight: 8,
    paddingLeft: 4,
  },
});
