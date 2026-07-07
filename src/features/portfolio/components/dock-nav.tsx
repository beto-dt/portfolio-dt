import { Platform, Pressable, Text, View, useWindowDimensions, type PressableStateCallbackType } from 'react-native';
import { router, usePathname } from 'expo-router';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';

type HoverState = PressableStateCallbackType & { hovered?: boolean };

// v2 design dock chrome: fixed blurred pill centered at the bottom.
const dockWebWide = Platform.OS === 'web'
  ? ({ position: 'fixed', left: '50%', transform: 'translateX(-50%)', backdropFilter: 'blur(16px)', boxShadow: '0 18px 44px -14px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.05)' } as object)
  : null;
const dockWebNarrow = Platform.OS === 'web'
  ? ({ position: 'fixed', backdropFilter: 'blur(16px)', boxShadow: '0 18px 44px -14px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.05)' } as object)
  : null;
const tabWeb = Platform.OS === 'web' ? ({ cursor: 'pointer', transitionProperty: 'background-color', transitionDuration: '180ms' } as object) : null;

type IconName = 'home' | 'services' | 'about' | 'projects' | 'contact' | 'blog';

// Icon paths lifted verbatim from Portfolio v2.dc.html (21×21, stroke 1.9).
function DockIcon({ name, color }: { name: IconName; color: string }) {
  const common = { stroke: color, strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' as const };
  return (
    <Svg width={21} height={21} viewBox="0 0 24 24">
      {name === 'home' ? (
        <>
          <Path d="M3 10.5 12 3l9 7.5" {...common} />
          <Path d="M5.5 9.5V20a1 1 0 0 0 1 1H10v-5h4v5h3.5a1 1 0 0 0 1-1V9.5" {...common} />
        </>
      ) : null}
      {name === 'services' ? (
        <>
          <Rect x={3.5} y={3.5} width={7} height={7} rx={1.5} {...common} />
          <Rect x={13.5} y={3.5} width={7} height={7} rx={1.5} {...common} />
          <Rect x={3.5} y={13.5} width={7} height={7} rx={1.5} {...common} />
          <Rect x={13.5} y={13.5} width={7} height={7} rx={1.5} {...common} />
        </>
      ) : null}
      {name === 'about' ? (
        <>
          <Circle cx={12} cy={8} r={4} {...common} />
          <Path d="M4 21v-1a6 6 0 0 1 12 0v1" {...common} />
        </>
      ) : null}
      {name === 'projects' ? (
        <Path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2h8.5A1.5 1.5 0 0 1 21 9.5v8A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" {...common} />
      ) : null}
      {name === 'contact' ? (
        <>
          <Rect x={3} y={5} width={18} height={14} rx={2} {...common} />
          <Path d="m3.5 7 8.5 6 8.5-6" {...common} />
        </>
      ) : null}
      {name === 'blog' ? (
        <>
          <Path d="M12 20h9" {...common} />
          <Path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" {...common} />
        </>
      ) : null}
    </Svg>
  );
}

function DockTab({ icon, label, active, narrow, onPress }: { icon: IconName; label: string; active: boolean; narrow: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        { flexDirection: 'column', alignItems: 'center', gap: 4, paddingVertical: narrow ? 8 : 9, paddingHorizontal: narrow ? 6 : 20, borderRadius: 999, backgroundColor: active ? 'rgba(228,227,87,0.16)' : 'transparent' },
        narrow ? { flex: 1 } : null,
        tabWeb as object,
      ]}
    >
      {({ hovered }: HoverState) => {
        const color = active ? colors.accent : hovered ? '#e7e9ec' : '#9aa0aa';
        return (
          <>
            <DockIcon name={icon} color={color} />
            <Text style={{ fontFamily: active ? fonts.bodyMedium : fonts.body, fontSize: 11, color }}>{label}</Text>
          </>
        );
      }}
    </Pressable>
  );
}

export function DockNav() {
  const { content } = useI18n();
  const { dock } = content.nav;
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const narrow = width < 640;

  const tabs: { icon: IconName; route: string; label: string }[] = [
    { icon: 'home', route: '/', label: dock.home },
    { icon: 'services', route: '/servicios', label: dock.services },
    { icon: 'about', route: '/sobre-mi', label: dock.about },
    { icon: 'projects', route: '/proyectos', label: dock.projects },
    { icon: 'blog', route: '/blog', label: dock.blog },
    { icon: 'contact', route: '/contacto', label: dock.contact },
  ];

  return (
    <View
      style={[
        { position: 'absolute', bottom: 22, zIndex: 56, flexDirection: 'row', alignItems: 'center', gap: 2, padding: 7, borderRadius: 999, backgroundColor: 'rgba(10,11,14,0.76)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
        narrow ? { left: 12, right: 12, justifyContent: 'space-between' } : null,
        (narrow ? dockWebNarrow : dockWebWide) as object,
      ]}
    >
      {tabs.map((t) => (
        <DockTab key={t.route} icon={t.icon} label={t.label} active={pathname === t.route} narrow={narrow} onPress={() => { if (pathname !== t.route) router.replace(t.route as never); }} />
      ))}
    </View>
  );
}
