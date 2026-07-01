import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { IBMPlexSans_400Regular, IBMPlexSans_500Medium } from '@expo-google-fonts/ibm-plex-sans';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import { ThemeProvider } from '@/theme/theme-provider';
import { I18nProvider } from '@/i18n/i18n-provider';

export default function RootLayout() {
  // Load custom fonts. We intentionally do NOT block rendering on this: on web,
  // gating on fonts leaves the static prerender and first paint blank until JS
  // resolves the fonts. Rendering immediately shows content right away and lets
  // the custom fonts swap in when ready (a standard, acceptable FOUT).
  useFonts({
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    JetBrainsMono_400Regular,
  });

  return (
    <ThemeProvider>
      <I18nProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0b0e' } }} />
      </I18nProvider>
    </ThemeProvider>
  );
}
