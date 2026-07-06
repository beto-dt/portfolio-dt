import { useEffect, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SiteHeader } from './site-header';
import { SiteFooter } from './site-footer';
import { DockNav } from './dock-nav';
import { WhatsAppFab } from './whatsapp-fab';
import { armVisit } from '@/analytics/tracker';
import { colors } from '@/theme/tokens';

/** Chrome shared by every public page: header, scroll area, footer, dock, FAB. */
export function PageShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    armVisit();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SiteHeader />
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 148 }}>
        <View nativeID="top" style={{ alignSelf: 'stretch' }} />
        {children}
        <SiteFooter />
      </ScrollView>
      <DockNav />
      <WhatsAppFab />
    </View>
  );
}
