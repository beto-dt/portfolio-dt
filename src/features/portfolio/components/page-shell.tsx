import { useEffect, useState, type ReactNode } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { SiteHeader } from './site-header';
import { SiteFooter } from './site-footer';
import { DockNav } from './dock-nav';
import { WhatsAppFab } from './whatsapp-fab';
import { ScrollProgress } from './scroll-progress';
import { armVisit } from '@/analytics/tracker';
import { colors } from '@/theme/tokens';

// v2 design root: subtle accent radial glows over the flat background.
const ambientWeb = Platform.OS === 'web'
  ? ({
      backgroundImage:
        'radial-gradient(1200px 600px at 78% -8%, rgba(228,227,87,0.12), transparent 70%), ' +
        'radial-gradient(900px 500px at 8% 12%, rgba(228,227,87,0.07), transparent 65%)',
    } as object)
  : null;

/** Chrome shared by every public page: header, scroll area, footer, dock, FAB. */
export function PageShell({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    armVisit();
  }, []);

  return (
    <View style={[{ flex: 1, backgroundColor: colors.background }, ambientWeb as object]}>
      <SiteHeader />
      <ScrollView
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 148 }}
        scrollEventThrottle={16}
        onScroll={(e) => {
          const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
          const max = contentSize.height - layoutMeasurement.height;
          setProgress(max > 0 ? Math.min(1, Math.max(0, contentOffset.y / max)) : 0);
        }}
      >
        <View nativeID="top" style={{ alignSelf: 'stretch' }} />
        {children}
        <SiteFooter />
      </ScrollView>
      <DockNav />
      <WhatsAppFab />
      <ScrollProgress progress={progress} />
    </View>
  );
}
