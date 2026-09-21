"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { EmptyState } from "@/components/harikita/ui";
import { AdminPageHeader } from "@/components/admin";
import type { OrderViewModel } from "@/server/queries/orders";

export function AdminEscrowClient({
  dbOrders,
  escrowBalance,
}: {
  dbOrders: OrderViewModel[];
  escrowBalance: number;
}) {
  // Sumber tunggal: order dari DATABASE (admin-only). Tidak ada fallback ke mock
  // store agar panel otorisasi finansial ini tidak menampilkan data fiktif.
  const orders: OrderViewModel[] = dbOrders;

  const [authorizedIds, setAuthorizedIds] = useState<string[]>([]);

  const handleAuthorize = (id: string) => {
    setAuthorizedIds((prev) => [...prev, id]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Header */}
        <AdminPageHeader
          title="Otorisasi Rekening Bersama &amp; Outbox Notifikasi"
          description="Persetujuan transfer dana rekber resmi HariKita ke mitra vendor Kebumen serta pemantauan pengiriman notifikasi ganda."
          action={
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 shadow-2xs">
              <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              <span>Saldo Escrow Penampung: Rp {escrowBalance.toLocaleString("id-ID")}</span>
            </span>
          }
        />

        {/* SECTION 1: OUTBOX NOTIFIKASI */}
        <div className="bg-white rounded-3xl border border-hk-champagne/60 shadow-md p-6 space-y-4 font-manrope">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hk-champagne/30 pb-3">
            <div>
              <h2 className="font-editorial text-2xl font-bold text-hk-charcoal">
                Outbox Notifikasi Pesanan Vendor
              </h2>
              <p className="text-xs text-hk-charcoal/70">
                Notifikasi WhatsApp/in-app dikirim otomatis oleh scheduler platform (outbox persisten).
              </p>
            </div>
            <span className="text-xs font-bold text-hk-taupe bg-hk-ivory px-3 py-1 rounded-full border border-hk-champagne/40">
              Dikelola Sistem
            </span>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-hk-champagne/40 bg-hk-ivory/50 p-4 text-xs text-hk-charcoal/75">
            <ShieldCheck className="w-5 h-5 shrink-0 text-hk-taupe" aria-hidden="true" />
            <p className="leading-relaxed">
              Log pengiriman notifikasi (WhatsApp &amp; in-app) dikelola secara otomatis oleh outbox
              persisten dan scheduler platform. Panel ini tidak menampilkan data contoh — log nyata
              tersedia melalui sistem notifikasi dan akan ditampilkan di sini setelah integrasi
              tampilan outbox admin diaktifkan.
            </p>
          </div>
        </div>

        {/* SECTION 2: ESCROW DISBURSEMENT AUTHORIZATION */}
        <div className="bg-white rounded-3xl border border-hk-champagne/60 shadow-md p-6 space-y-4 font-manrope">
          <div className="border-b border-hk-champagne/30 pb-3">
            <h2 className="font-editorial text-2xl font-bold text-hk-charcoal">
              Antrean Pencairan Dana Escrow ke Rekening Vendor
            </h2>
            <p className="text-xs text-hk-charcoal/70">
              Termin DP 30% cair pada H-3 acara, dan pelunasan 70% cair pada H+2 pasca acara.
            </p>
          </div>

          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="p-8 rounded-2xl bg-hk-ivory/50 border border-dashed border-hk-champagne/50 text-center text-xs text-hk-charcoal/60 italic">
                Belum ada pesanan dalam antrean pencairan escrow.
              </div>
            ) : (
              orders.map((ord) => {
              const isAuthDp = authorizedIds.includes(`dp_${ord.id}`);
              const isAuthFinal = authorizedIds.includes(`final_${ord.id}`);

              return (
                <div
                  key={ord.id}
                  className="p-5 rounded-2xl bg-hk-ivory/50 border border-hk-champagne/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-hk-charcoal bg-white px-2 py-0.5 rounded-md border border-hk-champagne/40">
                        {ord.bookingId}
                      </span>
                      <span className="font-bold text-hk-charcoal">{ord.customerName}</span>
                      <span className="text-hk-charcoal/60">({ord.eventDate})</span>
                    </div>
                    <p className="text-hk-charcoal/70 text-[11px]">
                      Lokasi: {ord.eventLocation}, Kec. {ord.district} • Total: Rp {ord.financials.totalAmount.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* DP 30% Action */}
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-hk-champagne/50">
                      <span className="font-semibold text-hk-charcoal">
                        DP 30%: Rp {ord.financials.dpAmount.toLocaleString("id-ID")}
                      </span>
                      {!isAuthDp ? (
                        <button
                          type="button"
                          onClick={() => handleAuthorize(`dp_${ord.id}`)}
                          aria-label={`Rilis DP 30% untuk pesanan ${ord.bookingId}`}
                          className="focus-ring px-2.5 py-1.5 rounded-full bg-emerald-700 text-white font-bold hover:bg-emerald-800 text-[10px] min-h-[32px]"
                        >
                          Rilis H-3
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Dirilis
                        </span>
                      )}
                    </div>

                    {/* Pelunasan 70% Action */}
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-hk-champagne/50">
                      <span className="font-semibold text-hk-charcoal">
                        Pelunasan 70%: Rp {ord.financials.pelunasanAmount.toLocaleString("id-ID")}
                      </span>
                      {!isAuthFinal ? (
                        <button
                          type="button"
                          onClick={() => handleAuthorize(`final_${ord.id}`)}
                          aria-label={`Rilis pelunasan 70% untuk pesanan ${ord.bookingId}`}
                          className="focus-ring px-2.5 py-1.5 rounded-full bg-hk-charcoal text-white font-bold hover:bg-hk-taupe text-[10px] min-h-[32px]"
                        >
                          Rilis H+2
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Dirilis
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
