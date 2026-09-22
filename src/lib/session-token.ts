/**
 * HariKita - Signed Session Token
 *
 * Token format: `v1.<base64url(JSON payload)>.<base64url(HMAC-SHA256(payload))>`
 * Prefix versi `v1.` mengunci format pra-rilis sehingga rotasi secret/algorithm
 * di masa depan bersifat eksplisit (token tanpa prefix ini ditolak).
 * Memakai Web Crypto (crypto.subtle) agar jalan di Node runtime maupun Edge Runtime.
 * Modul murni string↔string — tidak mengimpor Next.js.
 */

/** Prefix versi format token. Token tanpa prefix ini ditolak (fail-closed). */
const TOKEN_VERSION = "v1";

/** Role yang diizinkan. Role di luar daftar ini → verifikasi gagal (fail-closed). */
const ALLOWED_ROLES = ["CLIENT", "VENDOR", "ADMIN", "BA"] as const;

export interface SessionData {
  userId: string;
  role: string;
  name: string;
  phone: string;
}

/** Ambil secret sesi. Fail-closed: throw bila kosong. */
export function getSessionSecret(): string {
  const secret = process.env.HARIKITA_SESSION_SECRET;
  if (!secret || secret.trim() === "") {
    throw new Error(
      "HARIKITA_SESSION_SECRET tidak di-set. Cookie sesi tidak dapat ditandatangani."
    );
  }
  return secret;
}

/** Encode string → base64url (UTF-8 aman, tanpa padding). */
export function base64urlEncode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Decode base64url → string (UTF-8). Throw bila format tidak valid. */
export function base64urlDecode(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** Hitung HMAC-SHA256(payload, secret) → base64url. */
export async function hmacBase64url(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const bytes = new Uint8Array(sig);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Tanda tangani SessionData → token "v1.payload.signature". Throw bila secret kosong. */
export async function signSession(data: SessionData): Promise<string> {
  const secret = getSessionSecret();
  const payload = base64urlEncode(JSON.stringify(data));
  const signature = await hmacBase64url(payload, secret);
  return `${TOKEN_VERSION}.${payload}.${signature}`;
}

/** Perbandingan string constant-time (panjang boleh bocor, isi tidak). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Verifikasi token → SessionData, atau null bila invalid.
 * Tidak pernah throw.
 */
export async function verifySession(token: string): Promise<SessionData | null> {
  try {
    if (!token || typeof token !== "string") return null;
    const versionPrefix = `${TOKEN_VERSION}.`;
    if (!token.startsWith(versionPrefix)) return null;
    const parts = token.slice(versionPrefix.length).split(".");
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    if (!payload || !signature) return null;

    const expected = await hmacBase64url(payload, getSessionSecret());
    if (!safeEqual(signature, expected)) return null;

    const json = base64urlDecode(payload);
    const data = JSON.parse(json) as Partial<SessionData>;
    if (
      typeof data.userId !== "string" ||
      typeof data.role !== "string" ||
      typeof data.name !== "string" ||
      typeof data.phone !== "string"
    ) {
      return null;
    }
    if (!ALLOWED_ROLES.includes(data.role as (typeof ALLOWED_ROLES)[number])) {
      return null;
    }
    return {
      userId: data.userId,
      role: data.role,
      name: data.name,
      phone: data.phone,
    };
  } catch {
    return null;
  }
}
