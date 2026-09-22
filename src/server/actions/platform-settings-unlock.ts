"use server";

import { requireAdminCapability } from "@/server/auth/admin-guard";
import { getPlatformSettings } from "@/server/services/platform-settings-service";
import { issueOtp, verifyOtp } from "@/server/services/otp-service";
import { sendOtpEmail } from "@/server/services/email-service";
import {
  setAdminUnlockCookie,
  clearAdminUnlockCookie,
} from "@/server/auth/admin-edit-unlock";
import { runAction, type ActionResult } from "./_shared";
import { DomainError } from "@/server/services/errors";

const OTP_PURPOSE = "ADMIN_EDIT_UNLOCK" as const;

/**
 * HariKita - Platform Settings Edit Unlock Actions
 *
 * Alur gembok edit: kirim OTP ke email Super Admin → verifikasi → cookie
 * bertanda tangan "unlocked" (TTL 10 menit) → save diizinkan sekali → terkunci lagi.
 * Hanya SUPER_ADMIN (MANAGE_PLATFORM_SETTINGS).
 */

export async function requestPlatformEditOtpAction(): Promise<
  ActionResult<{ sent: boolean; devCode?: string }>
> {
  return runAction(async () => {
    await requireAdminCapability("MANAGE_PLATFORM_SETTINGS");
    const settings = await getPlatformSettings();
    const email = settings.superAdminEmail;
    if (!email) {
      throw new DomainError(
        "INVALID_PLATFORM_SETTINGS",
        "Email Super Admin belum diatur di Pengaturan Platform."
      );
    }
    const { code } = await issueOtp(email, OTP_PURPOSE);
    const res = await sendOtpEmail(email, code, OTP_PURPOSE);
    if (res.devMode) {
      // Mode dev (tanpa provider email): kode diteruskan agar bisa diuji.
      return { sent: false, devCode: res.devCode };
    }
    if (!res.sent) {
      throw new DomainError(
        "EMAIL_SEND_FAILED",
        "Kode dibuat tetapi email gagal dikirim. Periksa konfigurasi email."
      );
    }
    return { sent: true };
  });
}

export async function verifyPlatformEditOtpAction(input: {
  code: string;
}): Promise<ActionResult<{ unlocked: boolean }>> {
  return runAction(async () => {
    const actor = await requireAdminCapability("MANAGE_PLATFORM_SETTINGS");
    const settings = await getPlatformSettings();
    const email = settings.superAdminEmail;
    if (!email) {
      throw new DomainError("INVALID_PLATFORM_SETTINGS", "Email Super Admin belum diatur.");
    }
    await verifyOtp({ email, purpose: OTP_PURPOSE, code: input.code });
    await setAdminUnlockCookie(actor.userId);
    return { unlocked: true };
  });
}

export async function lockPlatformEditAction(): Promise<ActionResult<{ locked: boolean }>> {
  return runAction(async () => {
    await requireAdminCapability("MANAGE_PLATFORM_SETTINGS");
    await clearAdminUnlockCookie();
    return { locked: true };
  });
}
