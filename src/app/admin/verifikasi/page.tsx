import React from "react";
import { getVendorVerifications } from "@/server/queries/admin";
import { AdminVerifikasiClient } from "./AdminVerifikasiClient";

export const dynamic = "force-dynamic";

/**
 * Pusat Verifikasi Mitra — Server Component (admin-only).
 */
export default async function Page() {
  const dbVendors = await getVendorVerifications();
  return <AdminVerifikasiClient dbVendors={dbVendors} />;
}
