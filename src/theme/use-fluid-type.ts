import { useWindowDimensions } from 'react-native';

/**
 * Evaluates a CSS `clamp(min, <vw>vw, max)` for the current viewport width.
 * Lets us reproduce the mock's fluid typography with RN primitives (no CSS).
 */
export function clampVw(min: number, vw: number, max: number, width: number): number {
  return Math.round(Math.max(min, Math.min(max, (vw / 100) * width)));
}

/** Responsive font sizes (and derived line-heights/letter-spacings) for the
 *  large display type. Scales from mobile to desktop like the original mock. */
export function useFluidType() {
  const { width } = useWindowDimensions();

  const heroTitle = clampVw(40, 6.6, 80, width); // mock: clamp(40px, 6.6vw, 80px)
  const heroSubtitle = clampVw(16, 1.5, 19, width); // mock: clamp(16px, 1.5vw, 19px)
  const sectionHeading = clampVw(26, 3.2, 40, width); // mock: ~clamp(28px, 3.4vw, 42px)

  return {
    width,
    heroTitle,
    heroTitleLineHeight: Math.round(heroTitle * 1.02),
    heroTitleSpacing: -heroTitle * 0.03,
    heroSubtitle,
    heroSubtitleLineHeight: Math.round(heroSubtitle * 1.6),
    sectionHeading,
    sectionHeadingSpacing: -sectionHeading * 0.02,
  };
}
