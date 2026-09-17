import React from "react";
import { getVendorBlackouts, getCurrentVendor } from "@/server/queries/vendor";
import { VendorKalenderClient } from "./VendorKalenderClient";

export const dynamic = "force-dynamic";

/**
 * Kalender Blackout Vendor — Server Component.
 * Sumber: database (BLACKED_OUT slots milik vendor login). Fallback mock bila
 * vendor belum ter-resolve.
 */
export default async function Page() {
  const vendor = await getCurrentVendor();
  const dbBlackouts = vendor ? await getVendorBlackouts() : [];

  return (
    <VendorKalenderClient dbBlackouts={dbBlackouts} vendorResolved={Boolean(vendor)} />
  );
}
