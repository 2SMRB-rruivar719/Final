import { buildPlaceQuery, getGoogleStaticMapUrl } from './googleMaps';

/**
 * Stable travel/place photos via Unsplash CDN (no deprecated source.unsplash.com).
 * Picks deterministically from pools so the same key maps to the same image.
 * Uses Google Static Maps when VITE_GOOGLE_MAPS_API_KEY is configured.
 */

const PLACE_BANNERS = [
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80',
];

const PLACE_CARDS = [
  'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1491841573378-b13ab2f4b4f8?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80',
];

function stableIndex(key: string, modulo: number): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % modulo;
}

export function getPlaceBannerUrl(
  destination: string,
  day: number,
  locationHint?: string
): string {
  const query = locationHint
    ? buildPlaceQuery(locationHint, destination)
    : destination;
  const staticMap = getGoogleStaticMapUrl(query, 640, 360);
  if (staticMap) return staticMap;
  const key = `${destination}|day|${day}`;
  return PLACE_BANNERS[stableIndex(key, PLACE_BANNERS.length)];
}

export function getPlaceActivityPhotoUrl(
  destination: string,
  day: number,
  activityIndex: number,
  locationHint: string
): string {
  const query = buildPlaceQuery(locationHint, destination);
  const staticMap = getGoogleStaticMapUrl(query, 640, 280);
  if (staticMap) return staticMap;
  const key = `${destination}|d${day}|i${activityIndex}|${locationHint}`;
  return PLACE_CARDS[stableIndex(key, PLACE_CARDS.length)];
}
