import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { isAdminEditUnlocked } from "@/server/auth/admin-edit-unlock";
import { getPlatformSettingsForAdmin } from "@/server/queries/platform-settings";
import { AdminPengaturanClient } from "./AdminPengaturanClient";

export const metadata: Metadata = {
  title: "Pengaturan Platform",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminPengaturanPage() {
  const settings = await getPlatformSettingsForAdmin();
  if (!settings) {
    return (
      <div className="p-8 text-hk-charcoal">
        Akses ditolak. Hanya admin yang dapat membuka halaman ini.
      </div>
    );
  }
  const session = await getSession();
  const unlocked = session ? await isAdminEditUnlocked(session.userId) : false;
  return <AdminPengaturanClient initial={settings} unlocked={unlocked} />;
}
