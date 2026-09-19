import { useEffect, useMemo, useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const FLOWERS = [
  require('@/assets/images/celebrate-flower-pink.png'),
  require('@/assets/images/celebrate-flower-yellow.png'),
  require('@/assets/images/celebrate-flower-purple.png'),
];

const FLOWER_COUNT = 10;
const SPARKLE_COUNT = 5;
const CELEBRATION_MS = 2100;

type SuccessCelebrationProps = {
  playKey: number;
};

function Flower({
  playKey,
  left,
  size,
  delay,
  duration,
  spin,
  sway,
  source,
  fall,
}: {
  playKey: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  spin: number;
  sway: number;
  source: number;
  fall: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(delay, withTiming(1, { duration, easing: Easing.in(Easing.quad) }));
    return () => {
      cancelAnimation(progress);
    };
  }, [delay, duration, playKey, progress]);

  const style = useAnimatedStyle(() => {
    const fadeIn = Math.min(1, progress.value / 0.1);
    const fadeOut = progress.value > 0.78 ? 1 - (progress.value - 0.78) / 0.22 : 1;
    return {
      opacity: fadeIn * fadeOut,
      transform: [
        { translateY: progress.value * fall },
        { translateX: Math.sin(progress.value * 6.2) * sway },
        { rotate: `${spin + progress.value * 140}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[styles.petal, { left, width: size, height: size * 1.28 }, style]}>
      <Image source={source} style={styles.image} contentFit="contain" />
    </Animated.View>
  );
}

function Sparkle({
  playKey,
  left,
  top,
  size,
  delay,
  duration,
}: {
  playKey: number;
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.quad) }));
    return () => {
      cancelAnimation(progress);
    };
  }, [delay, duration, playKey, progress]);

  const style = useAnimatedStyle(() => {
    const pulse = progress.value < 0.5 ? progress.value / 0.5 : 1 - (progress.value - 0.5) / 0.5;
    return {
      opacity: pulse * 0.9,
      transform: [{ scale: 0.55 + pulse * 0.7 }, { translateY: progress.value * 28 }],
    };
  });

  return <Animated.View style={[styles.sparkle, { left, top, width: size, height: size, borderRadius: size / 2 }, style]} />;
}

export function SuccessCelebration({ playKey }: SuccessCelebrationProps) {
  const { width, height } = useWindowDimensions();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (playKey <= 0) {
      return;
    }
    setActive(true);
    const timer = setTimeout(() => setActive(false), CELEBRATION_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [playKey]);

  const flakes = useMemo(() => {
    return Array.from({ length: FLOWER_COUNT }, (_, index) => ({
      id: `${playKey}-f-${index}`,
      left: width * (0.06 + (index * 0.88) / FLOWER_COUNT),
      size: 42 + ((index * 17) % 28),
      delay: (index % 4) * 80,
      duration: 1500 + (index % 5) * 140,
      spin: (index * 33) % 180,
      sway: 14 + (index % 5) * 6,
      source: FLOWERS[index % FLOWERS.length],
    }));
  }, [playKey, width]);

  const sparkles = useMemo(() => {
    return Array.from({ length: SPARKLE_COUNT }, (_, index) => ({
      id: `${playKey}-s-${index}`,
      left: width * (0.18 + index * 0.16),
      top: height * (0.12 + (index % 3) * 0.1),
      size: 7 + (index % 3) * 3,
      delay: 120 + index * 90,
      duration: 900 + (index % 3) * 120,
    }));
  }, [height, playKey, width]);

  if (!active || playKey <= 0) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.root}>
      {flakes.map((flake) => (
        <Flower key={flake.id} playKey={playKey} {...flake} fall={height * 0.78} />
      ))}
      {sparkles.map((sparkle) => (
        <Sparkle key={sparkle.id} playKey={playKey} {...sparkle} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 30,
    overflow: 'hidden',
  },
  petal: {
    position: 'absolute',
    top: -36,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  sparkle: {
    position: 'absolute',
    backgroundColor: '#FFE98A',
    shadowColor: '#FFF6C8',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
});
