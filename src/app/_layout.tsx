import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import {
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, useColorScheme, View } from 'react-native';

import { GUGU_LOGO_ASPECT, GUGU_LOGO_SOURCE } from '@/components/branding/GuguLogo';
import AppTabs from '@/components/app-tabs';
import { GuguColors } from '@/constants/gugu';
import { audioManager } from '@/services/audio';

SplashScreen.preventAutoHideAsync();

const SPLASH_LOGO_WIDTH = 220;

function LogoOnlySplash() {
  return (
    <View
      style={styles.splash}
      onLayout={() => {
        void SplashScreen.hideAsync();
      }}
      pointerEvents="none">
      <Image
        source={GUGU_LOGO_SOURCE}
        style={styles.splashLogo}
        contentFit="contain"
        accessible={false}
      />
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });
  const [timedOut, setTimedOut] = useState(false);
  const ready = fontsLoaded || Boolean(fontError) || timedOut;

  useEffect(() => {
    const timeout = setTimeout(() => setTimedOut(true), 2500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    void audioManager.init();
    void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <LogoOnlySplash />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppTabs />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splash: {
    flex: 1,
    backgroundColor: GuguColors.sky,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: SPLASH_LOGO_WIDTH,
    height: SPLASH_LOGO_WIDTH * GUGU_LOGO_ASPECT,
  },
});
