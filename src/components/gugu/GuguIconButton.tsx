import { type ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { GUGU_MEADOW, GUGU_MEADOW_FILL } from '@/components/gugu/guguControls';
import { HomeSpace } from '@/features/home/homeLayout';

type GuguIconButtonProps = {
  size: number;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
  children: ReactNode;
};

export function GuguIconButton({
  size,
  onPress,
  disabled,
  accessibilityLabel,
  children,
}: GuguIconButtonProps) {
  const press = useSharedValue(0);
  const radius = Math.round(size * 0.3);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(press.value, [0, 1], [1, 0.94]) }],
    shadowOpacity: interpolate(press.value, [0, 1], [0.24, 0.1]),
    elevation: interpolate(press.value, [0, 1], [8, 2]),
    opacity: disabled ? 0.42 : 1,
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        if (!disabled) press.value = withTiming(1, { duration: 90 });
      }}
      onPressOut={() => {
        press.value = withTiming(0, { duration: 140 });
      }}
      hitSlop={HomeSpace.xs}
      style={{ width: size, height: size, backgroundColor: 'transparent' }}>
      <Animated.View
        style={[
          styles.shadow,
          { width: size, height: size, borderRadius: radius, backgroundColor: GUGU_MEADOW_FILL },
          style,
        ]}>
        <LinearGradient
          colors={[...GUGU_MEADOW]}
          locations={[0, 0.48, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.face, { borderRadius: radius, backgroundColor: GUGU_MEADOW_FILL }]}>
          <View style={styles.slot}>{children}</View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#2B3A4A',
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
  },
  face: {
    flex: 1,
    overflow: 'hidden',
  },
  slot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
