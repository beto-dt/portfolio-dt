import type { ReactNode } from 'react';
import { Image, Linking, Platform, Pressable, ScrollView, Text, useWindowDimensions, View, type PressableStateCallbackType } from 'react-native';
import type { Locale } from '@/i18n/locales';
import { colors, fonts, radii } from '@/theme/tokens';
import { Chip } from '@/ui/chip';
import { HoverLink } from '@/ui/hover-link';

type HoverState = PressableStateCallbackType & { hovered?: boolean };

export type AdminView = 'metrics' | 'bookings' | 'posts' | 'editor';

const webPress = Platform.OS === 'web'
  ? ({ cursor: 'pointer', transitionProperty: 'background-color, border-color, opacity', transitionDuration: '150ms' } as object)
  : null;

const NAV: { key: AdminView; glyph: string; label: string }[] = [
  { key: 'metrics', glyph: '📊', label: 'Métricas' },
  { key: 'bookings', glyph: '💬', label: 'Solicitudes' },
  { key: 'posts', glyph: '📝', label: 'Blog' },
  { key: 'editor', glyph: '✎', label: 'Editor' },
];

/** Shared view header: title + subtitle, used by every admin view. */
export function ViewHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontFamily: fonts.display, fontSize: 26, color: colors.text }}>{title}</Text>
      <Text style={{ fontSize: 14, lineHeight: 21, color: colors.textMuted }}>{subtitle}</Text>
    </View>
  );
}

/** Small accent action button (Responder, Guardar). */
export function AccentButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered, pressed }: HoverState) => [
        { backgroundColor: hovered ? '#eeed6b' : colors.accent, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, opacity: pressed ? 0.85 : 1 },
        webPress as object,
      ]}
    >
      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.onAccent }}>{label}</Text>
    </Pressable>
  );
}

function NavItem({ glyph, label, active, badge, onPress }: { glyph: string; label: string; active: boolean; badge?: number | null; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }: HoverState) => [
        { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: radii.md, backgroundColor: active ? 'rgba(228,227,87,0.12)' : hovered ? colors.surfaceStrong : 'transparent' },
        webPress as object,
      ]}
    >
      <Text style={{ fontSize: 13, color: active ? colors.accent : colors.textMuted }}>{glyph}</Text>
      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: active ? colors.accent : colors.textMuted }}>{label}</Text>
      {badge ? (
        <View style={{ marginLeft: 'auto', minWidth: 20, height: 20, borderRadius: 999, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.onAccent }}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function AdminShell({
  view,
  onNavigate,
  bookingsCount,
  publishing,
  onPublish,
  publishMsg,
  publishUrl,
  locale,
  onLocale,
  onSignOut,
  children,
}: {
  view: AdminView;
  onNavigate: (v: AdminView) => void;
  bookingsCount: number | null;
  publishing: boolean;
  onPublish: () => void;
  publishMsg: string | null;
  publishUrl: string | null;
  locale: Locale;
  onLocale: (l: Locale) => void;
  onSignOut: () => void;
  children: ReactNode;
}) {
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, flexDirection: wide ? 'row' : 'column' }}>
      <View
        style={{
          width: wide ? 280 : '100%',
          borderRightWidth: wide ? 1 : 0,
          borderBottomWidth: wide ? 0 : 1,
          borderColor: colors.border,
          backgroundColor: 'rgba(255,255,255,0.015)',
          padding: 20,
          justifyContent: wide ? 'space-between' : 'flex-start',
          gap: wide ? 0 : 20,
        }}
      >
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ backgroundColor: colors.surfaceCell, padding: 5, borderRadius: 10 }}>
              <Image source={require('@/assets/images/logo.png')} style={{ width: 32, height: 32, borderRadius: 8 }} />
            </View>
            <View style={{ gap: 2 }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 15, color: colors.text }}>Luis De La Torre</Text>
              <Text style={{ fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 1.5, color: colors.accent }}>CONSOLE</Text>
            </View>
          </View>
          <Text style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.textFaint, marginTop: 20, marginBottom: 6, paddingHorizontal: 14 }}>GESTIÓN</Text>
          <View style={{ gap: 2 }}>
            {NAV.map((item) => (
              <NavItem
                key={item.key}
                glyph={item.glyph}
                label={item.label}
                active={view === item.key}
                badge={item.key === 'bookings' ? bookingsCount : null}
                onPress={() => onNavigate(item.key)}
              />
            ))}
          </View>
        </View>

        <View style={{ gap: 10 }}>
          {publishMsg ? (
            <View style={{ gap: 4 }}>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{publishMsg}</Text>
              {publishUrl ? (
                <HoverLink label="Ver progreso en GitHub Actions" onPress={() => Linking.openURL(publishUrl)} color={colors.accent} hoverColor={colors.text} />
              ) : null}
            </View>
          ) : null}
          <Pressable
            onPress={onPublish}
            disabled={publishing}
            style={({ hovered, pressed }: HoverState) => [
              { backgroundColor: hovered ? '#eeed6b' : colors.accent, borderRadius: 12, paddingVertical: 13, alignItems: 'center', opacity: pressed ? 0.85 : publishing ? 0.7 : 1 },
              webPress as object,
            ]}
          >
            <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.onAccent }}>{publishing ? 'Publicando…' : '↑ Publicar'}</Text>
          </Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {(['es', 'en'] as Locale[]).map((l) => (
              <Chip key={l} label={l.toUpperCase()} active={l === locale} onPress={() => onLocale(l)} />
            ))}
            <View style={{ flex: 1 }} />
            <Pressable
              onPress={onSignOut}
              style={({ hovered }: HoverState) => [
                { borderWidth: 1, borderColor: hovered ? colors.borderStrong : colors.border, borderRadius: radii.md, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: hovered ? colors.surfaceStrong : 'transparent' },
                webPress as object,
              ]}
            >
              <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.textMuted }}>⎋ Salir</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 32, maxWidth: 1100, width: '100%' }}>
        {children}
      </ScrollView>
    </View>
  );
}
