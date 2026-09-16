import React from "react";
import { getVendorProfile } from "@/server/actions/vendor-profile";
import { VendorHeaderNav } from "@/components/vendor/VendorHeaderNav";

export const metadata = {
  title: "Portal Mitra Vendor Kebumen | HariKita",
  description: "Pusat manajemen portofolio, kalender ketersediaan, order escrow, dan statistik mitra vendor HariKita Kebumen.",
};

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getVendorProfile();

  return (
    <div className="min-h-screen bg-hk-ivory text-hk-charcoal font-manrope selection:bg-hk-champagne selection:text-white flex flex-col">
      <VendorHeaderNav
        businessName={profile?.businessName || "Mitra Studio Kebumen"}
        category={profile?.category || "Layanan Terpadu"}
        userPhone={profile?.phone}
        district={profile?.district || "Kebumen"}
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}
