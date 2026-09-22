import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardShell, ADMIN_NAV } from "@/components/dashboard";

export const metadata: Metadata = {
  title: "Super Admin — HariKita",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell nav={ADMIN_NAV} roleLabel="Super Admin" homeHref="/admin">
      {children}
    </DashboardShell>
  );
}
