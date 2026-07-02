import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, Text, View } from 'react-native';
import type { User } from 'firebase/auth';
import type { PortfolioContent } from '@/content/types';
import type { Locale } from '@/i18n/locales';
import { colors, fonts } from '@/theme/tokens';
import { AppButton } from '@/ui/app-button';
import { Chip } from '@/ui/chip';
import { HoverLink } from '@/ui/hover-link';
import { onAdminAuthChanged, signInWithGoogle, signOutAdmin } from '../auth';
import { loadContent, saveSection } from '../content-repo';
import { publishSite } from '../publish';
import { HeroForm } from '../components/forms/hero-form';
import { NavForm } from '../components/forms/nav-form';
import { ServicesForm } from '../components/forms/services-form';
import { ImpactForm } from '../components/forms/impact-form';
import { StackForm } from '../components/forms/stack-form';
import { ExperienceForm } from '../components/forms/experience-form';
import { ProjectsForm } from '../components/forms/projects-form';
import { CertificationsForm } from '../components/forms/certifications-form';
import { EducationForm } from '../components/forms/education-form';
import { ProcessForm } from '../components/forms/process-form';
import { CollaborationForm } from '../components/forms/collaboration-form';
import { ContactForm } from '../components/forms/contact-form';
import { FooterForm } from '../components/forms/footer-form';
import { MetricsView } from '../components/metrics-view';
import { BookingsView } from '../components/bookings-view';
import { AdminBackdrop, LoginView } from '../components/login-view';

type SectionKey = keyof PortfolioContent;

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: 'nav', label: 'Nav' },
  { key: 'hero', label: 'Hero' },
  { key: 'services', label: 'Servicios' },
  { key: 'process', label: 'Proceso' },
  { key: 'impact', label: 'Impacto' },
  { key: 'stack', label: 'Stack' },
  { key: 'experience', label: 'Experiencia' },
  { key: 'projects', label: 'Proyectos' },
  { key: 'certifications', label: 'Certificaciones' },
  { key: 'education', label: 'Educación' },
  { key: 'collaboration', label: 'Colaboración' },
  { key: 'contact', label: 'Contacto' },
  { key: 'footer', label: 'Footer' },
];

function SectionForm({ section, content, onChange }: { section: SectionKey; content: PortfolioContent; onChange: (c: PortfolioContent) => void }) {
  switch (section) {
    case 'nav':
      return <NavForm value={content.nav} onChange={(v) => onChange({ ...content, nav: v })} />;
    case 'hero':
      return <HeroForm value={content.hero} onChange={(v) => onChange({ ...content, hero: v })} />;
    case 'services':
      return <ServicesForm value={content.services} onChange={(v) => onChange({ ...content, services: v })} />;
    case 'process':
      return <ProcessForm value={content.process} onChange={(v) => onChange({ ...content, process: v })} />;
    case 'impact':
      return <ImpactForm value={content.impact} onChange={(v) => onChange({ ...content, impact: v })} />;
    case 'stack':
      return <StackForm value={content.stack} onChange={(v) => onChange({ ...content, stack: v })} />;
    case 'experience':
      return <ExperienceForm value={content.experience} onChange={(v) => onChange({ ...content, experience: v })} />;
    case 'projects':
      return <ProjectsForm value={content.projects} onChange={(v) => onChange({ ...content, projects: v })} />;
    case 'certifications':
      return <CertificationsForm value={content.certifications} onChange={(v) => onChange({ ...content, certifications: v })} />;
    case 'education':
      return <EducationForm value={content.education} onChange={(v) => onChange({ ...content, education: v })} />;
    case 'collaboration':
      return <CollaborationForm value={content.collaboration} onChange={(v) => onChange({ ...content, collaboration: v })} />;
    case 'contact':
      return <ContactForm value={content.contact} onChange={(v) => onChange({ ...content, contact: v })} />;
    case 'footer':
      return <FooterForm value={content.footer} onChange={(v) => onChange({ ...content, footer: v })} />;
  }
}

export function AdminScreen() {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<'content' | 'metrics' | 'bookings'>('content');
  const [locale, setLocale] = useState<Locale>('es');
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [section, setSection] = useState<SectionKey>('hero');
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
      .then((c) => active && setContent(c))
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
    if (!content) return;
    setStatus('Guardando…');
    try {
      await saveSection(locale, section, content[section]);
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
      <AdminBackdrop>
        <ActivityIndicator color={colors.accent} />
      </AdminBackdrop>
    );
  }

  if (!user) {
    return <LoginView onSignIn={onSignIn} error={error} />;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 24, gap: 20, maxWidth: 760, width: '100%', marginHorizontal: 'auto' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.text }}>Panel · {SECTIONS.find((s) => s.key === section)?.label}</Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          {view !== 'content' ? <AppButton label="Editar" onPress={() => setView('content')} variant="pill" size="sm" /> : null}
          {view !== 'metrics' ? <AppButton label="Métricas" onPress={() => setView('metrics')} variant="pill" size="sm" /> : null}
          {view !== 'bookings' ? <AppButton label="Solicitudes" onPress={() => setView('bookings')} variant="pill" size="sm" /> : null}
          <AppButton label={publishing ? 'Publicando…' : 'Publicar'} onPress={onPublish} variant="pillPrimary" size="sm" />
          <AppButton label="Cerrar sesión" onPress={signOutAdmin} variant="pill" size="sm" />
        </View>
      </View>

      {publishMsg ? (
        <View style={{ gap: 4 }}>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{publishMsg}</Text>
          {publishUrl ? (
            <HoverLink label="Ver progreso en GitHub Actions" onPress={() => Linking.openURL(publishUrl)} color={colors.accent} hoverColor={colors.text} />
          ) : null}
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['es', 'en'] as Locale[]).map((l) => (
          <Chip key={l} label={l.toUpperCase()} active={l === locale} onPress={() => setLocale(l)} />
        ))}
      </View>

      {view === 'metrics' ? (
        <MetricsView />
      ) : view === 'bookings' ? (
        <BookingsView />
      ) : (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {SECTIONS.map((s) => (
              <Chip key={s.key} label={s.label} active={s.key === section} onPress={() => setSection(s.key)} mono={false} />
            ))}
          </View>
          {loading || !content ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <>
              <SectionForm section={section} content={content} onChange={setContent} />
              <View style={{ alignSelf: 'flex-start' }}>
                <AppButton label="Guardar" onPress={onSave} variant="primary" />
              </View>
              {status ? <Text style={{ color: colors.textMuted, fontSize: 13 }}>{status}</Text> : null}
            </>
          )}
        </>
      )}
      {error ? <Text style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</Text> : null}
    </ScrollView>
  );
}
