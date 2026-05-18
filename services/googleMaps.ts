/** Full search query for Maps (location + destination). */
export function buildPlaceQuery(location: string, destination: string): string {
  const loc = location.trim();
  const dest = destination.trim();
  if (!dest) return loc;
  if (!loc) return dest;
  if (loc.toLowerCase().includes(dest.toLowerCase())) return loc;
  return `${loc}, ${dest}`;
}

/** Opens Google Maps (app or web) for the place. */
export function getGoogleMapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Embedded map preview (no API key required). */
export function getGoogleMapsEmbedUrl(query: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&hl=es&output=embed`;
}

/** Static map image when VITE_GOOGLE_MAPS_API_KEY is set. */
export function getGoogleStaticMapUrl(
  query: string,
  width: number,
  height: number
): string | null {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  if (!key?.trim()) return null;
  const q = encodeURIComponent(query);
  return (
    `https://maps.googleapis.com/maps/api/staticmap` +
    `?center=${q}&zoom=15&size=${width}x${height}&scale=2` +
    `&maptype=roadmap&markers=color:0x2563eb%7C${q}&key=${encodeURIComponent(key.trim())}`
  );
}
