import React from "react";
import { getVendorPackages, getCurrentVendor } from "@/server/queries/vendor";
import { VendorPaketClient } from "./VendorPaketClient";

export const dynamic = "force-dynamic";

/**
 * Manajemen Paket Vendor — Server Component.
 * Sumber: database (paket milik vendor login). Fallback mock bila belum login.
 */
export default async function Page() {
  const vendor = await getCurrentVendor();
  const dbPackages = vendor ? await getVendorPackages() : [];

  return <VendorPaketClient dbPackages={dbPackages} vendorResolved={Boolean(vendor)} />;
}
