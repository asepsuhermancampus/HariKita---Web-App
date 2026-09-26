import React from "react";
import { resolveCoupleDisplayName } from "@/lib/client-couple-profile";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { DashboardShell, CLIENT_NAV } from "@/components/dashboard";

export const metadata = {
  title: "Portal Klien HariKita — Ekosistem Acara Kebumen",
  description:
    "Pusat pengelolaan profil pengantin, riwayat pesanan vendor, pelacak jadwal fitting & test food, dan undangan digital HariKita Kebumen.",
};

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const user = session?.role === "CLIENT"
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          name: true,
          clientProfile: {
            select: {
              partnerName: true,
              groomName: true,
              brideName: true,
              coupleDisplayName: true,
            },
          },
        },
      })
    : null;
  const userName = resolveCoupleDisplayName({
    userName: user?.name,
    partnerName: user?.clientProfile?.partnerName,
    groomName: user?.clientProfile?.groomName,
    brideName: user?.clientProfile?.brideName,
    coupleDisplayName: user?.clientProfile?.coupleDisplayName,
  });

  return (
    <DashboardShell
      nav={CLIENT_NAV}
      roleLabel="Klien"
      homeHref="/client"
      userName={userName}
    >
      {children}
    </DashboardShell>
  );
}
