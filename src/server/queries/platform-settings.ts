import { canViewAdmin } from "@/server/auth/admin-guard";
import {
  getPlatformSettings,
  type PlatformSettingsView,
} from "@/server/services/platform-settings-service";

/**
 * HariKita - Platform Settings Query Layer
 *
 * Query read-only untuk panel admin (VIEW_ADMIN). Mengembalikan null bila
 * pemanggil tidak berhak membuka panel admin.
 */
export async function getPlatformSettingsForAdmin(): Promise<PlatformSettingsView | null> {
  if (!(await canViewAdmin())) return null;
  return getPlatformSettings();
}
