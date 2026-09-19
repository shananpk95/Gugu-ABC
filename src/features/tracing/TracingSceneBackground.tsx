import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { HomeBackground } from '@/features/home/HomeBackground';

const BIRD_ASPECT = 284 / 420;

export function TracingSceneBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <HomeBackground />

      <Image source={require('@/assets/images/home-cloud.png')} style={[styles.cloud, styles.cloudA]} contentFit="contain" />
      <Image source={require('@/assets/images/home-cloud.png')} style={[styles.cloud, styles.cloudB]} contentFit="contain" />
      <Image source={require('@/assets/images/home-cloud.png')} style={[styles.cloud, styles.cloudC]} contentFit="contain" />

      <Image source={require('@/assets/images/home-bird.png')} style={[styles.bird, styles.birdBlue]} contentFit="contain" />
      <Image source={require('@/assets/images/bird-yellow.png')} style={[styles.bird, styles.birdYellow]} contentFit="contain" />
      <Image source={require('@/assets/images/bird-orange.png')} style={[styles.bird, styles.birdOrange]} contentFit="contain" />
      <Image source={require('@/assets/images/bird-green.png')} style={[styles.bird, styles.birdGreen]} contentFit="contain" />
      <Image source={require('@/assets/images/bird-purple.png')} style={[styles.bird, styles.birdPurple]} contentFit="contain" />
      <Image source={require('@/assets/images/home-bird.png')} style={[styles.bird, styles.birdFar]} contentFit="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  cloud: {
    position: 'absolute',
    aspectRatio: 420 / 242,
  },
  cloudA: {
    width: '16%',
    top: '6%',
    left: '18%',
    opacity: 0.88,
  },
  cloudB: {
    width: '12%',
    top: '10%',
    left: '48%',
    opacity: 0.7,
  },
  cloudC: {
    width: '14%',
    top: '5%',
    right: '10%',
    opacity: 0.82,
  },
  bird: {
    position: 'absolute',
    aspectRatio: 1 / BIRD_ASPECT,
  },
  birdBlue: {
    width: '7%',
    top: '8%',
    left: '32%',
  },
  birdYellow: {
    width: '5.5%',
    top: '4%',
    left: '58%',
    transform: [{ scaleX: -1 }],
  },
  birdOrange: {
    width: '6.2%',
    top: '12%',
    right: '22%',
  },
  birdGreen: {
    width: '4.6%',
    top: '7%',
    right: '38%',
    transform: [{ scaleX: -1 }],
  },
  birdPurple: {
    width: '5%',
    top: '14%',
    left: '42%',
  },
  birdFar: {
    width: '3.8%',
    top: '5%',
    left: '72%',
    opacity: 0.86,
  },
});
