import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SuccessCelebration } from '@/components/gugu/SuccessCelebration';
import { GuguColors } from '@/constants/gugu';
import { CollectBalloon } from '@/features/games/collectLetters/CollectBalloon';
import { GameResultDialog } from '@/features/games/GameResultDialog';
import { GameStatChip } from '@/features/games/GameStatChip';
import { GameWorld } from '@/features/games/GameWorld';
import { ALPHABET } from '@/features/games/crackBalloon/round';
import { HomeSpace } from '@/features/home/homeLayout';
import { audioManager } from '@/services/audio';

const COLLECT_MAX_MIST = 2;

/** Baskets: 6.75× original (4.5 × 1.5); clamped only so 3 stay on-screen. */
const BASKET_SIZE_SCALE = 6.75;
/** Basket letter sticker: 1.5× original Nunito size. */
const BASKET_LETTER_SCALE = 1.5;
/** Collectible balloons: 1.5× previous collectible size. */
const COLLECT_BALLOON_SCALE = 1.5;

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

type BasketLayout = {
  letter: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Collision matches visible basket art (sticker is on the art). */
  hitX: number;
  hitY: number;
  hitW: number;
  hitH: number;
  hitPad: number;
};

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
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const padLeft = Math.max(insets.left, HomeSpace.md);
  const padRight = Math.max(insets.right, HomeSpace.md);
  const padTop = Math.max(insets.top, HomeSpace.sm);
  const padBottom = Math.max(insets.bottom, HomeSpace.md);
  const backSize = Math.min(52, Math.max(44, height * 0.09));
  const compact = height < 430;

  const count = Math.max(1, balls.length);
  const cols = Math.min(6, Math.max(3, count));
  const originalBallSize = Math.min(54, Math.max(40, Math.min(playSize.width / (cols + 1.6), compact ? 44 : 54)));
  const ballSize = originalBallSize * COLLECT_BALLOON_SCALE;
  const balloonVisualH = ballSize * 1.22 + Math.max(12, Math.round(ballSize * 0.28)) + 8;

  const originalLabelSize = compact ? 18 : 22;
  const labelSize = Math.round(originalLabelSize * BASKET_LETTER_SCALE);
  const stickerPad = Math.max(6, Math.round(labelSize * 0.28));
  const stickerSize = labelSize + stickerPad * 2;
  const countH = 16;

  const originalBasketW = Math.min(150, Math.max(96, playSize.width * 0.22));
  const originalBasketH = Math.min(128, Math.max(88, playSize.height * 0.34));
  const desiredBasketW = originalBasketW * BASKET_SIZE_SCALE;
  const desiredBasketH = originalBasketH * BASKET_SIZE_SCALE;

  // Fit 3 baskets on screen while targeting 6.75×.
  const minGap = 6;
  const maxBasketW = playSize.width > 0 ? (playSize.width - minGap * 4) / 3 : desiredBasketW;
  const minFallSpace = Math.max(balloonVisualH + 16, playSize.height * 0.22);
  const maxBasketH =
    playSize.height > 0 ? Math.max(48, playSize.height - countH - minFallSpace - 4) : desiredBasketH;
  const fitScale = Math.min(1, maxBasketW / Math.max(1, desiredBasketW), maxBasketH / Math.max(1, desiredBasketH));
  const basketW = desiredBasketW * fitScale;
  const basketH = desiredBasketH * fitScale;
  const hitPad = 16 * BASKET_SIZE_SCALE * fitScale;

  const ballHomes = useMemo(() => {
    if (!playSize.width) return [];
    const columns = Math.min(6, Math.max(3, balls.length));
    const rows = Math.ceil(balls.length / columns);
    const cellW = playSize.width / columns;
    const topArea = Math.max(balloonVisualH + 12, playSize.height - basketH - countH - 28);
    const cellH = Math.min(balloonVisualH + 12, topArea / rows);
    return balls.map((ball, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      return {
        ...ball,
        x: col * cellW + (cellW - ballSize) / 2,
        y: 8 + row * cellH,
      };
    });
  }, [ballSize, balls, balloonVisualH, basketH, countH, playSize.height, playSize.width]);

  const basketLayouts = useMemo((): BasketLayout[] => {
    if (!playSize.width || !playSize.height) return [];
    const gap = (playSize.width - basketW * 3) / 4;
    const artTop = playSize.height - basketH - countH - 4;
    return baskets.map((letter, index) => {
      const x = gap + index * (basketW + gap);
      return {
        letter,
        x,
        y: artTop,
        width: basketW,
        height: basketH + countH,
        hitX: x,
        hitY: artTop,
        hitW: basketW,
        hitH: basketH,
        hitPad,
      };
    });
  }, [basketH, basketW, baskets, countH, hitPad, playSize.height, playSize.width]);

  useEffect(() => {
    void audioManager.init();
    return () => {
      if (completeTimerRef.current) {
        clearTimeout(completeTimerRef.current);
        completeTimerRef.current = null;
      }
      audioManager.stop();
    };
  }, []);

  const loadLevel = useCallback((nextLevel: number, keepScore = true) => {
    if (completeTimerRef.current) {
      clearTimeout(completeTimerRef.current);
      completeTimerRef.current = null;
    }
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
        cx >= basket.hitX - basket.hitPad &&
        cx <= basket.hitX + basket.hitW + basket.hitPad &&
        cy >= basket.hitY - basket.hitPad &&
        cy <= basket.hitY + basket.hitH + basket.hitPad,
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
      const willComplete = collected.length + 1 >= balls.length;
      setCollected((value) => [...value, id]);
      setScore((value) => value + 1);
      if (willComplete) {
        setBusy(true);
        setCelebrateKey((key) => key + 1);
        audioManager.playLevelUp();
        if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
        completeTimerRef.current = setTimeout(() => {
          completeTimerRef.current = null;
          setComplete(true);
        }, 420);
      }
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
            <View style={[styles.basketArtWrap, { height: basketH }]}>
              <Image
                source={require('@/assets/images/game-basket.png')}
                style={styles.basketArt}
                contentFit="contain"
              />
              {/* Sticker centered on the woven front wall (below green rim). */}
              <View
                pointerEvents="none"
                style={[
                  styles.letterSticker,
                  {
                    width: stickerSize,
                    height: stickerSize,
                    borderRadius: stickerSize * 0.28,
                    // Front-wall band sits roughly mid-lower on the basket art.
                    top: basketH * 0.52 - stickerSize / 2,
                    left: (basket.width - stickerSize) / 2,
                    transform: [{ scaleY: 0.94 }],
                  },
                ]}>
                <Text style={[styles.stickerLetter, { fontSize: labelSize, lineHeight: labelSize + 2 }]}>
                  {basket.letter}
                </Text>
              </View>
            </View>
            <Text style={styles.basketCount}>
              {collectedFor(basket.letter)}/{totalFor(basket.letter)}
            </Text>
          </View>
        ))}

        {ballHomes.map((home, index) => (
          <CollectBalloon
            key={home.id}
            id={home.id}
            letter={home.letter}
            colorIndex={index}
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
  basketArtWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  basketArt: {
    width: '100%',
    height: '100%',
  },
  letterSticker: {
    position: 'absolute',
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDF8',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.98)',
    // Soft contact shadow — reads as stuck on, not floating above.
    shadowColor: '#2B3A4A',
    shadowOpacity: 0.12,
    shadowRadius: 1.5,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  stickerLetter: {
    fontFamily: 'Nunito_800ExtraBold',
    fontWeight: '800',
    color: GuguColors.ink,
    textAlign: 'center',
  },
  basketCount: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: GuguColors.ink,
    marginTop: -4,
  },
});
