/**
 * Penanda "mode edit terbuka" untuk Platform Settings setelah verifikasi OTP.
 * Token HMAC bertanda tangan (memakai HARIKITA_SESSION_SECRET), disimpan di
 * cookie httpOnly. Verifikasi tidak pernah throw.
 */
import { cookies } from "next/headers";
import {
  hmacBase64url,
  base64urlEncode,
  base64urlDecode,
  getSessionSecret,
} from "@/lib/session-token";

export const UNLOCK_TTL_MINUTES = 10;
export const UNLOCK_COOKIE = "hk_admin_unlock";

interface UnlockPayload {
  adminId: string;
  exp: number; // epoch ms
}

export async function signUnlockToken(
  adminId: string,
  now: Date = new Date()
): Promise<string> {
  const payload: UnlockPayload = {
    adminId,
    exp: now.getTime() + UNLOCK_TTL_MINUTES * 60 * 1000,
  };
  const body = base64urlEncode(JSON.stringify(payload));
  const sig = await hmacBase64url(body, getSessionSecret());
  return `u1.${body}.${sig}`;
}

export async function verifyUnlockToken(
  token: string | undefined
): Promise<{ adminId: string } | null> {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || parts[0] !== "u1") return null;
    const [, body, sig] = parts;
    const expected = await hmacBase64url(body, getSessionSecret());
    if (expected !== sig) return null;
    const payload = JSON.parse(base64urlDecode(body)) as UnlockPayload;
    if (typeof payload.adminId !== "string" || typeof payload.exp !== "number") return null;
    if (Date.now() > payload.exp) return null;
    return { adminId: payload.adminId };
  } catch {
    return null;
  }
}

export async function setAdminUnlockCookie(adminId: string): Promise<void> {
  const token = await signUnlockToken(adminId);
  const store = await cookies();
  store.set(UNLOCK_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: UNLOCK_TTL_MINUTES * 60,
  });
}

export async function clearAdminUnlockCookie(): Promise<void> {
  const store = await cookies();
  store.delete(UNLOCK_COOKIE);
}

export async function isAdminEditUnlocked(adminId: string): Promise<boolean> {
  const store = await cookies();
  const token = store.get(UNLOCK_COOKIE)?.value;
  const res = await verifyUnlockToken(token);
  return res?.adminId === adminId;
}
