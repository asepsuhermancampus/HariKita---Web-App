import React from "react";
import { getVendorProfile } from "@/server/actions/vendor-profile";
import { getSession } from "@/lib/session";
import { DashboardShell, VENDOR_NAV } from "@/components/dashboard";

export const metadata = {
  title: "Portal Mitra Vendor Kebumen | HariKita",
  description:
    "Pusat manajemen portofolio, kalender ketersediaan, order escrow, dan statistik mitra vendor HariKita Kebumen.",
};

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const [profile, session] = await Promise.all([getVendorProfile(), getSession()]);
  // Utamakan nama usaha vendor; fallback ke nama user sesi agar sidebar tidak
  // jatuh ke label generik "HariKita".
  const userName = profile?.businessName || session?.name || undefined;
  return (
    <DashboardShell
      nav={VENDOR_NAV}
      roleLabel="Mitra Vendor"
      homeHref="/dashboard/vendor"
      userName={userName}
    >
      {children}
    </DashboardShell>
  );
}
