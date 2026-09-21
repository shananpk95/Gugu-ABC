import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AlphabetOverlay } from '@/components/gugu/AlphabetOverlay';
import { BackButton } from '@/components/gugu/BackButton';
import { GuguIconButton } from '@/components/gugu/GuguIconButton';
import { GUGU_MEADOW } from '@/components/gugu/guguControls';
import { GuguColors } from '@/constants/gugu';
import { getWordItem, getWordItems } from '@/data/words';
import { HomeBackground } from '@/features/home/HomeBackground';
import { HomeSpace } from '@/features/home/homeLayout';
import { audioManager } from '@/services/audio';

const BOY_ASPECT = 1152 / 864;

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

export function WordSession() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const items = useMemo(() => getWordItems(), []);
  const overlayLetters = useMemo(
    () => items.map((item) => ({ id: item.letter, character: item.letter })),
    [items],
  );
  const [index, setIndex] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const item = getWordItem(index);
  const bounce = useSharedValue(1);

  const padLeft = Math.max(insets.left, HomeSpace.md);
  const padRight = Math.max(insets.right, HomeSpace.md);
  const padTop = Math.max(insets.top, HomeSpace.sm);
  const padBottom = Math.max(insets.bottom, HomeSpace.md);
  const backSize = Math.min(52, Math.max(44, height * 0.09));
  const playSize = Math.min(72, Math.max(56, height * 0.14));
  const sideSize = Math.min(48, Math.max(40, height * 0.085));
  const leftWidth = Math.min(width * 0.28, 280);
  const boyMaxH = height * 0.78;
  const boyMaxW = leftWidth - padLeft;
  const boyHeight = Math.min(boyMaxH, boyMaxW * BOY_ASPECT);
  const boyWidth = boyHeight / BOY_ASPECT;
  const cardMax = Math.min(420, width - leftWidth - padRight - 16);
  const imageSize = Math.min(200, height * 0.38, cardMax - 48);
  const letterSize = Math.min(42, height * 0.1);

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounce.value }],
  }));

  const playPhrase = useCallback(() => {
    bounce.value = withSequence(withSpring(1.06, { damping: 8 }), withSpring(1));
    void audioManager.playWordPhrase(item.letter, item.word);
  }, [bounce, item.letter, item.word]);

  useEffect(() => {
    void audioManager.init();
    return () => {
      audioManager.stop();
    };
  }, []);

  useEffect(() => {
    bounce.value = 1;
    void audioManager.playWordPhrase(item.letter, item.word);
  }, [bounce, item.letter, item.word]);

  return (
    <View style={styles.root}>
      <HomeBackground />

      <View style={[styles.page, { paddingTop: padTop, paddingBottom: padBottom }]}>
        <View style={[styles.left, { width: leftWidth, paddingLeft: padLeft }]}>
          <BackButton size={backSize} onPress={() => router.back()} />
          <View style={styles.boyStage} pointerEvents="none">
            <Image
              source={require('@/assets/images/words-gugu-boy.png')}
              style={{ width: boyWidth, height: boyHeight }}
              contentFit="contain"
              accessibilityLabel="GuGu"
            />
          </View>
        </View>

        <View style={[styles.stage, { paddingRight: padRight }]}>
          <Animated.View style={[styles.cardShadow, { width: cardMax }, bounceStyle]}>
            <LinearGradient colors={[...GUGU_MEADOW]} locations={[0, 0.5, 1]} style={styles.card}>
              <Image source={item.image} style={{ width: imageSize, height: imageSize }} contentFit="contain" />
              <Text style={[styles.letter, { fontSize: letterSize, lineHeight: letterSize * 1.1 }]}>{item.letter}</Text>
              <Text style={styles.word}>{item.word}</Text>
              <View style={styles.controls}>
                <GuguIconButton size={playSize} onPress={playPhrase} accessibilityLabel="Play sound">
                  <SpeakerGlyph size={Math.round(playSize * 0.46)} />
                </GuguIconButton>
                <GuguIconButton
                  size={sideSize}
                  onPress={() => {
                    audioManager.playTap();
                    setIndex((value) => (value + 1) % items.length);
                  }}
                  accessibilityLabel="Next letter">
                  <NextGlyph size={Math.round(sideSize * 0.46)} />
                </GuguIconButton>
                <GuguIconButton size={sideSize} onPress={() => setPickerOpen(true)} accessibilityLabel="Choose letter">
                  <Image
                    source={require('@/assets/images/letter-pick-icon.png')}
                    style={{ width: sideSize * 0.5, height: sideSize * 0.5 }}
                    contentFit="contain"
                  />
                </GuguIconButton>
              </View>
            </LinearGradient>
          </Animated.View>
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
  },
  cardShadow: {
    maxWidth: 420,
    borderRadius: 32,
    shadowColor: '#2B3A4A',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  card: {
    borderRadius: 32,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 4,
  },
  letter: {
    fontFamily: 'Nunito_800ExtraBold',
    fontWeight: '800',
    color: GuguColors.ink,
  },
  word: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    fontWeight: '800',
    color: GuguColors.ink,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HomeSpace.sm,
    marginTop: 8,
  },
});
