import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AlphabetOverlay } from '@/components/gugu/AlphabetOverlay';
import { BackButton } from '@/components/gugu/BackButton';
import { GuguIconButton } from '@/components/gugu/GuguIconButton';
import { GuguColors } from '@/constants/gugu';
import { getPronunciationLetter, getPronunciationLetters } from '@/data/pronunciation';
import { HomeBackground } from '@/features/home/HomeBackground';
import { HomeSpace } from '@/features/home/homeLayout';
import { audioManager } from '@/services/audio';
import type { PronunciationMode } from '@/types/pronunciation';

const BOY_ASPECT = 1152 / 864;

type PronunciationSessionProps = {
  mode: PronunciationMode;
};

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

function NextGlyph({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M9.2 5.2 16.6 12 9.2 18.8"
        stroke={GuguColors.ink}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function PronunciationSession({ mode }: PronunciationSessionProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const letters = useMemo(() => getPronunciationLetters(), []);
  const overlayLetters = useMemo(
    () => letters.map((item) => ({ id: item.id, character: item.letter })),
    [letters],
  );
  const [index, setIndex] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const letter = getPronunciationLetter(index);
  const clip = mode === 'letter-name' ? letter.letterName : letter.phonicsSound;
  const bounce = useSharedValue(1);

  const padLeft = Math.max(insets.left, HomeSpace.md);
  const padRight = Math.max(insets.right, HomeSpace.md);
  const padTop = Math.max(insets.top, HomeSpace.sm);
  const padBottom = Math.max(insets.bottom, HomeSpace.md);
  const backSize = Math.min(56, Math.max(48, height * 0.1));
  const playSize = Math.min(96, Math.max(72, height * 0.18));
  const sideSize = Math.min(52, Math.max(44, height * 0.09));
  const playGlyph = Math.round(playSize * 0.46);
  const sideGlyph = Math.round(sideSize * 0.46);
  const leftWidth = width * 0.28;
  const boyMaxH = height * 0.78;
  const boyMaxW = leftWidth - padLeft;
  const boyHeight = Math.min(boyMaxH, boyMaxW * BOY_ASPECT);
  const boyWidth = boyHeight / BOY_ASPECT;
  const letterSize = Math.min(height * 0.46, (width - leftWidth - padRight) * 0.42);

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounce.value }],
  }));

  const playClip = useCallback(() => {
    bounce.value = withSequence(withSpring(1.1, { damping: 8 }), withSpring(1));
    audioManager.playTap();
    void audioManager.playPronunciation(clip);
  }, [bounce, clip]);

  useEffect(() => {
    void audioManager.init();
    return () => {
      audioManager.stop();
    };
  }, []);

  useEffect(() => {
    bounce.value = 1;
    void audioManager.playPronunciation(clip);
  }, [bounce, clip, letter.id, mode]);

  return (
    <View style={styles.root}>
      <HomeBackground />

      <View style={[styles.page, { paddingTop: padTop, paddingBottom: padBottom }]}>
        <View style={[styles.left, { width: leftWidth, paddingLeft: padLeft }]}>
          <BackButton size={backSize} onPress={() => router.back()} />
          <View style={styles.boyStage} pointerEvents="none">
            <Image
              source={require('@/assets/images/listen-gugu-boy.png')}
              style={{ width: boyWidth, height: boyHeight }}
              contentFit="contain"
              accessibilityLabel="GuGu"
            />
          </View>
        </View>

        <View style={[styles.stage, { paddingRight: padRight }]}>
          <Animated.Text style={[styles.letter, { fontSize: letterSize, lineHeight: letterSize * 1.08 }, bounceStyle]}>
            {letter.letter}
          </Animated.Text>

          <View style={styles.controls}>
            <GuguIconButton size={playSize} onPress={playClip} accessibilityLabel="Play sound">
              <SpeakerGlyph size={playGlyph} />
            </GuguIconButton>
            <GuguIconButton
              size={sideSize}
              onPress={() => {
                audioManager.playTap();
                setIndex((value) => (value + 1) % letters.length);
              }}
              accessibilityLabel="Next letter">
              <NextGlyph size={sideGlyph} />
            </GuguIconButton>
            <GuguIconButton size={sideSize} onPress={() => setPickerOpen(true)} accessibilityLabel="Choose letter">
              <Image
                source={require('@/assets/images/letter-pick-icon.png')}
                style={{ width: sideGlyph + 4, height: sideGlyph + 4 }}
                contentFit="contain"
              />
            </GuguIconButton>
          </View>
        </View>
      </View>

      <AlphabetOverlay
        visible={pickerOpen}
        letters={overlayLetters}
        selectedIndex={index}
        onSelect={(nextIndex) => {
          setIndex(nextIndex);
          audioManager.playTap();
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GuguColors.sky,
  },
  page: {
    flex: 1,
    flexDirection: 'row',
  },
  left: {
    overflow: 'hidden',
  },
  boyStage: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  stage: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: HomeSpace.md,
  },
  letter: {
    fontFamily: 'Nunito_800ExtraBold',
    fontWeight: '800',
    color: GuguColors.ink,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 224, 138, 0.55)',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 10,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HomeSpace.md,
  },
});
