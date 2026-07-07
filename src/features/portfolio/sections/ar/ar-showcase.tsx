import { useEffect, useRef, useState } from 'react';
import { Platform, Text, View, useWindowDimensions } from 'react-native';
import { unstable_createElement } from 'react-native-web';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { Reveal } from '@/ui/reveal';

const T = {
  es: {
    kicker: 'ar demo',
    heading: 'Míralo en tu espacio',
    support:
      'Gira la torre y hazle zoom. Desde tu móvil, toca «Ver en AR» para ponerla en tu escritorio — sin instalar nada. Así se siente el trabajo de Realidad Aumentada que construyo.',
    arButton: 'Ver en AR ↗',
  },
  en: {
    kicker: 'ar demo',
    heading: 'See it in your space',
    support:
      'Rotate the rook and zoom in. On your phone, tap “View in AR” to place it on your desk — nothing to install. This is what the Augmented Reality work I build feels like.',
    arButton: 'View in AR ↗',
  },
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

export function ArShowcase() {
  const { locale } = useI18n();
  const { width } = useWindowDimensions();
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
      alt: t.heading,
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
    <Container style={{ paddingVertical: 40 }}>
      <Reveal delay={0}>
        <SectionHeading kicker={t.kicker} heading={t.heading} />
        <Text style={{ fontSize: 15, lineHeight: 24, color: colors.textMuted, maxWidth: 640, marginTop: -16, marginBottom: 28 }}>
          {t.support}
        </Text>
      </Reveal>
      <Reveal delay={120}>
        <View
          ref={hostRef}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 24,
            overflow: 'hidden',
            backgroundColor: 'rgba(255,255,255,0.02)',
            height: width < 640 ? 380 : 460,
          }}
        >
          {/* Static placeholder behind the viewer; hidden once the model renders. */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', opacity: modelReady ? 0 : 1 }}>
            <Text style={{ fontSize: 64, color: colors.accent }}>♜</Text>
          </View>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>{viewer}</View>
        </View>
      </Reveal>
    </Container>
  );
}
