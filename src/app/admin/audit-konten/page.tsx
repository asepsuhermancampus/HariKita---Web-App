"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Search,
  Filter,
  Eye,
  Sparkles,
} from "lucide-react";

export default function AdminAuditKontenPage() {
  const auditLogs = [
    {
      id: "LOG-DIS-001",
      timestamp: "14 September 2026, 11:24 WIB",
      vendorName: "Studio Foto Baru Kebumen",
      source: "Input Caption Portofolio Feed",
      violationType: "Penyelundupan Nomor Telepon",
      detectedPattern: "0812.9982.1122 (Pola Titik/Spasi)",
      rawSnippet: "Untuk booking langsung tanpa aplikasi bisa hubungi o812.9982.1122 ya kak...",
      status: "INTERCEPTED",
      actionTaken: "Pesan diblokir otomatis sebelum tersimpan ke database. Peringatan otomatis dikirim via dashboard.",
    },
    {
      id: "LOG-DIS-002",
      timestamp: "13 September 2026, 16:45 WIB",
      vendorName: "Mitra Dekorasi Gombong",
      source: "Bio Profil Toko",
      violationType: "Penyelundupan Link WhatsApp Luar",
      detectedPattern: "wa.me/62852...",
      rawSnippet: "Konsultasi tema pelaminan bisa langsung klik wa.me/6285299882211...",
      status: "INTERCEPTED",
      actionTaken: "Tautan disensor. Vendor diberikan edukasi mengenai proteksi rekening bersama HariKita.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#4A2E35] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs text-[#6B5E62] flex items-center gap-1 mb-1">
              <Link href="/admin" className="hover:text-[#4A2E35]">
                Super Admin
              </Link>
              <span>/</span>
              <span className="text-[#4A2E35] font-medium">Audit Anti-Disintermediasi</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A2E35]">
              Log Sensor Anti-Disintermediasi
            </h1>
            <p className="text-xs text-[#6B5E62] mt-0.5">
              Pantauan otomatis terhadap upaya penyelundupan kontak pribadi/nomor HP untuk transaksi di luar escrow platform.
            </p>
          </div>

          <Link
            href="/hub-koordinasi"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4A2E35] text-white text-xs font-semibold hover:bg-[#6B5E62] transition-colors shadow-sm self-start"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            Uji Simulator Sensor
          </Link>
        </div>

        {/* Policy Summary Card */}
        <div className="bg-white rounded-2xl border border-[#C5A880]/30 shadow-sm p-5 sm:p-6 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h3 className="font-serif text-base font-bold text-[#4A2E35]">
              Mekanisme Perlindungan Ekosistem & Escrow
            </h3>
          </div>
          <p className="text-xs text-[#6B5E62] leading-relaxed">
            Algoritma <code>detectOffPlatformContact</code> memeriksa nomor telepon format Indonesia (+62, 08, leetspeak nol/o, titik, spasi),
            akun Instagram/medsos luar, nomor rekening bank, serta URL bypass WhatsApp (wa.me). Konten yang terdeteksi
            langsung diblokir secara client-side dan server-side untuk memastikan seluruh transaksi tetap terlindungi jaminan rekening bersama.
          </p>
        </div>

        {/* Logs List */}
        <div className="space-y-4">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-2xl border border-red-200 shadow-sm p-5 sm:p-6 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#FAF8F5]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-red-900 px-2.5 py-1 rounded bg-red-50 border border-red-200">
                    {log.id}
                  </span>
                  <span className="text-xs text-[#6B5E62]">{log.timestamp}</span>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  Dicegat Sistem (Otomatis Diblokir)
                </span>
              </div>

              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[#6B5E62]">Mitra Terkait:</span>
                  <strong className="text-[#4A2E35]">{log.vendorName}</strong>
                  <span className="text-[#6B5E62]">({log.source})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#6B5E62]">Kategori Pelanggaran:</span>
                  <span className="font-semibold text-red-700">{log.violationType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#6B5E62]">Pola Terdeteksi:</span>
                  <code className="bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E5D7C7] text-[#4A2E35]">
                    {log.detectedPattern}
                  </code>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-red-50/50 border border-red-100 text-xs text-[#4A2E35]">
                <span className="font-semibold text-red-900 block mb-1">Snippet Teks yang Dicegat:</span>
                <span className="italic">"{log.rawSnippet}"</span>
              </div>

              <div className="text-[11px] text-[#6B5E62] flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>Tindakan Proteksi:</strong> {log.actionTaken}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
