import type { CSSProperties } from 'react';

/** Borde del avatar: vacío = color de marca (Tailwind travel-secondary). */
export function getProfileAvatarFrame(
  hex?: string | null
): { ringClass: string; ringStyle: CSSProperties } {
  const c = typeof hex === 'string' ? hex.trim() : '';
  if (!c) {
    return {
      ringClass: 'border-4 border-travel-secondary',
      ringStyle: {},
    };
  }
  return {
    ringClass: 'border-4 border-solid',
    ringStyle: {
      borderColor: c,
      boxShadow: `0 0 0 1px rgba(255,255,255,0.35), 0 12px 36px -12px ${c}`,
    },
  };
}
