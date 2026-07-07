declare module 'react-native-web' {
  import type { ReactElement, ReactNode } from 'react';
  export function unstable_createElement(
    type: string,
    props?: Record<string, unknown>,
    ...children: ReactNode[]
  ): ReactElement;
}
