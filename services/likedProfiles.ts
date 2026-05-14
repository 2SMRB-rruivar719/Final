import { UserProfile } from '../types';

const STORAGE_KEY = 'tm_liked_profiles';
const MAX_ITEMS = 80;

const normalize = (u: UserProfile): UserProfile => ({
  ...u,
  interests: Array.isArray(u.interests) ? u.interests : [],
  travelStyle: Array.isArray(u.travelStyle) ? u.travelStyle : [],
});

export function readLikedProfiles(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UserProfile[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalize).filter((p) => p?.id && p?.name);
  } catch {
    return [];
  }
}

export function addLikedProfile(user: UserProfile): void {
  try {
    const list = readLikedProfiles();
    if (list.some((p) => p.id === user.id)) return;
    const next = [normalize(user), ...list].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / serialization issues
  }
}

export function removeLikedProfile(id: string): void {
  try {
    const list = readLikedProfiles().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}
