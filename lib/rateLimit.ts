/**
 * Simple in-memory rate limiter for API routes.
 * Tracks requests per IP within a sliding window.
 *
 * Note: This works per serverless instance. For distributed
 * rate limiting across multiple instances, use Upstash Redis
 * or similar. This is a solid baseline for Netlify/Vercel deploys.
 */

const requests = new Map<string, { count: number; resetAt: number }>();

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requests) {
    if (now > value.resetAt) {
      requests.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function rateLimit({
  ip,
  limit = 5,
  windowMs = 60 * 1000,
}: {
  ip: string;
  limit?: number;
  windowMs?: number;
}): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = requests.get(ip);

  if (!entry || now > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}
