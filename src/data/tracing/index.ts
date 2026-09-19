import { LOWERCASE_LETTERS } from '@/data/tracing/lowercase';
import { UPPERCASE_LETTERS } from '@/data/tracing/uppercase';
import type { LetterCase, TraceLetter } from '@/types/tracing';

export function getTracingLetters(letterCase: LetterCase): TraceLetter[] {
  return letterCase === 'uppercase' ? UPPERCASE_LETTERS : LOWERCASE_LETTERS;
}

export function getTracingLetter(letterCase: LetterCase, index: number): TraceLetter {
  const letters = getTracingLetters(letterCase);
  return letters[Math.max(0, Math.min(index, letters.length - 1))];
}
