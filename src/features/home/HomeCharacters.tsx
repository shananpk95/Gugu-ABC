import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { createHomeLayout } from '@/features/home/homeLayout';

type HomeCharactersProps = {
  layout: ReturnType<typeof createHomeLayout>;
};

function Sprite({
  box,
  source,
  flip,
}: {
  box: { position: 'absolute'; left: number; top: number; width: number; height: number };
  source: number;
  flip?: boolean;
}) {
  return (
    <View style={box}>
      <Image
        source={source}
        style={[styles.asset, flip && styles.flip]}
        contentFit="contain"
        accessible={false}
      />
    </View>
  );
}

export function HomeCharacters({ layout }: HomeCharactersProps) {
  return (
    <View pointerEvents="none">
      <Sprite box={layout.cloudLeft} source={require('@/assets/images/home-cloud.png')} />
      <Sprite box={layout.cloudMid} source={require('@/assets/images/home-cloud.png')} />
      <Sprite box={layout.cloudRight} source={require('@/assets/images/home-cloud.png')} />

      <Sprite box={layout.birdFar} source={require('@/assets/images/home-bird.png')} />
      <Sprite box={layout.birdLeft} source={require('@/assets/images/home-bird.png')} />
      <Sprite box={layout.birdRight} source={require('@/assets/images/home-bird.png')} flip />
      <Sprite box={layout.crow} source={require('@/assets/images/home-crow.png')} />

      <Sprite box={layout.butterflyLeft} source={require('@/assets/images/home-butterfly.png')} />
      <Sprite box={layout.butterfly} source={require('@/assets/images/home-butterfly.png')} />

      <Sprite box={layout.beeLeft} source={require('@/assets/images/home-bee.png')} />
      <Sprite box={layout.beeRight} source={require('@/assets/images/home-bee.png')} flip />
    </View>
  );
}

const styles = StyleSheet.create({
  asset: {
    width: '100%',
    height: '100%',
  },
  flip: {
    transform: [{ scaleX: -1 }],
  },
});
