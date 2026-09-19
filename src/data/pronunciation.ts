import type { PronunciationLetter } from '@/types/pronunciation';

const NAME_RATE = 0.82;
const NAME_PITCH = 1.06;
const SOUND_RATE = 0.62;
const SOUND_PITCH = 1.04;

function entry(
  letter: string,
  letterName: PronunciationLetter['letterName'],
  phonicsSound: PronunciationLetter['phonicsSound'],
): PronunciationLetter {
  return {
    id: letter,
    letter,
    letterName: { rate: NAME_RATE, pitch: NAME_PITCH, ...letterName },
    phonicsSound: { rate: SOUND_RATE, pitch: SOUND_PITCH, ...phonicsSound },
  };
}

export const PRONUNCIATION_LETTERS: PronunciationLetter[] = [
  entry('A', { ipa: '/eɪ/', speakText: 'ay' }, { ipa: '/æ/', speakText: 'æ', rate: 0.5, pitch: 1.12 }),
  entry('B', { ipa: '/biː/', speakText: 'bee' }, { ipa: '/b/', speakText: 'buh' }),
  entry('C', { ipa: '/siː/', speakText: 'see' }, { ipa: '/k/', speakText: 'kuh' }),
  entry('D', { ipa: '/diː/', speakText: 'dee' }, { ipa: '/d/', speakText: 'duh' }),
  entry('E', { ipa: '/iː/', speakText: 'ee' }, { ipa: '/ɛ/', speakText: 'eh', rate: 0.52 }),
  entry('F', { ipa: '/ɛf/', speakText: 'ef' }, { ipa: '/f/', speakText: 'fff', rate: 0.48 }),
  entry('G', { ipa: '/dʒiː/', speakText: 'jee' }, { ipa: '/g/', speakText: 'guh' }),
  entry('H', { ipa: '/eɪtʃ/', speakText: 'aitch' }, { ipa: '/h/', speakText: 'huh' }),
  entry('I', { ipa: '/aɪ/', speakText: 'eye' }, { ipa: '/ɪ/', speakText: 'ih', rate: 0.52 }),
  entry('J', { ipa: '/dʒeɪ/', speakText: 'jay' }, { ipa: '/dʒ/', speakText: 'juh' }),
  entry('K', { ipa: '/keɪ/', speakText: 'kay' }, { ipa: '/k/', speakText: 'kuh' }),
  entry('L', { ipa: '/ɛl/', speakText: 'ell' }, { ipa: '/l/', speakText: 'ull', rate: 0.5 }),
  entry('M', { ipa: '/ɛm/', speakText: 'em' }, { ipa: '/m/', speakText: 'mmm', rate: 0.48 }),
  entry('N', { ipa: '/ɛn/', speakText: 'en' }, { ipa: '/n/', speakText: 'nnn', rate: 0.48 }),
  entry('O', { ipa: '/oʊ/', speakText: 'oh' }, { ipa: '/ɒ/', speakText: 'aw', rate: 0.52 }),
  entry('P', { ipa: '/piː/', speakText: 'pee' }, { ipa: '/p/', speakText: 'puh' }),
  entry('Q', { ipa: '/kjuː/', speakText: 'cue' }, { ipa: '/kw/', speakText: 'kwuh' }),
  entry('R', { ipa: '/ɑːr/', speakText: 'ar' }, { ipa: '/r/', speakText: 'rrr', rate: 0.48 }),
  entry('S', { ipa: '/ɛs/', speakText: 'ess' }, { ipa: '/s/', speakText: 'sss', rate: 0.48 }),
  entry('T', { ipa: '/tiː/', speakText: 'tee' }, { ipa: '/t/', speakText: 'tuh' }),
  entry('U', { ipa: '/juː/', speakText: 'you' }, { ipa: '/ʌ/', speakText: 'uh', rate: 0.52 }),
  entry('V', { ipa: '/viː/', speakText: 'vee' }, { ipa: '/v/', speakText: 'vvv', rate: 0.48 }),
  entry('W', { ipa: '/ˈdʌbəl.juː/', speakText: 'double you' }, { ipa: '/w/', speakText: 'wuh' }),
  entry('X', { ipa: '/ɛks/', speakText: 'ex' }, { ipa: '/ks/', speakText: 'ks' }),
  entry('Y', { ipa: '/waɪ/', speakText: 'why' }, { ipa: '/j/', speakText: 'yuh' }),
  entry('Z', { ipa: '/ziː/', speakText: 'zee' }, { ipa: '/z/', speakText: 'zzz', rate: 0.48 }),
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
