import React from "react";
import { Coins } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { getAmbassadorCommissions } from "@/server/queries/ambassador";
import { EmptyState } from "@/components/harikita/ui";

export const dynamic = "force-dynamic";

/**
 * Riwayat komisi BA — Server Component (BA-only via middleware).
 */
export default async function BaCommissionsPage() {
  const commissions = await getAmbassadorCommissions();
  const total = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-hk-charcoal">
            Riwayat Komisi
          </h1>
          <p className="text-xs text-hk-charcoal/70 mt-0.5 font-manrope">
            Komisi tercatat otomatis saat order vendor rekrutan tuntas (pelunasan 70%).
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-hk-soft-beige/60 text-hk-charcoal text-xs font-semibold border border-hk-champagne/50">
          <Coins className="w-3.5 h-3.5 text-hk-taupe" />
          Total: {formatRupiah(total)}
        </span>
      </div>

      {commissions.length === 0 ? (
        <EmptyState
          title="Belum ada komisi"
          description="Komisi akan muncul di sini setelah order dari vendor rekrutan Anda selesai dan pelunasan 70% cair."
          icon="inbox"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-hk-champagne/30 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-manrope">
              <thead className="bg-hk-ivory/70 text-hk-charcoal/70">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">Order</th>
                  <th className="text-left font-semibold px-4 py-3">Vendor</th>
                  <th className="text-right font-semibold px-4 py-3">Basis</th>
                  <th className="text-right font-semibold px-4 py-3">%</th>
                  <th className="text-right font-semibold px-4 py-3">Komisi</th>
                  <th className="text-right font-semibold px-4 py-3">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hk-soft-beige/60">
                {commissions.map((c) => (
                  <tr key={c.id} className="hover:bg-hk-ivory/40">
                    <td className="px-4 py-3 font-mono text-[11px] text-hk-charcoal">
                      {c.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-hk-charcoal">{c.vendorName}</td>
                    <td className="px-4 py-3 text-right text-hk-charcoal/80">
                      {formatRupiah(c.baseAmount)}
                    </td>
                    <td className="px-4 py-3 text-right text-hk-charcoal/80">{c.pct}%</td>
                    <td className="px-4 py-3 text-right font-bold text-hk-taupe">
                      {formatRupiah(c.commissionAmount)}
                    </td>
                    <td className="px-4 py-3 text-right text-hk-charcoal/60">{c.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
