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
  setOtpCookie,
  readOtpCookie,
  clearOtpCookie,
  SessionData,
} from "@/lib/session";
import { attributeVendorToReferral } from "@/server/services/ambassador-service";
import { runAction, type ActionResult } from "./_shared";
import { DomainError } from "@/server/services/errors";
import {
  issueOtp,
  verifyOtp,
  assertPinChangeAllowed,
  type OtpPurpose,
} from "@/server/services/otp-service";
import { sendOtpEmail, sendPinChangedEmail } from "@/server/services/email-service";

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^08\d{8,12}$/;

/**
 * Mengirim OTP ke email. Untuk REGISTER, memastikan email & HP belum terpakai.
 * Untuk RESET_PIN, email harus terdaftar (pesan generik bila tidak).
 */
export async function sendOtpAction(input: {
  name?: string;
  phone?: string;
  email: string;
  purpose: OtpPurpose;
  role?: string;
}): Promise<ActionResult<{ devCode?: string }>> {
  return runAction(async () => {
    const email = input.email?.trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email)) {
      throw new DomainError("INVALID_EMAIL", "Format email tidak valid.");
    }

    if (input.purpose === "REGISTER") {
      const name = input.name?.trim();
      const phone = input.phone?.trim();
      if (!name) throw new DomainError("INVALID_PHONE", "Nama lengkap wajib diisi.");
      if (!phone || !PHONE_RE.test(phone)) {
        throw new DomainError("INVALID_PHONE", "Nomor HP tidak valid (contoh: 081234567890).");
      }
      const byPhone = await prisma.user.findUnique({ where: { phone } });
      if (byPhone) throw new DomainError("PHONE_ALREADY_USED", "Nomor HP sudah terdaftar.");
      const byEmail = await prisma.user.findUnique({ where: { email } });
      if (byEmail) throw new DomainError("EMAIL_ALREADY_USED", "Email sudah terdaftar.");
    } else {
      const user = await prisma.user.findUnique({ where: { email } });
      // Pesan generik agar tidak membocorkan status email.
      if (!user) {
        throw new DomainError("INVALID_EMAIL", "Jika email terdaftar, kode akan dikirim.");
      }
    }

    const { code } = await issueOtp(email, input.purpose);
    const result = await sendOtpEmail(email, code, input.purpose);
    if (!result.sent && !result.devMode) {
      throw new DomainError("EMAIL_SEND_FAILED", "Gagal mengirim email. Coba lagi.");
    }
    return result.devCode ? { devCode: result.devCode } : {};
  });
}

/** Memverifikasi kode OTP; menyimpan otpId di cookie bila valid. */
export async function verifyOtpAction(input: {
  email: string;
  purpose: OtpPurpose;
  code: string;
}): Promise<ActionResult<{ verified: true }>> {
  return runAction(async () => {
    const email = input.email?.trim().toLowerCase();
    const { otpId } = await verifyOtp({ email, purpose: input.purpose, code: input.code?.trim() });
    await setOtpCookie(otpId);
    return { verified: true as const };
  });
}

/** Menyelesaikan registrasi (butuh OTP VERIFIED via cookie). */
export async function completeRegistrationAction(input: {
  name: string;
  phone: string;
  email: string;
  pin: string;
  role: string;
  referralCode?: string;
}): Promise<ActionResult<{ redirectTo: string }>> {
  return runAction(async () => {
    const email = input.email?.trim().toLowerCase();
    const name = input.name?.trim();
    const phone = input.phone?.trim();
    const pin = input.pin?.trim();

    const otpId = await readOtpCookie();
    if (!otpId) throw new DomainError("OTP_NOT_FOUND", "Verifikasi OTP belum selesai.");
    const otp = await prisma.otpCode.findUnique({ where: { id: otpId } });
    if (!otp || otp.status !== "VERIFIED" || otp.email !== email || otp.purpose !== "REGISTER") {
      throw new DomainError("OTP_NOT_FOUND", "Verifikasi OTP tidak valid. Ulangi.");
    }
    if (!name || !phone || !PHONE_RE.test(phone)) {
      throw new DomainError("INVALID_PHONE", "Data identitas tidak valid.");
    }
    if (!/^\d{6}$/.test(pin)) throw new DomainError("PIN_TOO_RECENT", "PIN harus 6 digit.");

    const role = ["CLIENT", "VENDOR"].includes(input.role) ? input.role : "CLIENT";
    const hashedPin = await bcrypt.hash(pin, 10);

    const newUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name,
          phone,
          email,
          pin: hashedPin,
          role,
          ...(role === "VENDOR"
            ? {
                vendorProfile: {
                  create: { businessName: name, category: "katering", address: "-", city: "Kebumen" },
                },
              }
            : {}),
        },
      });
      await tx.pinChangeLog.create({ data: { userId: u.id } });
      await tx.otpCode.update({ where: { id: otpId }, data: { status: "CONSUMED" } });
      return u;
    });

    if (role === "VENDOR" && input.referralCode) {
      const vp = await prisma.vendorProfile.findUnique({ where: { userId: newUser.id } });
      if (vp) await attributeVendorToReferral(vp.id, input.referralCode);
    }

    await clearOtpCookie();
    await setSessionCookie({
      userId: newUser.id,
      role: newUser.role,
      name: newUser.name,
      phone: newUser.phone,
    });
    return { redirectTo: getDashboardPath(newUser.role) };
  });
}

/** Kirim OTP untuk reset PIN. */
export async function sendResetOtpAction(
  email: string
): Promise<ActionResult<{ devCode?: string }>> {
  return sendOtpAction({ email, purpose: "RESET_PIN" });
}

/** Set PIN baru setelah OTP VERIFIED (reset). */
export async function resetPinAction(input: {
  email: string;
  pin: string;
}): Promise<ActionResult<{ ok: true }>> {
  return runAction(async () => {
    const email = input.email?.trim().toLowerCase();
    const pin = input.pin?.trim();
    const otpId = await readOtpCookie();
    if (!otpId) throw new DomainError("OTP_NOT_FOUND", "Verifikasi OTP belum selesai.");
    const otp = await prisma.otpCode.findUnique({ where: { id: otpId } });
    if (!otp || otp.status !== "VERIFIED" || otp.email !== email || otp.purpose !== "RESET_PIN") {
      throw new DomainError("OTP_NOT_FOUND", "Verifikasi OTP tidak valid. Ulangi.");
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new DomainError("OTP_NOT_FOUND", "Akun tidak ditemukan.");
    await assertPinChangeAllowed(user.id);
    if (!/^\d{6}$/.test(pin)) throw new DomainError("PIN_TOO_RECENT", "PIN harus 6 digit.");

    const hashedPin = await bcrypt.hash(pin, 10);
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { pin: hashedPin } });
      await tx.pinChangeLog.create({ data: { userId: user.id } });
      await tx.otpCode.update({ where: { id: otpId }, data: { status: "CONSUMED" } });
    });
    await clearOtpCookie();
    await sendPinChangedEmail(email, user.name);
    return { ok: true as const };
  });
}
