import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getClientOrderViewModels } from "@/server/queries/orders";
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
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      {/* Header Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-hk-champagne/40 pb-6">
        <div>
          <div className="text-xs font-manrope text-hk-charcoal/70 flex items-center gap-1 mb-1.5">
            <Link href="/client" className="hover:text-hk-charcoal font-medium">
              Portal Klien
            </Link>
            <span>/</span>
            <span className="text-hk-charcoal font-semibold">Daftar Pesanan &amp; Invoice</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-hk-charcoal leading-tight">
            Riwayat Pesanan &amp; Kontrak Acara
          </h1>
          <p className="text-xs sm:text-sm font-manrope text-hk-charcoal/80 mt-1 leading-relaxed">
            Kelola pesanan paket acara Anda, cetak dokumen tagihan escrow resmi, dan pantau radar koordinasi vendor.
          </p>
        </div>

        <Link
          href="/builder"
          className="px-5 py-2.5 rounded-full bg-hk-taupe text-white text-xs font-manrope font-semibold hover:bg-[#78644e] transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-hk-champagne" />
          <span>Racik Paket Baru</span>
        </Link>
      </div>

      <ClientOrdersList dbOrders={dbOrders} />
    </div>
  );
}
