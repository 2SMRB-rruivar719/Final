import type { ThemeMode } from '../types';

export type ProfileCoverId =
  | 'default'
  | 'sunrise'
  | 'ocean'
  | 'forest'
  | 'city'
  | 'aurora'
  | 'desert';

export const PROFILE_COVER_OPTIONS: { id: ProfileCoverId; labelEs: string; labelEn: string }[] = [
  { id: 'default', labelEs: 'Clásico', labelEn: 'Classic' },
  { id: 'sunrise', labelEs: 'Amanecer', labelEn: 'Sunrise' },
  { id: 'ocean', labelEs: 'Océano', labelEn: 'Ocean' },
  { id: 'forest', labelEs: 'Bosque', labelEn: 'Forest' },
  { id: 'city', labelEs: 'Ciudad', labelEn: 'City' },
  { id: 'aurora', labelEs: 'Aurora', labelEn: 'Aurora' },
  { id: 'desert', labelEs: 'Desierto', labelEn: 'Desert' },
];

/** Clases Tailwind para el bloque superior del perfil (degradado suave). */
export function profileCoverSectionClass(coverId: string | undefined, theme: ThemeMode): string {
  const id = (coverId || 'default') as ProfileCoverId;
  const isDark = theme === 'dark';
  const presets: Record<ProfileCoverId, { light: string; dark: string }> = {
    default: {
      light: 'bg-gradient-to-b from-travel-secondary/35 via-white to-transparent',
      dark: 'bg-gradient-to-b from-slate-800 via-slate-900/95 to-transparent',
    },
    sunrise: {
      light: 'bg-gradient-to-br from-amber-200/70 via-orange-100/50 to-rose-50/30',
      dark: 'bg-gradient-to-br from-orange-900/50 via-amber-950/40 to-slate-900',
    },
    ocean: {
      light: 'bg-gradient-to-br from-sky-200/60 via-cyan-50/50 to-blue-50/20',
      dark: 'bg-gradient-to-br from-cyan-900/35 via-sky-950/30 to-slate-900',
    },
    forest: {
      light: 'bg-gradient-to-br from-emerald-200/55 via-green-50/40 to-teal-50/20',
      dark: 'bg-gradient-to-br from-emerald-900/35 via-green-950/25 to-slate-900',
    },
    city: {
      light: 'bg-gradient-to-br from-violet-200/50 via-slate-100/60 to-fuchsia-50/25',
      dark: 'bg-gradient-to-br from-violet-900/40 via-slate-900 to-fuchsia-950/20',
    },
    aurora: {
      light: 'bg-gradient-to-br from-fuchsia-200/50 via-cyan-100/40 to-indigo-50/25',
      dark: 'bg-gradient-to-br from-fuchsia-900/30 via-cyan-900/25 to-slate-900',
    },
    desert: {
      light: 'bg-gradient-to-br from-amber-100/70 via-orange-50/50 to-stone-100/30',
      dark: 'bg-gradient-to-br from-amber-950/40 via-orange-950/30 to-slate-900',
    },
  };
  const pair = presets[id] || presets.default;
  return isDark ? pair.dark : pair.light;
}
