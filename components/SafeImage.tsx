import React, { useCallback, useEffect, useState } from 'react';

const uiAvatarUrl = (label: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent((label || '?').slice(0, 48))}&background=1e293b&color=f8fafc&size=512`;

const picsumUrl = (seed: string, w: number, h: number) => {
  const s = encodeURIComponent(seed).slice(0, 120);
  return `https://picsum.photos/seed/${s}/${w}/${h}`;
};

type Phase = 'primary' | 'secondary' | 'tertiary';

export type SafeImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> & {
  src: string;
  alt: string;
  /** Used for deterministic fallback (name, id, place, etc.) */
  fallbackSeed?: string;
  /** Avatars use UI-generated portrait on last fallback; photos use a second Picsum URL. */
  variant?: 'avatar' | 'photo';
};

/**
 * Remote images with graceful fallbacks (Picsum → UI Avatars) so chats and cards never stay broken.
 */
export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackSeed,
  variant = 'photo',
  className,
  loading,
  decoding,
  referrerPolicy,
  ...rest
}) => {
  const seed = fallbackSeed || alt || 'img';
  const [phase, setPhase] = useState<Phase>('primary');

  useEffect(() => {
    setPhase('primary');
  }, [src]);

  const resolvedSrc =
    phase === 'primary'
      ? src
      : phase === 'secondary'
        ? picsumUrl(seed, 800, 600)
        : variant === 'avatar'
          ? uiAvatarUrl(seed)
          : picsumUrl(`${seed}|alt`, 1200, 800);

  const handleError = useCallback(() => {
    setPhase((p) => {
      if (p === 'primary') return 'secondary';
      if (p === 'secondary') return 'tertiary';
      return 'tertiary';
    });
  }, []);

  return (
    <img
      {...rest}
      src={resolvedSrc}
      alt={alt}
      className={className}
      loading={loading ?? 'lazy'}
      decoding={decoding ?? 'async'}
      referrerPolicy={referrerPolicy ?? 'no-referrer-when-downgrade'}
      onError={handleError}
    />
  );
};
