import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type AmbassadorTx = Prisma.TransactionClient;

/** Membuat kode referral unik format BA-<KOTA>-<4 char>. */
export function generateReferralCode(city: string = "Kebumen"): string {
  const cityPart = (city || "Kebumen")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 8) || "KOTA";
  const suffix = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4).padEnd(4, "0");
  return `BA-${cityPart}-${suffix}`;
}

/** Resolve kode referral → BA aktif. Mengembalikan null bila kosong/invalid/nonaktif. */
export async function resolveReferral(
  code: string | null | undefined,
  tx?: AmbassadorTx
): Promise<{ ambassadorId: string } | null> {
  const normalized = (code ?? "").trim().toUpperCase();
  if (!normalized) return null;
  const db = tx ?? prisma;
  const ba = await db.brandAmbassador.findUnique({ where: { referralCode: normalized } });
  if (!ba || !ba.isActive) return null;
  return { ambassadorId: ba.id };
}

/** True bila BA adalah user yang sama dengan vendor (self-referral). */
export function attributionBaLocked(vendorUserId: string, ambassadorUserId: string): boolean {
  return vendorUserId === ambassadorUserId;
}
