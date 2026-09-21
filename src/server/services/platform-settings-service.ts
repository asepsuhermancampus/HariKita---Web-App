/**
 * HariKita - Platform Settings Service
 *
 * Satu sumber kebenaran persentase finansial platform (DP, pelunasan, platform
 * fee + rinciannya, default komisi BA). `getPlatformSettings` tidak pernah throw
 * — fallback ke DEFAULT bila baris belum ada. `validatePlatformSettings` menegak
 * aturan persentase. `updatePlatformSettings` menyimpan + menulis audit.
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DomainError } from "./errors";
import type { AdminActor } from "@/server/auth/admin-guard";
import { recordAdminAudit } from "./admin-audit-service";

export type PlatformSettingsTx = Prisma.TransactionClient;

export interface PlatformFeeComponentView {
  id: string;
  label: string;
  pct: number;
  sortOrder: number;
}

export interface PlatformSettingsView {
  dpPct: number;
  settlementPct: number;
  platformFeePct: number;
  defaultBaCommissionPct: number;
  components: PlatformFeeComponentView[];
}

/** Nilai default (fallback bila belum ada baris) — mencerminkan hardcode lama. */
export const DEFAULT_PLATFORM_SETTINGS: PlatformSettingsView = {
  dpPct: 30,
  settlementPct: 70,
  platformFeePct: 10,
  defaultBaCommissionPct: 5,
  components: [],
};

/** Validasi aturan persentase. Throw DomainError bila invalid. */
export function validatePlatformSettings(input: PlatformSettingsView): void {
  const pcts = [
    input.dpPct,
    input.settlementPct,
    input.platformFeePct,
    input.defaultBaCommissionPct,
    ...input.components.map((c) => c.pct),
  ];
  for (const p of pcts) {
    if (!Number.isInteger(p) || p < 0 || p > 100) {
      throw new DomainError(
        "INVALID_PLATFORM_SETTINGS",
        `Persentase harus integer 0–100 (diberikan: ${p}).`
      );
    }
  }
  if (input.dpPct + input.settlementPct !== 100) {
    throw new DomainError("INVALID_PLATFORM_SETTINGS", "DP% + Settlement% harus = 100.");
  }
  const componentTotal = input.components.reduce((acc, c) => acc + c.pct, 0);
  if (componentTotal !== input.platformFeePct) {
    throw new DomainError(
      "INVALID_PLATFORM_SETTINGS",
      `Total komponen fee (${componentTotal}) harus = platformFeePct (${input.platformFeePct}).`
    );
  }
}

/** Baca setting aktif. Tidak throw; fallback DEFAULT bila belum ada baris. */
export async function getPlatformSettings(tx?: PlatformSettingsTx): Promise<PlatformSettingsView> {
  const db = tx ?? prisma;
  try {
    const row = await db.platformSetting.findFirst({
      where: { isActive: true },
      include: { components: { orderBy: { sortOrder: "asc" } } },
    });
    if (!row) return { ...DEFAULT_PLATFORM_SETTINGS, components: [] };
    return {
      dpPct: row.dpPct,
      settlementPct: row.settlementPct,
      platformFeePct: row.platformFeePct,
      defaultBaCommissionPct: row.defaultBaCommissionPct,
      components: row.components.map((c) => ({
        id: c.id,
        label: c.label,
        pct: c.pct,
        sortOrder: c.sortOrder,
      })),
    };
  } catch {
    return { ...DEFAULT_PLATFORM_SETTINGS, components: [] };
  }
}

/**
 * Simpan setting + komponen (replace) lalu tulis audit.
 * Aktor wajib punya MANAGE_PLATFORM_SETTINGS (dicek pemanggil/action).
 */
export async function updatePlatformSettings(
  input: PlatformSettingsView & { actor: AdminActor },
  tx?: PlatformSettingsTx
): Promise<PlatformSettingsView> {
  validatePlatformSettings(input);
  const db = tx ?? prisma;

  let row = await db.platformSetting.findFirst({ where: { isActive: true } });
  if (!row) {
    row = await db.platformSetting.create({ data: { isActive: true } });
  }

  await db.platformFeeComponent.deleteMany({ where: { settingId: row.id } });

  await db.platformSetting.update({
    where: { id: row.id },
    data: {
      dpPct: input.dpPct,
      settlementPct: input.settlementPct,
      platformFeePct: input.platformFeePct,
      defaultBaCommissionPct: input.defaultBaCommissionPct,
      updatedById: input.actor.userId,
      updatedByName: input.actor.name,
      components: {
        create: input.components.map((c, i) => ({
          label: c.label,
          pct: c.pct,
          sortOrder: c.sortOrder ?? i,
        })),
      },
    },
  });

  await recordAdminAudit(
    {
      actor: input.actor,
      capability: "MANAGE_PLATFORM_SETTINGS",
      action: "PLATFORM_SETTINGS_UPDATED",
      targetType: "PlatformSetting",
      targetId: row.id,
      metadata: {
        dpPct: input.dpPct,
        settlementPct: input.settlementPct,
        platformFeePct: input.platformFeePct,
        defaultBaCommissionPct: input.defaultBaCommissionPct,
        componentCount: input.components.length,
      },
    },
    tx
  );

  return getPlatformSettings(db);
}
