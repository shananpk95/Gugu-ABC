import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { GuguIconButton } from '@/components/gugu/GuguIconButton';
import { SuccessCelebration } from '@/components/gugu/SuccessCelebration';
import { GuguColors } from '@/constants/gugu';
import { getPronunciationByLetter } from '@/data/pronunciation';
import { GameResultDialog } from '@/features/games/GameResultDialog';
import { GameStatChip } from '@/features/games/GameStatChip';
import { GameWorld } from '@/features/games/GameWorld';
import { LetterBalloon } from '@/features/games/crackBalloon/LetterBalloon';
import { createBalloonRound, type BalloonItem } from '@/features/games/crackBalloon/round';
import { HomeSpace } from '@/features/home/homeLayout';
import { audioManager } from '@/services/audio';

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

function placeBalloons(
  balloons: BalloonItem[],
  areaWidth: number,
  areaHeight: number,
  size: number,
): PlacedBalloon[] {
  const cols = Math.min(5, Math.max(3, Math.ceil(balloons.length / 2)));
  const rows = Math.ceil(balloons.length / cols);
  const cellW = areaWidth / cols;
  const cellH = areaHeight / rows;
  const balloonH = size * 1.22 + 18;

  return balloons.map((balloon, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const jitterX = ((index % 3) - 1) * Math.min(10, cellW * 0.06);
    const jitterY = ((index % 2) - 0.5) * Math.min(8, cellH * 0.08);
    const left = col * cellW + (cellW - size) / 2 + jitterX;
    const top = row * cellH + (cellH - balloonH) / 2 + jitterY;
    return {
      ...balloon,
      left: Math.max(0, Math.min(areaWidth - size, left)),
      top: Math.max(0, Math.min(areaHeight - balloonH, top)),
    };
  });
}

export function CrackBalloonGame() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [roundData, setRoundData] = useState(() => createBalloonRound(undefined, 0));
  const [poppedId, setPoppedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [celebrateKey, setCelebrateKey] = useState(0);
  const [playSize, setPlaySize] = useState({ width: 0, height: 0 });

  const padLeft = Math.max(insets.left, HomeSpace.md);
  const padRight = Math.max(insets.right, HomeSpace.md);
  const padTop = Math.max(insets.top, HomeSpace.sm);
  const padBottom = Math.max(insets.bottom, HomeSpace.md);
  const backSize = Math.min(52, Math.max(44, height * 0.09));
  const speakSize = Math.min(48, Math.max(40, height * 0.08));
  const targetSize = Math.min(56, Math.max(40, height * 0.11));
  const balloonSize = Math.min(76, Math.max(56, Math.min(playSize.width / 7, playSize.height / 3.2)));

  const placed = useMemo(() => {
    if (!playSize.width || !playSize.height) return [];
    return placeBalloons(roundData.balloons, playSize.width, playSize.height, balloonSize);
  }, [balloonSize, playSize.height, playSize.width, roundData.balloons]);

  useEffect(() => {
    void audioManager.init();
    return () => {
      audioManager.stop();
    };
  }, []);

  const speakTarget = useCallback(() => {
    const clip = getPronunciationByLetter(roundData.target).letterName;
    void audioManager.playPronunciation(clip);
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
      const clip = getPronunciationByLetter(balloon.letter).letterName;
      void audioManager.playPronunciation(clip);
      setCelebrateKey((value) => value + 1);
      const currentTarget = roundData.target;
      const nextIndex = round + 1;
      setTimeout(() => {
        nextRound(currentTarget, nextIndex);
      }, 780);
      return;
    }

    audioManager.playRetry();
    setBusy(true);
    setOver(true);
  };

  const playAgain = () => {
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
      <View style={[styles.hud, { paddingTop: padTop, paddingRight: padRight, paddingLeft: padLeft + backSize + HomeSpace.sm, maxWidth: 980, alignSelf: 'center', width: '100%' }]}>
        <View style={styles.targetWrap}>
          <Text style={styles.targetLabel}>Find</Text>
          <Text style={[styles.target, { fontSize: targetSize, lineHeight: targetSize * 1.05 }]}>{roundData.target}</Text>
          <GuguIconButton size={speakSize} onPress={speakTarget} accessibilityLabel="Hear letter">
            <SpeakerGlyph size={Math.round(speakSize * 0.46)} />
          </GuguIconButton>
        </View>
        <View style={styles.stats}>
          <GameStatChip label="Score" value={`${score}`} />
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
  targetWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HomeSpace.sm,
    flexShrink: 1,
  },
  targetLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    fontWeight: '800',
    color: GuguColors.ink,
  },
  target: {
    fontFamily: 'Nunito_800ExtraBold',
    fontWeight: '800',
    color: GuguColors.ink,
    textShadowColor: 'rgba(255, 224, 138, 0.55)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  stats: {
    flexDirection: 'row',
    gap: HomeSpace.sm,
  },
  play: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
});
