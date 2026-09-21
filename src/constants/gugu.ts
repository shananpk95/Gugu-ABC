import type { ImageSource } from 'expo-image';

export const GuguColors = {
  sky: '#7EC8E3',
  yellow: '#FFE08A',
  mint: '#B7EBD0',
  /** Balloon letter face — rgb(132,184,157) */
  green: '#84B89D',
  greenMid: '#51856A',
  greenDark: '#1E5237',
  greenDeep: '#001C08',
  greenInk: '#000602',
  coral: '#FF8B7B',
  lavender: '#D5C7F5',
  peach: '#FFD3B6',
  cream: '#FFF8F0',
  ink: '#2B3A4A',
  muted: '#5D6D7E',
  white: '#FFFFFF',
} as const;

export type AppHref = '/' | '/learn' | '/practice' | '/practice/tracing' | '/practice/listen' | '/practice/games' | '/practice/words' | '/games' | '/progress';

export type HomeSliderKind = 'real' | 'dummy';

export type HomeSliderCategory = {
  id: string;
  title: string;
  subtitle: string;
  tint: string;
  kind: HomeSliderKind;
  href?: AppHref;
  icon: ImageSource;
};

/** Home carousel: icons only. Titles are for accessibility, not on-screen labels. */
export const HOME_SLIDER_CATEGORIES: HomeSliderCategory[] = [
  {
    id: 'draw',
    title: 'Draw',
    subtitle: 'Tracing and drawing letters',
    tint: GuguColors.lavender,
    kind: 'real',
    href: '/practice/tracing',
    icon: require('@/assets/images/draw-icon.png'),
  },
  {
    id: 'listen',
    title: 'Listen',
    subtitle: 'Letter sounds and pronunciation',
    tint: GuguColors.yellow,
    kind: 'real',
    href: '/practice/listen',
    icon: require('@/assets/images/listen-icon.png'),
  },
  {
    id: 'game',
    title: 'Game',
    subtitle: 'Letter games',
    tint: GuguColors.coral,
    kind: 'real',
    href: '/practice/games',
    icon: require('@/assets/images/game-icon.png'),
  },
  {
    id: 'words',
    title: 'Words',
    subtitle: 'Learning words',
    tint: GuguColors.peach,
    kind: 'real',
    href: '/practice/words',
    icon: require('@/assets/images/words-icon.png'),
  },
];

export const LEARN_SECTIONS = [
  'Alphabet',
  'Pronunciation',
  'Phonics',
  'Vocabulary',
  'Reading',
] as const;

export const GAME_SECTIONS = [
  'Find the Letter',
  'Letter Matching',
  'Memory Match',
  'Missing Letter',
  'Listening Quiz',
  'Word Builder',
] as const;
