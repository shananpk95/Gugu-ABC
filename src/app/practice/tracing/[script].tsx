import { Href, Redirect, useLocalSearchParams } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { TracingSession } from '@/features/tracing/TracingSession';
import type { LetterCase } from '@/types/tracing';

export default function TracingLetterScreen() {
  const { script } = useLocalSearchParams<{ script: string }>();
  const letterCase: LetterCase | null =
    script === 'uppercase' || script === 'lowercase' ? script : null;

  if (!letterCase) {
    return <Redirect href={'/practice/tracing' as Href} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TracingSession letterCase={letterCase} />
    </GestureHandlerRootView>
  );
}
