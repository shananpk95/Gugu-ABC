import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';

import { getSettings, saveSettings } from '@/services/storage';
import type { PronunciationClip } from '@/types/pronunciation';

const successSource = require('../../../assets/audio/effects/success.wav');
const retrySource = require('../../../assets/audio/effects/retry.wav');
const tapSource = require('../../../assets/audio/effects/tap.wav');

class AudioManager {
  private successPlayer: AudioPlayer | null = null;
  private retryPlayer: AudioPlayer | null = null;
  private tapPlayer: AudioPlayer | null = null;
  private ready = false;
  private speaking = false;
  private voiceEnabled = true;
  private speakGeneration = 0;
  private clipPlayer: AudioPlayer | null = null;

  async init() {
    if (this.ready) return;
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'mixWithOthers',
        shouldPlayInBackground: false,
      });
      this.successPlayer = createAudioPlayer(successSource);
      this.retryPlayer = createAudioPlayer(retrySource);
      this.tapPlayer = createAudioPlayer(tapSource);
      const settings = await getSettings();
      this.voiceEnabled = settings.voiceEnabled;
      this.ready = true;
    } catch {
      this.ready = false;
    }
  }

  private replay(player: AudioPlayer | null) {
    if (!player) return;
    void player.seekTo(0).then(() => {
      player.play();
    }).catch(() => {
      // Missing or interrupted audio must not crash tracing.
    });
  }

  isVoiceEnabled() {
    return this.voiceEnabled;
  }

  async setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
    await saveSettings({ voiceEnabled: enabled });
  }

  playSuccess() {
    if (!this.voiceEnabled) return;
    this.replay(this.successPlayer);
  }

  playRetry() {
    if (!this.voiceEnabled) return;
    this.replay(this.retryPlayer);
  }

  playTap() {
    if (!this.voiceEnabled) return;
    this.replay(this.tapPlayer);
  }

  async playPraise(letter: string) {
    await this.init();
    if (!this.voiceEnabled) return;
    Speech.stop();
    this.speaking = true;
    await new Promise<void>((resolve) => {
      Speech.speak(`Great! ${letter}!`, {
        language: 'en-US',
        pitch: 1.08,
        rate: 0.86,
        onDone: () => {
          this.speaking = false;
          resolve();
        },
        onStopped: () => {
          this.speaking = false;
          resolve();
        },
        onError: () => {
          this.speaking = false;
          resolve();
        },
      });
    });
  }

  async playPronunciation(clip: PronunciationClip) {
    await this.init();
    this.speakGeneration += 1;
    const generation = this.speakGeneration;
    Speech.stop();
    this.stopClipPlayer();
    this.speaking = true;

    if (clip.audio) {
      try {
        this.clipPlayer = createAudioPlayer(clip.audio);
        this.clipPlayer.play();
        this.speaking = false;
        return;
      } catch {
        // Fall through to the TTS prompt for this letter.
      }
    }

    await new Promise<void>((resolve) => {
      Speech.speak(clip.speakText, {
        language: 'en-US',
        pitch: clip.pitch ?? 1.05,
        rate: clip.rate ?? 0.8,
        onDone: () => {
          if (generation === this.speakGeneration) this.speaking = false;
          resolve();
        },
        onStopped: () => {
          if (generation === this.speakGeneration) this.speaking = false;
          resolve();
        },
        onError: () => {
          if (generation === this.speakGeneration) this.speaking = false;
          resolve();
        },
      });
    });
  }

  async playWordPhrase(letterSpeak: string, word: string) {
    await this.playPronunciation({
      ipa: '',
      speakText: `${letterSpeak} for ${word}`,
      rate: 0.82,
      pitch: 1.08,
    });
  }

  private stopClipPlayer() {
    if (!this.clipPlayer) return;
    try {
      this.clipPlayer.pause();
      this.clipPlayer.remove();
    } catch {
      // Player may already be released.
    }
    this.clipPlayer = null;
  }

  stop() {
    this.speakGeneration += 1;
    Speech.stop();
    this.stopClipPlayer();
    this.speaking = false;
  }
}

export const audioManager = new AudioManager();
