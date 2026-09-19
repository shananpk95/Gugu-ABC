import { Href, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GuguLogo } from '@/components/branding/GuguLogo';
import { CategoryCard } from '@/components/category-card';
import { GuguColors } from '@/constants/gugu';
import { Fonts, Spacing } from '@/constants/theme';

export default function PracticeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.screen}>
        <View style={styles.copy}>
          <GuguLogo size={52} />
          <Text style={styles.title}>Trace</Text>
          <Text style={styles.description}>Practice writing letters with your finger.</Text>
        </View>
        <View style={styles.cardWrap}>
          <CategoryCard
            title="Trace"
            subtitle="Capital and small letters"
            tint={GuguColors.lavender}
            featured
            onPress={() => router.push('/practice/tracing' as Href)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: GuguColors.cream,
  },
  screen: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.five,
  },
  copy: {
    width: 220,
    gap: Spacing.three,
  },
  title: {
    fontFamily: Fonts.rounded,
    fontSize: 32,
    fontWeight: '800',
    color: GuguColors.ink,
  },
  description: {
    marginTop: Spacing.two,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: GuguColors.muted,
  },
  cardWrap: {
    flex: 1,
    maxWidth: 420,
  },
});
