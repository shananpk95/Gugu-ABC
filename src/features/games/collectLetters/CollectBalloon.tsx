import { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { GuguColors } from '@/constants/gugu';

/** Basket Game only — mirrors kids-balloon look without touching Balloon Game components. */
const COLLECT_BALLOON_COLORS = [
  ['#FFB4A8', '#FF8B7B', '#E25A55'],
  ['#FFE9A8', '#FFE08A', '#E2C04A'],
  ['#C8F3DC', '#8FE0B8', '#5CB98A'],
  ['#BFE6F6', '#7EC8E3', '#4AA0C4'],
  ['#E6D9FF', '#D5C7F5', '#A994E0'],
  ['#FFD9C2', '#FFD3B6', '#F0A88A'],
  ['#FFC2E4', '#F48BC4', '#D45A9A'],
  ['#C9F08A', '#A8DC5A', '#7BB82A'],
] as const;

type CollectBalloonProps = {
  id: string;
  letter: string;
  colorIndex: number;
  size: number;
  homeX: number;
  homeY: number;
  collected: boolean;
  disabled: boolean;
  onDrop: (id: string, letter: string, centerX: number, centerY: number, reset: () => void) => void;
};

export function CollectBalloon({
  id,
  letter,
  colorIndex,
  size,
  homeX,
  homeY,
  collected,
  disabled,
  onDrop,
}: CollectBalloonProps) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const colors = COLLECT_BALLOON_COLORS[colorIndex % COLLECT_BALLOON_COLORS.length]!;
  const width = size;
  const height = size * 1.22;
  const stringH = Math.max(12, Math.round(size * 0.28));
  const totalH = height + 8 + stringH;

  useEffect(() => {
    x.value = 0;
    y.value = 0;
  }, [homeX, homeY, id, x, y]);

  const reset = () => {
    x.value = withSpring(0);
    y.value = withSpring(0);
  };

  const finish = (dx: number, dy: number) => {
    onDrop(id, letter, homeX + dx + size / 2, homeY + dy + height / 2, reset);
  };

  const pan = Gesture.Pan()
    .enabled(!collected && !disabled)
    .onUpdate((event) => {
      x.value = event.translationX;
      y.value = event.translationY;
    })
    .onEnd((event) => {
      runOnJS(finish)(event.translationX, event.translationY);
    });

  const style = useAnimatedStyle(() => ({
    zIndex: 12,
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  if (collected) {
    return null;
  }

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.wrap, { left: homeX, top: homeY, width, height: totalH }, style]}>
        <LinearGradient
          colors={[...colors]}
          locations={[0, 0.45, 1]}
          style={[styles.body, { width, height, borderRadius: width / 2 }]}>
          <View style={[styles.shine, { width: width * 0.28, height: height * 0.22 }]} />
          <Text style={[styles.letter, { fontSize: Math.round(size * 0.42) }]}>{letter}</Text>
        </LinearGradient>
        <View
          style={[
            styles.knot,
            {
              backgroundColor: colors[2],
              width: Math.max(8, size * 0.18),
              height: Math.max(6, size * 0.14),
            },
          ]}
        />
        <View
          style={[
            styles.string,
            {
              backgroundColor: colors[2],
              height: stringH,
              width: Math.max(2, size * 0.04),
            },
          ]}
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    alignItems: 'center',
  },
  body: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#2B3A4A',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  shine: {
    position: 'absolute',
    top: '14%',
    left: '18%',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.42)',
  },
  letter: {
    fontFamily: 'Nunito_800ExtraBold',
    fontWeight: '800',
    color: GuguColors.ink,
    textAlign: 'center',
  },
  knot: {
    borderRadius: 3,
    marginTop: -2,
  },
  string: {
    borderRadius: 1,
    opacity: 0.7,
  },
});
