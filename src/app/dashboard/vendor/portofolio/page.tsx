import React from "react";
import { getCurrentVendor, getVendorPortfolios } from "@/server/queries/vendor";
import { getVendorProfile } from "@/server/actions/vendor-profile";
import { getSession } from "@/lib/session";
import { VendorPortofolioClient } from "./VendorPortofolioClient";

export const dynamic = "force-dynamic";

/**
 * Pengelola Portofolio Vendor — Server Component.
 * Sumber: database (VendorPortfolio milik vendor login). Fallback mock bila
 * vendor belum ter-resolve.
 *
 * Slug diambil dari VendorProfile. Bila `getCurrentVendor()` null namun sesi
 * tetap VENDOR/ADMIN, kita fallback ke `getVendorProfile()` (yang menyelf-heal
 * slug kosong) agar tombol "Lihat Profil Publik" tidak pernah mati untuk
 * vendor yang sudah login.
 */
export default async function Page() {
  const vendor = await getCurrentVendor();
  const dbPosts = vendor ? await getVendorPortfolios() : [];

  let vendorSlug = vendor?.slug ?? "";
  let vendorName = vendor?.businessName ?? "";

  if (!vendorSlug) {
    const session = await getSession();
    if (session?.role === "VENDOR" || session?.role === "ADMIN") {
      const profile = await getVendorProfile();
      vendorSlug = profile?.slug ?? "";
      vendorName = vendorName || profile?.businessName || "";
    }
  }

  return (
    <VendorPortofolioClient
      dbPosts={dbPosts}
      vendorResolved={Boolean(vendor)}
      vendorSlug={vendorSlug}
      vendorName={vendorName}
    />
  );
}
