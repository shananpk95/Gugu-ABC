import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import { backgroundMusic } from '@/services/backgroundMusic';
import { pronunciationService } from '@/services/pronunciation';
import { getSettings, saveSettings } from '@/services/storage';

const celebrateWowSource = require('../../../assets/audio/effects/celebrate-wow.mp3');
const successSource = require('../../../assets/audio/effects/success.mp3');
const retrySource = require('../../../assets/audio/effects/retry.mp3');
const tapSource = require('../../../assets/audio/effects/tap.mp3');

/** Matches celebrate-wow.mp3 length (kids cheer clip 0:14–0:17). */
const CELEBRATE_WOW_MS = 3000;
const LETTER_GAP_MS = 280;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

class AudioManager {
  private celebrateWowPlayer: AudioPlayer | null = null;
  private successPlayer: AudioPlayer | null = null;
  private retryPlayer: AudioPlayer | null = null;
  private tapPlayer: AudioPlayer | null = null;
  private ready = false;
  private voiceEnabled = true;
  private musicEnabled = true;
  private effectDuckTimer: ReturnType<typeof setTimeout> | null = null;
  private drawCompletionGeneration = 0;
  private levelUpLockUntil = 0;

  async init() {
    if (this.ready) return;
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'mixWithOthers',
        shouldPlayInBackground: false,
      });
      this.celebrateWowPlayer = createAudioPlayer(celebrateWowSource);
      this.successPlayer = createAudioPlayer(successSource);
      this.retryPlayer = createAudioPlayer(retrySource);
      this.tapPlayer = createAudioPlayer(tapSource);
      const settings = await getSettings();
      this.voiceEnabled = settings.voiceEnabled;
      this.musicEnabled = settings.musicEnabled;
      pronunciationService.setVoiceEnabled(this.voiceEnabled);
      backgroundMusic.setEnabled(this.musicEnabled);
      await pronunciationService.init();
      this.ready = true;
    } catch {
      this.ready = false;
    }
  }

  private replay(player: AudioPlayer | null) {
    if (!player) return;
    void player
      .seekTo(0)
      .then(() => {
        player.play();
      })
      .catch(() => {
        // Missing or interrupted audio must not crash tracing.
      });
  }

  isVoiceEnabled() {
    return this.voiceEnabled;
  }

  async setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
    pronunciationService.setVoiceEnabled(enabled);
    if (!enabled) {
      this.stop();
    }
    await saveSettings({ voiceEnabled: enabled });
  }

  isMusicEnabled() {
    return this.musicEnabled;
  }

  async setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    backgroundMusic.setEnabled(enabled);
    if (enabled) {
      await backgroundMusic.start();
    }
    await saveSettings({ musicEnabled: enabled });
  }

  /** Loud kids cheering celebration for Draw letter complete. */
  playCelebrateWow() {
    if (!this.voiceEnabled) return;
    const player = this.celebrateWowPlayer;
    if (!player) return;
    try {
      player.volume = 1;
    } catch {
      // Volume may be unavailable on some platforms.
    }
    this.replay(player);
    this.duckEffect(CELEBRATE_WOW_MS + 400);
  }

  /**
   * Games level-up: short energetic cheer with BGM duck/restore.
   * Plays once per level-up event (guards duplicate calls).
   */
  playLevelUp() {
    if (!this.voiceEnabled) return;
    const now = Date.now();
    if (now < this.levelUpLockUntil) return;
    this.levelUpLockUntil = now + CELEBRATE_WOW_MS;

    const player = this.celebrateWowPlayer;
    if (!player) return;
    try {
      player.volume = 1;
    } catch {
      // Volume may be unavailable on some platforms.
    }
    this.replay(player);
    this.duckEffect(CELEBRATE_WOW_MS + 400);
  }

  /**
   * Draw completion: energetic celebration → short gap → loud letter name.
   * Flower shower is triggered separately in TracingSession.
   */
  async playDrawCompletion(letter: string) {
    await this.init();
    if (!this.voiceEnabled) return;
    this.drawCompletionGeneration += 1;
    const generation = this.drawCompletionGeneration;

    backgroundMusic.duck('effect');
    this.playCelebrateWow();
    await sleep(CELEBRATE_WOW_MS);
    if (generation !== this.drawCompletionGeneration || !this.voiceEnabled) {
      backgroundMusic.unduck('effect');
      return;
    }

    await sleep(LETTER_GAP_MS);
    if (generation !== this.drawCompletionGeneration || !this.voiceEnabled) return;

    this.duckEffect(LETTER_GAP_MS + 1100);
    await pronunciationService.playLetterAnnounce(letter);
  }

  cancelDrawCompletion() {
    this.drawCompletionGeneration += 1;
    pronunciationService.stopPronunciation();
  }

  playSuccess() {
    if (!this.voiceEnabled) return;
    this.replay(this.successPlayer);
    this.duckEffect();
  }

  playRetry() {
    if (!this.voiceEnabled) return;
    this.replay(this.retryPlayer);
    this.duckEffect();
  }

  playTap() {
    if (!this.voiceEnabled) return;
    this.replay(this.tapPlayer);
  }

  async playWordPhrase(letter: string, word: string) {
    await this.init();
    await pronunciationService.playWord(letter, word);
  }

  stop() {
    this.cancelDrawCompletion();
    this.levelUpLockUntil = 0;
    if (this.effectDuckTimer) {
      clearTimeout(this.effectDuckTimer);
      this.effectDuckTimer = null;
      backgroundMusic.unduck('effect');
    }
    pronunciationService.stopPronunciation();
  }

  private duckEffect(ms = 480) {
    backgroundMusic.duck('effect');
    if (this.effectDuckTimer) clearTimeout(this.effectDuckTimer);
    this.effectDuckTimer = setTimeout(() => {
      backgroundMusic.unduck('effect');
      this.effectDuckTimer = null;
    }, ms);
  }
}

export const audioManager = new AudioManager();
