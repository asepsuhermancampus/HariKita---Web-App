"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Wallet,
  Building2,
  DollarSign,
  MessageCircle,
  ExternalLink,
  Send,
  Sparkles,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { useNotifications } from "@/lib/notification-store";
import { useOrders } from "@/lib/order-store";
import type { OrderViewModel } from "@/server/queries/orders";

export function AdminEscrowClient({
  dbOrders,
  escrowBalance,
}: {
  dbOrders: OrderViewModel[];
  escrowBalance: number;
}) {
  const { allNotifications, triggerWhatsAppReminder } = useNotifications("all");
  const { orders: mockOrders } = useOrders();

  // Sumber order: DB bila ada, jika tidak mock (bentuk disamakan).
  const orders: OrderViewModel[] =
    dbOrders.length > 0
      ? dbOrders
      : mockOrders.map((o) => ({
          id: o.id,
          bookingId: o.bookingId,
          customerName: o.customerName,
          customerWhatsApp: o.customerWhatsApp,
          eventDate: o.eventDate,
          eventLocation: o.eventLocation,
          district: o.district,
          paymentStatus: o.paymentStatus,
          paymentType: o.paymentType,
          status: o.paymentStatus,
          notes: o.notes ?? "",
          financials: o.financials,
          items: o.items.map((i) => ({
            id: i.id,
            vendorName: i.vendorName,
            categoryTitle: i.categoryTitle,
            categoryId: i.categoryId,
            packageName: i.packageName,
            unitPrice: i.unitPrice,
            quantity: i.quantity,
            status: i.status,
          })),
          escrowStatus: {
            dpReleased: o.escrowStatus.dpReleased,
            settlementReleased: o.escrowStatus.settlementReleased,
          },
          createdAt: o.createdAt,
        }));

  const [authorizedIds, setAuthorizedIds] = useState<string[]>([]);

  const handleAuthorize = (id: string) => {
    setAuthorizedIds((prev) => [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-hk-ivory text-hk-charcoal py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-hk-champagne/40 pb-6">
          <div>
            <div className="text-xs font-manrope text-hk-charcoal/70 flex items-center gap-1 mb-1">
              <Link href="/admin" className="focus-ring rounded hover:text-hk-charcoal">
                Super Admin
              </Link>
              <span>/</span>
              <span className="text-hk-charcoal font-semibold">Otorisasi Escrow &amp; Notifikasi</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-hk-charcoal">
              Otorisasi Rekening Bersama &amp; Outbox Notifikasi
            </h1>
            <p className="text-xs font-manrope text-hk-charcoal/70 mt-0.5">
              Persetujuan transfer dana rekber resmi HariKita ke mitra vendor Kebumen serta pemantauan pengiriman notifikasi ganda.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-800 text-xs font-manrope font-bold border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>Saldo Escrow Penampung: Rp {escrowBalance.toLocaleString("id-ID")}</span>
            </span>
          </div>
        </div>

        {/* SECTION 1: OUTBOX DISPATCH MONITOR (DOUBLE NOTIFICATION) */}
        <div className="bg-white rounded-3xl border border-hk-champagne/60 shadow-md p-6 space-y-4 font-manrope">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hk-champagne/30 pb-3">
            <div>
              <h2 className="font-editorial text-2xl font-bold text-hk-charcoal">
                Outbox Monitor: Notifikasi Ganda Pesanan Vendor
              </h2>
              <p className="text-xs text-hk-charcoal/70">
                Log pengiriman notifikasi otomatis setelah klien membayar DP 30% via Escrow.
              </p>
            </div>
            <span className="text-xs font-bold text-hk-taupe bg-hk-ivory px-3 py-1 rounded-full border border-hk-champagne/40">
              Total Log: {allNotifications.length} Pesan
            </span>
          </div>

          <div className="border border-hk-champagne/40 rounded-2xl overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-hk-ivory text-hk-charcoal/70 font-semibold border-b border-hk-champagne/40">
                    <th className="p-3">Booking ID</th>
                    <th className="p-3">Mitra Vendor</th>
                    <th className="p-3">Calon Pengantin</th>
                    <th className="p-3">Tanggal Acara</th>
                    <th className="p-3">In-App Inbox</th>
                    <th className="p-3">WhatsApp Alert</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hk-champagne/20">
                  {allNotifications.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-hk-charcoal/60 italic">
                        Belum ada log notifikasi. Outbox akan terisi setelah pesanan diproses.
                      </td>
                    </tr>
                  ) : (
                    allNotifications.map((notif) => {
                    const waLink = triggerWhatsAppReminder(notif);
                    return (
                      <tr key={notif.id} className="hover:bg-hk-ivory/40 transition-colors">
                        <td className="p-3 font-mono font-bold text-hk-charcoal">
                          {notif.bookingId}
                        </td>
                        <td className="p-3">
                          <strong className="text-hk-charcoal block">{notif.vendorName}</strong>
                          <span className="text-[10px] text-hk-charcoal/60">{notif.packageName}</span>
                        </td>
                        <td className="p-3 text-hk-charcoal font-medium">
                          {notif.clientName}
                        </td>
                        <td className="p-3 text-hk-charcoal/80">
                          {notif.eventDate}
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                            <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                            <span>Terkirim</span>
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                            <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                            <span>Dispatched</span>
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Kirim pengingat WhatsApp untuk pesanan ${notif.bookingId}`}
                            className="focus-ring inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors text-[11px] shadow-2xs min-h-[32px]"
                          >
                            <MessageCircle className="w-3 h-3" aria-hidden="true" />
                            <span>Kirim WA</span>
                          </a>
                        </td>
                      </tr>
                    );
                    })
                  )}
                </tbody>
              </table>
            </div>
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
