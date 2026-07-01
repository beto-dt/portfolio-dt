import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import type { User } from 'firebase/auth';
import type { HeroContent, PortfolioContent } from '@/content/types';
import type { Locale } from '@/i18n/locales';
import { colors, fonts, radii } from '@/theme/tokens';
import { onAdminAuthChanged, signInWithGoogle, signOutAdmin } from '../auth';
import { loadContent, saveSection } from '../content-repo';
import { publishSite } from '../publish';
import { HeroForm } from '../components/hero-form';

export function AdminScreen() {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [locale, setLocale] = useState<Locale>('es');
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState<string | null>(null);
  const [publishUrl, setPublishUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let unsub: (() => void) | undefined;
    onAdminAuthChanged((u) => {
      if (!active) return;
      setUser(u);
      setAuthReady(true);
    }).then((fn) => {
      if (active) unsub = fn;
      else fn();
    });
    return () => {
      active = false;
      unsub?.();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    setStatus(null);
    loadContent(locale)
      .then((content: PortfolioContent) => {
        if (active) setHero(content.hero);
      })
      .catch((e) => active && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user, locale]);

  const onSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al iniciar sesión');
    }
  };

  const onSave = async () => {
    if (!hero) return;
    setStatus('Guardando…');
    try {
      await saveSection(locale, 'hero', hero);
      setStatus('Guardado en Firestore — publica para verlo en vivo.');
    } catch (e) {
      setStatus(e instanceof Error ? `Error: ${e.message}` : 'Error al guardar');
    }
  };

  const onPublish = async () => {
    setPublishing(true);
    setPublishMsg(null);
    setPublishUrl(null);
    try {
      const { actionsUrl } = await publishSite();
      setPublishMsg('Publicación iniciada (~2-3 min).');
      setPublishUrl(actionsUrl);
    } catch (e) {
      setPublishMsg(e instanceof Error ? `Error: ${e.message}` : 'Error al publicar');
    } finally {
      setPublishing(false);
    }
  };

  if (!authReady) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 24, color: colors.text }}>Panel de administración</Text>
        <Pressable onPress={onSignIn} style={{ backgroundColor: colors.accent, borderRadius: radii.md, paddingHorizontal: 22, paddingVertical: 13 }}>
          <Text style={{ color: colors.onAccent, fontFamily: fonts.bodyMedium, fontSize: 15 }}>Iniciar sesión con Google</Text>
        </Pressable>
        {error ? <Text style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 24, gap: 20, maxWidth: 720, width: '100%', marginHorizontal: 'auto' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.text }}>Editar · Hero</Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Pressable onPress={onPublish} disabled={publishing} style={{ backgroundColor: colors.accent, borderRadius: radii.pill, paddingHorizontal: 16, paddingVertical: 7, opacity: publishing ? 0.6 : 1 }}>
            <Text style={{ color: colors.onAccent, fontFamily: fonts.bodyMedium, fontSize: 13 }}>{publishing ? 'Publicando…' : 'Publicar'}</Text>
          </Pressable>
          <Pressable onPress={signOutAdmin} style={{ borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 7 }}>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>Cerrar sesión</Text>
          </Pressable>
        </View>
      </View>

      {publishMsg ? (
        <View style={{ gap: 4 }}>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{publishMsg}</Text>
          {publishUrl ? (
            <Text onPress={() => Linking.openURL(publishUrl)} style={{ color: colors.accent, fontSize: 13, textDecorationLine: 'underline' }}>
              Ver progreso en GitHub Actions
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['es', 'en'] as Locale[]).map((l) => (
          <Pressable key={l} onPress={() => setLocale(l)} style={{ borderRadius: radii.sm, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: l === locale ? colors.accent : colors.surfaceStrong }}>
            <Text style={{ color: l === locale ? colors.onAccent : colors.text, fontFamily: fonts.mono, fontSize: 12 }}>{l.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      {loading || !hero ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <>
          <HeroForm value={hero} onChange={setHero} />
          <Pressable onPress={onSave} style={{ alignSelf: 'flex-start', backgroundColor: colors.accent, borderRadius: radii.md, paddingHorizontal: 24, paddingVertical: 13 }}>
            <Text style={{ color: colors.onAccent, fontFamily: fonts.bodyMedium, fontSize: 15 }}>Guardar</Text>
          </Pressable>
          {status ? <Text style={{ color: colors.textMuted, fontSize: 13 }}>{status}</Text> : null}
        </>
      )}
      {error ? <Text style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</Text> : null}
    </ScrollView>
  );
}
