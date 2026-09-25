import { cookies } from "next/headers";
import { signSession, verifySession, type SessionData } from "./session-token";
export type { SessionData };

const COOKIE_NAME = "hk_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari dalam detik

/**
 * Membaca dan memparsing session cookie.
 * Return null jika cookie tidak ada atau format tidak valid.
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return verifySession(raw);
}

/**
 * Menyimpan session ke cookie httpOnly.
 * Dipanggil dari Server Action setelah login sukses.
 */
export async function setSessionCookie(data: SessionData): Promise<void> {
  const cookieStore = await cookies();
  const token = await signSession(data);
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

/**
 * Menghapus session cookie. Dipanggil saat logout.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Helper: dapatkan redirect path berdasarkan role.
 */
export function getDashboardPath(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "VENDOR":
      return "/dashboard/vendor/profil";
    case "BA":
      return "/dashboard/ba";
    case "CLIENT":
    default:
      return "/client/profil";
  }
}

/**
 * Helper: dapatkan halaman login sesuai role.
 *  - CLIENT / VENDOR → /auth/login (portal publik klien & mitra)
 *  - BA              → /auth/login/ba (portal Brand Ambassador, tidak ditautkan publik)
 *  - ADMIN           → /auth/login/admin (portal Super Admin, tidak ditautkan publik)
 */
export function getLoginPath(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/auth/login/admin";
    case "BA":
      return "/auth/login/ba";
    case "CLIENT":
    case "VENDOR":
    default:
      return "/auth/login";
  }
}

const OTP_COOKIE_NAME = "hk_otp";
const OTP_COOKIE_MAX_AGE = 60 * 10; // 10 menit

/** Menyimpan id OTP terverifikasi sementara (anti-bypass). */
export async function setOtpCookie(otpId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(OTP_COOKIE_NAME, otpId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: OTP_COOKIE_MAX_AGE,
  });
}

/** Membaca id OTP dari cookie (atau null). */
export async function readOtpCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(OTP_COOKIE_NAME)?.value ?? null;
}

/** Menghapus cookie OTP. */
export async function clearOtpCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(OTP_COOKIE_NAME);
}
