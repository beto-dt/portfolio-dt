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
 * Fades + slides children in on mount (opacity 0->1, translateY 8->0) after
 * `delay` ms. Under prefers-reduced-motion it renders at the final state.
 */
export function Reveal({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: ViewStyle }) {
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
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
