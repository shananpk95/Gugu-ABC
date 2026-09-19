import { useMemo, useRef, useState } from 'react';
import { Href, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HOME_SLIDER_CATEGORIES, type HomeSliderCategory } from '@/constants/gugu';
import { createHomeLayout, HomeSpace } from '@/features/home/homeLayout';
import { audioManager } from '@/services/audio';

type CategoryCarouselProps = {
  layout: ReturnType<typeof createHomeLayout>;
};

function categoryContentWidth(count: number, cardWidth: number, cardGap: number) {
  if (count <= 0) {
    return 0;
  }
  return count * cardWidth + (count - 1) * cardGap;
}

export function shouldShowCategoryChevron(contentWidth: number, rowWidth: number) {
  return rowWidth > 0 && contentWidth > rowWidth + 1;
}

function CategoryTile({
  category,
  width,
  height,
  onPress,
}: {
  category: HomeSliderCategory;
  width: number;
  height: number;
  onPress: () => void;
}) {
  const press = useSharedValue(0);
  const radius = Math.round(Math.min(width, height) * 0.3);
  const iconPad = Math.max(8, Math.round(Math.min(width, height) * 0.08));

  const tileStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(press.value, [0, 1], [0, 3]) },
      { scale: interpolate(press.value, [0, 1], [1, 0.96]) },
    ],
    shadowOpacity: interpolate(press.value, [0, 1], [0.22, 0.1]),
    shadowRadius: interpolate(press.value, [0, 1], [12, 5]),
    shadowOffset: {
      width: 0,
      height: interpolate(press.value, [0, 1], [8, 3]),
    },
    elevation: interpolate(press.value, [0, 1], [8, 2]),
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={category.title}
      onPress={onPress}
      onPressIn={() => {
        press.value = withTiming(1, { duration: 90 });
      }}
      onPressOut={() => {
        press.value = withTiming(0, { duration: 140 });
      }}
      style={{ width, height }}>
      <Animated.View
        style={[
          styles.tile,
          {
            width,
            height,
            borderRadius: radius,
          },
          tileStyle,
        ]}>
        <LinearGradient
          colors={['#E8E49C', '#D0E3A2', '#B8D890']}
          locations={[0, 0.48, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.tileFace, { borderRadius: radius }]}>
          <View style={[styles.softEdge, { borderRadius: radius }]} pointerEvents="none" />
          <Image
            source={category.icon}
            style={{ width: width - iconPad * 2, height: height - iconPad * 2 }}
            contentFit="contain"
          />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

export function CategoryCarousel({ layout }: CategoryCarouselProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<HomeSliderCategory>>(null);
  const [page, setPage] = useState(0);
  const [rowWidth, setRowWidth] = useState(0);
  const stride = layout.cardWidth + layout.cardGap;
  const categories = HOME_SLIDER_CATEGORIES;
  const padLeft = Math.max(insets.left, HomeSpace.md);
  const padRight = Math.max(insets.right, HomeSpace.md);

  const contentWidth = useMemo(
    () => categoryContentWidth(categories.length, layout.cardWidth, layout.cardGap),
    [categories.length, layout.cardWidth, layout.cardGap],
  );
  const availableWidth = Math.max(0, rowWidth - padLeft - padRight);
  const showChevron = shouldShowCategoryChevron(contentWidth, availableWidth);
  const centerGroup = rowWidth > 0 && !showChevron;

  const onRowLayout = (event: LayoutChangeEvent) => {
    setRowWidth(event.nativeEvent.layout.width);
  };

  const onPressCategory = (category: HomeSliderCategory) => {
    if (category.kind === 'real' && category.href) {
      router.push(category.href as Href);
      return;
    }
    audioManager.playTap();
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextPage = Math.round(event.nativeEvent.contentOffset.x / stride);
    setPage(Math.max(0, Math.min(categories.length - 1, nextPage)));
  };

  const scrollNext = () => {
    const next = Math.min(page + 1, categories.length - 1);
    listRef.current?.scrollToOffset({ offset: next * stride, animated: true });
    setPage(next);
  };

  return (
    <View
      style={[styles.row, { paddingLeft: padLeft, paddingRight: padRight }]}
      onLayout={onRowLayout}>
      <FlatList
        ref={listRef}
        horizontal
        style={styles.list}
        data={categories}
        extraData={`${layout.cardWidth}-${layout.cardGap}-${showChevron}-${centerGroup}`}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={showChevron}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.carouselContent,
          centerGroup ? styles.centeredContent : null,
        ]}
        ItemSeparatorComponent={() => <View style={{ width: layout.cardGap }} />}
        renderItem={({ item }) => (
          <CategoryTile
            category={item}
            width={layout.cardWidth}
            height={layout.cardHeight}
            onPress={() => onPressCategory(item)}
          />
        )}
      />

      {showChevron ? (
        <Pressable
          onPress={scrollNext}
          style={({ pressed }) => [
            styles.chevronHit,
            { width: layout.chevronHit, height: layout.chevronHit },
            pressed && styles.chevronPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="More categories"
          hitSlop={HomeSpace.xs}>
          <Image
            source={require('@/assets/images/chevron.png')}
            style={{ width: layout.chevronSize, height: layout.chevronHeight }}
            contentFit="contain"
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'visible',
  },
  list: {
    flex: 1,
    overflow: 'visible',
  },
  carouselContent: {
    alignItems: 'center',
  },
  centeredContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  tile: {
    shadowColor: '#2B3A4A',
    backgroundColor: 'transparent',
  },
  tileFace: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  softEdge: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1,
    borderColor: 'rgba(245, 236, 150, 0.38)',
  },
  chevronHit: {
    marginLeft: HomeSpace.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
});
