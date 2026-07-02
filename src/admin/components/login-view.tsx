import type { ReactNode } from 'react';
import { Image, Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts } from '@/theme/tokens';
import { HoverLink } from '@/ui/hover-link';

type HoverState = PressableStateCallbackType & { hovered?: boolean };

const backdropWeb = Platform.OS === 'web'
  ? ({
      backgroundImage:
        'radial-gradient(640px 420px at 50% 30%, rgba(228,227,87,0.06), rgba(228,227,87,0) 70%), ' +
        'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), ' +
        'linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      backgroundSize: 'auto, 48px 48px, 48px 48px',
    } as object)
  : null;
const cardGlowWeb = Platform.OS === 'web'
  ? ({ backgroundImage: 'radial-gradient(420px 260px at 80% 0%, rgba(228,227,87,0.06), rgba(228,227,87,0) 70%)' } as object)
  : null;
const googleWeb = Platform.OS === 'web'
  ? ({ cursor: 'pointer', transitionProperty: 'background-color, box-shadow', transitionDuration: '150ms' } as object)
  : null;
const googleHoverShadow = Platform.OS === 'web' ? ({ boxShadow: '0 8px 24px rgba(0,0,0,0.35)' } as object) : null;

/** Full-screen admin background (subtle grid + accent glow), content centered. */
export function AdminBackdrop({ children }: { children: ReactNode }) {
  return (
    <View style={[{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 }, backdropWeb as object]}>
      {children}
    </View>
  );
}

export function LoginView({ onSignIn, error }: { onSignIn: () => void; error: string | null }) {
  return (
    <AdminBackdrop>
      <View style={[{ width: '100%', maxWidth: 460, borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.02)', padding: 36, gap: 18 }, cardGlowWeb as object]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ backgroundColor: colors.surfaceCell, padding: 6, borderRadius: 12 }}>
            <Image source={require('@/assets/images/logo.png')} style={{ width: 40, height: 40, borderRadius: 10 }} />
          </View>
          <View style={{ gap: 2 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 16, color: colors.text }}>Luis De La Torre</Text>
            <Text style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: colors.accent }}>CONSOLE</Text>
          </View>
        </View>

        <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
          <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: colors.accent }} />
          <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1, color: 'rgb(201,205,212)' }}>ACCESO PRIVADO</Text>
        </View>

        <Text style={{ fontFamily: fonts.display, fontSize: 26, color: colors.text }}>Panel de administración</Text>
        <Text style={{ fontSize: 14.5, lineHeight: 22, color: colors.textMuted }}>
          Gestiona las solicitudes de proyectos y las citas agendadas desde tu portfolio.
        </Text>

        <Pressable
          onPress={onSignIn}
          style={({ hovered, pressed }: HoverState) => [
            { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: hovered ? '#f1f1f1' : '#ffffff', borderRadius: 12, paddingVertical: 14, opacity: pressed ? 0.85 : 1 },
            googleWeb as object,
            hovered ? (googleHoverShadow as object) : null,
          ]}
        >
          <Image source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }} style={{ width: 18, height: 18 }} />
          <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 15, color: '#1f1f1f' }}>Iniciar sesión con Google</Text>
        </Pressable>
        {error ? <Text style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</Text> : null}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <Text style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.textFaint }}>SEGURIDAD</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Text style={{ fontSize: 14, opacity: 0.7 }}>🔒</Text>
          <Text style={{ flex: 1, fontSize: 12.5, lineHeight: 19, color: colors.textFaint }}>
            Solo cuentas autorizadas pueden acceder. Tu sesión se cifra de extremo a extremo y expira automáticamente.
          </Text>
        </View>
      </View>

      <View style={{ marginTop: 24 }}>
        <HoverLink label="← Volver al sitio" onPress={() => router.replace('/')} color={colors.textFaint} hoverColor={colors.accent} />
      </View>
    </AdminBackdrop>
  );
}
