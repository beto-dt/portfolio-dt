import { Text, View } from 'react-native';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { HoverLink } from '@/ui/hover-link';
import { AppButton } from '@/ui/app-button';
import { scrollToAnchor } from '@/ui/scroll-to-anchor';

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
          <HoverLink key={link.anchor} label={link.label} onPress={() => scrollToAnchor(link.anchor)} />
        ))}
        <AppButton label={nav.languageToggleLabel} onPress={toggleLocale} variant="pill" size="sm" />
        <AppButton label={nav.cta.label} onPress={() => scrollToAnchor(nav.cta.anchor)} variant="pillPrimary" size="sm" />
      </View>
    </View>
  );
}
