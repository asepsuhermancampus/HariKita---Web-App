import React from "react";
import { Coins } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { getAmbassadorCommissions } from "@/server/queries/ambassador";
import { EmptyState } from "@/components/harikita/ui";
import { DashPageHeader } from "@/components/dashboard";

export const dynamic = "force-dynamic";

/**
 * Riwayat komisi BA — Server Component (BA-only via middleware).
 */
export default async function BaCommissionsPage() {
  const commissions = await getAmbassadorCommissions();
  const total = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);

  return (
    <div className="flex flex-col gap-6">
      <DashPageHeader
        title="Riwayat Komisi"
        description="Komisi tercatat otomatis saat order vendor rekrutan tuntas (pelunasan 70%)."
        action={
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-hk-champagne/50 bg-hk-soft-beige/60 px-3 py-1.5 text-xs font-semibold text-hk-charcoal">
            <Coins className="w-3.5 h-3.5 text-hk-taupe" />
            Total: {formatRupiah(total)}
          </span>
        }
      />

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
