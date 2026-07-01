import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { layout } from '@/theme/tokens';

export function Container({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <View
      style={[
        { width: '100%', maxWidth: layout.maxWidth, marginHorizontal: 'auto', paddingHorizontal: layout.gutter },
        style,
      ]}
    >
      {children}
    </View>
  );
}
