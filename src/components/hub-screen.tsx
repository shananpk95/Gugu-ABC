import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryCard } from '@/components/category-card';
import { GuguLogo } from '@/components/branding/GuguLogo';
import { GuguColors } from '@/constants/gugu';
import { BottomTabInset, Fonts, MaxContentWidth, Spacing } from '@/constants/theme';

type HubScreenProps = {
  title: string;
  description: string;
  sections: readonly string[];
  tint: string;
};

export function HubScreen({ title, description, sections, tint }: HubScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}>
          <GuguLogo size={52} />
          <View style={styles.brandCopy}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
        </View>
        <View style={styles.grid}>
          {sections.map((section) => (
            <CategoryCard key={section} title={section} tint={tint} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: GuguColors.cream,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  brandCopy: {
    flex: 1,
  },
  title: {
    marginTop: 0,
    fontFamily: Fonts.rounded,
    fontSize: 32,
    fontWeight: '800',
    color: GuguColors.ink,
  },
  description: {
    marginTop: Spacing.two,
    marginBottom: 0,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: GuguColors.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
});
