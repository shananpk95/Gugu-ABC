import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { GuguColors } from '@/constants/gugu';

export function HomeBackground() {
  return (
    <View pointerEvents="none" style={styles.root}>
      <Image
        source={require('@/assets/images/home-world.png')}
        style={styles.scene}
        contentFit="cover"
        contentPosition="center"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: GuguColors.sky,
  },
  scene: {
    width: '100%',
    height: '100%',
  },
});
