import { type ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { GUGU_MEADOW } from '@/components/gugu/guguControls';
import { modalEdgePadding } from '@/components/gugu/GuguModal';
import { GuguColors } from '@/constants/gugu';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type GuguDialogCardProps = {
  children: ReactNode;
  maxWidth?: number;
};

export function useDialogScale() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const padX = modalEdgePadding(width, height, Math.max(insets.left, insets.right));
  const padY = modalEdgePadding(width, height, Math.max(insets.top, insets.bottom));
  const availableH = height - padY * 2;
  const compact = availableH < 420 || width < 700;
  return {
    compact,
    maxCardWidth: Math.min(width - padX * 2, 560),
    maxCardHeight: availableH,
    pad: compact ? 10 : 16,
    titleSize: compact ? 22 : 28,
    bodySize: compact ? 14 : 16,
    statSize: compact ? 20 : 26,
    btnPadV: compact ? 8 : 12,
    btnPadH: compact ? 20 : 28,
    btnSize: compact ? 16 : 18,
  };
}

export function GuguDialogCard({ children, maxWidth = 520 }: GuguDialogCardProps) {
  const scale = useDialogScale();
  return (
    <View
      style={[
        styles.shadow,
        {
          alignSelf: 'center',
          width: '100%',
          maxWidth: Math.min(maxWidth, scale.maxCardWidth),
          maxHeight: scale.maxCardHeight,
        },
      ]}>
      <LinearGradient
        colors={[...GUGU_MEADOW]}
        locations={[0, 0.5, 1]}
        style={[styles.card, { paddingVertical: scale.pad, paddingHorizontal: scale.pad }]}>
        {children}
      </LinearGradient>
    </View>
  );
}

type GuguDialogButtonProps = {
  label: string;
  onPress: () => void;
};

export function GuguDialogButton({ label, onPress }: GuguDialogButtonProps) {
  const press = useSharedValue(0);
  const scale = useDialogScale();
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(press.value, [0, 1], [1, 0.96]) }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onPressIn={() => {
        press.value = withTiming(1, { duration: 90 });
      }}
      onPressOut={() => {
        press.value = withTiming(0, { duration: 140 });
      }}>
      <Animated.View style={[styles.btnWrap, style]}>
        <LinearGradient
          colors={['#FFE08A', '#F3D36A', '#E8C24C']}
          style={[styles.btnFace, { paddingHorizontal: scale.btnPadH, paddingVertical: scale.btnPadV }]}>
          <Text style={[styles.btnLabel, { fontSize: scale.btnSize }]}>{label}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 28,
    shadowColor: '#2B3A4A',
    shadowOpacity: 0.26,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  btnWrap: {
    borderRadius: 22,
    shadowColor: '#2B3A4A',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  btnFace: {
    borderRadius: 22,
    alignItems: 'center',
  },
  btnLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontWeight: '800',
    color: GuguColors.ink,
  },
});
