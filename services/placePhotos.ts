import { buildPlaceQuery, getGoogleStaticMapUrl } from './googleMaps';

/**
 * Stable travel/place photos via Unsplash CDN (no deprecated source.unsplash.com).
 * Picks deterministically from pools so the same key maps to the same image.
 * Uses Google Static Maps when VITE_GOOGLE_MAPS_API_KEY is configured.
 */

const PLACE_BANNERS = [
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1531572753322-ad063086cc14?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1493246507139-2e8f077bbaed?auto=format&fit=crop&w=1200&q=80',
];

const PLACE_CARDS = [
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518546305927-5a555bb6060d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518544889281-84399776433a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1505761671935-60b3a742bccd?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1499678329028-101765496a0a?auto=format&fit=crop&w=800&q=80',
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
