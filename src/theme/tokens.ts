export const fonts = {
  display: 'SpaceGrotesk_600SemiBold',
  displayBold: 'SpaceGrotesk_700Bold',
  body: 'IBMPlexSans_400Regular',
  bodyMedium: 'IBMPlexSans_500Medium',
  mono: 'JetBrainsMono_400Regular',
} as const;

export const colors = {
  accent: '#e4e357',
  background: '#0a0b0e',
  surface: 'rgba(255,255,255,0.024)',
  surfaceStrong: 'rgba(255,255,255,0.05)',
  surfaceCell: '#0d0f13',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.12)',
  onAccent: '#07120e',
  text: '#f4f5f7',
  textMuted: 'rgb(183,188,197)',
  textDim: 'rgb(154,160,170)',
  textFainter: 'rgb(139,144,154)',
  textFaint: 'rgb(107,114,128)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  xxl: 72,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export const layout = {
  maxWidth: 1180,
  gutter: 40,
} as const;

export const theme = { fonts, colors, spacing, radii, layout } as const;
export type Theme = typeof theme;
