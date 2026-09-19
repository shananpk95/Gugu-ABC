import { Href, Redirect, useLocalSearchParams } from 'expo-router';

import { PronunciationSession } from '@/features/listen/PronunciationSession';
import type { PronunciationMode } from '@/types/pronunciation';

export default function ListenModeScreen() {
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const pronunciationMode: PronunciationMode | null =
    mode === 'letter-name' || mode === 'phonics' ? mode : null;

  if (!pronunciationMode) {
    return <Redirect href={'/practice/listen' as Href} />;
  }

  return <PronunciationSession mode={pronunciationMode} />;
}
