import { Image, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { HomeSpace } from '@/features/home/homeLayout';

/** Same aspect as the first Home/Draw category tile. */
export const CATEGORY_TILE_ASPECT = 154 / 166;
export const CATEGORY_TILE_MAX_WIDTH = 188;

export function getCategoryTileLayout(innerWidth: number) {
  const gap = HomeSpace.md;
  const columns = innerWidth >= 248 ? 2 : 1;
  const tileWidth = Math.min(CATEGORY_TILE_MAX_WIDTH, (innerWidth - gap * (columns - 1)) / columns);
  const tileHeight = tileWidth * CATEGORY_TILE_ASPECT;
  return { gap, columns, tileWidth, tileHeight, inner: innerWidth };
}

type CategoryIconButtonProps = {
  icon: ImageSource;
  label: string;
  width: number;
  height: number;
  onPress: () => void;
};

export function CategoryIconButton({ icon, label, width, height, onPress }: CategoryIconButtonProps) {
  const press = useSharedValue(0);
  const radius = Math.round(Math.min(width, height) * 0.3);
  const iconPad = Math.max(8, Math.round(Math.min(width, height) * 0.08));
  const iconBox = Math.min(width, height) - iconPad * 2;

  const tileStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(press.value, [0, 1], [0, 3]) },
      { scale: interpolate(press.value, [0, 1], [1, 0.96]) },
    ],
    shadowOpacity: interpolate(press.value, [0, 1], [0.22, 0.1]),
    shadowRadius: interpolate(press.value, [0, 1], [12, 5]),
    shadowOffset: {
      width: 0,
      height: interpolate(press.value, [0, 1], [8, 3]),
    },
    elevation: interpolate(press.value, [0, 1], [8, 2]),
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
      }}
      style={{ width, height, maxWidth: width, maxHeight: height }}>
      <Animated.View style={[styles.tile, { width, height, borderRadius: radius }, tileStyle]}>
        <LinearGradient
          colors={['#E8E49C', '#D0E3A2', '#B8D890']}
          locations={[0, 0.48, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.face, { borderRadius: radius }]}>
          <View style={[styles.softEdge, { borderRadius: radius }]} pointerEvents="none" />
          <View style={[styles.iconSlot, { width: iconBox, height: iconBox }]}>
            <Image source={icon} style={styles.icon} contentFit="contain" />
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    shadowColor: '#2B3A4A',
    backgroundColor: 'transparent',
  },
  face: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSlot: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  softEdge: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1,
    borderColor: 'rgba(245, 236, 150, 0.38)',
  },
});
