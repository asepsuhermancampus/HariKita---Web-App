import React from "react";
import { getCurrentVendor, getVendorPortfolios } from "@/server/queries/vendor";
import { VendorPortofolioClient } from "./VendorPortofolioClient";

export const dynamic = "force-dynamic";

/**
 * Pengelola Portofolio Vendor — Server Component.
 * Sumber: database (VendorPortfolio milik vendor login). Fallback mock bila
 * vendor belum ter-resolve.
 */
export default async function Page() {
  const vendor = await getCurrentVendor();
  const dbPosts = vendor ? await getVendorPortfolios() : [];

  return (
    <VendorPortofolioClient
      dbPosts={dbPosts}
      vendorResolved={Boolean(vendor)}
      vendorSlug={vendor?.slug ?? ""}
      vendorName={vendor?.businessName ?? ""}
    />
  );
}
