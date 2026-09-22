import React from "react";
import { getVendorProfile } from "@/server/actions/vendor-profile";
import { DashboardShell, VENDOR_NAV } from "@/components/dashboard";

export const metadata = {
  title: "Portal Mitra Vendor Kebumen | HariKita",
  description:
    "Pusat manajemen portofolio, kalender ketersediaan, order escrow, dan statistik mitra vendor HariKita Kebumen.",
};

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  await getVendorProfile(); // pastikan profil ter-resolve
  return (
    <DashboardShell nav={VENDOR_NAV} roleLabel="Mitra Vendor" homeHref="/dashboard/vendor">
      {children}
    </DashboardShell>
  );
}
