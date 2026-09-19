"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  setSessionCookie,
  clearSessionCookie,
  getSession,
  getDashboardPath,
  getLoginPath,
  SessionData,
} from "@/lib/session";
import { attributeVendorToReferral } from "@/server/services/ambassador-service";

/**
 * Login action — verifikasi nomor HP + PIN, set session cookie.
 * FormData keys: "phone", "pin", "callbackUrl" (opsional), "allowedRoles" (opsional, CSV)
 *
 * `allowedRoles` membatasi portal login mana yang boleh masuk dari halaman tertentu
 * (mis. /auth/login hanya CLIENT+VENDOR, /auth/login/ba hanya BA, dst). Bila kosong,
 * semua role diizinkan (kompatibilitas mundur).
 */
export async function loginAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; redirectTo?: string }> {
  try {
    const phone = (formData.get("phone") as string)?.trim();
    const pin = (formData.get("pin") as string)?.trim();
    const callbackUrl = (formData.get("callbackUrl") as string) || null;
    const allowedRoles = (formData.get("allowedRoles") as string)
      ?.split(",")
      .map((r) => r.trim().toUpperCase())
      .filter(Boolean);

    // Validasi input dasar
    if (!phone || !pin) {
      return { success: false, error: "Nomor HP dan PIN wajib diisi." };
    }
    if (!/^\d{6}$/.test(pin)) {
      return { success: false, error: "PIN harus 6 digit angka." };
    }

    // Cari user di database berdasarkan nomor HP
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user || !user.pin) {
      return {
        success: false,
        error: "Nomor HP tidak terdaftar atau belum memiliki PIN.",
      };
    }

    // Batasi role sesuai portal login. Pesan generik agar tidak membocorkan
    // keberadaan halaman login khusus ke publik.
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return {
        success: false,
        error:
          "Akun ini tidak dapat masuk dari halaman ini. Silakan gunakan tautan login yang sesuai.",
      };
    }

    // Verifikasi PIN dengan bcrypt
    const isPinValid = await bcrypt.compare(pin, user.pin);
    if (!isPinValid) {
      return { success: false, error: "PIN salah. Silakan coba lagi." };
    }

    // Set session cookie
    const sessionData: SessionData = {
      userId: user.id,
      role: user.role,
      name: user.name,
      phone: user.phone,
    };
    await setSessionCookie(sessionData);

    // Tentukan redirect destination
    const defaultDashboard = getDashboardPath(user.role);
    const redirectTo =
      callbackUrl && callbackUrl.startsWith("/")
        ? callbackUrl
        : defaultDashboard;

    return { success: true, redirectTo };
  } catch (error) {
    console.error("[loginAction] Database/auth error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("Connection closed") || msg.includes("Can't reach database") || msg.includes("timeout")) {
      return {
        success: false,
        error: "Koneksi database sedang bangun dari standby atau terputus. Silakan coba lagi sebentar.",
      };
    }
    return {
      success: false,
      error: "Terjadi gangguan sistem saat memproses login. Silakan refresh dan coba lagi.",
    };
  }
}

/**
 * Logout action — hapus session cookie lalu redirect ke halaman login
 * sesuai peran user (CLIENT/VENDOR → /auth/login, BA → /auth/login/ba,
 * ADMIN → /auth/login/admin).
 */
export async function logoutAction(): Promise<void> {
  const session = await getSession();
  const target = session ? getLoginPath(session.role) : "/auth/login";
  await clearSessionCookie();
  redirect(target);
}

/**
 * Register action untuk Calon Pengantin (CLIENT).
 * FormData keys: "name", "phone", "pin"
 */
export async function registerClientAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const name = (formData.get("name") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();
    const pin = (formData.get("pin") as string)?.trim();

    if (!name || !phone || !pin) {
      return { success: false, error: "Nama, nomor HP, dan PIN wajib diisi." };
    }
    if (!/^\d{6}$/.test(pin)) {
      return { success: false, error: "PIN harus 6 digit angka." };
    }

    // Cek apakah nomor HP sudah terdaftar
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return {
        success: false,
        error: "Nomor HP sudah terdaftar. Silakan login.",
      };
    }

    const hashedPin = await bcrypt.hash(pin, 10);
    const newUser = await prisma.user.create({
      data: { name, phone, pin: hashedPin, role: "CLIENT" },
    });

    // Auto-login setelah register
    await setSessionCookie({
      userId: newUser.id,
      role: newUser.role,
      name: newUser.name,
      phone: newUser.phone,
    });

    return { success: true };
  } catch (error) {
    console.error("[registerClientAction] Error:", error);
    return {
      success: false,
      error: "Gagal memproses pendaftaran. Silakan periksa koneksi dan coba lagi.",
    };
  }
}

/**
 * Register action untuk Mitra Vendor (VENDOR).
 * FormData keys: "name", "phone", "pin", "businessName", "category", "address"
 */
export async function registerVendorAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const name = (formData.get("name") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();
    const pin = (formData.get("pin") as string)?.trim();
    const businessName = (formData.get("businessName") as string)?.trim();
    const category = (formData.get("category") as string)?.trim();
    const address = (formData.get("address") as string)?.trim();
    const referralCode = (formData.get("referralCode") as string)?.trim() || null;

    if (!name || !phone || !pin || !businessName || !category || !address) {
      return { success: false, error: "Semua field wajib diisi." };
    }
    if (!/^\d{6}$/.test(pin)) {
      return { success: false, error: "PIN harus 6 digit angka." };
    }

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return {
        success: false,
        error: "Nomor HP sudah terdaftar. Silakan login.",
      };
    }

    const hashedPin = await bcrypt.hash(pin, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        phone,
        pin: hashedPin,
        role: "VENDOR",
        vendorProfile: {
          create: {
            businessName,
            category,
            address,
            city: "Kebumen",
          },
        },
      },
    });

    // Atribusi referral BA (opsional, aman bila kode invalid).
    const createdVendor = await prisma.vendorProfile.findUnique({ where: { userId: newUser.id } });
    if (createdVendor && referralCode) {
      await attributeVendorToReferral(createdVendor.id, referralCode);
    }

    // Auto-login setelah register
    await setSessionCookie({
      userId: newUser.id,
      role: newUser.role,
      name: newUser.name,
      phone: newUser.phone,
    });

    return { success: true };
  } catch (error) {
    console.error("[registerVendorAction] Error:", error);
    return {
      success: false,
      error: "Gagal mendaftarkan vendor. Silakan periksa koneksi dan coba lagi.",
    };
  }
}
