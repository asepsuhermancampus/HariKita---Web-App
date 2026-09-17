import React from "react";
import { getSession } from "@/lib/session";
import { ClientHeaderNav } from "@/components/client/ClientHeaderNav";

export const metadata = {
  title: "Portal Klien HariKita • Ekosistem Acara Kebumen",
  description:
    "Pusat pengelolaan profil pengantin, riwayat pesanan vendor, pelacak jadwal fitting & test food, dan undangan digital HariKita Kebumen.",
};

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-hk-ivory text-hk-charcoal font-manrope selection:bg-hk-champagne selection:text-white flex flex-col">
      {/* Sub-Header Portal Klien */}
      <ClientHeaderNav
        userName={session?.name}
        userPhone={session?.phone}
      />

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
