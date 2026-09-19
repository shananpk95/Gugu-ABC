import type { ImageSource } from 'expo-image';

export type WordItem = {
  letter: string;
  word: string;
  image: ImageSource;
};

export const WORD_ITEMS: WordItem[] = [
  { letter: 'A', word: 'Apple', image: require('@/assets/images/word-apple.png') },
  { letter: 'B', word: 'Ball', image: require('@/assets/images/word-ball.png') },
  { letter: 'C', word: 'Cat', image: require('@/assets/images/word-cat.png') },
  { letter: 'D', word: 'Dog', image: require('@/assets/images/word-dog.png') },
  { letter: 'E', word: 'Elephant', image: require('@/assets/images/word-elephant.png') },
  { letter: 'F', word: 'Fish', image: require('@/assets/images/word-fish.png') },
  { letter: 'G', word: 'Goat', image: require('@/assets/images/word-goat.png') },
  { letter: 'H', word: 'Hat', image: require('@/assets/images/word-hat.png') },
  { letter: 'I', word: 'Ice Cream', image: require('@/assets/images/word-icecream.png') },
  { letter: 'J', word: 'Juice', image: require('@/assets/images/word-juice.png') },
  { letter: 'K', word: 'Kite', image: require('@/assets/images/word-kite.png') },
  { letter: 'L', word: 'Lion', image: require('@/assets/images/word-lion.png') },
  { letter: 'M', word: 'Mango', image: require('@/assets/images/word-mango.png') },
  { letter: 'N', word: 'Nest', image: require('@/assets/images/word-nest.png') },
  { letter: 'O', word: 'Orange', image: require('@/assets/images/word-orange.png') },
  { letter: 'P', word: 'Penguin', image: require('@/assets/images/word-penguin.png') },
  { letter: 'Q', word: 'Queen', image: require('@/assets/images/word-queen.png') },
  { letter: 'R', word: 'Rabbit', image: require('@/assets/images/word-rabbit.png') },
  { letter: 'S', word: 'Sun', image: require('@/assets/images/word-sun.png') },
  { letter: 'T', word: 'Tiger', image: require('@/assets/images/word-tiger.png') },
  { letter: 'U', word: 'Umbrella', image: require('@/assets/images/word-umbrella.png') },
  { letter: 'V', word: 'Van', image: require('@/assets/images/word-van.png') },
  { letter: 'W', word: 'Whale', image: require('@/assets/images/word-whale.png') },
  { letter: 'X', word: 'Xylophone', image: require('@/assets/images/word-xylophone.png') },
  { letter: 'Y', word: 'Yak', image: require('@/assets/images/word-yak.png') },
  { letter: 'Z', word: 'Zebra', image: require('@/assets/images/word-zebra.png') },
];

export function getWordItems(): WordItem[] {
  return WORD_ITEMS;
}

export function getWordItem(index: number): WordItem {
  return WORD_ITEMS[Math.max(0, Math.min(index, WORD_ITEMS.length - 1))]!;
}
