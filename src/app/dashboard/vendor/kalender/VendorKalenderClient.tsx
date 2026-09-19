"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useAvailability, availabilityStore } from "@/lib/availability-store";
import { addBlackoutAction, removeBlackoutAction } from "@/server/actions/vendor";
import type { VendorBlackoutDTO } from "@/server/queries/vendor";
import { Calendar as DayPickerCalendar } from "@/components/harikita/ui";

/**
 * Kalender Blackout Vendor (client component).
 *
 * `dbBlackouts` berasal dari database (VendorAvailability status BLACKED_OUT).
 * Bila kosong / belum ada vendor ter-resolve, UI jatuh ke mock store.
 */
export function VendorKalenderClient({
  dbBlackouts,
  vendorResolved,
}: {
  dbBlackouts: VendorBlackoutDTO[];
  vendorResolved: boolean;
}) {
  const router = useRouter();
  const currentVendorName = "Griya Busana Rarasati";
  const availabilityState = useAvailability();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  // Sumber blackout: DB (bila vendor ter-resolve) → mock store.
  const mockBlackouts = availabilityStore.getVendorBlackouts(currentVendorName);
  const blackouts: Array<{ date: string; reason: string }> = vendorResolved
    ? dbBlackouts.map((b) => ({ date: b.date, reason: b.reason }))
    : mockBlackouts.map((b) => ({ date: b.date, reason: b.reason }));

  const [newDate, setNewDate] = useState("");
  const [reason, setReason] = useState("Sudah Dipesan Offline");

  const handleAddDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;

    if (vendorResolved) {
      startTransition(async () => {
        const res = await addBlackoutAction({ date: newDate, reason });
        if (res.success) {
          setMessage(null);
          setNewDate("");
          router.refresh();
        } else {
          setMessage(res.message || "Gagal mengunci tanggal.");
        }
      });
    } else {
      availabilityStore.addBlackout({ vendorName: currentVendorName, date: newDate, reason });
      setNewDate("");
    }
  };

  const handleRemoveDate = (d: string) => {
    if (vendorResolved) {
      startTransition(async () => {
        const res = await removeBlackoutAction({ date: d });
        if (res.success) {
          setMessage(null);
          router.refresh();
        } else {
          setMessage(res.message || "Gagal membuka kunci tanggal.");
        }
      });
    } else {
      availabilityStore.removeBlackout(currentVendorName, d);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#4A2E35] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs text-[#6B5E62] flex items-center gap-1 mb-1">
              <Link href="/dashboard/vendor" className="hover:text-[#4A2E35]">
                Portal Mitra Vendor
              </Link>
              <span>/</span>
              <span className="text-[#4A2E35] font-medium">Kalender Blackout</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A2E35]">
              Kalender Blackout Dates
            </h1>
            <p className="text-xs text-[#6B5E62] mt-0.5">
              Kunci tanggal di mana jadwal Anda sudah terisi di luar platform HariKita atau saat libur operasional.
            </p>
          </div>

          <Link
            href="/hub-koordinasi"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4A2E35] text-white text-xs font-semibold hover:bg-[#6B5E62] transition-colors shadow-sm self-start"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            Cek Matriks Ketersediaan
          </Link>
        </div>

        {/* Lock Date Form Card */}
        <div className="bg-white rounded-2xl border border-[#C5A880]/30 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#FAF8F5] pb-3">
            <Lock className="w-5 h-5 text-[#C5A880]" />
            <h3 className="font-serif text-base font-bold text-[#4A2E35]">
              Kunci Tanggal Offline Baru
            </h3>
          </div>

          <form onSubmit={handleAddDate} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[#4A2E35] font-semibold mb-1">
                Tanggal Terpilih: <span className="text-red-500">*</span>
              </label>
              <div
                className={`w-full flex items-center justify-between gap-2 rounded-xl border p-2.5 min-h-[44px] ${
                  newDate
                    ? "border-[#C5A880]/60 bg-white text-[#4A2E35]"
                    : "border-dashed border-[#E5D7C7] bg-[#FAF8F5] text-[#6B5E62]"
                }`}
                aria-live="polite"
              >
                <span className="flex items-center gap-2 font-medium">
                  <Calendar className="w-4 h-4 text-[#C5A880] shrink-0" />
                  {newDate ? (
                    <span className="font-mono">{newDate}</span>
                  ) : (
                    <span className="italic">Pilih tanggal di kalender →</span>
                  )}
                </span>
                {newDate && (
                  <button
                    type="button"
                    onClick={() => setNewDate("")}
                    className="text-[#6B5E62] hover:text-[#4A2E35] transition-colors"
                    title="Kosongkan pilihan tanggal"
                    aria-label="Kosongkan pilihan tanggal"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-[#4A2E35] font-semibold mb-1">
                Alasan Penguncian:
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880]"
              >
                <option value="Sudah Dipesan Offline">Sudah Dipesan Offline</option>
                <option value="Libur Kru / Istirahat">Libur Kru / Istirahat</option>
                <option value="Acara Keluarga Internal">Acara Keluarga Internal</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 px-4 rounded-xl bg-[#4A2E35] text-white font-semibold hover:bg-[#6B5E62] transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5 text-[#C5A880]" />
                {isPending ? "Menyimpan..." : "Kunci Tanggal Ini"}
              </button>
            </div>
          </form>
          {message && (
            <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4" />
              <span>{message}</span>
            </div>
          )}
        </div>

        {/* Visual Interactive Month Calendar & Blackout Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col items-center gap-2">
            <div className="w-full text-center">
              <h3 className="font-serif text-base font-bold text-[#4A2E35]">
                Pilih Tanggal
              </h3>
              <p className="text-[11px] text-[#6B5E62]">
                Klik tanggal untuk mengisi formulir kunci di atas. Tanggal merah sudah terkunci.
              </p>
            </div>
            <DayPickerCalendar
              selected={newDate}
              onSelect={(d) => setNewDate(d)}
              blackoutDates={blackouts.map((b) => b.date)}
              className="w-full"
            />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-[#C5A880]/30 shadow-sm p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-[#FAF8F5] pb-3">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#4A2E35]">
                    Daftar Tanggal Terkunci ({blackouts.length} Tanggal)
                  </h3>
                  <span className="text-xs text-[#6B5E62]">
                    Calon pengantin tidak dapat memesan jadwal pada tanggal ini.
                  </span>
                </div>
              </div>

              {blackouts.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#6B5E62]">
                  Belum ada tanggal yang dikunci offline. Seluruh tanggal di kalender terbuka untuk pemesanan klien.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
            {blackouts.map((item) => (
              <div
                key={`${item.date}`}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5D7C7] text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#4A2E35] block font-mono text-sm">
                      {item.date}
                    </strong>
                    <span className="text-[11px] text-[#6B5E62]">{item.reason}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveDate(item.date)}
                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1 text-[11px]"
                  title="Buka kembali tanggal ini"
                >
                  <Unlock className="w-3.5 h-3.5" /> Buka Kunci
                </button>
              </div>
            ))}
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
