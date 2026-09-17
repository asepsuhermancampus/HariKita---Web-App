import React from "react";
import { getDisputes } from "@/server/queries/admin";
import { AdminDisputeClient } from "./AdminDisputeClient";

export const dynamic = "force-dynamic";

/**
 * Resolution Center — Server Component (admin-only).
 */
export default async function Page() {
  const dbDisputes = await getDisputes();
  return <AdminDisputeClient dbDisputes={dbDisputes} />;
}
