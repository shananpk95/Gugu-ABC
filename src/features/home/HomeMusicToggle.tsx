import { useEffect, useState } from 'react';
import Svg, { Path } from 'react-native-svg';

import { GuguIconButton } from '@/components/gugu/GuguIconButton';
import { GuguColors } from '@/constants/gugu';
import { audioManager } from '@/services/audio';

function MusicGlyph({ muted, size }: { muted: boolean; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M9.2 16.6V7.2l9.2-1.6v9.6"
        stroke={GuguColors.ink}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path d="M9.2 16.6a2.3 2.3 0 1 1-4.6 0 2.3 2.3 0 0 1 4.6 0ZM18.4 15.2a2.3 2.3 0 1 1-4.6 0 2.3 2.3 0 0 1 4.6 0Z" fill={GuguColors.ink} />
      {muted ? (
        <Path d="M4.2 19.2 19.6 4.6" stroke={GuguColors.ink} strokeWidth="2.4" strokeLinecap="round" />
      ) : null}
    </Svg>
  );
}

export function HomeMusicToggle({ size }: { size: number }) {
  const [on, setOn] = useState(true);

  useEffect(() => {
    void audioManager.init().then(() => setOn(audioManager.isMusicEnabled()));
  }, []);

  return (
    <GuguIconButton
      size={size}
      onPress={() => {
        const next = !audioManager.isMusicEnabled();
        void audioManager.setMusicEnabled(next);
        setOn(next);
        audioManager.playTap();
      }}
      accessibilityLabel={on ? 'Music on' : 'Music off'}>
      <MusicGlyph muted={!on} size={Math.round(size * 0.46)} />
    </GuguIconButton>
  );
}
