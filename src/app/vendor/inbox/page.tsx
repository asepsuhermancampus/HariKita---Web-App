import React from "react";
import { getVendorInbox } from "@/server/queries/vendor";
import { VendorInboxClient } from "./VendorInboxClient";

export const dynamic = "force-dynamic";

/**
 * Kotak Masuk Vendor — Server Component.
 * Sumber: database (OrderItem milik vendor login). Fallback mock bila kosong.
 */
export default async function Page() {
  const dbItems = await getVendorInbox();
  return <VendorInboxClient dbItems={dbItems} />;
}
