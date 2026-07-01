import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { layout } from '@/theme/tokens';

export function Container({ children, style, nativeID }: { children: ReactNode; style?: ViewStyle; nativeID?: string }) {
  return (
    <View
      nativeID={nativeID}
      style={[
        { width: '100%', maxWidth: layout.maxWidth, marginHorizontal: 'auto', paddingHorizontal: layout.gutter },
        style,
      ]}
    >
      {children}
    </View>
  );
}
