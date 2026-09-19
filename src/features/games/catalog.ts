import type { ImageSource } from 'expo-image';
import type { Href } from 'expo-router';

export type GameId = 'crack-balloon' | 'collect-letters';

export type GameEntry = {
  id: GameId;
  label: string;
  href: Href;
  icon: ImageSource;
};

export const GAME_CATALOG: GameEntry[] = [
  {
    id: 'crack-balloon',
    label: 'Crack the Balloon',
    href: '/practice/games/crack-balloon' as Href,
    icon: require('@/assets/images/subcat-crack-balloon.png'),
  },
  {
    id: 'collect-letters',
    label: 'Collect the Letters',
    href: '/practice/games/collect-letters' as Href,
    icon: require('@/assets/images/subcat-collect-letters.png'),
  },
];
