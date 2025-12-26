export const colors = {
  // Keep these aligned with `website/src/app/globals.css`.
  bg: '#070B16',
  surface: 'rgba(15, 23, 42, 0.72)',
  surfaceMuted: 'rgba(15, 23, 42, 0.46)',
  surfaceElevated: '#0B1220',
  text: '#F8FAFC',
  muted: 'rgba(226, 232, 240, 0.70)',
  textMuted: 'rgba(226, 232, 240, 0.70)',
  border: 'rgba(148, 163, 184, 0.16)',
  accent: '#22D3EE',
  accentAlt: '#3B82F6',
  accentSoft: 'rgba(34, 211, 238, 0.12)',
  success: '#4ADE80',
  warning: '#FACC15',
  danger: '#FB7185',

  brandNavy: '#1E3A8A',
  brandTeal: '#22D3EE',
  brandTealSoft: 'rgba(34, 211, 238, 0.15)',
};

export const spacing = { xs: 8, sm: 12, md: 16, lg: 24, xl: 32 };
export const radius = { md: 12, lg: 16, xl: 999 };

// Font family keys must match the names registered by `@expo-google-fonts/*`.
// Loaded in `App.tsx`.
export const fonts = {
  body: 'Inter_500Medium',
  bodyStrong: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  heading: 'Sora_800ExtraBold',
  headingStrong: 'Sora_700Bold',
} as const;

export const typography = {
  headingWeight: '800' as const,
  bodyWeight: '600' as const,
};
