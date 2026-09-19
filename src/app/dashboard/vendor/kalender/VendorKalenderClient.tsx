"use client";

import React, { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Lock,
  Unlock,
  AlertCircle,
  Filter,
  History,
  Sparkles,
} from "lucide-react";
import { useAvailability, availabilityStore } from "@/lib/availability-store";
import { addBlackoutAction, removeBlackoutAction } from "@/server/actions/vendor";
import type { VendorBlackoutDTO } from "@/server/queries/vendor";
import { Calendar as DayPickerCalendar, Modal } from "@/components/harikita/ui";

/** Tanggal hari ini dalam format kanonikal "YYYY-MM-DD" (waktu lokal). */
function todayYmd(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

type ListFilter = "all" | "upcoming" | "history";

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

  // Pop-up konfirmasi buka kunci.
  const [confirmRemoveDate, setConfirmRemoveDate] = useState<string | null>(null);

  // Filter daftar tanggal terkunci: Semua / Akan Datang / Riwayat.
  const [listFilter, setListFilter] = useState<ListFilter>("all");

  const today = useMemo(() => todayYmd(), []);

  // Riwayat = tanggal yang sudah lewat (< hari ini). Tanggal lewat tidak bisa
  // dipilih untuk dikunci, namun tetap tampil di kalender & daftar sebagai arsip.
  const isPast = (date: string) => date < today;

  const sortedBlackouts = useMemo(
    () => [...blackouts].sort((a, b) => a.date.localeCompare(b.date)),
    [blackouts]
  );

  const filteredBlackouts = useMemo(() => {
    if (listFilter === "upcoming") return sortedBlackouts.filter((b) => !isPast(b.date));
    if (listFilter === "history") return sortedBlackouts.filter((b) => isPast(b.date));
    return sortedBlackouts;
  }, [sortedBlackouts, listFilter, today]);

  const upcomingCount = sortedBlackouts.filter((b) => !isPast(b.date)).length;
  const historyCount = sortedBlackouts.filter((b) => isPast(b.date)).length;

  const handleAddDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;

    // Tolak tanggal lampau (validasi klien; server tetap otoritatif).
    if (isPast(newDate)) {
      setMessage("Tanggal yang sudah terlewat tidak dapat dikunci.");
      return;
    }

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

  const executeRemoveDate = (d: string) => {
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
    setConfirmRemoveDate(null);
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

          <form onSubmit={handleAddDate} className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs items-start">
            {/* Kalender pemilih tanggal (daypicker) — menggantikan slot "Tanggal Terpilih" */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[#4A2E35] font-semibold">
                  Pilih Tanggal: <span className="text-red-500">*</span>
                </label>
                {newDate ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#4A2E35] bg-[#FAF8F5] border border-[#C5A880]/40 px-2.5 py-1 rounded-lg">
                    <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
                    {newDate}
                    <button
                      type="button"
                      onClick={() => setNewDate("")}
                      className="text-[#6B5E62] hover:text-[#4A2E35] transition-colors"
                      title="Kosongkan pilihan tanggal"
                      aria-label="Kosongkan pilihan tanggal"
                    >
                      ✕
                    </button>
                  </span>
                ) : (
                  <span className="text-[11px] italic text-[#6B5E62]">
                    Belum ada tanggal dipilih
                  </span>
                )}
              </div>
              <div className="flex justify-center rounded-2xl border border-[#E5D7C7] bg-[#FAF8F5] p-2">
                <DayPickerCalendar
                  bare
                  selected={newDate}
                  onSelect={(d) => setNewDate(d)}
                  blackoutDates={blackouts.map((b) => b.date)}
                  minDate={today}
                  className="max-w-md"
                />
              </div>
              <p className="mt-2 text-[11px] text-[#6B5E62] leading-relaxed">
                Klik tanggal untuk dipilih. Tanggal merah sudah terkunci; tanggal lampau
                (redup) hanya sebagai riwayat dan tidak bisa dikunci.
              </p>
            </div>

            {/* Panel alasan + aksi */}
            <div className="lg:col-span-1 space-y-3">
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
              <button
                type="submit"
                disabled={isPending || !newDate}
                className="w-full py-3 px-4 rounded-xl bg-[#4A2E35] text-white font-semibold hover:bg-[#6B5E62] transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Daftar Tanggal Terkunci */}
        <div className="bg-white rounded-2xl border border-[#C5A880]/30 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-[#FAF8F5] pb-3">
            <div>
              <h3 className="font-serif text-base font-bold text-[#4A2E35]">
                Daftar Tanggal Terkunci ({filteredBlackouts.length} Tanggal)
              </h3>
              <span className="text-xs text-[#6B5E62]">
                Calon pengantin tidak dapat memesan jadwal pada tanggal ini.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Filter className="w-3.5 h-3.5 text-[#6B5E62]" />
              <select
                value={listFilter}
                onChange={(e) => setListFilter(e.target.value as ListFilter)}
                className="p-2 rounded-xl border border-[#E5D7C7] text-xs text-[#4A2E35] focus:outline-none focus:border-[#C5A880]"
                aria-label="Filter daftar tanggal terkunci"
              >
                <option value="all">Semua ({sortedBlackouts.length})</option>
                <option value="upcoming">Akan Datang ({upcomingCount})</option>
                <option value="history">Riwayat ({historyCount})</option>
              </select>
            </div>
          </div>

          {filteredBlackouts.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#6B5E62]">
              {listFilter === "history"
                ? "Belum ada riwayat tanggal terkunci yang terlewat."
                : "Belum ada tanggal yang dikunci offline. Seluruh tanggal di kalender terbuka untuk pemesanan klien."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
              {filteredBlackouts.map((item) => {
                const past = isPast(item.date);
                return (
                  <div
                    key={`${item.date}`}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-xs ${
                      past
                        ? "bg-[#F3EFEA] border-[#E5D7C7] opacity-80"
                        : "bg-[#FAF8F5] border-[#E5D7C7]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          past ? "bg-[#E5D7C7] text-[#6B5E62]" : "bg-red-100 text-red-800"
                        }`}
                      >
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-[#4A2E35] block font-mono text-sm">
                          {item.date}
                        </strong>
                        <span className="text-[11px] text-[#6B5E62]">
                          {item.reason}
                          {past && (
                            <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] text-[#8A7A66]">
                              <History className="w-3 h-3" /> Riwayat
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {past ? (
                      <span
                        className="p-1.5 rounded-lg text-[#8A7A66] text-[11px] cursor-default"
                        title="Tanggal lampau tidak dapat dibuka kuncinya"
                      >
                        Terlewat
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmRemoveDate(item.date)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1 text-[11px]"
                        title="Buka kembali tanggal ini"
                      >
                        <Unlock className="w-3.5 h-3.5" /> Buka Kunci
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pop-up konfirmasi buka kunci */}
      <Modal
        isOpen={confirmRemoveDate !== null}
        onClose={() => setConfirmRemoveDate(null)}
        title="Buka Kunci Tanggal?"
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmRemoveDate(null)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#E5D7C7] text-[#4A2E35] text-sm font-semibold hover:bg-[#FAF8F5] transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => confirmRemoveDate && executeRemoveDate(confirmRemoveDate)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <Unlock className="w-3.5 h-3.5" /> Ya, Buka Kunci
            </button>
          </>
        }
      >
        <p className="text-sm text-[#4A2E35] leading-relaxed">
          Buka kunci tanggal{" "}
          <strong className="font-mono">{confirmRemoveDate}</strong>?
        </p>
        <p className="mt-2 text-xs text-[#6B5E62] leading-relaxed">
          Setelah dibuka, tanggal ini akan tersedia kembali dan dapat dipesan oleh calon
          pengantin di platform HariKita.
        </p>
      </Modal>
    </div>
  );
}
