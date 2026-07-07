import { useEffect, useRef, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { unstable_createElement } from 'react-native-web';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';

const T = {
  es: { arButton: 'Ver en AR ↗' },
  en: { arButton: 'View in AR ↗' },
};

/** Injects the self-hosted model-viewer module once, on first mount (web only). */
function ensureModelViewerScript(): void {
  if (typeof document === 'undefined' || typeof customElements === 'undefined') return;
  if (customElements.get('model-viewer') || document.getElementById('model-viewer-script')) return;
  const script = document.createElement('script');
  script.type = 'module';
  script.src = '/vendor/model-viewer.min.js';
  script.id = 'model-viewer-script';
  document.head.appendChild(script);
}

/** The interactive 3D/AR rook viewer; fills its parent. */
export function ArViewer() {
  const { locale } = useI18n();
  const t = T[locale];
  const hostRef = useRef<View>(null);
  const [modelReady, setModelReady] = useState(false);

  useEffect(() => {
    ensureModelViewerScript();
  }, []);

  // Hide the static placeholder once the model renders (the viewer background
  // is transparent, so anything behind it stays visible until then). Polling
  // the element's `loaded` flag is more reliable than a React ref here:
  // unstable_createElement does not forward refs to the custom element.
  useEffect(() => {
    const host = hostRef.current as unknown as HTMLElement | null;
    if (!host || typeof host.querySelector !== 'function') return;
    let ticks = 0;
    const timer = setInterval(() => {
      const el = host.querySelector('model-viewer') as unknown as { loaded?: boolean } | null;
      ticks += 1;
      if (el?.loaded) {
        setModelReady(true);
        clearInterval(timer);
      } else if (ticks > 120) {
        clearInterval(timer); // never loaded — keep the static placeholder
      }
    }, 250);
    return () => clearInterval(timer);
  }, []);

  if (Platform.OS !== 'web') return null;

  const viewer = unstable_createElement(
    'model-viewer',
    {
      src: '/models/rook.glb',
      'ios-src': '/models/rook.usdz',
      alt: 'Luis De La Torre — AR demo',
      ar: '',
      'ar-modes': 'webxr scene-viewer quick-look',
      'camera-controls': '',
      'auto-rotate': '',
      'auto-rotate-delay': '0',
      'shadow-intensity': '1',
      'touch-action': 'pan-y',
      loading: 'eager',
      style: { width: '100%', height: '100%', '--progress-bar-color': 'rgba(228,227,87,0.85)' },
    },
    unstable_createElement(
      'button',
      {
        slot: 'ar-button',
        style: {
          position: 'absolute',
          bottom: '18px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: colors.accent,
          color: colors.onAccent,
          border: 'none',
          borderRadius: '999px',
          padding: '12px 22px',
          fontFamily: fonts.bodyMedium,
          fontSize: '14px',
          cursor: 'pointer',
        },
      },
      t.arButton,
    ),
  );

  return (
    <View ref={hostRef} style={{ flex: 1 }}>
      {/* Static placeholder behind the viewer; hidden once the model renders. */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', opacity: modelReady ? 0 : 1 }}>
        <Text style={{ fontSize: 64, color: colors.accent }}>♜</Text>
      </View>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>{viewer}</View>
    </View>
  );
}
