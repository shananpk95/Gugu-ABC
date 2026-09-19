import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { GuguLogo } from '@/components/branding/GuguLogo';
import { GuguColors } from '@/constants/gugu';
import { getProgress } from '@/services/storage';
import { BottomTabInset, Fonts, MaxContentWidth, Spacing } from '@/constants/theme';

export default function ProgressScreen() {
  const [stars, setStars] = useState(0);
  const [uppercase, setUppercase] = useState(0);
  const [lowercase, setLowercase] = useState(0);

  useFocusEffect(
    useCallback(() => {
      void getProgress().then((progress) => {
        setStars(progress.stars);
        setUppercase(Object.keys(progress.tracing.uppercase).length);
        setLowercase(Object.keys(progress.tracing.lowercase).length);
      });
    }, []),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.brandRow}>
          <GuguLogo size={52} />
          <View style={styles.brandCopy}>
            <Text style={styles.title}>Progress</Text>
            <Text style={styles.description}>Stars and tracing progress stay on this device.</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.stat}>{stars} Stars</Text>
          <Text style={styles.statLabel}>Capital letters traced: {uppercase} / 26</Text>
          <Text style={styles.statLabel}>Small letters traced: {lowercase} / 26</Text>
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
  card: {
    backgroundColor: GuguColors.white,
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  stat: {
    fontSize: 28,
    fontWeight: '800',
    color: GuguColors.ink,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: GuguColors.muted,
  },
});
