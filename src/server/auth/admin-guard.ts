/**
 * HariKita - Admin RBAC Guard
 *
 * Satu sumber kebenaran otorisasi admin. Sub-role disimpan pada User.adminRole
 * (null = grandfathered SUPER_ADMIN). session.role tetap "ADMIN".
 */

export type AdminSubRole = "SUPER_ADMIN" | "OPS" | "FINANCE";

export type AdminCapability =
  | "VIEW_ADMIN"
  | "VERIFY_VENDOR"
  | "MANAGE_DISPUTE"
  | "MANAGE_FINANCE"
  | "MANAGE_BA"
  | "MANAGE_ADMIN";

export const CAPABILITY_MATRIX: Record<AdminSubRole, readonly AdminCapability[]> = {
  SUPER_ADMIN: [
    "VIEW_ADMIN",
    "VERIFY_VENDOR",
    "MANAGE_DISPUTE",
    "MANAGE_FINANCE",
    "MANAGE_BA",
    "MANAGE_ADMIN",
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
