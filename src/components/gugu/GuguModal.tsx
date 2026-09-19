import { type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type GuguModalProps = {
  visible: boolean;
  onRequestClose?: () => void;
  dismissOnBackdrop?: boolean;
  children: ReactNode;
};

export function modalEdgePadding(width: number, height: number, inset: number) {
  const responsive = Math.round(Math.min(width, height) * 0.035);
  return Math.max(20, inset, Math.min(40, responsive));
}

export function GuguModal({ visible, onRequestClose, dismissOnBackdrop = false, children }: GuguModalProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const padX = modalEdgePadding(width, height, Math.max(insets.left, insets.right));
  const padY = modalEdgePadding(width, height, Math.max(insets.top, insets.bottom));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      supportedOrientations={['landscape', 'landscape-left', 'landscape-right', 'portrait']}
      onRequestClose={onRequestClose}>
      <View style={styles.screen} pointerEvents="box-none">
        <Pressable
          style={styles.overlay}
          onPress={dismissOnBackdrop ? onRequestClose : undefined}
          accessibilityLabel={dismissOnBackdrop ? 'Close' : undefined}
        />
        <View
          pointerEvents="box-none"
          style={[
            styles.center,
            {
              paddingLeft: padX,
              paddingRight: padX,
              paddingTop: padY,
              paddingBottom: padY,
            },
          ]}>
          <View style={styles.popup} pointerEvents="box-none">
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(43, 58, 74, 0.5)',
  },
  center: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popup: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
