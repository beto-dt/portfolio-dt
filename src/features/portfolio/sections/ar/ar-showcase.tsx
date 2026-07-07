import { useEffect } from 'react';
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
    fallback: 'Tu navegador no soporta el visor 3D.',
  },
  en: {
    kicker: 'ar demo',
    heading: 'See it in your space',
    support:
      'Rotate the rook and zoom in. On your phone, tap “View in AR” to place it on your desk — nothing to install. This is what the Augmented Reality work I build feels like.',
    arButton: 'View in AR ↗',
    fallback: 'Your browser does not support the 3D viewer.',
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

  useEffect(() => {
    ensureModelViewerScript();
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
      loading: 'lazy',
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
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 24,
            overflow: 'hidden',
            backgroundColor: 'rgba(255,255,255,0.02)',
            height: width < 640 ? 380 : 460,
          }}
        >
          {/* Static fallback behind the viewer: visible only if the element never defines/loads. */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Text style={{ fontSize: 64, color: colors.accent }}>♜</Text>
            <Text style={{ fontSize: 13, color: colors.textFaint }}>{t.fallback}</Text>
          </View>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>{viewer}</View>
        </View>
      </Reveal>
    </Container>
  );
}
