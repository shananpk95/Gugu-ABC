import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { BackButton } from '@/components/gugu/BackButton';
import { GuguColors } from '@/constants/gugu';
import { HomeBackground } from '@/features/home/HomeBackground';

type GameWorldProps = {
  backSize: number;
  padLeft: number;
  padTop: number;
  onBack: () => void;
  children: ReactNode;
};

export function GameWorld({ backSize, padLeft, padTop, onBack, children }: GameWorldProps) {
  return (
    <View style={styles.root}>
      <HomeBackground />
      <View style={[styles.back, { top: padTop, left: padLeft }]}>
        <BackButton size={backSize} onPress={onBack} />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GuguColors.sky,
  },
  back: {
    position: 'absolute',
    zIndex: 8,
  },
});
