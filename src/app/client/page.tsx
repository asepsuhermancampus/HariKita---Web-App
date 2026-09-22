"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import {
  FileText,
  Calendar,
  CreditCard,
  CheckCircle2,
  Check,
  Clock,
  ExternalLink,
  Phone,
  Sparkles,
  Scissors,
  MapPin,
  ShieldCheck,
  User,
} from "lucide-react";
import { DashPageHeader } from "@/components/dashboard";

export default function ClientPortalPage() {
  const [activeTab, setActiveTab] = useState<"invoices" | "sessions" | "contract">("invoices");

  const mockOrder = {
    orderNumber: "HK-KBM-202611-001",
    clientName: "Bima & Citra",
    eventDate: "2026-11-20",
    venue: "Gedung Pertemuan Setda Kebumen",
    totalAmount: 16800000,
    dpAmount: 5040000, // 30%
    settlementAmount: 11760000, // 70%
    status: "CONFIRMED",
    dpStatus: "PAID",
    settlementStatus: "HOLD_IN_ESCROW",
  };

  const mockSessions = [
    {
      id: "ses-1",
      title: "Sesi 1: Fitting Pertama Busana Pengantin",
      vendor: "Griya Busana Rarasati Kebumen",
      scheduledDate: "2026-10-15",
      status: "COMPLETED",
      location: "Studio Rarasati, Jl. Pahlawan No. 12, Kebumen",
      notes: "Pengukuran badan mempelai pria & wanita selesai, penyesuaian kain jarik.",
      icon: Scissors,
    },
    {
      id: "ses-2",
      title: "Sesi 2: Pengiriman Sample Test Food Katering",
      vendor: "Dapur Rasa Boga Kebumen",
      scheduledDate: "2026-10-28",
      status: "SCHEDULED",
      location: "Kediaman Mempelai Wanita (Perum Kebumen Indah B-12)",
      notes: "Pengantaran sample box 5 menu utama & es dawet ireng butuh untuk dicicipi keluarga.",
      icon: Calendar,
    },
    {
      id: "ses-3",
      title: "Sesi 3: Final Fitting Busana & Seragam Orang Tua",
      vendor: "Griya Busana Rarasati Kebumen",
      scheduledDate: "2026-11-10",
      status: "SCHEDULED",
      location: "Studio Rarasati, Jl. Pahlawan No. 12, Kebumen",
      notes: "Pengecekan akhir kebaya akad, beskap resepsi, dan seragam kedua belah pihak orang tua.",
      icon: Scissors,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <DashPageHeader
        title={`Pusat Pesanan: ${mockOrder.clientName}`}
        description={`Kode Booking ${mockOrder.orderNumber} • Acara ${mockOrder.eventDate} di ${mockOrder.venue}`}
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/client/profil"
              className="flex min-h-11 items-center gap-2 rounded-full border border-hk-champagne/60 bg-white px-4 text-xs font-semibold text-hk-charcoal hover:bg-hk-soft-beige/40"
            >
              <User className="w-3.5 h-3.5 text-hk-taupe" />
              <span>Kelola Profil Data Diri</span>
            </Link>
            <Link
              href="/undangan/bima-citra"
              target="_blank"
              className="flex min-h-11 items-center gap-2 rounded-full border border-hk-champagne/60 bg-white px-4 text-xs font-semibold text-hk-charcoal hover:bg-hk-soft-beige/40"
            >
              <ExternalLink className="w-3.5 h-3.5 text-hk-taupe" />
              <span>Buka Undangan Web Anda</span>
            </Link>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-hk-champagne/30 pb-3">
        <button
          onClick={() => setActiveTab("invoices")}
          className={`px-5 py-2.5 rounded-full text-xs font-manrope transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "invoices"
              ? "bg-hk-charcoal text-white font-bold shadow-sm"
              : "border border-hk-champagne/50 text-hk-charcoal/75 hover:bg-hk-soft-beige/40 hover:text-hk-charcoal font-medium"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Invoice &amp; Rekening Bersama</span>
        </button>

        <button
          onClick={() => setActiveTab("sessions")}
          className={`px-5 py-2.5 rounded-full text-xs font-manrope transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "sessions"
              ? "bg-hk-charcoal text-white font-bold shadow-sm"
              : "border border-hk-champagne/50 text-hk-charcoal/75 hover:bg-hk-soft-beige/40 hover:text-hk-charcoal font-medium"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Jadwal 2x Fitting &amp; Test Food ({mockSessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("contract")}
          className={`px-5 py-2.5 rounded-full text-xs font-manrope transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "contract"
              ? "bg-hk-charcoal text-white font-bold shadow-sm"
              : "border border-hk-champagne/50 text-hk-charcoal/75 hover:bg-hk-soft-beige/40 hover:text-hk-charcoal font-medium"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Kontrak Kerja Digital (SLA)</span>
        </button>
      </div>

      {/* TAB 1: INVOICES & ESCROW */}
      {activeTab === "invoices" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-fadeIn">
          {/* DP 30% Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-manrope font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Termin 1: DP 30%
              </span>
              <span className="flex items-center gap-1.5 text-xs font-manrope font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Terverifikasi Lunas</span>
              </span>
            </div>

            <div>
              <span className="text-xs font-manrope text-hk-charcoal/70">Nominal Uang Muka:</span>
              <p className="font-manrope tabular-nums text-3xl font-bold text-hk-charcoal mt-1">
                {formatRupiah(mockOrder.dpAmount)}
              </p>
            </div>

            <p className="text-xs sm:text-sm font-manrope text-hk-charcoal/80 leading-relaxed">
              Mengunci tanggal seluruh vendor di Kebumen. Dana disimpan di Rekening Bersama HariKita dan dicairkan 30% ke vendor pada H-3 acara untuk modal operasional belanja.
            </p>

            <div className="p-4 rounded-2xl bg-hk-soft-beige/30 border border-hk-champagne/30 text-xs font-manrope text-hk-charcoal space-y-2">
              <div className="flex justify-between">
                <span className="text-hk-charcoal/70">Tanggal Bayar:</span>
                <span className="font-mono font-bold">12 Okt 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-hk-charcoal/70">Metode:</span>
                <span className="font-bold">Virtual Account Mandiri Escrow</span>
              </div>
            </div>
          </div>

          {/* Settlement 70% Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-hk-champagne/50 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-manrope font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                Termin 2: Pelunasan 70%
              </span>
              <span className="flex items-center gap-1.5 text-xs font-manrope font-bold text-amber-700">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Ditahan di Rekening Bersama</span>
              </span>
            </div>

            <div>
              <span className="text-xs font-manrope text-hk-charcoal/70">Nominal Pelunasan:</span>
              <p className="font-manrope tabular-nums text-3xl font-bold text-hk-charcoal mt-1">
                {formatRupiah(mockOrder.settlementAmount)}
              </p>
            </div>

            <p className="text-xs sm:text-sm font-manrope text-hk-charcoal/80 leading-relaxed">
              Pelunasan disetorkan H-7 acara dan <strong>DITAHAN SECARA AMAN</strong> di rekening escrow. Dana baru ditransfer ke vendor pada H+2 pasca-acara setelah Anda menekan tombol konfirmasi sukses.
            </p>

            <div className="pt-2">
              <Link
                href={`/pesanan/${mockOrder.orderNumber}/invoice`}
                className="w-full py-3 px-6 rounded-full bg-hk-charcoal hover:bg-hk-taupe text-white font-manrope font-bold text-xs shadow-sm transition-all block text-center"
              >
                Lihat Invoice Resmi &amp; Bukti Setor
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PHYSICAL SESSIONS (FITTING & TEST FOOD) */}
      {activeTab === "sessions" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockSessions.map((session) => {
              const Icon = session.icon;
              const isDone = session.status === "COMPLETED";

              return (
                <div
                  key={session.id}
                  className="p-6 rounded-3xl bg-white border border-hk-champagne/40 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-hk-soft-beige/50 border border-hk-champagne/40 flex items-center justify-center text-hk-charcoal">
                        <Icon className="w-5 h-5 text-hk-taupe" />
                      </div>
                      <span
                        className={`text-[10px] font-manrope font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          isDone
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {isDone ? "Selesai Sesi" : "Terjadwal"}
                      </span>
                    </div>

                    <h3 className="font-editorial text-2xl font-normal text-hk-charcoal leading-snug">
                      {session.title}
                    </h3>

                    <div className="space-y-1.5 text-xs font-manrope text-hk-charcoal/80">
                      <div className="flex items-center gap-1.5 font-semibold text-hk-charcoal">
                        <Calendar className="w-3.5 h-3.5 text-hk-taupe" />
                        <span>{session.scheduledDate}</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-hk-taupe shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{session.location}</span>
                      </div>
                    </div>

                    <p className="text-xs font-manrope text-hk-charcoal/80 italic bg-hk-soft-beige/30 p-3.5 rounded-xl border border-hk-champagne/25 leading-relaxed">
                      &ldquo;{session.notes}&rdquo;
                    </p>
                  </div>

                  <a
                    href="https://wa.me/6281234567890?text=Halo%20HariKita%2C%20saya%20ingin%20koordinasi%20sesi%20fitting%2Ftestfood"
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-4 rounded-full border border-hk-champagne/60 text-hk-charcoal font-manrope font-semibold text-xs hover:bg-hk-soft-beige/40 flex items-center justify-center gap-1.5 transition-all w-full mt-2"
                  >
                    <Phone className="w-3.5 h-3.5 text-hk-taupe" />
                    <span>Koordinasi via WhatsApp</span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DIGITAL CONTRACT */}
      {activeTab === "contract" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-hk-champagne/40 shadow-xs space-y-6 max-w-3xl mx-auto animate-fadeIn">
          <div className="flex items-center justify-between border-b border-hk-champagne/20 pb-4">
            <div>
              <span className="text-[10px] font-manrope font-bold uppercase tracking-wider text-hk-taupe">
                Perjanjian Kerja Sama Digital
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl font-normal text-hk-charcoal mt-0.5">
                Surat Kontrak &amp; Kesepakatan SLA Hari H
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-hk-charcoal bg-hk-soft-beige/60 border border-hk-champagne/40 px-3.5 py-1 rounded-full">
              KTR-KBM-2026-001
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-hk-soft-beige/30 border border-hk-champagne/30 text-xs sm:text-sm font-manrope text-hk-charcoal/80 space-y-3 leading-relaxed">
            <p>
              1. <strong>Para Pihak:</strong> Pihak Pertama (Klien: Bima &amp; Citra) dan Pihak Kedua (Konsorsium Vendor Terpilih HariKita Kabupaten Kebumen).
            </p>
            <p>
              2. <strong>Jaminan SLA:</strong> Seluruh vendor wajib hadir dan standby di venue minimal 2 jam sebelum acara dimulai. Katering wajib menyajikan makanan hangat tepat waktu pada pukul 11:00 WIB.
            </p>
            <p>
              3. <strong>Klausul Escrow:</strong> Pembayaran 70% pelunasan dilindungi oleh rekening bersama HariKita hingga H+2 pasca-acara.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-hk-champagne/20 text-xs font-manrope text-hk-charcoal text-center">
            <div className="p-5 rounded-2xl bg-white border border-hk-champagne/40 space-y-2">
              <span className="text-[10px] text-hk-taupe uppercase font-bold tracking-wider font-manrope">Tanda Tangan Klien</span>
              <div className="h-16 flex items-center justify-center font-editorial text-2xl italic text-hk-charcoal">
                Bima &amp; Citra
              </div>
              <span className="text-[11px] text-emerald-700 font-bold flex items-center justify-center gap-1 font-manrope">
                <Check className="h-3.5 w-3.5" /> Ditandatangani Digital
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-hk-champagne/40 space-y-2">
              <span className="text-[10px] text-hk-taupe uppercase font-bold tracking-wider font-manrope">Tanda Tangan Konsorsium Vendor</span>
              <div className="h-16 flex items-center justify-center font-editorial text-2xl italic text-hk-charcoal">
                HariKita Kebumen
              </div>
              <span className="text-[11px] text-emerald-700 font-bold flex items-center justify-center gap-1 font-manrope">
                <Check className="h-3.5 w-3.5" /> Terverifikasi Legal
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
