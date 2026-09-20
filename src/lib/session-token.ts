/**
 * HariKita - Signed Session Token
 *
 * Token format: `<base64url(JSON payload)>.<base64url(HMAC-SHA256(payload))>`
 * Memakai Web Crypto (crypto.subtle) agar jalan di Node runtime maupun Edge Runtime.
 * Modul murni string↔string — tidak mengimpor Next.js.
 */

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
function base64urlEncode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Decode base64url → string (UTF-8). Throw bila format tidak valid. */
function base64urlDecode(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** Hitung HMAC-SHA256(payload, secret) → base64url. */
async function hmacBase64url(payload: string, secret: string): Promise<string> {
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

/** Tanda tangani SessionData → token "payload.signature". Throw bila secret kosong. */
export async function signSession(data: SessionData): Promise<string> {
  const secret = getSessionSecret();
  const payload = base64urlEncode(JSON.stringify(data));
  const signature = await hmacBase64url(payload, secret);
  return `${payload}.${signature}`;
}
