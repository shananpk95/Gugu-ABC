import type { EdgeInsets } from 'react-native-safe-area-context';

import { GUGU_LOGO_ASPECT } from '@/components/branding/GuguLogo';

export type HomeBox = {
  position: 'absolute';
  left: number;
  top: number;
  width: number;
  height: number;
};

export const HomeSpace = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

const BEAR_ASPECT = 189 / 175;
const RABBIT_ASPECT = 197 / 138;
const SPEECH_ASPECT = 153 / 205;
const BUTTERFLY_ASPECT = 93 / 111;
const CARD_ASPECT = 154 / 166;
const CHEVRON_ASPECT = 88 / 83;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function box(left: number, top: number, width: number, height: number): HomeBox {
  return { position: 'absolute', left, top, width, height };
}

export function createHomeLayout(screenWidth: number, screenHeight: number, insets: EdgeInsets) {
  const isTablet = Math.min(screenWidth, screenHeight) >= 600 || screenWidth >= 1000;
  const safeLeft = Math.max(insets.left, HomeSpace.md);
  const safeRight = Math.max(insets.right, HomeSpace.md);
  const safeTop = Math.max(insets.top, HomeSpace.xs);
  const safeBottom = Math.max(insets.bottom, HomeSpace.md);

  const cardWidth = isTablet
    ? clamp(screenWidth * 0.12, 140, 200)
    : clamp(screenWidth * 0.15, 108, 156);
  const cardHeight = cardWidth * CARD_ASPECT;
  const cardGap = isTablet ? HomeSpace.lg : HomeSpace.md;

  const chevronSize = clamp(screenHeight * 0.1, 40, 56);
  const chevronHit = Math.max(chevronSize + HomeSpace.md, 52);
  const chevronHeight = chevronSize * CHEVRON_ASPECT;

  const logoHeight = isTablet
    ? clamp(Math.min(screenHeight * 0.5, screenWidth * 0.36), 200, 280)
    : clamp(Math.min(screenHeight * 0.48, screenWidth * 0.32), 168, 220);
  const logoWidth = logoHeight / GUGU_LOGO_ASPECT;

  const padTop = safeTop + HomeSpace.xs;
  const padBottom = safeBottom + HomeSpace.md;
  const carouselReserve = cardHeight + HomeSpace.sm;
  const stageTop = padTop + logoHeight + HomeSpace.xs;
  const stageBottom = screenHeight - padBottom - carouselReserve;

  const bearWidth = clamp(isTablet ? screenHeight * 0.4 : screenHeight * 0.38, 120, 220);
  const bearHeight = bearWidth * BEAR_ASPECT;
  const bearTopRaw = clamp(stageTop + HomeSpace.sm, stageTop, Math.max(stageTop, stageBottom - bearHeight));
  const bearTop = clamp(bearTopRaw - HomeSpace.xl, Math.min(stageTop, stageBottom - bearHeight - HomeSpace.xs), stageBottom - bearHeight - HomeSpace.xs);
  const bear = box(safeLeft, bearTop, bearWidth, bearHeight);

  const rabbitWidth = clamp(isTablet ? screenHeight * 0.34 : screenHeight * 0.32, 104, 180);
  const rabbitHeight = rabbitWidth * RABBIT_ASPECT;
  const rabbitLeft = screenWidth - safeRight - rabbitWidth;

  const speechWidth = clamp(screenWidth * 0.16, 120, 188);
  const speechHeight = speechWidth * SPEECH_ASPECT;
  const speech = box(screenWidth - safeRight - speechWidth, safeTop, speechWidth, speechHeight);

  const butterflyWidth = clamp(screenHeight * 0.11, 48, 72);
  const butterflyHeight = butterflyWidth * BUTTERFLY_ASPECT;
  const butterfly = box(
    rabbitLeft - butterflyWidth * 0.55,
    Math.min(stageBottom - rabbitHeight - HomeSpace.xs + HomeSpace.md, stageBottom - butterflyHeight - HomeSpace.xs),
    butterflyWidth,
    butterflyHeight,
  );

  const contentPadLeft = Math.max(safeLeft + HomeSpace.md, bearWidth * 0.55);
  const contentPadRight = Math.max(safeRight + HomeSpace.md, rabbitWidth * 0.28 + chevronHit * 0.15);

  const cloudAspect = 242 / 420;
  const birdAspect = 187 / 280;
  const beeAspect = 239 / 220;
  const cloudW = clamp(screenWidth * 0.14, 72, 128);
  const cloudSmallW = clamp(screenWidth * 0.1, 56, 96);
  const birdW = clamp(screenHeight * 0.08, 36, 56);
  const birdFarW = clamp(screenHeight * 0.055, 26, 40);
  const beeW = clamp(screenHeight * 0.07, 28, 44);

  const cloudLeft = box(safeLeft, safeTop + HomeSpace.xs, cloudW, cloudW * cloudAspect);
  const cloudMid = box(safeLeft + HomeSpace.xxl, safeTop + HomeSpace.xl, cloudSmallW, cloudSmallW * cloudAspect);
  const cloudRight = box(
    Math.max(screenWidth * 0.58, speech.left - cloudW - HomeSpace.sm),
    safeTop + HomeSpace.xs,
    cloudW,
    cloudW * cloudAspect,
  );
  const birdLeft = box(safeLeft + cloudW * 0.55, safeTop + HomeSpace.sm, birdW, birdW * birdAspect);
  const birdRight = box(speech.left - birdFarW * 0.2, padTop + speechHeight * 0.55, birdFarW, birdFarW * birdAspect);
  const birdFar = box(safeLeft + screenWidth * 0.16, safeTop + HomeSpace.xs, birdFarW, birdFarW * birdAspect);
  const beeLeft = box(safeLeft + bearWidth * 0.72, stageTop + HomeSpace.xs, beeW, beeW * beeAspect);
  const beeRight = box(rabbitLeft - beeW * 0.4, stageTop + HomeSpace.md, beeW * 0.86, beeW * 0.86 * beeAspect);
  const butterflyLeft = box(
    safeLeft + HomeSpace.md,
    Math.min(stageBottom - butterflyHeight * 0.85, stageTop + HomeSpace.xxl),
    butterflyWidth * 0.82,
    butterflyHeight * 0.82,
  );
  const crowAspect = 190 / 280;
  const crowW = clamp(screenHeight * 0.09, 40, 58);
  const crow = box(screenWidth * 0.58, padTop + HomeSpace.sm, crowW, crowW * crowAspect);

  return {
    isTablet,
    bear,
    butterfly,
    cloudLeft,
    cloudMid,
    cloudRight,
    birdLeft,
    birdRight,
    birdFar,
    crow,
    beeLeft,
    beeRight,
    butterflyLeft,
    logoWidth,
    logoHeight,
    cardWidth,
    cardHeight,
    cardGap,
    chevronSize,
    chevronHeight,
    chevronHit,
    padTop,
    padBottom,
    contentPadLeft,
    contentPadRight,
  };
}
