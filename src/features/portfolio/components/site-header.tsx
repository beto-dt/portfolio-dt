import { Pressable, Text, View } from 'react-native';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';

export function SiteHeader() {
  const { content, toggleLocale } = useI18n();
  const { nav } = content;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // Wrap the nav below the name on narrow (mobile) widths instead of
        // forcing horizontal overflow.
        flexWrap: 'wrap',
        columnGap: 20,
        rowGap: 12,
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.07)',
        backgroundColor: 'rgba(10,11,14,0.72)',
      }}
    >
      <View style={{ flexDirection: 'column', gap: 2, minWidth: 0, flexShrink: 1 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 16, letterSpacing: -0.16, color: colors.text }}>
          {nav.name}
        </Text>
        <Text style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.6, color: colors.accent }}>
          {nav.role}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 24, flexWrap: 'wrap', flexShrink: 1 }}>
        {nav.links.map((link) => (
          <Text key={link.anchor} style={{ fontSize: 13.5, color: colors.textMuted }}>
            {link.label}
          </Text>
        ))}
        <Pressable
          onPress={toggleLocale}
          style={{
            backgroundColor: colors.surfaceStrong,
            borderWidth: 1,
            borderColor: colors.borderStrong,
            borderRadius: radii.pill,
            paddingHorizontal: 11,
            paddingVertical: 6,
          }}
        >
          <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 0.55, color: 'rgb(231,233,236)' }}>
            {nav.languageToggleLabel}
          </Text>
        </Pressable>
        <View style={{ backgroundColor: colors.accent, borderRadius: radii.pill, paddingHorizontal: 16, paddingVertical: 9 }}>
          <Text style={{ fontSize: 13, fontFamily: fonts.bodyMedium, color: colors.onAccent }}>{nav.cta.label}</Text>
        </View>
      </View>
    </View>
  );
}
