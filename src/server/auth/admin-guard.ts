/**
 * HariKita - Admin RBAC Guard
 *
 * Satu sumber kebenaran otorisasi admin. Sub-role disimpan pada User.adminRole
 * (null = grandfathered SUPER_ADMIN). session.role tetap "ADMIN".
 */

import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DomainError } from "@/server/services/errors";

export type AdminSubRole = "SUPER_ADMIN" | "OPS" | "FINANCE";

export type AdminCapability =
  | "VIEW_ADMIN"
  | "VERIFY_VENDOR"
  | "MANAGE_DISPUTE"
  | "MANAGE_FINANCE"
  | "MANAGE_BA"
  | "MANAGE_ADMIN"
  | "MANAGE_PLATFORM_SETTINGS";

export const CAPABILITY_MATRIX: Record<AdminSubRole, readonly AdminCapability[]> = {
  SUPER_ADMIN: [
    "VIEW_ADMIN",
    "VERIFY_VENDOR",
    "MANAGE_DISPUTE",
    "MANAGE_FINANCE",
    "MANAGE_BA",
    "MANAGE_ADMIN",
    "MANAGE_PLATFORM_SETTINGS",
  ],
  OPS: ["VIEW_ADMIN", "VERIFY_VENDOR", "MANAGE_DISPUTE"],
  FINANCE: ["VIEW_ADMIN", "MANAGE_FINANCE"],
};

const KNOWN_SUB_ROLES: readonly AdminSubRole[] = ["SUPER_ADMIN", "OPS", "FINANCE"];

/**
 * Sub-role efektif. null bila bukan admin.
 * - role !== "ADMIN" → null
 * - adminRole null / tak dikenal → "SUPER_ADMIN" (grandfathered / fail-safe)
 */
export function resolveAdminRole(role: string, adminRole: string | null): AdminSubRole | null {
  if (role !== "ADMIN") return null;
  if (!adminRole) return "SUPER_ADMIN";
  const normalized = adminRole.trim().toUpperCase();
  if (KNOWN_SUB_ROLES.includes(normalized as AdminSubRole)) {
    return normalized as AdminSubRole;
  }
  return "SUPER_ADMIN";
}

/** Apakah sub-role punya capability. */
export function hasCapability(subRole: AdminSubRole, cap: AdminCapability): boolean {
  return CAPABILITY_MATRIX[subRole].includes(cap);
}

export interface AdminActor {
  userId: string;
  name: string;
  subRole: AdminSubRole;
}

/**
 * Memuat actor admin dari DB berdasarkan userId.
 * Mengembalikan null bila user tidak ada atau bukan admin.
 */
export async function loadAdminActor(userId: string): Promise<AdminActor | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  const subRole = resolveAdminRole(user.role, user.adminRole);
  if (!subRole) return null;
  return { userId: user.id, name: user.name, subRole };
}

/**
 * Guard utama. Membaca sesi, memuat actor, dan memverifikasi capability.
 * @throws {DomainError} UNAUTHORIZED_ADMIN_CAPABILITY
 */
export async function requireAdminCapability(cap: AdminCapability): Promise<AdminActor> {
  const session = await getSession();
  if (!session) {
    throw new DomainError("UNAUTHORIZED_ADMIN_CAPABILITY", "Sesi tidak ditemukan. Silakan login.");
  }
  const actor = await loadAdminActor(session.userId);
  if (!actor) {
    throw new DomainError("UNAUTHORIZED_ADMIN_CAPABILITY", "Akses admin ditolak.");
  }
  if (!hasCapability(actor.subRole, cap)) {
    throw new DomainError(
      "UNAUTHORIZED_ADMIN_CAPABILITY",
      `Sub-role ${actor.subRole} tidak memiliki capability ${cap}.`
    );
  }
  return actor;
}

/**
 * Predikat read-only untuk akses baca admin (VIEW_ADMIN). Tidak pernah throw —
 * mengembalikan `false` bila tidak login / bukan admin / sub-role tanpa VIEW_ADMIN.
 * Dipakai oleh query layer (read paths) agar otorisasi admin tetap satu sumber.
 */
export async function canViewAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  const actor = await loadAdminActor(session.userId);
  if (!actor) return false;
  return hasCapability(actor.subRole, "VIEW_ADMIN");
}
