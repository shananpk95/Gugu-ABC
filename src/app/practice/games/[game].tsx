import { Href, Redirect, useLocalSearchParams } from 'expo-router';

import { CollectLettersGame } from '@/features/games/collectLetters/CollectLettersGame';
import { CrackBalloonGame } from '@/features/games/crackBalloon/CrackBalloonGame';

export default function GameScreen() {
  const { game } = useLocalSearchParams<{ game: string }>();

  if (game === 'crack-balloon') {
    return <CrackBalloonGame />;
  }
  if (game === 'collect-letters') {
    return <CollectLettersGame />;
  }

  return <Redirect href={'/practice/games' as Href} />;
}
