import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GuguLogo } from '@/components/branding/GuguLogo';
import { GuguColors } from '@/constants/gugu';
import { CategoryCarousel } from '@/features/home/CategoryCarousel';
import { HomeBackground } from '@/features/home/HomeBackground';
import { HomeCharacters } from '@/features/home/HomeCharacters';
import { createHomeLayout, HomeSpace } from '@/features/home/homeLayout';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const layout = useMemo(() => createHomeLayout(width, height, insets), [width, height, insets]);

  return (
    <View style={styles.root}>
      <HomeBackground />
      <HomeCharacters layout={layout} />

      <View
        style={[
          styles.content,
          {
            paddingTop: layout.padTop,
            paddingBottom: layout.padBottom,
            paddingLeft: layout.contentPadLeft,
            paddingRight: layout.contentPadRight,
          },
        ]}>
        <View style={styles.logoWrap} pointerEvents="none">
          <GuguLogo size={layout.logoWidth} />
        </View>

        <View style={styles.stage} />

        <View
          style={[
            styles.carouselWrap,
            {
              height: layout.cardHeight,
              marginLeft: -layout.contentPadLeft,
              marginRight: -layout.contentPadRight,
            },
          ]}>
          <CategoryCarousel layout={layout} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GuguColors.sky,
  },
  content: {
    flex: 1,
  },
  logoWrap: {
    alignItems: 'center',
  },
  stage: {
    flex: 1,
    minHeight: HomeSpace.xl,
  },
  carouselWrap: {
    justifyContent: 'center',
    overflow: 'visible',
  },
});
