"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import {
  FileText,
  Calendar,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Phone,
  Sparkles,
  Scissors,
  Utensils,
  MapPin,
} from "lucide-react";

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
      icon: Utensils,
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold/25 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 text-gold-dark text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portal Klien Terintegrasi</span>
          </div>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl text-plum font-bold mt-2">
            Pusat Pesanan: {mockOrder.clientName}
          </h1>
          <p className="text-xs text-plum-light mt-1">
            Kode Booking: <span className="font-mono font-bold text-plum">{mockOrder.orderNumber}</span> • Acara: {mockOrder.eventDate} di {mockOrder.venue}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/undangan/bima-citra"
            target="_blank"
            className="btn btn-sm btn-outline border-gold/40 text-plum font-bold rounded-full hover:bg-gold/15 gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gold-dark" />
            <span>Buka Undangan Web Anda</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gold/20 pb-2">
        <button
          onClick={() => setActiveTab("invoices")}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "invoices"
              ? "gold-gradient-bg text-plum-dark shadow-sm"
              : "text-plum-light hover:bg-gold/10"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Invoice & Rekening Bersama</span>
        </button>

        <button
          onClick={() => setActiveTab("sessions")}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "sessions"
              ? "gold-gradient-bg text-plum-dark shadow-sm"
              : "text-plum-light hover:bg-gold/10"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Jadwal 2x Fitting & Test Food ({mockSessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("contract")}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "contract"
              ? "gold-gradient-bg text-plum-dark shadow-sm"
              : "text-plum-light hover:bg-gold/10"
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
          <div className="p-8 rounded-3xl bg-white border border-emerald-300 shadow-md space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                Termin 1: DP 30%
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>Terverifikasi Lunas</span>
              </span>
            </div>

            <div>
              <span className="text-xs text-plum-light">Nominal Uang Muka:</span>
              <p className="font-mono text-3xl font-bold text-plum">
                {formatRupiah(mockOrder.dpAmount)}
              </p>
            </div>

            <p className="text-xs text-plum-light leading-relaxed">
              Mengunci tanggal seluruh vendor di Kebumen. Dana disimpan di Rekening Bersama HariKita dan dicairkan 30% ke vendor pada H-3 acara untuk modal operasional belanja.
            </p>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-gold/20 text-[11px] text-plum space-y-1">
              <div className="flex justify-between">
                <span>Tanggal Bayar:</span>
                <span className="font-mono font-bold">12 Okt 2026</span>
              </div>
              <div className="flex justify-between">
                <span>Metode:</span>
                <span className="font-bold">Virtual Account Mandiri Escrow</span>
              </div>
            </div>
          </div>

          {/* Settlement 70% Card */}
          <div className="p-8 rounded-3xl bg-white border border-gold/40 shadow-md space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-dark bg-gold/15 px-3 py-1 rounded-full">
                Termin 2: Pelunasan 70%
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-700">
                <Clock className="w-4 h-4" />
                <span>Ditahan di Rekening Bersama</span>
              </span>
            </div>

            <div>
              <span className="text-xs text-plum-light">Nominal Pelunasan:</span>
              <p className="font-mono text-3xl font-bold text-plum">
                {formatRupiah(mockOrder.settlementAmount)}
              </p>
            </div>

            <p className="text-xs text-plum-light leading-relaxed">
              Pelunasan disetorkan H-7 acara dan <strong>DITAHAN SECARA AMAN</strong> di rekening escrow. Dana baru ditransfer ke vendor pada H+2 pasca-acara setelah Anda menekan tombol konfirmasi sukses.
            </p>

            <div className="pt-2">
              <button className="btn btn-sm w-full gold-gradient-bg text-plum-dark font-bold rounded-full border-none shadow-sm">
                Lihat Invoice Resmi & Bukti Setor
              </button>
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
                  className={`p-6 rounded-3xl bg-white border shadow-sm space-y-4 flex flex-col justify-between ${
                    isDone ? "border-emerald-300" : "border-gold/30"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-gold/15 flex items-center justify-center text-gold-dark">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          isDone
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isDone ? "Selesai Sesi" : "Terjadwal"}
                      </span>
                    </div>

                    <h3 className="font-serif-luxury text-lg font-bold text-plum">
                      {session.title}
                    </h3>

                    <div className="space-y-1 text-xs text-plum-light">
                      <div className="flex items-center gap-1.5 font-bold text-plum">
                        <Calendar className="w-3.5 h-3.5 text-gold-dark" />
                        <span>{session.scheduledDate}</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gold-dark shrink-0 mt-0.5" />
                        <span className="leading-snug">{session.location}</span>
                      </div>
                    </div>

                    <p className="text-xs text-plum-light/90 italic bg-[#FAF8F5] p-3 rounded-xl border border-gold/15">
                      &ldquo;{session.notes}&rdquo;
                    </p>
                  </div>

                  <a
                    href="https://wa.me/6281234567890?text=Halo%20HariKita%2C%20saya%20ingin%20koordinasi%20sesi%20fitting%2Ftestfood"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-xs btn-outline border-gold/40 text-plum font-bold rounded-full w-full"
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    Koordinasi via WhatsApp
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DIGITAL CONTRACT */}
      {activeTab === "contract" && (
        <div className="p-8 rounded-3xl bg-white border border-gold/30 shadow-md space-y-6 max-w-3xl mx-auto animate-fadeIn">
          <div className="flex items-center justify-between border-b border-gold/20 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark">
                Perjanjian Kerja Sama Digital
              </span>
              <h3 className="font-serif-luxury text-2xl font-bold text-plum">
                Surat Kontrak & Kesepakatan SLA Hari H
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-plum bg-gold/15 px-3 py-1 rounded-full">
              KTR-KBM-2026-001
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-gold/20 text-xs text-plum-light space-y-3 leading-relaxed">
            <p>
              1. <strong>Para Pihak:</strong> Pihak Pertama (Klien: Bima & Citra) dan Pihak Kedua (Konsorsium Vendor Terpilih HariKita Kabupaten Kebumen).
            </p>
            <p>
              2. <strong>Jaminan SLA:</strong> Seluruh vendor wajib hadir dan standby di venue minimal 2 jam sebelum acara dimulai. Katering wajib menyajikan makanan hangat tepat waktu pada pukul 11:00 WIB.
            </p>
            <p>
              3. <strong>Klausul Escrow:</strong> Pembayaran 70% pelunasan dilindungi oleh rekening bersama HariKita hingga H+2 pasca-acara.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gold/20 text-xs text-plum text-center">
            <div className="p-4 rounded-2xl bg-white border border-gold/30 space-y-2">
              <span className="text-[10px] text-plum-light uppercase font-bold">Tanda Tangan Klien</span>
              <div className="h-14 flex items-center justify-center font-script text-2xl text-emerald-800">
                Bima & Citra
              </div>
              <span className="text-[10px] text-emerald-700 font-bold block">✓ Ditandatangani Digital</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gold/30 space-y-2">
              <span className="text-[10px] text-plum-light uppercase font-bold">Tanda Tangan Konsorsium Vendor</span>
              <div className="h-14 flex items-center justify-center font-script text-2xl text-emerald-800">
                HariKita Kebumen
              </div>
              <span className="text-[10px] text-emerald-700 font-bold block">✓ Terverifikasi Legal</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
