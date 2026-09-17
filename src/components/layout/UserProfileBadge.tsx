import { getSession } from "@/lib/session";
import { logoutAction } from "@/server/actions/auth";
import { LogOut, UserCircle } from "lucide-react";

/**
 * Server Component — menampilkan badge nama user yang sedang login
 * beserta tombol logout. Tambahkan ke navbar portal client/vendor/admin.
 *
 * Usage: <UserProfileBadge />
 */
export default async function UserProfileBadge() {
  const session = await getSession();
  if (!session) return null;

  const roleLabel: Record<string, string> = {
    ADMIN: "Super Admin",
    VENDOR: "Mitra Vendor",
    CLIENT: "Pengantin",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs text-[#4A2E35]">
        <UserCircle className="w-4 h-4 text-[#C5A880]" />
        <span className="font-semibold">{session.name}</span>
        <span className="text-[#6B5E62]">
          ({roleLabel[session.role] ?? session.role})
        </span>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex items-center gap-1 text-[11px] text-[#6B5E62] hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
        >
          <LogOut className="w-3 h-3" />
          <span>Keluar</span>
        </button>
      </form>
    </div>
  );
}
