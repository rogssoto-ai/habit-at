export type ThemeName = 'calm_focus' | 'deep_focus' | 'warm_clay';

export interface Theme {
  name: ThemeName;
  label: string;
  background: string;
  accent: string;
  accentSecondary: string;
  textPrimary: string;
  textSecondary: string;
  surface: string;
  notification: string;
}

export const themes: Record<ThemeName, Theme> = {
  calm_focus: {
    name: 'calm_focus',
    label: 'Calm Focus',
    background: '#F7F4EF',
    accent: '#2D6A4F',
    accentSecondary: '#52B788',
    textPrimary: '#2C2C2A',
    textSecondary: '#888780',
    surface: '#FFFFFF',
    notification: '#D4A574',
  },
  deep_focus: {
    name: 'deep_focus',
    label: 'Deep Focus',
    background: '#0F172A',
    accent: '#3B82F6',
    accentSecondary: '#10B981',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    surface: '#1E293B',
    notification: '#F59E0B',
  },
  warm_clay: {
    name: 'warm_clay',
    label: 'Warm Clay',
    background: '#FDF6F0',
    accent: '#C2541A',
    accentSecondary: '#E9C46A',
    textPrimary: '#2D1B0E',
    textSecondary: '#8B6F5E',
    surface: '#FFFFFF',
    notification: '#2D6A4F',
  },
};

// Colores del calendario — fijos, no cambian con el tema
export const calendarColors = {
  zero: '#EF4444',
  low: '#F97316',
  mid: '#EAB308',
  high: '#84CC16',
  full: '#16A34A',
  none: '#D1D5DB',
};
