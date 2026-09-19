import type { LetterCase } from '@/types/tracing';
import { getProgress, saveProgress, type ChildProgress } from '@/services/storage';

export async function markTracingComplete(
  letterCase: LetterCase,
  character: string,
): Promise<ChildProgress> {
  const progress = await getProgress();
  const bucket = letterCase === 'uppercase' ? progress.tracing.uppercase : progress.tracing.lowercase;
  const alreadyComplete = Boolean(bucket[character]);
  if (!alreadyComplete) {
    bucket[character] = true;
    progress.stars += 1;
  }
  await saveProgress(progress);
  return progress;
}
