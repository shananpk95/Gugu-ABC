import { Image, type ImageSource } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GuguColors } from '@/constants/gugu';
import { Fonts, Spacing } from '@/constants/theme';

type CategoryCardProps = {
  title: string;
  subtitle?: string;
  tint: string;
  icon?: string;
  iconSource?: ImageSource;
  onPress?: () => void;
  featured?: boolean;
  width?: number;
  height?: number;
};

export function CategoryCard({
  title,
  subtitle,
  tint,
  icon,
  iconSource,
  onPress,
  featured,
  width,
  height,
}: CategoryCardProps) {
  const compact = iconSource != null && width != null && height != null;
  const labelHeight = compact ? Math.max(26, Math.round(width * 0.24)) : 0;
  const iconSize = compact ? Math.min(width, Math.max(48, height - labelHeight - 8)) : 0;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact ? styles.compactCard : null,
        featured && styles.featured,
        width != null && { width, flexGrow: 0, flexBasis: width, maxWidth: width },
        height != null && { height, minHeight: height },
        compact ? styles.compactTransparent : { backgroundColor: tint },
        pressed && styles.pressed,
      ]}>
      {compact ? (
        <View style={styles.compactBody}>
          <Image source={iconSource} style={{ width: iconSize, height: iconSize }} contentFit="contain" />
          <View style={[styles.namePill, { backgroundColor: tint, minHeight: labelHeight }]}>
            <Text style={styles.compactTitle} numberOfLines={1}>
              {title}
            </Text>
          </View>
        </View>
      ) : (
        <View>
          {icon ? <Text style={styles.icon}>{icon}</Text> : null}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 108,
    borderRadius: 24,
    padding: Spacing.three,
    justifyContent: 'flex-end',
    flexGrow: 1,
    flexBasis: '47%',
    shadowColor: '#2B3A4A',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  compactCard: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    borderRadius: 0,
    minHeight: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  compactTransparent: {
    backgroundColor: 'transparent',
  },
  compactBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
  },
  namePill: {
    alignSelf: 'stretch',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2B3A4A',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  icon: {
    fontSize: 26,
    marginBottom: 6,
  },
  featured: {
    flexBasis: '100%',
    maxWidth: '100%',
    minHeight: 132,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    fontWeight: '800',
    color: GuguColors.ink,
  },
  compactTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    color: GuguColors.ink,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: GuguColors.muted,
    fontFamily: Fonts.rounded,
  },
});
