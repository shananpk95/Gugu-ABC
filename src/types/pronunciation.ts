export type PronunciationMode = 'letter-name' | 'phonics';

export type PronunciationClip = {
  /** Human-readable IPA, for data/debug only. */
  ipa: string;
  /**
   * TTS-safe English prompt. Never use the raw glyph for phonics,
   * because engines would speak the letter name instead of the sound.
   */
  speakText: string;
  rate?: number;
  pitch?: number;
  /** Optional recorded clip; when present it is preferred over TTS. */
  audio?: number;
};

export type PronunciationLetter = {
  id: string;
  letter: string;
  letterName: PronunciationClip;
  phonicsSound: PronunciationClip;
};
