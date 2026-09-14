"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Scissors,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useOrders } from "@/lib/order-store";

interface PhysicalSession {
  id: string;
  title: string;
  vendor: string;
  category: string;
  date: string;
  time: string;
  location: string;
  status: "COMPLETED" | "CONFIRMED" | "SCHEDULED" | "RESCHEDULE_REQUESTED";
  statusLabel: string;
  notes: string;
  icon: any;
  mapsUrl: string;
}

export default function ClientJadwalPage() {
  const [activeTab, setActiveTab] = useState<"sessions" | "rundown">("sessions");
  const { orders } = useOrders();

  // Active order fallback or latest booked order
  const activeOrder = orders[0] || {
    id: "HKB-2026-001",
    customerName: "Aditya & Larasati",
    eventDate: "2026-10-18",
    eventLocation: "Pendopo Ronggowarsito Kebumen",
    items: [],
  };

  // State: Dynamic Physical Sessions
  const [sessions, setSessions] = useState<PhysicalSession[]>([
    {
      id: "ses-1",
      title: "Fitting Pertama Busana Pengantin (1st Fitting)",
      vendor: "Griya Busana Rarasati",
      category: "Busana Pengantin",
      date: "15 September 2026",
      time: "10:00 - 12:00 WIB",
      location: "Studio Rarasati, Jl. Pahlawan No. 12, Kebumen",
      status: "COMPLETED",
      statusLabel: "Selesai Sesi",
      notes: "Pengukuran badan mempelai pria & wanita selesai, penyesuaian kain jarik.",
      icon: Scissors,
      mapsUrl: "https://maps.google.com/?q=Kebumen",
    },
    {
      id: "ses-2",
      title: "Pengiriman Sample Box Test Food Katering",
      vendor: "Dapur Rasa Boga Kebumen",
      category: "Katering",
      date: "28 September 2026",
      time: "11:30 WIB",
      location: "Kediaman Mempelai Wanita (Perum Kebumen Indah B-12)",
      status: "CONFIRMED",
      statusLabel: "Terkonfirmasi",
      notes: "Pengantaran sample box 5 menu utama & es dawet ireng butuh untuk dicicipi keluarga.",
      icon: Calendar,
      mapsUrl: "https://maps.google.com/?q=Kebumen",
    },
    {
      id: "ses-3",
      title: "Fitting Final Busana & Seragam Orang Tua",
      vendor: "Griya Busana Rarasati",
      category: "Busana Pengantin",
      date: "10 Oktober 2026",
      time: "14:00 - 16:00 WIB",
      location: "Studio Rarasati, Jl. Pahlawan No. 12, Kebumen",
      status: "SCHEDULED",
      statusLabel: "Terjadwal",
      notes: "Pengecekan akhir kebaya akad, beskap resepsi, dan seragam kedua belah pihak orang tua.",
      icon: Scissors,
      mapsUrl: "https://maps.google.com/?q=Kebumen",
    },
  ]);

  // Modal Reschedule State
  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean;
    sessionId: string;
    newDate: string;
    reason: string;
  }>({
    isOpen: false,
    sessionId: "",
    newDate: "",
    reason: "",
  });

  const handleConfirmAttendance = (id: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: "CONFIRMED",
              statusLabel: "Kehadiran Dikonfirmasi",
            }
          : s
      )
    );
  };

  const handleOpenReschedule = (session: PhysicalSession) => {
    setRescheduleModal({
      isOpen: true,
      sessionId: session.id,
      newDate: "",
      reason: "",
    });
  };

  const handleSubmitReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleModal.newDate) return;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === rescheduleModal.sessionId
          ? {
              ...s,
              date: rescheduleModal.newDate,
              status: "RESCHEDULE_REQUESTED",
              statusLabel: "Pengajuan Reschedule Terkirim",
              notes: `Permintaan reschedule: ${rescheduleModal.reason || "Menyesuaikan jam kerja"}. Menunggu konfirmasi vendor.`,
            }
          : s
      )
    );
    setRescheduleModal({ isOpen: false, sessionId: "", newDate: "", reason: "" });
  };

  // Dynamic Rundown Hari H mapped from active order items
  const dynamicRundown = [
    {
      time: "04:30 - 06:30 WIB",
      activity: "MUA Standby & Makeup Pengantin + Ibu",
      vendor: "Alula MUA & Hijab Styling",
      location: "Ruang Rias Lokasi Acara",
      role: "MUA",
    },
    {
      time: "05:30 - 07:00 WIB",
      activity: "Dokumentasi Detail Gaun, Kotak Mahar & Flatlay Cincin",
      vendor: "Pradana Cinema & Story",
      location: activeOrder.eventLocation,
      role: "Foto-Video",
    },
    {
      time: "06:30 - 07:30 WIB",
      activity: "Fitting Final & Pasang Ronce Melati Asli",
      vendor: "Griya Busana Rarasati",
      location: "Ruang Rias Mempelai",
      role: "Busana",
    },
    {
      time: "07:30 - 08:30 WIB",
      activity: "Prosesi Ijab Kabul / Akad Nikah Khidmat",
      vendor: "Seluruh Vendor Terkoneksi Standby",
      location: `Meja Akad, ${activeOrder.eventLocation}`,
      role: "All In",
    },
    {
      time: "08:30 - 09:30 WIB",
      activity: "Sesi Foto Formal Buku Nikah & Keluarga Inti",
      vendor: "Pradana Cinema & Story",
      location: "Pelaminan Adat",
      role: "Foto",
    },
    {
      time: "09:30 - 13:00 WIB",
      activity: "Ramah Tamah Resepsi, Pembukaan Prasmanan & Live Music",
      vendor: "Dapur Rasa Boga Kebumen",
      location: "Area Jamuan Tamu",
      role: "Katering",
    },
    {
      time: "13:00 - 14:00 WIB",
      activity: "Penyerahan Souvenir & Serah Terima Box Flashdisk Liputan",
      vendor: "Pradana Cinema & Story",
      location: activeOrder.eventLocation,
      role: "Dokumentasi",
    },
  ];

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
            <span className="text-hk-charcoal font-semibold">Jadwal Sesi &amp; Hari H</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-hk-charcoal leading-tight">
            Pelacak Sesi Fisik &amp; Rundown Hari H
          </h1>
          <p className="text-xs sm:text-sm font-manrope text-hk-charcoal/80 mt-1 leading-relaxed">
            Kelola sesi fitting di Kebumen, pengantaran sample box test food, dan susunan rundown hari H terkoordinasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/hub-koordinasi?orderId=${activeOrder.id}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-hk-taupe text-white text-xs font-manrope font-semibold hover:bg-[#78644e] transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-hk-champagne" />
            <span>Radar Hub Koordinasi</span>
          </Link>
        </div>
      </div>

      {/* Info Card Active Order */}
      <div className="bg-white rounded-3xl border border-hk-champagne/40 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-manrope uppercase tracking-wider font-bold text-hk-taupe">
            Acara Terkoneksi ({activeOrder.id})
          </span>
          <h2 className="font-editorial text-2xl font-normal text-hk-charcoal">
            {activeOrder.customerName}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs font-manrope text-hk-charcoal/80">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-hk-taupe" />
              <span>Hari H: <strong className="font-semibold text-hk-charcoal">{activeOrder.eventDate}</strong></span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-hk-taupe" />
              <span>{activeOrder.eventLocation}</span>
            </span>
          </div>
        </div>

        <Link
          href={`/pesanan/${activeOrder.id}/invoice`}
          className="px-4 py-2 rounded-full bg-hk-soft-beige/50 border border-hk-champagne/60 text-hk-charcoal text-xs font-manrope font-semibold hover:bg-white transition-colors self-start sm:self-auto shrink-0 flex items-center gap-1.5 shadow-2xs"
        >
          Lihat Invoice Resmi
        </Link>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 border-b border-hk-champagne/30 pb-3">
        <button
          onClick={() => setActiveTab("sessions")}
          className={`px-5 py-2.5 rounded-full text-xs font-manrope transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "sessions"
              ? "bg-hk-charcoal text-white font-bold shadow-xs"
              : "border border-hk-champagne/50 text-hk-charcoal/75 hover:bg-hk-soft-beige/40 hover:text-hk-charcoal font-medium"
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>3 Sesi Fisik Wajib (Fitting &amp; Test Food)</span>
        </button>
        <button
          onClick={() => setActiveTab("rundown")}
          className={`px-5 py-2.5 rounded-full text-xs font-manrope transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "rundown"
              ? "bg-hk-charcoal text-white font-bold shadow-xs"
              : "border border-hk-champagne/50 text-hk-charcoal/75 hover:bg-hk-soft-beige/40 hover:text-hk-charcoal font-medium"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Rundown Hari H Otomatis ({activeOrder.eventDate})</span>
        </button>
      </div>

      {activeTab === "sessions" ? (
        /* TAB 1: Sesi Fisik List */
        <div className="space-y-4">
          {sessions.map((ses) => {
            const IconComponent = ses.icon;
            return (
              <div
                key={ses.id}
                className="bg-white rounded-3xl border border-hk-champagne/40 shadow-xs p-6 space-y-4 relative overflow-hidden transition-all hover:border-hk-taupe"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-hk-soft-beige/50 border border-hk-champagne/40 flex items-center justify-center text-hk-charcoal shrink-0">
                      <IconComponent className="w-6 h-6 text-hk-taupe" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-manrope uppercase tracking-wider font-bold text-hk-taupe bg-hk-soft-beige/60 px-2.5 py-0.5 rounded-full border border-hk-champagne/40">
                          {ses.category}
                        </span>
                        <span className="text-xs font-manrope text-hk-charcoal/70">Mitra: {ses.vendor}</span>
                      </div>
                      <h3 className="font-editorial text-2xl font-normal text-hk-charcoal mt-1">
                        {ses.title}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-manrope font-semibold self-start sm:self-center shrink-0 ${
                      ses.status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : ses.status === "CONFIRMED"
                        ? "bg-blue-50 text-blue-800 border border-blue-200"
                        : ses.status === "RESCHEDULE_REQUESTED"
                        ? "bg-purple-50 text-purple-800 border border-purple-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {ses.statusLabel}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-manrope text-hk-charcoal/80 pt-2 border-t border-hk-soft-beige/60">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-hk-taupe shrink-0" />
                    <span className="font-manrope tabular-nums">{ses.date} • {ses.time}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-4 h-4 text-hk-taupe shrink-0" />
                      <span className="truncate">{ses.location}</span>
                    </div>
                    <a
                      href={ses.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-hk-taupe hover:underline font-semibold flex items-center gap-0.5 shrink-0"
                    >
                      Peta <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-hk-soft-beige/30 border border-hk-champagne/30 text-xs font-manrope text-hk-charcoal/80">
                  <strong className="text-hk-charcoal block mb-0.5 font-semibold">Catatan Teknis Sesi:</strong>
                  {ses.notes}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-hk-soft-beige/60">
                  {ses.status !== "COMPLETED" && (
                    <>
                      <button
                        onClick={() => handleOpenReschedule(ses)}
                        className="px-4 py-2 rounded-full border border-hk-champagne/60 text-hk-charcoal hover:bg-hk-soft-beige/40 text-xs font-manrope font-semibold transition-colors cursor-pointer"
                      >
                        Ajukan Reschedule
                      </button>
                      {ses.status !== "CONFIRMED" && (
                        <button
                          onClick={() => handleConfirmAttendance(ses.id)}
                          className="px-4 py-2 rounded-full bg-hk-charcoal text-white hover:bg-hk-taupe text-xs font-manrope font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-hk-champagne" />
                          <span>Konfirmasi Kehadiran</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TAB 2: Rundown Hari H */
        <div className="bg-white rounded-3xl border border-hk-champagne/40 shadow-xs p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-hk-champagne/30 pb-4 gap-2">
            <div>
              <h3 className="font-editorial text-2xl font-normal text-hk-charcoal">
                Susunan Rundown Sinkron Multi-Vendor
              </h3>
              <p className="text-xs font-manrope text-hk-charcoal/70 mt-0.5">
                Sinkron secara otomatis ke jam hadir (call time) dashboard masing-masing vendor yang dipesan.
              </p>
            </div>
            <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-manrope font-semibold border border-emerald-200 self-start sm:self-auto">
              Status: Seluruh Vendor Standby
            </span>
          </div>

          <div className="space-y-3">
            {dynamicRundown.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-hk-soft-beige/25 border border-hk-champagne/30 gap-2 text-xs font-manrope hover:bg-white transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span className="font-manrope tabular-nums font-bold text-hk-charcoal bg-white px-3 py-1.5 rounded-lg border border-hk-champagne/40 shrink-0 text-xs shadow-2xs">
                    {item.time}
                  </span>
                  <div>
                    <strong className="text-hk-charcoal block text-sm font-semibold">
                      {item.activity}
                    </strong>
                    <span className="text-hk-charcoal/70 text-[11px]">
                      Lokasi: {item.location}
                    </span>
                  </div>
                </div>
                <div className="text-right text-[11px] font-manrope font-semibold text-hk-taupe self-end sm:self-center shrink-0">
                  {item.vendor}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-hk-champagne/60 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-hk-champagne/30 pb-3">
              <h3 className="font-editorial text-2xl font-normal text-hk-charcoal">
                Ajukan Reschedule Sesi Fisik
              </h3>
              <button
                onClick={() => setRescheduleModal({ isOpen: false, sessionId: "", newDate: "", reason: "" })}
                className="text-hk-charcoal/60 hover:text-hk-charcoal text-sm p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReschedule} className="space-y-4 text-xs font-manrope">
              <div>
                <label className="block text-hk-charcoal font-semibold mb-1">
                  Pilih Tanggal Baru:
                </label>
                <input
                  type="date"
                  required
                  value={rescheduleModal.newDate}
                  onChange={(e) =>
                    setRescheduleModal((prev) => ({ ...prev, newDate: e.target.value }))
                  }
                  className="w-full p-3 rounded-xl border border-hk-champagne/60 focus:outline-none focus:border-hk-taupe focus-visible:ring-2 focus-visible:ring-hk-charcoal bg-hk-ivory/50"
                />
              </div>

              <div>
                <label className="block text-hk-charcoal font-semibold mb-1">
                  Alasan Perubahan Jadwal:
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Menyesuaikan jam kerja atau jadwal cuti keluarga..."
                  value={rescheduleModal.reason}
                  onChange={(e) =>
                    setRescheduleModal((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  className="w-full p-3 rounded-xl border border-hk-champagne/60 focus:outline-none focus:border-hk-taupe focus-visible:ring-2 focus-visible:ring-hk-charcoal bg-hk-ivory/50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-hk-champagne/30">
                <button
                  type="button"
                  onClick={() => setRescheduleModal({ isOpen: false, sessionId: "", newDate: "", reason: "" })}
                  className="px-4 py-2 rounded-full border border-hk-champagne/60 text-hk-charcoal hover:bg-hk-soft-beige/40 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-hk-taupe text-white font-semibold hover:bg-[#78644e] transition-colors shadow-xs cursor-pointer"
                >
                  Kirimkan Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
