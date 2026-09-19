import Svg, { Path } from 'react-native-svg';

import { GuguIconButton } from '@/components/gugu/GuguIconButton';
import { GuguColors } from '@/constants/gugu';

type BackButtonProps = {
  size: number;
  onPress: () => void;
};

function BackArrow({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M11.2 5.2 4.6 12l6.6 6.8"
        stroke={GuguColors.ink}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M6.2 12h13.2"
        stroke={GuguColors.ink}
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function BackButton({ size, onPress }: BackButtonProps) {
  return (
    <GuguIconButton size={size} onPress={onPress} accessibilityLabel="Back">
      <BackArrow size={Math.round(size * 0.46)} />
    </GuguIconButton>
  );
}
