import { cookies } from "next/headers";

export interface SessionData {
  userId: string;
  role: string; // "CLIENT" | "VENDOR" | "ADMIN" | "BA"
  name: string;
  phone: string;
}

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
  try {
    const decoded = Buffer.from(raw, "base64").toString("utf-8");
    const data = JSON.parse(decoded) as SessionData;
    // Validasi field wajib ada
    if (!data.userId || !data.role || !data.name || !data.phone) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Menyimpan session ke cookie httpOnly.
 * Dipanggil dari Server Action setelah login sukses.
 */
export async function setSessionCookie(data: SessionData): Promise<void> {
  const cookieStore = await cookies();
  const encoded = Buffer.from(JSON.stringify(data)).toString("base64");
  cookieStore.set(COOKIE_NAME, encoded, {
    httpOnly: true,
    sameSite: "lax",
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
