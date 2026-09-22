import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getClientOrderViewModels } from "@/server/queries/orders";
import { DashPageHeader } from "@/components/dashboard";
import { ClientOrdersList } from "./ClientOrdersList";

export const dynamic = "force-dynamic";

/**
 * Riwayat Pesanan Klien — Server Component.
 * Sumber utama: database (owner-scoped). Fallback ke mock store bila kosong,
 * sehingga UI tetap terisi pada environment tanpa data pesanan.
 */
export default async function ClientPesananPage() {
  const dbOrders = await getClientOrderViewModels();

  return (
    <div className="flex flex-col gap-6">
      <DashPageHeader
        title="Riwayat Pesanan & Kontrak Acara"
        description="Kelola pesanan paket acara Anda, cetak dokumen tagihan escrow resmi, dan pantau radar koordinasi vendor."
        action={
          <Link
            href="/builder"
            className="focus-ring inline-flex min-h-11 items-center gap-1.5 self-start rounded-full bg-hk-taupe px-5 text-xs font-semibold text-white hover:bg-hk-charcoal sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-hk-champagne" />
            <span>Racik Paket Baru</span>
          </Link>
        }
      />

      <ClientOrdersList dbOrders={dbOrders} />
    </div>
  );
}
