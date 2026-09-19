import React from "react";
import { getAmbassadorSummary } from "@/server/queries/ambassador";
import { BaHeaderNav } from "@/components/ba/BaHeaderNav";

export const metadata = {
  title: "Portal Brand Ambassador | HariKita",
  description:
    "Portal Brand Ambassador HariKita: pantau vendor rekrutan, komisi, dan saldo dompet Anda.",
};

export default async function BaLayout({ children }: { children: React.ReactNode }) {
  const summary = await getAmbassadorSummary();

  return (
    <div className="min-h-screen bg-hk-ivory text-hk-charcoal font-manrope selection:bg-hk-champagne selection:text-white flex flex-col">
      <BaHeaderNav
        displayName={summary?.displayName ?? "BA HariKita"}
        referralCode={summary?.referralCode ?? "-"}
        walletBalance={summary?.walletBalance ?? 0}
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}
