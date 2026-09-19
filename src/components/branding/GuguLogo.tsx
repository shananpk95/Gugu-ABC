import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

export const GUGU_LOGO_ASPECT = 1079 / 617;
export const GUGU_LOGO_SOURCE = require('@/assets/images/gugu-logo.png');

const SIZES = {
  small: 44,
  medium: 120,
  large: 168,
} as const;

type GuguLogoProps = {
  size?: keyof typeof SIZES | number;
};

export function GuguLogo({ size = 'medium' }: GuguLogoProps) {
  const width = typeof size === 'number' ? size : SIZES[size];

  return (
    <Image
      source={GUGU_LOGO_SOURCE}
      style={[styles.logo, { width, height: width * GUGU_LOGO_ASPECT }]}
      contentFit="contain"
      accessibilityLabel="GuGu"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    aspectRatio: GUGU_LOGO_ASPECT,
  },
});
