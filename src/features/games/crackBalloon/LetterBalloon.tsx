import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { GuguColors } from '@/constants/gugu';

export const BALLOON_COLORS = [
  ['#FFB4A8', '#FF8B7B', '#E25A55'],
  ['#FFE9A8', '#FFE08A', '#E2C04A'],
  ['#C8F3DC', '#8FE0B8', '#5CB98A'],
  ['#BFE6F6', '#7EC8E3', '#4AA0C4'],
  ['#E6D9FF', '#D5C7F5', '#A994E0'],
  ['#FFD9C2', '#FFD3B6', '#F0A88A'],
  ['#FFC2E4', '#F48BC4', '#D45A9A'],
  ['#C9F08A', '#A8DC5A', '#7BB82A'],
] as const;

type LetterBalloonProps = {
  letter: string;
  colorIndex: number;
  size: number;
  left: number;
  top: number;
  popped: boolean;
  missed: number;
  disabled: boolean;
  onPress: () => void;
};

export function LetterBalloon({
  letter,
  colorIndex,
  size,
  left,
  top,
  popped,
  missed,
  disabled,
  onPress,
}: LetterBalloonProps) {
  const float = useSharedValue(0);
  const pop = useSharedValue(0);
  const shake = useSharedValue(0);
  const colors = BALLOON_COLORS[colorIndex % BALLOON_COLORS.length];
  const width = size;
  const height = size * 1.22;

  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600 + (colorIndex % 4) * 180, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1600 + (colorIndex % 4) * 180, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [colorIndex, float]);

  useEffect(() => {
    if (popped) {
      pop.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) });
    } else {
      pop.value = 0;
    }
  }, [pop, popped]);

  useEffect(() => {
    if (!missed) return;
    shake.value = withSequence(
      withTiming(1, { duration: 50 }),
      withTiming(-1, { duration: 80 }),
      withTiming(1, { duration: 80 }),
      withTiming(0, { duration: 70 }),
    );
  }, [missed, shake]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(pop.value, [0, 1], [1, 0]),
    transform: [
      { translateY: interpolate(float.value, [0, 1], [0, -10]) },
      { translateX: shake.value * 8 },
      { scale: interpolate(pop.value, [0, 0.45, 1], [1, 1.18, 0.2]) },
    ],
  }));

  return (
    <Animated.View style={[styles.wrap, { left, top, width, height: height + 18 }, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Balloon ${letter}`}
        disabled={disabled || popped}
        onPress={onPress}
        hitSlop={6}
        style={styles.hit}>
        <LinearGradient colors={[...colors]} locations={[0, 0.45, 1]} style={[styles.body, { width, height, borderRadius: width / 2 }]}>
          <View style={[styles.shine, { width: width * 0.28, height: height * 0.22 }]} />
          <Text style={[styles.letter, { fontSize: Math.round(size * 0.42) }]}>{letter}</Text>
        </LinearGradient>
        <View style={[styles.knot, { backgroundColor: colors[2] }]} />
        <View style={[styles.string, { backgroundColor: colors[2] }]} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
  },
  hit: {
    alignItems: 'center',
  },
  body: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#2B3A4A',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
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
    width: 10,
    height: 8,
    borderRadius: 3,
    marginTop: -2,
  },
  string: {
    width: 2,
    height: 14,
    borderRadius: 1,
    opacity: 0.7,
  },
});
