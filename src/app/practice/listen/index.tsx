import { Href, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/gugu/BackButton';
import { GuguColors } from '@/constants/gugu';
import { CategoryIconButton, getCategoryTileLayout } from '@/features/category/CategoryIconButton';
import { HomeBackground } from '@/features/home/HomeBackground';
import { HomeSpace } from '@/features/home/homeLayout';

const BOY_ASPECT = 1152 / 864;

const SUBCATEGORIES = [
  {
    id: 'letter-name',
    label: 'Letter Name',
    href: '/practice/listen/letter-name' as Href,
    icon: require('@/assets/images/subcat-letter-name.png'),
  },
  {
    id: 'phonics',
    label: 'Phonics Sound',
    href: '/practice/listen/phonics' as Href,
    icon: require('@/assets/images/subcat-phonics.png'),
  },
] as const;

export default function ListenHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const leftWidth = width * 0.4;
  const rightWidth = width * 0.6;
  const padLeft = Math.max(insets.left, HomeSpace.md);
  const padRight = Math.max(insets.right, HomeSpace.md);
  const padTop = Math.max(insets.top, HomeSpace.sm);
  const padBottom = Math.max(insets.bottom, HomeSpace.md);
  const backSize = Math.min(56, Math.max(48, height * 0.1));

  const sceneMaxH = height - padTop - backSize - HomeSpace.xs - padBottom;
  const sceneMaxW = leftWidth - padLeft - HomeSpace.xs;
  const sceneHFromW = sceneMaxW * BOY_ASPECT;
  const sceneHeight = Math.min(sceneMaxH, sceneHFromW);
  const sceneWidth = sceneHeight / BOY_ASPECT;

  const grid = useMemo(() => {
    const inner = Math.max(160, rightWidth - padRight - HomeSpace.xl * 2);
    return getCategoryTileLayout(inner);
  }, [rightWidth, padRight]);

  return (
    <View style={styles.root}>
      <HomeBackground />

      <View style={styles.split}>
        <View style={[styles.left, { width: leftWidth, paddingLeft: padLeft, paddingTop: padTop, paddingBottom: padBottom }]}>
          <View style={styles.backWrap}>
            <BackButton size={backSize} onPress={() => router.back()} />
          </View>

          <Image
            source={require('@/assets/images/home-cloud.png')}
            style={[styles.cloud, { width: leftWidth * 0.22, top: padTop, left: padLeft + backSize + HomeSpace.xs }]}
            contentFit="contain"
            accessible={false}
          />
          <Image
            source={require('@/assets/images/home-bird.png')}
            style={[styles.bird, { width: Math.min(36, height * 0.055), top: padTop + HomeSpace.xs, right: HomeSpace.sm }]}
            contentFit="contain"
            accessible={false}
          />

          <View style={styles.boyStage} pointerEvents="none">
            <Image
              source={require('@/assets/images/listen-gugu-boy.png')}
              style={{ width: sceneWidth, height: sceneHeight }}
              contentFit="contain"
              accessibilityLabel="GuGu"
            />
          </View>

          <Image
            source={require('@/assets/images/home-butterfly.png')}
            style={[styles.butterfly, { width: Math.min(36, height * 0.06), left: padLeft, bottom: padBottom }]}
            contentFit="contain"
            accessible={false}
          />
        </View>

        <ScrollView
          style={[styles.right, { width: rightWidth }]}
          contentContainerStyle={[
            styles.rightContent,
            {
              paddingTop: padTop + HomeSpace.lg,
              paddingBottom: padBottom + HomeSpace.lg,
              paddingRight: padRight + HomeSpace.md,
              paddingLeft: HomeSpace.lg,
            },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <View style={[styles.grid, { width: grid.inner, gap: grid.gap }]}>
            {SUBCATEGORIES.map((item) => (
              <View key={item.id} style={{ width: grid.tileWidth, height: grid.tileHeight }}>
                <CategoryIconButton
                  icon={item.icon}
                  label={item.label}
                  width={grid.tileWidth}
                  height={grid.tileHeight}
                  onPress={() => router.push(item.href)}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GuguColors.sky,
  },
  split: {
    flex: 1,
    flexDirection: 'row',
  },
  left: {
    overflow: 'hidden',
  },
  backWrap: {
    zIndex: 4,
  },
  cloud: {
    position: 'absolute',
    aspectRatio: 420 / 242,
    opacity: 0.92,
  },
  bird: {
    position: 'absolute',
    aspectRatio: 280 / 187,
  },
  boyStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  butterfly: {
    position: 'absolute',
    aspectRatio: 111 / 93,
  },
  right: {
    flex: 1,
  },
  rightContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
