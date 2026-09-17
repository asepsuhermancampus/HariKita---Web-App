import React from "react";
import { getContentAuditFindings } from "@/server/queries/admin";
import { AdminAuditKontenClient } from "./AdminAuditKontenClient";

export const dynamic = "force-dynamic";

/**
 * Audit Anti-Disintermediasi — Server Component (admin-only).
 */
export default async function Page() {
  const dbFindings = await getContentAuditFindings();
  return <AdminAuditKontenClient dbFindings={dbFindings} />;
}
