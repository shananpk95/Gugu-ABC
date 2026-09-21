import { Platform, StyleSheet, Text, View } from 'react-native';

import { GuguColors } from '@/constants/gugu';

/** Closest system equivalent to "Arial Black", Gadget, sans-serif */
const BOLD_BLACK = Platform.select({
  ios: 'Arial Black',
  android: 'sans-serif-black',
  default: 'System',
})!;

type TargetLetterProps = {
  letter: string;
  size: number;
};

/**
 * Balloon Game target letter — flat bold system font.
 * Color matches other game letter/text typography (`GuguColors.ink`).
 */
export function TargetLetter3D({ letter, size }: TargetLetterProps) {
  return (
    <View
      accessibilityRole="header"
      accessibilityLabel={`Find letter ${letter}`}
      style={[
        styles.wrap,
        {
          width: size * 0.95,
          height: size * 1.15,
        },
      ]}>
      <Text
        style={[
          styles.letter,
          {
            fontSize: size,
            lineHeight: size * 1.05,
            includeFontPadding: false,
          },
        ]}>
        {letter}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontFamily: BOLD_BLACK,
    fontWeight: '900',
    color: GuguColors.ink,
    textAlign: 'center',
  },
});
