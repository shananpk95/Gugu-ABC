export type PronunciationMode = 'letter-name' | 'phonics';

export type PronunciationLetter = {
  id: string;
  letter: string;
  /** Phonics IPA from the teaching reference (documentation only). */
  phonicsIpa: string;
  letterNameAudio: number;
  phonicsAudio: number;
};
