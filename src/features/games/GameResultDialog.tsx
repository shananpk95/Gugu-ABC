import { StyleSheet, Text, View } from 'react-native';

import { GuguDialogButton, GuguDialogCard, useDialogScale } from '@/components/gugu/GuguDialog';
import { GuguModal } from '@/components/gugu/GuguModal';
import { GuguColors } from '@/constants/gugu';

type GameResultDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  scoreLabel?: string;
  scoreValue?: string;
  mistLabel?: string;
  mistValue?: string;
  actionLabel: string;
  onAction: () => void;
};

export function GameResultDialog({
  visible,
  title,
  message,
  scoreLabel = 'Score',
  scoreValue,
  mistLabel = 'Mist',
  mistValue,
  actionLabel,
  onAction,
}: GameResultDialogProps) {
  const scale = useDialogScale();

  return (
    <GuguModal visible={visible}>
      <GuguDialogCard maxWidth={400}>
        <View style={[styles.body, { gap: scale.compact ? 6 : 10 }]}>
          <Text style={[styles.title, { fontSize: scale.titleSize }]}>{title}</Text>
          <Text style={[styles.message, { fontSize: scale.bodySize }]}>{message}</Text>
          {scoreValue != null || mistValue != null ? (
            <View style={styles.row}>
              {scoreValue != null ? (
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>{scoreLabel}</Text>
                  <Text style={[styles.statValue, { fontSize: scale.statSize }]}>{scoreValue}</Text>
                </View>
              ) : null}
              {mistValue != null ? (
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>{mistLabel}</Text>
                  <Text style={[styles.statValue, { fontSize: scale.statSize }]}>{mistValue}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
          <View style={{ marginTop: scale.compact ? 4 : 8 }}>
            <GuguDialogButton label={actionLabel} onPress={onAction} />
          </View>
        </View>
      </GuguDialogCard>
    </GuguModal>
  );
}

const styles = StyleSheet.create({
  body: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontWeight: '800',
    color: GuguColors.ink,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '700',
    color: GuguColors.muted,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    alignItems: 'center',
    minWidth: 72,
  },
  statLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: GuguColors.muted,
  },
  statValue: {
    fontFamily: 'Nunito_800ExtraBold',
    fontWeight: '800',
    color: GuguColors.ink,
  },
});
