"use client";

import React, { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { DashCard, DashPageHeader } from "@/components/dashboard";

export default function KateringPage() {
  const [undangan, setUndangan] = useState(300);
  const tamuPerUndangan = 2;
  const buffer = 2.2;

  const result = useMemo(() => {
    const tamu = undangan * tamuPerUndangan;
    const totalPorsi = Math.round(tamu * buffer);
    return {
      tamu,
      totalPorsi,
      buffet: Math.round(totalPorsi * 0.5),
      stall: Math.round(totalPorsi * 0.5),
    };
  }, [undangan]);

  const nf = (n: number) => n.toLocaleString("id-ID");

  return (
    <div className="flex flex-col gap-6">
      <DashPageHeader
        title="Kalkulator Katering Resepsi"
        description="Simulator porsi makanan berdasarkan jumlah undangan. Rumus standar: Undangan x 2 x 2.2."
      />

      <DashCard title="Simulator Porsi">
        <div className="flex flex-col gap-4">
          <label className="font-manrope text-sm font-semibold text-hk-charcoal" htmlFor="undangan">
            Jumlah Undangan (pcs)
          </label>
          <input
            id="undangan"
            type="number"
            min={0}
            value={undangan}
            onChange={(e) => setUndangan(Math.max(0, parseInt(e.target.value || "0", 10)))}
            className="w-full max-w-xs rounded-xl border border-hk-champagne/60 px-4 py-3 text-lg font-bold tabular-nums"
          />
          <p className="flex items-center gap-2 font-manrope text-xs text-hk-taupe">
            <Calculator className="h-4 w-4" /> Rasio 2.0 orang/undangan x buffer 2.2 porsi.
          </p>
        </div>
      </DashCard>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatBox label="Estimasi Tamu Fisik" value={`${nf(result.tamu)} Orang`} />
        <StatBox label="Total Porsi Wajib" value={`${nf(result.totalPorsi)} Porsi`} accent />
        <StatBox label="Buffet (Prasmanan 50%)" value={`${nf(result.buffet)} Porsi`} />
        <StatBox label="Gubukan (Stall 50%)" value={`${nf(result.stall)} Porsi`} />
      </div>
    </div>
  );
}

function StatBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 text-center ${accent ? "border-hk-taupe bg-hk-soft-beige/40" : "border-hk-champagne/40 bg-white"}`}>
      <div className="font-manrope text-[11px] font-semibold uppercase tracking-wider text-hk-taupe">{label}</div>
      <div className="mt-1 font-editorial text-2xl font-bold tabular-nums text-hk-charcoal">{value}</div>
    </div>
  );
}
