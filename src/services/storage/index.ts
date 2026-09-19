import AsyncStorage from '@react-native-async-storage/async-storage';

export type TracingProgressMap = Record<string, boolean>;

export type ChildProgress = {
  stars: number;
  tracing: {
    uppercase: TracingProgressMap;
    lowercase: TracingProgressMap;
  };
};

const PROGRESS_KEY = 'gugu.childProgress';

const EMPTY_PROGRESS: ChildProgress = {
  stars: 0,
  tracing: {
    uppercase: {},
    lowercase: {},
  },
};

export async function getProgress(): Promise<ChildProgress> {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...EMPTY_PROGRESS, tracing: { uppercase: {}, lowercase: {} } };
    const parsed = JSON.parse(raw) as ChildProgress;
    return {
      stars: typeof parsed.stars === 'number' ? parsed.stars : 0,
      tracing: {
        uppercase: parsed.tracing?.uppercase ?? {},
        lowercase: parsed.tracing?.lowercase ?? {},
      },
    };
  } catch {
    return { ...EMPTY_PROGRESS, tracing: { uppercase: {}, lowercase: {} } };
  }
}

export async function saveProgress(progress: ChildProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Storage failure must not crash tracing.
  }
}

export type AppSettings = {
  voiceEnabled: boolean;
};

const SETTINGS_KEY = 'gugu.settings';

const EMPTY_SETTINGS: AppSettings = {
  voiceEnabled: true,
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...EMPTY_SETTINGS };
    const parsed = JSON.parse(raw) as AppSettings;
    return { voiceEnabled: parsed.voiceEnabled !== false };
  } catch {
    return { ...EMPTY_SETTINGS };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Settings failure must not crash tracing.
  }
}
