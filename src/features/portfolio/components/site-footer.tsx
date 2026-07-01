import { Text, View } from 'react-native';
import { Container } from './container';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';

export function SiteFooter() {
  const { content } = useI18n();
  const { footer } = content;
  return (
    <View style={{ width: '100%', borderTopWidth: 1, borderTopColor: colors.border }}>
      <Container style={{ paddingVertical: 28, flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.textFaint }}>{footer.copyright}</Text>
        <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.textFaint }}>{footer.tagline}</Text>
      </Container>
    </View>
  );
}
