import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * HariKita Auth Middleware — Route Guard
 *
 * Membaca cookie `hk_session` dan memproteksi portal berdasarkan role.
 * Berjalan di Edge Runtime — tidak bisa menggunakan `cookies()` dari next/headers.
 * Cookie dibaca langsung dari request.cookies.
 */

const COOKIE_NAME = "hk_session";

interface SessionPayload {
  userId: string;
  role: string; // "CLIENT" | "VENDOR" | "ADMIN" | "BA"
  name: string;
  phone: string;
}

function parseSession(cookieValue: string | undefined): SessionPayload | null {
  if (!cookieValue) return null;
  try {
    const decoded = Buffer.from(cookieValue, "base64").toString("utf-8");
    const data = JSON.parse(decoded) as SessionPayload;
    if (!data.userId || !data.role) return null;
    return data;
  } catch {
    return null;
  }
}

function getDashboardPath(role: string): string {
  if (role === "ADMIN") return "/admin";
  if (role === "VENDOR") return "/dashboard/vendor/profil";
  if (role === "BA") return "/dashboard/ba";
  return "/client/profil";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawCookie = request.cookies.get(COOKIE_NAME)?.value;
  const session = parseSession(rawCookie);

  // ── 0. Alias redirects: /dashboard/vendor/profile → /dashboard/vendor/profil & /client/profile → /client/profil ──
  if (pathname === "/dashboard/vendor/profile") {
    return NextResponse.redirect(new URL("/dashboard/vendor/profil", request.url));
  }
  if (pathname === "/client/profile") {
    return NextResponse.redirect(new URL("/client/profil", request.url));
  }

  // ── 1. Jika sudah login dan mencoba akses /auth/* → redirect ke dashboard ──
  if (pathname.startsWith("/auth/")) {
    if (session) {
      return NextResponse.redirect(
        new URL(getDashboardPath(session.role), request.url)
      );
    }
    return NextResponse.next();
  }

  // ── 2. Proteksi /admin/* → hanya ADMIN ──
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const url = new URL("/auth/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(
        new URL(getDashboardPath(session.role), request.url)
      );
    }
    return NextResponse.next();
  }

  // ── 3. Proteksi /dashboard/vendor/* → hanya VENDOR atau ADMIN ──
  //    Seluruh dashboard mitra vendor kini berada di /dashboard/vendor/*.
  //    Ruang publik /vendor, /vendor/kategori/*, dan /vendor/[slug] bebas diakses.
  if (pathname === "/dashboard/vendor" || pathname.startsWith("/dashboard/vendor/")) {
    if (!session) {
      const url = new URL("/auth/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (session.role !== "VENDOR" && session.role !== "ADMIN") {
      return NextResponse.redirect(
        new URL(getDashboardPath(session.role), request.url)
      );
    }
    return NextResponse.next();
  }

  // ── 4. Proteksi /dashboard/ba/* → hanya BA atau ADMIN ──
  //    Portal Brand Ambassador: dashboard, vendor, komisi, dan dompet BA.
  if (pathname === "/dashboard/ba" || pathname.startsWith("/dashboard/ba/")) {
    if (!session) {
      const url = new URL("/auth/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (session.role !== "BA" && session.role !== "ADMIN") {
      return NextResponse.redirect(
        new URL(getDashboardPath(session.role), request.url)
      );
    }
    return NextResponse.next();
  }

  // ── 5. Proteksi /client/* → hanya CLIENT atau ADMIN ──
  if (pathname.startsWith("/client")) {
    if (!session) {
      const url = new URL("/auth/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (session.role !== "CLIENT" && session.role !== "ADMIN") {
      return NextResponse.redirect(
        new URL(getDashboardPath(session.role), request.url)
      );
    }
    return NextResponse.next();
  }

  // ── 6. Semua route publik lainnya → lanjut tanpa cek ──
  return NextResponse.next();
}

export const config = {
  /**
   * Matcher: jalankan middleware untuk semua path
   * KECUALI file statis & Next.js internal assets.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons/|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.webp$).*)",
  ],
};
