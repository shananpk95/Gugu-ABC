import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { GuguIconButton } from '@/components/gugu/GuguIconButton';
import { SuccessCelebration } from '@/components/gugu/SuccessCelebration';
import { GuguColors } from '@/constants/gugu';
import { GameResultDialog } from '@/features/games/GameResultDialog';
import { GameStatChip } from '@/features/games/GameStatChip';
import { GameWorld } from '@/features/games/GameWorld';
import { LetterBalloon } from '@/features/games/crackBalloon/LetterBalloon';
import { TargetLetter3D } from '@/features/games/crackBalloon/TargetLetter3D';
import { createBalloonRound, type BalloonItem } from '@/features/games/crackBalloon/round';
import { HomeSpace } from '@/features/home/homeLayout';
import { audioManager } from '@/services/audio';
import { pronunciationService } from '@/services/pronunciation';

function SpeakerGlyph({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3.5 9.2h3.1L11 5.8v12.4L6.6 14.8H3.5c-.6 0-1-.4-1-1V10.2c0-.6.4-1 1-1Z" fill={GuguColors.ink} />
      <Path
        d="M14.2 8.2c1.2 1.1 1.9 2.5 1.9 3.8s-.7 2.7-1.9 3.8M16.8 6.2c1.9 1.7 3 3.7 3 5.8s-1.1 4.1-3 5.8"
        stroke={GuguColors.ink}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

type PlacedBalloon = BalloonItem & { left: number; top: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Distribute balloons across the right-side play area only (never the letter column). */
function placeBalloons(
  balloons: BalloonItem[],
  areaWidth: number,
  areaHeight: number,
  size: number,
): PlacedBalloon[] {
  const cols = Math.min(4, Math.max(3, Math.ceil(Math.sqrt(balloons.length * 1.2))));
  const rows = Math.ceil(balloons.length / cols);
  const cellW = areaWidth / cols;
  const cellH = areaHeight / rows;
  const balloonH = size * 1.22 + 18;
  const padX = Math.max(4, size * 0.06);
  const padY = Math.max(4, size * 0.05);

  return balloons.map((balloon, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const jitterX = ((index % 3) - 1) * Math.min(12, cellW * 0.08);
    const jitterY = ((index % 2) - 0.5) * Math.min(10, cellH * 0.1);
    const left = col * cellW + (cellW - size) / 2 + jitterX;
    const top = row * cellH + (cellH - balloonH) / 2 + jitterY;
    return {
      ...balloon,
      left: clamp(left, padX, Math.max(padX, areaWidth - size - padX)),
      top: clamp(top, padY, Math.max(padY, areaHeight - balloonH - padY)),
    };
  });
}

export function CrackBalloonGame() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [roundData, setRoundData] = useState(() => createBalloonRound(undefined, 0));
  const [poppedId, setPoppedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [celebrateKey, setCelebrateKey] = useState(0);
  const [letterPaneSize, setLetterPaneSize] = useState({ width: 0, height: 0 });
  const [balloonPaneSize, setBalloonPaneSize] = useState({ width: 0, height: 0 });
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const padLeft = Math.max(insets.left, HomeSpace.md);
  const padRight = Math.max(insets.right, HomeSpace.md);
  const padTop = Math.max(insets.top, HomeSpace.sm);
  const padBottom = Math.max(insets.bottom, HomeSpace.md);
  const backSize = Math.min(52, Math.max(44, height * 0.09));
  const speakSize = Math.min(48, Math.max(40, height * 0.08));

  const letterW = letterPaneSize.width || width * 0.3;
  const letterH = letterPaneSize.height || height * 0.7;
  const targetSize = Math.min(letterW * 0.88, letterH * 0.72);

  const balloonW = balloonPaneSize.width || width * 0.7;
  const balloonH = balloonPaneSize.height || height * 0.7;
  const balloonSize = Math.min(76, Math.max(54, Math.min(balloonW / 5.5, balloonH / 3.2)));

  const placed = useMemo(() => {
    if (!balloonPaneSize.width || !balloonPaneSize.height) return [];
    return placeBalloons(roundData.balloons, balloonPaneSize.width, balloonPaneSize.height, balloonSize);
  }, [balloonPaneSize.height, balloonPaneSize.width, balloonSize, roundData.balloons]);

  useEffect(() => {
    void audioManager.init();
    return () => {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = null;
      }
      audioManager.stop();
    };
  }, []);

  const speakTarget = useCallback(() => {
    void pronunciationService.playLetterName(roundData.target);
  }, [roundData.target]);

  const nextRound = useCallback((currentTarget: string, nextIndex: number) => {
    setPoppedId(null);
    setBusy(false);
    setRound(nextIndex);
    setRoundData(createBalloonRound(currentTarget, nextIndex));
  }, []);

  const onBalloon = (balloon: BalloonItem) => {
    if (busy || over || poppedId) return;

    if (balloon.letter === roundData.target) {
      setBusy(true);
      setPoppedId(balloon.id);
      setScore((value) => value + 1);
      audioManager.playSuccess();
      audioManager.playLevelUp();
      void pronunciationService.playLetterName(balloon.letter);
      setCelebrateKey((value) => value + 1);
      const currentTarget = roundData.target;
      const nextIndex = round + 1;
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = setTimeout(() => {
        advanceTimerRef.current = null;
        nextRound(currentTarget, nextIndex);
      }, 780);
      return;
    }

    audioManager.playRetry();
    setBusy(true);
    setOver(true);
  };

  const playAgain = () => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    audioManager.stop();
    setScore(0);
    setRound(0);
    setPoppedId(null);
    setBusy(false);
    setOver(false);
    setCelebrateKey(0);
    setRoundData(createBalloonRound(undefined, 0));
  };

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
        <View style={styles.hudSpacer} />
        <View style={styles.stats}>
          <GameStatChip label="Score" value={`${score}`} />
          <GuguIconButton size={speakSize} onPress={speakTarget} accessibilityLabel="Hear letter">
            <SpeakerGlyph size={Math.round(speakSize * 0.46)} />
          </GuguIconButton>
        </View>
      </View>

      <View
        style={[
          styles.split,
          {
            marginLeft: padLeft,
            marginRight: padRight,
            marginBottom: padBottom,
            maxWidth: 980,
            alignSelf: 'center',
            width: '100%',
          },
        ]}>
        {/* LEFT ~30% — target letter only */}
        <View
          style={styles.letterPane}
          onLayout={(event) => {
            const next = event.nativeEvent.layout;
            setLetterPaneSize((current) =>
              current.width === next.width && current.height === next.height
                ? current
                : { width: next.width, height: next.height },
            );
          }}>
          <TargetLetter3D letter={roundData.target} size={targetSize} />
        </View>

        {/* RIGHT ~70% — balloons only; clipped so nothing crosses into letter pane */}
        <View
          style={styles.balloonPane}
          onLayout={(event) => {
            const next = event.nativeEvent.layout;
            setBalloonPaneSize((current) =>
              current.width === next.width && current.height === next.height
                ? current
                : { width: next.width, height: next.height },
            );
          }}>
          {placed.map((balloon) => (
            <LetterBalloon
              key={balloon.id}
              letter={balloon.letter}
              colorIndex={balloon.colorIndex}
              size={balloonSize}
              left={balloon.left}
              top={balloon.top}
              popped={poppedId === balloon.id}
              missed={0}
              disabled={busy || over}
              onPress={() => onBalloon(balloon)}
            />
          ))}
        </View>
      </View>

      <GameResultDialog
        visible={over}
        title="Oops!"
        message="That balloon was not the right letter. Let's try again!"
        scoreValue={`${score}`}
        actionLabel="Play Again"
        onAction={playAgain}
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
    minHeight: 72,
  },
  hudSpacer: {
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HomeSpace.sm,
  },
  split: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 0,
    minWidth: 0,
  },
  letterPane: {
    flex: 3,
    minWidth: 0,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: HomeSpace.sm,
  },
  balloonPane: {
    flex: 7,
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    position: 'relative',
  },
});
