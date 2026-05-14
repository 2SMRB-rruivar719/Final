import type { CSSProperties } from 'react';

export type AvatarRingStyle = 'solid' | 'double' | 'glow' | '' | undefined;

/** Borde del avatar: hex vacío = color de marca (Tailwind travel-secondary). */
export function getProfileAvatarFrame(
  hex?: string | null,
  ringStyle: AvatarRingStyle = 'solid'
): { ringClass: string; ringStyle: CSSProperties } {
  const c = typeof hex === 'string' ? hex.trim() : '';
  const mode = ringStyle === 'double' || ringStyle === 'glow' ? ringStyle : 'solid';

  const brandGlow =
    '0 0 0 1px rgba(255,255,255,0.3), 0 0 28px -4px rgba(251, 191, 36, 0.55), 0 14px 36px -12px rgba(249, 115, 22, 0.35)';
  const brandDouble = '0 0 0 3px rgba(253, 224, 71, 0.85), 0 0 0 6px rgba(15, 23, 42, 0.08)';

  if (!c) {
    if (mode === 'glow') {
      return {
        ringClass: 'border-4 border-travel-secondary',
        ringStyle: { boxShadow: brandGlow },
      };
    }
    if (mode === 'double') {
      return {
        ringClass: 'border-4 border-travel-secondary',
        ringStyle: { boxShadow: brandDouble },
      };
    }
    return {
      ringClass: 'border-4 border-travel-secondary',
      ringStyle: {},
    };
  }

  if (mode === 'glow') {
    return {
      ringClass: 'border-4 border-solid',
      ringStyle: {
        borderColor: c,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.35), 0 0 36px -4px ${c}, 0 18px 44px -14px ${c}99`,
      },
    };
  }
  if (mode === 'double') {
    return {
      ringClass: 'border-4 border-solid',
      ringStyle: {
        borderColor: c,
        boxShadow: `0 0 0 2px ${c}55, 0 0 0 5px rgba(255,255,255,0.85)`,
      },
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
