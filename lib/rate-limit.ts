// Simple in-memory rate limiter
// For production at scale, swap for Vercel KV or Upstash Redis

const hits = new Map<string, { count: number; resetAt: number }>();
let lastCleanup = Date.now();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 3;      // 3 marks per minute per IP

export function rateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();

  // Clean stale entries periodically
  if (now - lastCleanup > 5 * 60 * 1000) {
    for (const [key, entry] of hits.entries()) {
      if (now > entry.resetAt) hits.delete(key);
    }
    lastCleanup = now;
  }

  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count };
}