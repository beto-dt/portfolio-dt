import { useState } from 'react';
import { Modal, Platform, Pressable, Text, View, useWindowDimensions, type PressableStateCallbackType } from 'react-native';
import { markSectionSeen } from '@/analytics/tracker';
import type { ProjectItem } from '@/content/types';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { ProjectCard } from '../projects/project-card';
import { ArViewer } from './ar-viewer';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const webCursor = Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null;

const T = {
  es: {
    category: 'DEMO INTERACTIVO',
    title: 'Realidad Aumentada en tu navegador',
    description:
      'Una torre 3D que puedes girar, acercar y — desde tu móvil — colocar en tu espacio real con un tap, sin instalar nada. Modelo generado por código y servido como WebAR.',
    cta: 'Abrir demo ↗',
    modalTitle: 'Demo WebAR',
    close: 'Cerrar',
  },
  en: {
    category: 'INTERACTIVE DEMO',
    title: 'Augmented Reality in your browser',
    description:
      'A 3D rook you can rotate, zoom and — from your phone — place in your real space with one tap, nothing to install. Model generated from code and served as WebAR.',
    cta: 'Open demo ↗',
    modalTitle: 'WebAR demo',
    close: 'Close',
  },
};

const TECH = ['WebAR', '3D', 'model-viewer', 'Scene Viewer', 'Quick Look'];

/** First card of the projects grid: opens the WebAR viewer in a modal. */
export function ArDemoCard() {
  const { locale } = useI18n();
  const { height } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const t = T[locale];

  const item: ProjectItem = { category: t.category, title: t.title, description: t.description, tech: TECH };

  const openDemo = () => {
    setOpen(true);
    markSectionSeen('ar');
  };

  return (
    <>
      <ProjectCard item={item} onPress={openDemo} cta={t.cta} />
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          {/* Stop backdrop-close when pressing inside the dialog. */}
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              width: '92%',
              maxWidth: 900,
              height: Math.min(height * 0.78, 640),
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 24,
              backgroundColor: '#0d0e11',
              overflow: 'hidden',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 17, color: colors.text }}>{t.modalTitle}</Text>
              <Pressable
                onPress={() => setOpen(false)}
                accessibilityLabel={t.close}
                style={[{ padding: 6 }, webCursor as object]}
              >
                {({ hovered }: HoverState) => (
                  <Text style={{ fontSize: 18, color: hovered ? colors.accent : colors.textMuted }}>✕</Text>
                )}
              </Pressable>
            </View>
            <ArViewer />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
