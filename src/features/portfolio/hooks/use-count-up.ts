import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

function prefersReducedMotion(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

type Parsed = { prefix: string; target: number; decimals: number; suffix: string };

/** Split "99.9%" into { prefix:"", target:99.9, decimals:1, suffix:"%" }. Null if no number. */
function parse(value: string): Parsed | null {
  const m = /^(\D*)(\d+(?:\.\d+)?)(.*)$/.exec(value);
  if (!m) return null;
  const [, prefix, num, suffix] = m;
  const dot = num.indexOf('.');
  return { prefix, target: parseFloat(num), decimals: dot === -1 ? 0 : num.length - dot - 1, suffix };
}

function format(p: Parsed, n: number): string {
  return `${p.prefix}${n.toFixed(p.decimals)}${p.suffix}`;
}

/**
 * Returns `value` with its number animating 0 -> target on mount (~1s, ease-out).
 * Non-numeric values and reduced-motion return the final string immediately.
 */
export function useCountUp(value: string, opts?: { durationMs?: number }): string {
  const durationMs = opts?.durationMs ?? 1000;
  const parsed = parse(value);
  const [display, setDisplay] = useState<string>(() => (parsed ? format(parsed, 0) : value));

  useEffect(() => {
    if (!parsed) {
      setDisplay(value);
      return;
    }
    if (prefersReducedMotion() || typeof requestAnimationFrame !== 'function') {
      setDisplay(format(parsed, parsed.target));
      return;
    }
    let raf = 0;
    let start = 0;
    const tick = (ts: number) => {
      if (start === 0) start = ts;
      const t = Math.min(1, (ts - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(format(parsed, parsed.target * eased));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(format(parsed, parsed.target)); // land exactly on target
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // value drives re-parse; parsed is derived from value each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs]);

  return display;
}
