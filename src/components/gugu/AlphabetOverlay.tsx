import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { GuguDialogCard, useDialogScale } from '@/components/gugu/GuguDialog';
import { GuguIconButton } from '@/components/gugu/GuguIconButton';
import { GuguModal } from '@/components/gugu/GuguModal';
import { GUGU_LETTER_TINTS } from '@/components/gugu/guguControls';
import { GuguColors } from '@/constants/gugu';
import { Fonts } from '@/constants/theme';

type AlphabetItem = {
  id: string;
  character: string;
};

type AlphabetOverlayProps = {
  visible?: boolean;
  letters: AlphabetItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
};

function CloseGlyph({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7 7l10 10M17 7 7 17" stroke={GuguColors.ink} strokeWidth="3.2" strokeLinecap="round" />
    </Svg>
  );
}

export function AlphabetOverlay({
  visible = true,
  letters,
  selectedIndex,
  onSelect,
  onClose,
}: AlphabetOverlayProps) {
  const scale = useDialogScale();
  const cell = scale.compact ? 48 : 58;
  const closeSize = scale.compact ? 40 : 46;
  const fontSize = scale.compact ? 22 : 26;

  return (
    <GuguModal visible={visible} onRequestClose={onClose} dismissOnBackdrop>
      <GuguDialogCard maxWidth={580}>
        <View style={[styles.grid, { gap: scale.compact ? 6 : 8 }]}>
          {letters.map((item, letterIndex) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={item.character}
              onPress={() => onSelect(letterIndex)}
              style={[
                styles.cell,
                { width: cell, height: cell, borderRadius: Math.round(cell * 0.32), backgroundColor: GUGU_LETTER_TINTS[letterIndex % GUGU_LETTER_TINTS.length] },
                letterIndex === selectedIndex && styles.cellActive,
              ]}>
              <Text style={[styles.letter, { fontSize }]}>{item.character}</Text>
            </Pressable>
          ))}
        </View>
        <View style={[styles.footer, { marginTop: scale.compact ? 8 : 12 }]}>
          <GuguIconButton size={closeSize} onPress={onClose} accessibilityLabel="Close">
            <CloseGlyph size={Math.round(closeSize * 0.42)} />
          </GuguIconButton>
        </View>
      </GuguDialogCard>
    </GuguModal>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2B3A4A',
    shadowOpacity: 0.14,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cellActive: {
    borderWidth: 3,
    borderColor: GuguColors.ink,
  },
  letter: {
    fontFamily: Fonts.rounded,
    fontWeight: '800',
    color: GuguColors.ink,
  },
  footer: {
    alignItems: 'flex-end',
  },
});
