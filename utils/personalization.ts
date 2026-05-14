import type { CSSProperties } from 'react';
import type { UserProfile } from '../types';

/** Color de acento global (botones, envío en chat, etc.). Vacío = marca TravelMatch. */
export const UI_ACCENT_PRESETS: { key: string; hex: string }[] = [
  { key: 'brand', hex: '' },
  { key: 'mint', hex: '#14b8a6' },
  { key: 'ocean', hex: '#0ea5e9' },
  { key: 'violet', hex: '#8b5cf6' },
  { key: 'rose', hex: '#e11d48' },
  { key: 'amber', hex: '#d97706' },
  { key: 'slate', hex: '#475569' },
];

function normalizeBubbleStyle(raw?: string | null): 'classic' | 'pill' | 'minimal' {
  return raw === 'pill' || raw === 'minimal' ? raw : 'classic';
}

/** Aplica variables y clases en `<html>` para toda la app. */
export function syncPersonalizationRoot(user: UserProfile | null): void {
  const el = document.documentElement;
  if (!user) {
    el.style.removeProperty('--tm-accent');
    el.classList.remove('tm-font-lg', 'tm-bubble-pill', 'tm-bubble-minimal');
    return;
  }
  const hex = user.uiAccentColor?.trim();
  if (hex) {
    el.style.setProperty('--tm-accent', hex);
  } else {
    el.style.removeProperty('--tm-accent');
  }
  el.classList.toggle('tm-font-lg', user.fontScale === 'large');
  el.classList.remove('tm-bubble-pill', 'tm-bubble-minimal');
  const bubble = user.chatBubbleStyle || '';
  if (bubble === 'pill') el.classList.add('tm-bubble-pill');
  else if (bubble === 'minimal') el.classList.add('tm-bubble-minimal');
}

export function buildOutgoingMessageBubble(
  bubbleStyle: string | undefined | null,
  accentHex?: string | null
): { className: string; style?: CSSProperties } {
  const acc = accentHex?.trim();
  const st = normalizeBubbleStyle(bubbleStyle);
  const radius =
    st === 'pill'
      ? 'rounded-3xl rounded-tr-md'
      : st === 'minimal'
        ? 'rounded-lg rounded-tr-sm'
        : 'rounded-2xl rounded-tr-none';
  const base = `p-3 ${radius} text-white shadow-sm`;
  if (acc) {
    return { className: base, style: { backgroundColor: acc } };
  }
  return { className: `${base} bg-travel-primary` };
}

export function buildIncomingMessageBubble(
  bubbleStyle: string | undefined | null,
  isDark: boolean
): string {
  const st = normalizeBubbleStyle(bubbleStyle);
  const radius =
    st === 'pill'
      ? 'rounded-3xl rounded-tl-md'
      : st === 'minimal'
        ? 'rounded-lg rounded-tl-sm'
        : 'rounded-2xl rounded-tl-none';
  if (isDark) {
    return `p-3 ${radius} bg-slate-800 text-gray-100 border border-slate-700 shadow-sm`;
  }
  return `p-3 ${radius} bg-white text-gray-800 border border-gray-100 shadow-sm`;
}
