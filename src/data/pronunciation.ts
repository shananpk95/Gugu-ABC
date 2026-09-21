import type { PronunciationLetter } from '@/types/pronunciation';

/**
 * Letter names: frozen prerecorded alphabet-name MP3s (do not regenerate).
 * Phonics: isolated phoneme MP3s (SAPI UPS), not letter names and not expo-speech.
 *
 * Phonics mapping follows https://www.showandtellletter.com/alphabet-sounds/
 */
export const PRONUNCIATION_LETTERS: PronunciationLetter[] = [
  { id: 'A', letter: 'A', phonicsIpa: '/æ/', letterNameAudio: require('@/assets/audio/letter-names/a.mp3'), phonicsAudio: require('@/assets/audio/phonics/a.mp3') },
  { id: 'B', letter: 'B', phonicsIpa: '/b/', letterNameAudio: require('@/assets/audio/letter-names/b.mp3'), phonicsAudio: require('@/assets/audio/phonics/b.mp3') },
  { id: 'C', letter: 'C', phonicsIpa: '/k/', letterNameAudio: require('@/assets/audio/letter-names/c.mp3'), phonicsAudio: require('@/assets/audio/phonics/c.mp3') },
  { id: 'D', letter: 'D', phonicsIpa: '/d/', letterNameAudio: require('@/assets/audio/letter-names/d.mp3'), phonicsAudio: require('@/assets/audio/phonics/d.mp3') },
  { id: 'E', letter: 'E', phonicsIpa: '/ɛ/', letterNameAudio: require('@/assets/audio/letter-names/e.mp3'), phonicsAudio: require('@/assets/audio/phonics/e.mp3') },
  { id: 'F', letter: 'F', phonicsIpa: '/f/', letterNameAudio: require('@/assets/audio/letter-names/f.mp3'), phonicsAudio: require('@/assets/audio/phonics/f.mp3') },
  { id: 'G', letter: 'G', phonicsIpa: '/g/', letterNameAudio: require('@/assets/audio/letter-names/g.mp3'), phonicsAudio: require('@/assets/audio/phonics/g.mp3') },
  { id: 'H', letter: 'H', phonicsIpa: '/h/', letterNameAudio: require('@/assets/audio/letter-names/h.mp3'), phonicsAudio: require('@/assets/audio/phonics/h.mp3') },
  { id: 'I', letter: 'I', phonicsIpa: '/ɪ/', letterNameAudio: require('@/assets/audio/letter-names/i.mp3'), phonicsAudio: require('@/assets/audio/phonics/i.mp3') },
  { id: 'J', letter: 'J', phonicsIpa: '/dʒ/', letterNameAudio: require('@/assets/audio/letter-names/j.mp3'), phonicsAudio: require('@/assets/audio/phonics/j.mp3') },
  { id: 'K', letter: 'K', phonicsIpa: '/k/', letterNameAudio: require('@/assets/audio/letter-names/k.mp3'), phonicsAudio: require('@/assets/audio/phonics/k.mp3') },
  { id: 'L', letter: 'L', phonicsIpa: '/l/', letterNameAudio: require('@/assets/audio/letter-names/l.mp3'), phonicsAudio: require('@/assets/audio/phonics/l.mp3') },
  { id: 'M', letter: 'M', phonicsIpa: '/m/', letterNameAudio: require('@/assets/audio/letter-names/m.mp3'), phonicsAudio: require('@/assets/audio/phonics/m.mp3') },
  { id: 'N', letter: 'N', phonicsIpa: '/n/', letterNameAudio: require('@/assets/audio/letter-names/n.mp3'), phonicsAudio: require('@/assets/audio/phonics/n.mp3') },
  { id: 'O', letter: 'O', phonicsIpa: '/ɒ/', letterNameAudio: require('@/assets/audio/letter-names/o.mp3'), phonicsAudio: require('@/assets/audio/phonics/o.mp3') },
  { id: 'P', letter: 'P', phonicsIpa: '/p/', letterNameAudio: require('@/assets/audio/letter-names/p.mp3'), phonicsAudio: require('@/assets/audio/phonics/p.mp3') },
  { id: 'Q', letter: 'Q', phonicsIpa: '/kw/', letterNameAudio: require('@/assets/audio/letter-names/q.mp3'), phonicsAudio: require('@/assets/audio/phonics/q.mp3') },
  { id: 'R', letter: 'R', phonicsIpa: '/r/', letterNameAudio: require('@/assets/audio/letter-names/r.mp3'), phonicsAudio: require('@/assets/audio/phonics/r.mp3') },
  { id: 'S', letter: 'S', phonicsIpa: '/s/', letterNameAudio: require('@/assets/audio/letter-names/s.mp3'), phonicsAudio: require('@/assets/audio/phonics/s.mp3') },
  { id: 'T', letter: 'T', phonicsIpa: '/t/', letterNameAudio: require('@/assets/audio/letter-names/t.mp3'), phonicsAudio: require('@/assets/audio/phonics/t.mp3') },
  { id: 'U', letter: 'U', phonicsIpa: '/ʌ/', letterNameAudio: require('@/assets/audio/letter-names/u.mp3'), phonicsAudio: require('@/assets/audio/phonics/u.mp3') },
  { id: 'V', letter: 'V', phonicsIpa: '/v/', letterNameAudio: require('@/assets/audio/letter-names/v.mp3'), phonicsAudio: require('@/assets/audio/phonics/v.mp3') },
  { id: 'W', letter: 'W', phonicsIpa: '/w/', letterNameAudio: require('@/assets/audio/letter-names/w.mp3'), phonicsAudio: require('@/assets/audio/phonics/w.mp3') },
  { id: 'X', letter: 'X', phonicsIpa: '/ks/', letterNameAudio: require('@/assets/audio/letter-names/x.mp3'), phonicsAudio: require('@/assets/audio/phonics/x.mp3') },
  { id: 'Y', letter: 'Y', phonicsIpa: '/j/', letterNameAudio: require('@/assets/audio/letter-names/y.mp3'), phonicsAudio: require('@/assets/audio/phonics/y.mp3') },
  { id: 'Z', letter: 'Z', phonicsIpa: '/z/', letterNameAudio: require('@/assets/audio/letter-names/z.mp3'), phonicsAudio: require('@/assets/audio/phonics/z.mp3') },
];

export function getPronunciationLetters(): PronunciationLetter[] {
  return PRONUNCIATION_LETTERS;
}

export function getPronunciationLetter(index: number): PronunciationLetter {
  const letters = PRONUNCIATION_LETTERS;
  return letters[Math.max(0, Math.min(index, letters.length - 1))];
}

export function getPronunciationByLetter(letter: string): PronunciationLetter {
  const match = PRONUNCIATION_LETTERS.find((item) => item.letter === letter.toUpperCase());
  return match ?? PRONUNCIATION_LETTERS[0];
}
