import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';

import { getPronunciationByLetter } from '@/data/pronunciation';
import { backgroundMusic, type MusicDuckKind } from '@/services/backgroundMusic';

const TTS_LANGUAGE = 'en-US';

class PronunciationService {
  private ready = false;
  private voiceEnabled = true;
  private generation = 0;
  private player: AudioPlayer | null = null;
  private preferredVoiceId: string | null | undefined;

  async init() {
    if (this.ready) return;
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'mixWithOthers',
        shouldPlayInBackground: false,
      });
      this.ready = true;
    } catch {
      this.ready = false;
    }
  }

  setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
    if (!enabled) this.stopPronunciation();
  }

  async playLetterName(letter: string) {
    await this.withMusicDuck('speech', async () => {
      const entry = getPronunciationByLetter(letter);
      const generation = await this.playAsset(entry.letterNameAudio);
      await this.waitForPlayer(generation);
    });
  }

  async playPhonics(letter: string) {
    await this.withMusicDuck('phonics', async () => {
      const entry = getPronunciationByLetter(letter);
      const generation = await this.playAsset(entry.phonicsAudio);
      await this.waitForPlayer(generation);
    });
  }

  async playWord(letter: string, word: string) {
    await this.withMusicDuck('speech', async () => {
      await this.init();
      if (!this.voiceEnabled) return;
      const entry = getPronunciationByLetter(letter);
      const generation = await this.playAsset(entry.letterNameAudio);
      await this.waitForPlayer(generation);
      if (generation !== this.generation) return;
      await this.speak(`for ${word}`, { rate: 0.84, pitch: 1.06 });
    });
  }

  /** Clear, prominent letter name after Draw celebration (no praise words). */
  async playLetterAnnounce(letter: string) {
    await this.withMusicDuck('speech', async () => {
      const entry = getPronunciationByLetter(letter);
      // Loud + clear letter name after popper crack (stands above ducked BGM).
      const generation = await this.playAsset(entry.letterNameAudio, 1.25);
      await this.waitForPlayer(generation);
    });
  }

  stopPronunciation() {
    this.generation += 1;
    void Speech.stop();
    this.stopPlayer();
  }

  private async withMusicDuck(kind: MusicDuckKind, work: () => Promise<void>) {
    backgroundMusic.duck(kind);
    try {
      await work();
    } finally {
      backgroundMusic.unduck(kind);
    }
  }

  private async playAsset(source: number, volume = 1): Promise<number> {
    await this.init();
    if (!this.voiceEnabled) return this.generation;
    this.generation += 1;
    const generation = this.generation;
    await Speech.stop();
    this.stopPlayer();
    if (generation !== this.generation) return generation;
    try {
      this.player = createAudioPlayer(source);
      this.player.volume = Math.min(1, Math.max(0.2, volume));
      this.player.play();
    } catch {
      this.stopPlayer();
    }
    return generation;
  }

  private async waitForPlayer(generation: number) {
    const player = this.player;
    if (!player) return;
    const started = Date.now();
    let heardDuration = false;
    while (generation === this.generation && Date.now() - started < 2500) {
      const duration = player.duration ?? 0;
      const current = player.currentTime ?? 0;
      if (duration > 0.05) {
        heardDuration = true;
        if (current >= duration - 0.04) break;
      } else if (!heardDuration && Date.now() - started > 650) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
  }

  private async speak(text: string, options: { rate: number; pitch: number }) {
    await this.init();
    if (!this.voiceEnabled) return;
    this.generation += 1;
    const generation = this.generation;
    await Speech.stop();
    this.stopPlayer();
    if (!text.trim() || generation !== this.generation) return;

    const voice = await this.resolveVoice();
    if (generation !== this.generation) return;

    await new Promise<void>((resolve) => {
      Speech.speak(text, {
        language: TTS_LANGUAGE,
        voice,
        rate: options.rate,
        pitch: options.pitch,
        onDone: () => resolve(),
        onStopped: () => resolve(),
        onError: () => resolve(),
      });
    });
  }

  private async resolveVoice(): Promise<string | undefined> {
    if (this.preferredVoiceId !== undefined) {
      return this.preferredVoiceId ?? undefined;
    }
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      const enUs = voices.filter((voice) =>
        (voice.language ?? '').replace('_', '-').toLowerCase().startsWith('en-us'),
      );
      const pool =
        enUs.length > 0
          ? enUs
          : voices.filter((voice) => (voice.language ?? '').toLowerCase().startsWith('en'));
      const preferred =
        pool.find((voice) => voice.quality === Speech.VoiceQuality.Enhanced) ??
        pool.find((voice) => /samantha|zira|google.*us|jenny|aria|female|siri/i.test(voice.name)) ??
        pool[0];
      this.preferredVoiceId = preferred?.identifier ?? null;
    } catch {
      this.preferredVoiceId = null;
    }
    return this.preferredVoiceId ?? undefined;
  }

  private stopPlayer() {
    if (!this.player) return;
    try {
      this.player.pause();
      this.player.remove();
    } catch {
      // Player may already be released.
    }
    this.player = null;
  }
}

export const pronunciationService = new PronunciationService();
