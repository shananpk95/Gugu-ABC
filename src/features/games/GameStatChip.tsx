import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { GUGU_MEADOW } from '@/components/gugu/guguControls';
import { GuguColors } from '@/constants/gugu';
import { HomeSpace } from '@/features/home/homeLayout';

type GameStatChipProps = {
  label: string;
  value: string;
};

export function GameStatChip({ label, value }: GameStatChipProps) {
  return (
    <View style={styles.shadow}>
      <LinearGradient colors={[...GUGU_MEADOW]} locations={[0, 0.48, 1]} style={styles.face}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 18,
    shadowColor: '#2B3A4A',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  face: {
    minWidth: 92,
    borderRadius: 18,
    paddingHorizontal: HomeSpace.md,
    paddingVertical: 8,
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    fontWeight: '700',
    color: GuguColors.muted,
  },
  value: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    fontWeight: '800',
    color: GuguColors.ink,
  },
});
