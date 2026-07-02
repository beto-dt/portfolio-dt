import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Platform, type ViewStyle } from 'react-native';

/** True when the user asked for reduced motion (web); false on native/SSR. */
function prefersReducedMotion(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Fades children in on mount (opacity 0->1) after `delay` ms, and — unless
 * `slide` is false — also slides them up (translateY 8->0). `slide={false}` is
 * used where a transform would break a seamless layout (e.g. a hairline grid).
 * Under prefers-reduced-motion it renders at the final state.
 */
export function Reveal({
  children,
  delay = 0,
  slide = true,
  style,
}: {
  children: ReactNode;
  delay?: number;
  slide?: boolean;
  style?: ViewStyle;
}) {
  const reduce = prefersReducedMotion();
  const progress = useRef(new Animated.Value(reduce ? 1 : 0)).current;

  useEffect(() => {
    if (reduce) return;
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: 500,
      delay,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [progress, delay, reduce]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: slide
            ? [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }]
            : undefined,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
