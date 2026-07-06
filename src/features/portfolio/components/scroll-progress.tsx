import { Platform, View } from 'react-native';
import { colors } from '@/theme/tokens';

// v2 design [data-progress]: 3px accent bar fixed to the top with a soft glow.
const barWeb = Platform.OS === 'web'
  ? ({ position: 'fixed', boxShadow: '0 0 12px rgba(228,227,87,0.6)', transitionProperty: 'width', transitionDuration: '100ms' } as object)
  : null;

export function ScrollProgress({ progress }: { progress: number }) {
  return (
    <View
      style={[
        { position: 'absolute', top: 0, left: 0, height: 3, zIndex: 60, backgroundColor: colors.accent, width: `${Math.round(progress * 1000) / 10}%` },
        barWeb as object,
      ]}
    />
  );
}
