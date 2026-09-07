const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const MAX_CLIENTS = 10_000;

/** Per-instance replay protection; the durable saved-application quota remains separate. */
export function createApplicationRequestLimiter() {
  const clients = new Map<string, { startedAt: number; count: number }>();
  return (key: string, now = Date.now()): boolean => {
    const existing = clients.get(key);
    if (existing && now - existing.startedAt < WINDOW_MS) {
      existing.count += 1;
      return existing.count > MAX_REQUESTS;
    }
    if (clients.size >= MAX_CLIENTS) {
      for (const [id, entry] of clients) if (now - entry.startedAt >= WINDOW_MS) clients.delete(id);
      if (clients.size >= MAX_CLIENTS) return true;
    }
    clients.set(key, { startedAt: now, count: 1 });
    return false;
  };
}
