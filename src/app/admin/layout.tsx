import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getSession } from "@/lib/session";
import { DashboardShell, ADMIN_NAV } from "@/components/dashboard";

export const metadata: Metadata = {
  title: "Super Admin — HariKita",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  return (
    <DashboardShell
      nav={ADMIN_NAV}
      roleLabel="Super Admin"
      homeHref="/admin"
      userName={session?.name}
    >
      {children}
    </DashboardShell>
  );
}
