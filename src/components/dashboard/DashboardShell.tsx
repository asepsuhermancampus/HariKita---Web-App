import type { ReactNode } from "react";
import { DashboardSidebarNav } from "./DashboardSidebarNav";
import type { NavGroup } from "./nav-config";

export function DashboardShell({
  nav,
  roleLabel,
  homeHref,
  children,
}: {
  nav: NavGroup[];
  roleLabel: string;
  homeHref: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-hk-canvas">
      <DashboardSidebarNav nav={nav} roleLabel={roleLabel} homeHref={homeHref} />
      <div className="min-w-0 flex-1">
        <main className="px-4 py-6 pt-20 sm:px-6 lg:px-8 lg:pt-6">{children}</main>
      </div>
    </div>
  );
}
