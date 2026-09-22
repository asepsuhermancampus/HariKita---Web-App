"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Inbox,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useNotifications } from "@/lib/notification-store";
import { vendorDecisionAction } from "@/server/actions/order";
import { DashPageHeader } from "@/components/dashboard";
import type { VendorInboxItemDTO } from "@/server/queries/vendor";

interface InboxVM {
  id: string;
  orderId: string;
  bookingId: string;
  clientName: string;
  eventDate: string;
  packageName: string;
  serviceName: string;
  price: number;
  dpAmount: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  notes?: string;
  rejectionReason?: string | null;
}

/**
 * Kotak Masuk Vendor (client).
 *
 * `dbItems` bersumber dari database (OrderItem milik vendor login). Bila kosong
 * (belum login vendor / belum ada order), UI jatuh ke mock notification store.
 */
export function VendorInboxClient({ dbItems }: { dbItems: VendorInboxItemDTO[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "new" | "confirmed">("all");
  const [actionError, setActionError] = useState<string | null>(null);
  const { notifications, confirmOrder } = useNotifications("all");

  const items: InboxVM[] =
    dbItems.length > 0
      ? dbItems.map((i) => ({
          id: i.id,
          orderId: i.orderId,
          bookingId: i.orderNumber,
          clientName: i.clientName,
          eventDate: i.eventDate.split("T")[0],
          packageName: i.packageName,
          serviceName: i.serviceName,
          price: i.subtotal,
          dpAmount: Math.floor(i.subtotal * 0.3),
          status: i.status as InboxVM["status"],
          rejectionReason: i.rejectionReason,
        }))
      : notifications.map((n) => ({
          id: n.id,
          orderId: n.bookingId,
          bookingId: n.bookingId,
          clientName: n.clientName,
          eventDate: n.eventDate,
          packageName: n.packageName,
          serviceName: n.vendorName,
          price: n.price,
          dpAmount: n.dpAmount,
          status: n.status === "CONFIRMED" ? "ACCEPTED" : "PENDING",
          notes: n.notes,
        }));

  const filtered = items.filter((o) => {
    if (filter === "new") return o.status === "PENDING";
    if (filter === "confirmed") return o.status === "ACCEPTED";
    return true;
  });

  const handleDecision = (itemId: string, command: "ACCEPT" | "REJECT") => {
    setActionError(null);
    if (dbItems.length === 0) {
      // Mode mock: pakai store lama.
      confirmOrder(itemId);
      return;
    }
    startTransition(async () => {
      const res = await vendorDecisionAction({
        orderItemId: itemId,
        command,
        rejectionReason: command === "REJECT" ? "Jadwal tidak tersedia" : undefined,
      });
      if (!res.success) {
        setActionError(res.message || "Gagal memproses keputusan.");
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <DashPageHeader
        title="Kotak Masuk Order & Notifikasi"
        description="Pesanan nyata yang masuk setelah calon pengantin mengajukan booking. Setujui atau tolak sesuai ketersediaan jadwal Anda."
        action={
          <Link
            href="/dashboard/vendor/kalender"
            className="focus-ring inline-flex min-h-11 items-center rounded-full border border-hk-champagne/60 bg-white px-4 text-xs font-bold text-hk-charcoal hover:bg-hk-ivory"
          >
            Cek Kalender Sibuk
          </Link>
        }
      />
      <div className="space-y-6">
        {/* Filter */}
        <div className="flex gap-2 border-b border-hk-champagne/40 pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-manrope font-bold transition-all ${
              filter === "all" ? "bg-hk-charcoal text-white shadow-xs" : "bg-white text-hk-charcoal/70 hover:text-hk-charcoal border border-hk-champagne/40"
            }`}
          >
            Semua Pesanan ({items.length})
          </button>
          <button
            onClick={() => setFilter("new")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-manrope font-bold transition-all ${
              filter === "new" ? "bg-amber-600 text-white shadow-xs" : "bg-white text-hk-charcoal/70 hover:text-hk-charcoal border border-hk-champagne/40"
            }`}
          >
            Menunggu Respon ({items.filter((n) => n.status === "PENDING").length})
          </button>
          <button
            onClick={() => setFilter("confirmed")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-manrope font-bold transition-all ${
              filter === "confirmed" ? "bg-emerald-700 text-white shadow-xs" : "bg-white text-hk-charcoal/70 hover:text-hk-charcoal border border-hk-champagne/40"
            }`}
          >
            Diterima ({items.filter((n) => n.status === "ACCEPTED").length})
          </button>
        </div>

        {actionError && (
          <div role="alert" className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-manrope text-red-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Notice */}
        <div className="p-4 rounded-2xl bg-white border border-hk-champagne/50 shadow-2xs flex items-start gap-3">
          <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs font-manrope text-hk-charcoal/70 leading-relaxed">
            <strong className="text-hk-charcoal block font-semibold">SLA Respon 24 Jam:</strong>
            Respon cepat menjaga jadwal klien tetap aman. Jika tidak direspon dalam 24 jam, pesanan dapat dialihkan otomatis oleh sistem.
          </div>
        </div>

        {/* Order Cards */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white border border-hk-champagne/40 text-xs font-manrope text-hk-charcoal/60">
              Tidak ada pesanan pada filter ini.
            </div>
          ) : (
            filtered.map((order) => {
              const isAccepted = order.status === "ACCEPTED";
              const isRejected = order.status === "REJECTED";
              const isPendingItem = order.status === "PENDING";

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-hk-champagne/60 shadow-md p-5 sm:p-6 space-y-4 font-manrope"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-hk-champagne/20">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-hk-charcoal px-2.5 py-1 rounded-full bg-hk-ivory border border-hk-champagne/50">
                        {order.bookingId}
                      </span>
                      <span className="text-xs text-hk-charcoal/70 flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-hk-taupe" />
                        <span>{order.eventDate}</span>
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        isAccepted
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : isRejected
                          ? "bg-red-50 text-red-800 border border-red-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {isAccepted ? "Diterima & Terkunci" : isRejected ? "Ditolak" : "Menunggu Konfirmasi"}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div>
                      <h3 className="font-editorial text-xl font-bold text-hk-charcoal mt-0.5">
                        {order.clientName}
                      </h3>
                      <p className="text-xs font-semibold text-hk-charcoal/80 mt-0.5">{order.packageName}</p>
                      <div className="text-xs text-hk-charcoal/70 flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-hk-taupe" />
                          <span>{order.serviceName}</span>
                        </span>
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <div className="text-xs text-hk-charcoal/60">Nilai Jasa Mitra:</div>
                      <div className="font-mono text-xl font-bold text-hk-charcoal">
                        Rp {order.price.toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>

                  {order.rejectionReason && (
                    <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800">
                      <strong className="block mb-0.5 font-semibold">Alasan Penolakan:</strong>
                      {order.rejectionReason}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-[11px] text-hk-charcoal/60 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Pencairan dana mengikuti mekanisme rekening bersama.</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/hub-koordinasi?bookingId=${order.bookingId}`}
                        className="px-3.5 py-2 rounded-full border border-hk-champagne/60 bg-white text-hk-charcoal text-xs font-manrope font-semibold hover:bg-hk-ivory transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-hk-taupe" />
                        <span>Radar Koordinasi</span>
                      </Link>

                      {isPendingItem && (
                        <>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleDecision(order.id, "REJECT")}
                            className="px-3.5 py-2 rounded-full border border-red-300 bg-white text-red-700 text-xs font-manrope font-semibold hover:bg-red-50 transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleDecision(order.id, "ACCEPT")}
                            className="px-4 py-2 rounded-full bg-hk-charcoal text-white text-xs font-manrope font-bold hover:bg-hk-taupe transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-hk-champagne" />
                            <span>Terima Pesanan</span>
                          </button>
                        </>
                      )}
                      {isAccepted && (
                        <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-manrope font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Diterima
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
  );
}
