import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AdminActor, AdminCapability } from "@/server/auth/admin-guard";

/**
 * HariKita - Admin Audit Service
 *
 * Menulis satu baris AdminAuditLog (append-only). Menerima `tx` opsional agar
 * dapat ikut transaksi aksi. Tidak ada update/delete.
 */

export interface AdminAuditInput {
  actor: AdminActor;
  capability: AdminCapability;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}

export async function recordAdminAudit(
  input: AdminAuditInput,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const db = tx ?? prisma;
  await db.adminAuditLog.create({
    data: {
      actorId: input.actor.userId,
      actorName: input.actor.name,
      actorRole: input.actor.subRole,
      capability: input.capability,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    },
  });
}
