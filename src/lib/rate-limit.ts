/**
 * HariKita - Lightweight Rate Limiter (process-local)
 *
 * Perlindungan dasar terhadap abuse pada endpoint publik sensitif
 * (webhook, cron, auth). Berbasis sliding-window di memori proses.
 *
 * CATATAN PENTING (jujur):
 *  - Ini adalah limiter PROCESS-LOCAL, BUKAN distributed. Pada deployment
 *    multi-instance (serverless), tiap instance memiliki hitungan sendiri.
 *  - Untuk produksi skala penuh, ganti dengan Redis/Upstash (`SET NX PX`).
 *  - Cukup sebagai lapisan pertama anti-spam pada pilot single-instance.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Membersihkan bucket kedaluwarsa secara periodik (mencegah memory leak). */
let lastSweep = 0;
function sweep(now: number): void {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitOptions {
  /** Kunci unik (mis. `webhook:<ip>`). */
  key: string;
  /** Jumlah maksimum permintaan dalam jendela. */
  limit: number;
  /** Panjang jendela (ms). */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/** Memeriksa & menaikkan hitungan permintaan untuk sebuah kunci. */
export function checkRateLimit({ key, limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

/** Mengekstrak IP klien dari header proxy umum (Vercel/Cloudflare). */
export function clientIpFromHeaders(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Reset seluruh bucket (untuk pengujian). */
export function resetRateLimits(): void {
  buckets.clear();
  lastSweep = 0;
}
