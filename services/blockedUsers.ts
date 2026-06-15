export interface BlockedUserEntry {
  userId: string;
  name: string;
  avatarUrl?: string;
  blockedAt: string;
}

const storageKey = (currentUserId: string) => `tm_blocked_${currentUserId}`;

export const CHATS_STORAGE_MUTATED_EVENT = 'studymatch:chats-storage-mutated';
export const BLOCKLIST_CHANGED_EVENT = 'studymatch:blocklist-changed';

export function readBlockedUsers(currentUserId: string): BlockedUserEntry[] {
  try {
    const raw = localStorage.getItem(storageKey(currentUserId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BlockedUserEntry[];
    return Array.isArray(parsed) ? parsed.filter((e) => e?.userId) : [];
  } catch {
    return [];
  }
}

export function isUserBlocked(currentUserId: string, otherUserId: string): boolean {
  return readBlockedUsers(currentUserId).some((e) => e.userId === otherUserId);
}

export function addBlockedUser(
  currentUserId: string,
  partial: Pick<BlockedUserEntry, 'userId' | 'name'> & { avatarUrl?: string }
): BlockedUserEntry[] {
  const prev = readBlockedUsers(currentUserId);
  const next: BlockedUserEntry[] = [
    {
      userId: partial.userId,
      name: partial.name,
      avatarUrl: partial.avatarUrl,
      blockedAt: new Date().toISOString(),
    },
    ...prev.filter((e) => e.userId !== partial.userId),
  ];
  localStorage.setItem(storageKey(currentUserId), JSON.stringify(next));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BLOCKLIST_CHANGED_EVENT));
  }
  return next;
}

export function removeBlockedUser(currentUserId: string, userId: string): BlockedUserEntry[] {
  const next = readBlockedUsers(currentUserId).filter((e) => e.userId !== userId);
  localStorage.setItem(storageKey(currentUserId), JSON.stringify(next));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BLOCKLIST_CHANGED_EVENT));
  }
  return next;
}

/** Id del otro usuario en un chat 1:1 (id de hilo `direct-<id>` o id legacy). */
export function getDirectChatPeerId(chat: { id: string; isGroup?: boolean }): string | null {
  if (chat.isGroup) return null;
  if (chat.id.startsWith('direct-')) return chat.id.slice('direct-'.length);
  return chat.id;
}

export function purgeDirectChatsWithPeer(currentUserId: string, peerUserId: string): void {
  const chatKey = `tm_chats_${currentUserId}`;
  try {
    const raw = localStorage.getItem(chatKey);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Array<{ id: string; isGroup?: boolean }>;
    if (!Array.isArray(parsed)) return;
    const next = parsed.filter((c) => {
      if (c.isGroup) return true;
      const pid = getDirectChatPeerId(c);
      return pid !== peerUserId;
    });
    localStorage.setItem(chatKey, JSON.stringify(next));
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CHATS_STORAGE_MUTATED_EVENT));
  }
}

export function notifyChatsStorageMutated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CHATS_STORAGE_MUTATED_EVENT));
  }
}
