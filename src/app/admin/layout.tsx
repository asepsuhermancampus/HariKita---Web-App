import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminSidebarNav } from "./AdminSidebarNav";

export const metadata: Metadata = {
  title: "Super Admin — HariKita",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-hk-canvas">
      <AdminSidebarNav />
      <div className="min-w-0 flex-1">
        <main className="px-4 py-6 pt-20 sm:px-6 lg:px-8 lg:pt-6">{children}</main>
      </div>
    </div>
  );
}
