import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SuccessCelebration } from '@/components/gugu/SuccessCelebration';
import { GUGU_LETTER_TINTS } from '@/components/gugu/guguControls';
import { GuguColors } from '@/constants/gugu';
import { GameResultDialog } from '@/features/games/GameResultDialog';
import { GameStatChip } from '@/features/games/GameStatChip';
import { GameWorld } from '@/features/games/GameWorld';
import { ALPHABET } from '@/features/games/crackBalloon/round';
import { HomeSpace } from '@/features/home/homeLayout';
import { audioManager } from '@/services/audio';

export const COLLECT_MAX_MIST = 2;

type LetterToken = {
  id: string;
  letter: string;
};

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function lettersForLevel(level: number): string[] {
  const start = (level * 3) % ALPHABET.length;
  return [0, 1, 2].map((offset) => ALPHABET[(start + offset) % ALPHABET.length]!);
}

function balloonsForLevel(level: number): LetterToken[] {
  const letters = lettersForLevel(level);
  const extras = 2 + (level % 3);
  const pool = [...letters];
  for (let i = 0; i < extras; i += 1) {
    pool.push(letters[i % 3]!);
  }
  return shuffle(pool).map((letter, index) => ({
    id: `${level}-${index}-${letter}`,
    letter,
  }));
}

type BasketLayout = { letter: string; x: number; y: number; width: number; height: number };

type LetterBallProps = {
  id: string;
  letter: string;
  color: string;
  size: number;
  homeX: number;
  homeY: number;
  collected: boolean;
  disabled: boolean;
  onDrop: (id: string, letter: string, centerX: number, centerY: number, reset: () => void) => void;
};

function LetterBall({ id, letter, color, size, homeX, homeY, collected, disabled, onDrop }: LetterBallProps) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  useEffect(() => {
    x.value = 0;
    y.value = 0;
  }, [homeX, homeY, id, x, y]);

  const reset = () => {
    x.value = withSpring(0);
    y.value = withSpring(0);
  };

  const finish = (dx: number, dy: number) => {
    onDrop(id, letter, homeX + dx + size / 2, homeY + dy + size / 2, reset);
  };

  const pan = Gesture.Pan()
    .enabled(!collected && !disabled)
    .onUpdate((event) => {
      x.value = event.translationX;
      y.value = event.translationY;
    })
    .onEnd((event) => {
      runOnJS(finish)(event.translationX, event.translationY);
    });

  const style = useAnimatedStyle(() => ({
    zIndex: 12,
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  if (collected) {
    return null;
  }

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.ballWrap, { left: homeX, top: homeY, width: size, height: size * 1.18 }, style]}>
        <View style={[styles.ball, { backgroundColor: color, borderRadius: size / 2 }]}>
          <Text style={[styles.ballLetter, { fontSize: Math.round(size * 0.42) }]}>{letter}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

export function CollectLettersGame() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [mist, setMist] = useState(0);
  const [collected, setCollected] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);
  const [complete, setComplete] = useState(false);
  const [celebrateKey, setCelebrateKey] = useState(0);
  const [playSize, setPlaySize] = useState({ width: 0, height: 0 });
  const [baskets, setBaskets] = useState<string[]>(() => shuffle(lettersForLevel(0)));
  const [balls, setBalls] = useState<LetterToken[]>(() => balloonsForLevel(0));
  const [busy, setBusy] = useState(false);

  const padLeft = Math.max(insets.left, HomeSpace.md);
  const padRight = Math.max(insets.right, HomeSpace.md);
  const padTop = Math.max(insets.top, HomeSpace.sm);
  const padBottom = Math.max(insets.bottom, HomeSpace.md);
  const backSize = Math.min(52, Math.max(44, height * 0.09));
  const compact = height < 430;

  const count = Math.max(1, balls.length);
  const cols = Math.min(6, Math.max(3, count));
  const ballSize = Math.min(54, Math.max(40, Math.min(playSize.width / (cols + 1.6), compact ? 44 : 54)));
  const basketW = Math.min(150, Math.max(96, playSize.width * 0.22));
  const basketH = Math.min(128, Math.max(88, playSize.height * 0.34));

  const ballHomes = useMemo(() => {
    if (!playSize.width) return [];
    const columns = Math.min(6, Math.max(3, balls.length));
    const rows = Math.ceil(balls.length / columns);
    const cellW = playSize.width / columns;
    const topArea = Math.max(ballSize + 12, playSize.height - basketH - 28);
    const cellH = Math.min(ballSize + 16, topArea / rows);
    return balls.map((ball, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      return {
        ...ball,
        x: col * cellW + (cellW - ballSize) / 2,
        y: 8 + row * cellH,
      };
    });
  }, [ballSize, balls, basketH, playSize.height, playSize.width]);

  const basketLayouts = useMemo((): BasketLayout[] => {
    if (!playSize.width || !playSize.height) return [];
    const gap = (playSize.width - basketW * 3) / 4;
    const top = playSize.height - basketH - 4;
    return baskets.map((letter, index) => ({
      letter,
      x: gap + index * (basketW + gap),
      y: top,
      width: basketW,
      height: basketH,
    }));
  }, [basketH, basketW, baskets, playSize.height, playSize.width]);

  useEffect(() => {
    void audioManager.init();
    return () => {
      audioManager.stop();
    };
  }, []);

  const loadLevel = useCallback((nextLevel: number, keepScore = true) => {
    const letters = lettersForLevel(nextLevel);
    setLevel(nextLevel);
    setMist(0);
    setCollected([]);
    setFailed(false);
    setComplete(false);
    setBusy(false);
    setBaskets(shuffle(letters));
    setBalls(balloonsForLevel(nextLevel));
    if (!keepScore) {
      setScore(0);
      setCelebrateKey(0);
    }
  }, []);

  const hitBasket = (cx: number, cy: number) => {
    return basketLayouts.find(
      (basket) =>
        cx >= basket.x - 16 &&
        cx <= basket.x + basket.width + 16 &&
        cy >= basket.y - 16 &&
        cy <= basket.y + basket.height + 16,
    );
  };

  const onDrop = (id: string, letter: string, cx: number, cy: number, reset: () => void) => {
    if (busy || failed || complete || collected.includes(id)) {
      reset();
      return;
    }
    const basket = hitBasket(cx, cy);
    if (!basket) {
      reset();
      return;
    }
    if (basket.letter === letter) {
      audioManager.playSuccess();
      setCollected((value) => {
        const next = [...value, id];
        if (next.length >= balls.length) {
          setBusy(true);
          setCelebrateKey((key) => key + 1);
          setTimeout(() => setComplete(true), 420);
        }
        return next;
      });
      setScore((value) => value + 1);
      return;
    }

    audioManager.playRetry();
    reset();
    setMist((value) => {
      const next = value + 1;
      if (next >= COLLECT_MAX_MIST) {
        setFailed(true);
        setBusy(true);
      }
      return next;
    });
  };

  const collectedFor = (letter: string) =>
    balls.filter((ball) => ball.letter === letter && collected.includes(ball.id)).length;
  const totalFor = (letter: string) => balls.filter((ball) => ball.letter === letter).length;

  return (
    <GameWorld backSize={backSize} padLeft={padLeft} padTop={padTop} onBack={() => router.back()}>
      <View
        style={[
          styles.hud,
          {
            paddingTop: padTop,
            paddingRight: padRight,
            paddingLeft: padLeft + backSize + HomeSpace.sm,
            maxWidth: 980,
            alignSelf: 'center',
            width: '100%',
          },
        ]}>
        <Text style={[styles.level, { fontSize: compact ? 18 : 22 }]}>Level {level + 1}</Text>
        <View style={styles.stats}>
          <GameStatChip label="Score" value={`${score}`} />
          <GameStatChip label="Mist" value={`${mist} / ${COLLECT_MAX_MIST}`} />
        </View>
      </View>

      <View
        style={[
          styles.play,
          {
            marginLeft: padLeft,
            marginRight: padRight,
            marginBottom: padBottom,
            maxWidth: 980,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
        onLayout={(event) => {
          const next = event.nativeEvent.layout;
          setPlaySize((current) =>
            current.width === next.width && current.height === next.height
              ? current
              : { width: next.width, height: next.height },
          );
        }}>
        {basketLayouts.map((basket) => (
          <View
            key={`basket-${basket.letter}`}
            style={[styles.basketWrap, { left: basket.x, top: basket.y, width: basket.width, height: basket.height }]}>
            <Text style={[styles.basketLabel, { fontSize: compact ? 18 : 22 }]}>{basket.letter}</Text>
            <Image source={require('@/assets/images/game-basket.png')} style={styles.basketArt} contentFit="contain" />
            <Text style={styles.basketCount}>
              {collectedFor(basket.letter)}/{totalFor(basket.letter)}
            </Text>
          </View>
        ))}

        {ballHomes.map((home, index) => (
          <LetterBall
            key={home.id}
            id={home.id}
            letter={home.letter}
            color={GUGU_LETTER_TINTS[index % GUGU_LETTER_TINTS.length]}
            size={ballSize}
            homeX={home.x}
            homeY={home.y}
            collected={collected.includes(home.id)}
            disabled={busy || failed || complete}
            onDrop={onDrop}
          />
        ))}
      </View>

      <GameResultDialog
        visible={failed}
        title="Let's try again!"
        message="Drop each balloon in the matching basket."
        scoreLabel="Level"
        scoreValue={`${level + 1}`}
        mistValue={`${mist} / ${COLLECT_MAX_MIST}`}
        actionLabel="Retry Level"
        onAction={() => loadLevel(level, true)}
      />
      <GameResultDialog
        visible={complete}
        title="Level Complete!"
        message="You collected every letter. Ready for the next one?"
        scoreValue={`${score}`}
        mistValue={`${mist} / ${COLLECT_MAX_MIST}`}
        actionLabel="Next Level"
        onAction={() => loadLevel(level + 1, true)}
      />
      <SuccessCelebration playKey={celebrateKey} />
    </GameWorld>
  );
}

const styles = StyleSheet.create({
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 6,
    minHeight: 64,
  },
  level: {
    fontFamily: 'Nunito_800ExtraBold',
    fontWeight: '800',
    color: GuguColors.ink,
  },
  stats: {
    flexDirection: 'row',
    gap: HomeSpace.sm,
  },
  play: {
    flex: 1,
    minHeight: 0,
  },
  basketWrap: {
    position: 'absolute',
    alignItems: 'center',
  },
  basketLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontWeight: '800',
    color: GuguColors.ink,
    marginBottom: 2,
  },
  basketArt: {
    width: '100%',
    flex: 1,
  },
  basketCount: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: GuguColors.ink,
    marginTop: -4,
  },
  ballWrap: {
    position: 'absolute',
  },
  ball: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2B3A4A',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  ballLetter: {
    fontFamily: 'Nunito_800ExtraBold',
    fontWeight: '800',
    color: GuguColors.ink,
  },
});
