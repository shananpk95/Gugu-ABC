export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const MAX_BALLOONS = 10;

export type BalloonItem = {
  id: string;
  letter: string;
  colorIndex: number;
};

export type BalloonRound = {
  target: string;
  balloons: BalloonItem[];
};

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function createBalloonRound(previousTarget?: string, round = 0): BalloonRound {
  const choices = ALPHABET.filter((letter) => letter !== previousTarget);
  const target = pick(choices.length ? choices : ALPHABET);
  const count = Math.min(MAX_BALLOONS, 6 + Math.floor(Math.random() * 5));
  const distractors = Array.from({ length: count - 1 }, () =>
    pick(ALPHABET.filter((letter) => letter !== target)),
  );
  const balloons = shuffle([target, ...distractors]).map((letter, index) => ({
    id: `${round}-${index}-${letter}-${Math.random().toString(36).slice(2, 6)}`,
    letter,
    colorIndex: (index * 3 + letter.charCodeAt(0)) % 8,
  }));

  return { target, balloons };
}
