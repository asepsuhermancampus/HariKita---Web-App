"use server";

import { requireAdminCapability } from "@/server/auth/admin-guard";
import { isAdminEditUnlocked, clearAdminUnlockCookie } from "@/server/auth/admin-edit-unlock";
import {
  updatePlatformSettings,
  type PlatformSettingsView,
} from "@/server/services/platform-settings-service";
import { runAction, revalidate, type ActionResult } from "./_shared";
import { DomainError } from "@/server/services/errors";

/**
 * HariKita - Platform Settings Server Actions
 *
 * Menyimpan persentase finansial platform + rincian komponen. Hanya SUPER_ADMIN
 * (capability MANAGE_PLATFORM_SETTINGS). Tulis wajib dalam mode edit terbuka
 * (penanda OTP-verified) — dijaga di server, bukan hanya UI.
 */
export async function updatePlatformSettingsAction(
  input: Omit<PlatformSettingsView, "components" | "superAdminEmail"> & {
    superAdminEmail?: string | null;
    components: Array<{ id?: string; label: string; pct: number; sortOrder?: number }>;
  }
): Promise<ActionResult<PlatformSettingsView>> {
  return runAction(async () => {
    const actor = await requireAdminCapability("MANAGE_PLATFORM_SETTINGS");
    if (!(await isAdminEditUnlocked(actor.userId))) {
      throw new DomainError(
        "ADMIN_EDIT_NOT_UNLOCKED",
        "Mode edit terkunci. Kirim & verifikasi kode OTP terlebih dahulu."
      );
    }
    const saved = await updatePlatformSettings({
      dpPct: input.dpPct,
      settlementPct: input.settlementPct,
      platformFeePct: input.platformFeePct,
      defaultBaCommissionPct: input.defaultBaCommissionPct,
      superAdminEmail: input.superAdminEmail ?? null,
      components: input.components.map((c, i) => ({
        id: c.id ?? "",
        label: c.label,
        pct: c.pct,
        sortOrder: c.sortOrder ?? i,
      })),
      actor,
    });
    // Setelah tersimpan, kunci kembali (butuh OTP baru untuk edit berikutnya).
    await clearAdminUnlockCookie();
    revalidate(["/admin/pengaturan", "/checkout"]);
    return saved;
  });
}
