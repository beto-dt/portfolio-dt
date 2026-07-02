import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, Text, useWindowDimensions, View, type PressableStateCallbackType } from 'react-native';
import type { User } from 'firebase/auth';
import type { PortfolioContent } from '@/content/types';
import type { Locale } from '@/i18n/locales';
import { colors, fonts, radii } from '@/theme/tokens';
import { onAdminAuthChanged, signInWithGoogle, signOutAdmin } from '../auth';
import { loadContent, saveSection } from '../content-repo';
import { loadBookings, setBookingStatus, type BookingRecord } from '../bookings-repo';
import { publishSite } from '../publish';
import { HeroForm } from '../components/forms/hero-form';
import { NavForm } from '../components/forms/nav-form';
import { ServicesForm } from '../components/forms/services-form';
import { ImpactForm } from '../components/forms/impact-form';
import { StackForm } from '../components/forms/stack-form';
import { ExperienceForm } from '../components/forms/experience-form';
import { ProjectsForm } from '../components/forms/projects-form';
import { TestimonialsForm } from '../components/forms/testimonials-form';
import { CertificationsForm } from '../components/forms/certifications-form';
import { EducationForm } from '../components/forms/education-form';
import { ProcessForm } from '../components/forms/process-form';
import { CollaborationForm } from '../components/forms/collaboration-form';
import { ContactForm } from '../components/forms/contact-form';
import { FooterForm } from '../components/forms/footer-form';
import { MetricsView } from '../components/metrics-view';
import { BookingsView } from '../components/bookings-view';
import { AdminBackdrop, LoginView } from '../components/login-view';
import { AccentButton, AdminShell, ViewHeader, type AdminView } from '../components/admin-shell';

type HoverState = PressableStateCallbackType & { hovered?: boolean };

const webPress = Platform.OS === 'web'
  ? ({ cursor: 'pointer', transitionProperty: 'background-color', transitionDuration: '150ms' } as object)
  : null;

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
  { key: 'testimonials', label: 'Recomendaciones' },
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
    case 'testimonials':
      return <TestimonialsForm value={content.testimonials} onChange={(v) => onChange({ ...content, testimonials: v })} />;
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

function SectionNavItem({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }: HoverState) => [
        { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radii.md, backgroundColor: active ? 'rgba(228,227,87,0.12)' : hovered ? colors.surfaceStrong : 'transparent' },
        webPress as object,
      ]}
    >
      <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: active ? colors.accent : colors.border }} />
      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: active ? colors.text : colors.textMuted }}>{label}</Text>
    </Pressable>
  );
}

function SaveBar({ status, onSave }: { status: string | null; onSave: () => void }) {
  const isSaving = status === 'Guardando…';
  const isSaved = !!status && status.startsWith('Guardado');
  const isError = !!status && !isSaving && !isSaved;
  const color = isSaved ? '#4ade80' : isSaving ? colors.accent : isError ? '#ff6b6b' : colors.textFaint;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface, padding: 16 }}>
      <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: color }} />
      <Text style={{ flex: 1, fontFamily: fonts.mono, fontSize: 12.5, color }}>{status ?? 'Sin cambios pendientes'}</Text>
      <AccentButton label="💾 Guardar" onPress={onSave} />
    </View>
  );
}

function EditorView({
  wide,
  section,
  onSection,
  loading,
  content,
  onChange,
  status,
  onSave,
}: {
  wide: boolean;
  section: SectionKey;
  onSection: (s: SectionKey) => void;
  loading: boolean;
  content: PortfolioContent | null;
  onChange: (c: PortfolioContent) => void;
  status: string | null;
  onSave: () => void;
}) {
  return (
    <View style={{ gap: 24 }}>
      <ViewHeader title="Editor de contenido" subtitle="Edita los textos de tu portfolio y publica los cambios." />
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 24 }}>
        <View style={{ width: wide ? 220 : '100%', gap: 4 }}>
          {SECTIONS.map((s) => (
            <SectionNavItem key={s.key} label={s.label} active={s.key === section} onPress={() => onSection(s.key)} />
          ))}
        </View>
        <View style={[{ gap: 16 }, wide ? { flex: 1 } : null]}>
          {loading || !content ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <>
              <SectionForm section={section} content={content} onChange={onChange} />
              <SaveBar status={status} onSave={onSave} />
            </>
          )}
        </View>
      </View>
    </View>
  );
}

export function AdminScreen() {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<AdminView>('metrics');
  const [locale, setLocale] = useState<Locale>('es');
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [section, setSection] = useState<SectionKey>('hero');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState<string | null>(null);
  const [publishUrl, setPublishUrl] = useState<string | null>(null);

  const [bookings, setBookings] = useState<BookingRecord[] | null>(null);

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

  useEffect(() => {
    if (!user) {
      setBookings(null);
      return;
    }
    let active = true;
    loadBookings()
      .then((b) => active && setBookings(b))
      .catch((e) => {
        if (active) {
          setBookings([]);
          setError(e instanceof Error ? e.message : String(e));
        }
      });
    return () => {
      active = false;
    };
  }, [user]);

  const onBookingStatus = async (id: string, next: string) => {
    setBookings((prev) => prev?.map((b) => (b.id === id ? { ...b, status: next } : b)) ?? prev);
    try {
      await setBookingStatus(id, next);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

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

  const { width } = useWindowDimensions();
  const wide = width >= 900;

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
    <AdminShell
      view={view}
      onNavigate={setView}
      bookingsCount={bookings ? bookings.length : null}
      publishing={publishing}
      onPublish={onPublish}
      publishMsg={publishMsg}
      publishUrl={publishUrl}
      locale={locale}
      onLocale={setLocale}
      onSignOut={signOutAdmin}
    >
      {view === 'metrics' ? (
        <MetricsView bookings={bookings} />
      ) : view === 'bookings' ? (
        <BookingsView bookings={bookings} onStatus={onBookingStatus} />
      ) : (
        <EditorView wide={wide} section={section} onSection={setSection} loading={loading} content={content} onChange={setContent} status={status} onSave={onSave} />
      )}
      {error ? <Text style={{ color: '#ff6b6b', fontSize: 13, marginTop: 16 }}>{error}</Text> : null}
    </AdminShell>
  );
}
