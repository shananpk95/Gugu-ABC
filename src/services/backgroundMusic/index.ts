import { AppState, type AppStateStatus } from 'react-native';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

const MUSIC_SOURCE = require('../../../assets/audio/music/gugu-bgm-source.mp3');

const NORMAL_VOLUME = 0.13;
const SPEECH_VOLUME = 0.04;
const PHONICS_VOLUME = 0.03;
const EFFECT_VOLUME = 0.04;
const FADE_DOWN_MS = 180;
const FADE_UP_MS = 320;

export type MusicDuckKind = 'speech' | 'phonics' | 'effect';

class BackgroundMusic {
  private player: AudioPlayer | null = null;
  private enabled = true;
  private started = false;
  private appActive = true;
  private duckCounts: Record<MusicDuckKind, number> = {
    speech: 0,
    phonics: 0,
    effect: 0,
  };
  private fadeToken = 0;
  private targetVolume = NORMAL_VOLUME;
  private appSub: { remove: () => void } | null = null;

  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.pause();
      return;
    }
    if (this.started && this.appActive) {
      this.resume();
    }
  }

  async start() {
    this.listenAppState();
    if (this.started) {
      this.resume();
      return;
    }
    this.started = true;
    if (!this.enabled || !this.appActive) return;
    this.ensurePlayer();
    this.fadeTo(this.currentDuckVolume(), FADE_UP_MS);
    this.player?.play();
  }

  pause() {
    try {
      this.player?.pause();
    } catch {
      // Player may already be released.
    }
  }

  resume() {
    if (!this.enabled || !this.appActive || !this.started) return;
    this.ensurePlayer();
    this.player?.play();
    this.fadeTo(this.currentDuckVolume(), FADE_UP_MS);
  }

  stop() {
    this.started = false;
    this.fadeToken += 1;
    if (!this.player) return;
    try {
      this.player.pause();
      this.player.remove();
    } catch {
      // Player may already be released.
    }
    this.player = null;
  }

  duck(kind: MusicDuckKind) {
    this.duckCounts[kind] += 1;
    this.fadeTo(this.currentDuckVolume(), FADE_DOWN_MS);
  }

  unduck(kind: MusicDuckKind) {
    this.duckCounts[kind] = Math.max(0, this.duckCounts[kind] - 1);
    this.fadeTo(this.currentDuckVolume(), FADE_UP_MS);
  }

  private currentDuckVolume() {
    if (!this.enabled) return 0;
    if (this.duckCounts.phonics > 0) return PHONICS_VOLUME;
    if (this.duckCounts.speech > 0) return SPEECH_VOLUME;
    if (this.duckCounts.effect > 0) return EFFECT_VOLUME;
    return NORMAL_VOLUME;
  }

  private ensurePlayer() {
    if (this.player) return;
    this.player = createAudioPlayer(MUSIC_SOURCE, { keepAudioSessionActive: true });
    this.player.loop = true;
    this.player.volume = 0;
  }

  private fadeTo(volume: number, durationMs: number) {
    this.targetVolume = volume;
    if (!this.player) return;
    this.fadeToken += 1;
    const token = this.fadeToken;
    const from = this.player.volume;
    const startedAt = Date.now();
    const step = () => {
      if (token !== this.fadeToken || !this.player) return;
      const t = Math.min(1, (Date.now() - startedAt) / Math.max(1, durationMs));
      const eased = t * t * (3 - 2 * t);
      this.player.volume = from + (this.targetVolume - from) * eased;
      if (t < 1) setTimeout(step, 32);
    };
    step();
  }

  private listenAppState() {
    if (this.appSub) return;
    this.appSub = AppState.addEventListener('change', (state: AppStateStatus) => {
      this.appActive = state === 'active';
      if (!this.appActive) {
        this.pause();
        return;
      }
      this.resume();
    });
  }
}

export const backgroundMusic = new BackgroundMusic();
