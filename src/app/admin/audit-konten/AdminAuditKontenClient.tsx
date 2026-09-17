"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldAlert, AlertTriangle, CheckCircle2, Search, Lock } from "lucide-react";
import type { ContentAuditFinding } from "@/server/queries/admin";

/**
 * Log Sensor Anti-Disintermediasi (client) — DB-driven.
 * `dbFindings` berasal dari pemindaian DB (description/caption vendor). Bila kosong,
 * tampil status "tidak ada temuan".
 */
export function AdminAuditKontenClient({ dbFindings }: { dbFindings: ContentAuditFinding[] }) {
  const [query, setQuery] = useState("");

  const findings = dbFindings.filter(
    (f) =>
      f.owner.toLowerCase().includes(query.toLowerCase()) ||
      f.scope.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#4A2E35] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs text-[#6B5E62] flex items-center gap-1 mb-1">
              <Link href="/admin" className="hover:text-[#4A2E35]">Super Admin</Link>
              <span>/</span>
              <span className="text-[#4A2E35] font-medium">Audit Anti-Disintermediasi</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A2E35]">
              Log Sensor Anti-Disintermediasi
            </h1>
            <p className="text-xs text-[#6B5E62] mt-0.5">
              Pemindaian otomatis teks tersimpan (deskripsi vendor &amp; caption portofolio) terhadap upaya penyelundupan kontak pribadi.
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white border border-[#C5A880] text-xs font-semibold shadow-2xs">
            Temuan Aktif: <strong className="text-amber-700">{dbFindings.length}</strong>
          </div>
        </div>

        {/* Search */}
        <div className="relative bg-white p-3 rounded-2xl border border-[#C5A880]/30 shadow-sm">
          <Search className="w-3.5 h-3.5 text-[#6B5E62] absolute left-6 top-5" aria-hidden="true" />
          <input
            type="search"
            placeholder="Cari nama vendor / tipe pelanggaran..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E5D7C7] text-xs focus:outline-none focus:border-[#C5A880]"
          />
        </div>

        {/* Findings list */}
        <div className="space-y-3">
          {findings.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-[#C5A880]/30 text-center text-[#6B5E62] text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              Tidak ada temuan kebocoran kontak pada konten yang tersimpan.
            </div>
          ) : (
            findings.map((f, idx) => (
              <div key={`${f.scope}-${f.refId}-${idx}`} className="bg-white rounded-2xl border border-red-200/60 shadow-sm p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#FAF8F5]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4" />
                    </span>
                    <div>
                      <strong className="text-[#4A2E35] text-sm block">{f.owner}</strong>
                      <span className="text-[11px] text-[#6B5E62] font-mono">{f.scope}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-red-50 text-red-800 border border-red-200 font-semibold">
                    <AlertTriangle className="w-3 h-3" /> Terdeteksi
                  </span>
                </div>
                <div className="text-xs text-[#6B5E62] leading-relaxed">
                  <span className="block text-[11px] font-semibold text-[#4A2E35] mb-1">Cuplikan teks:</span>
                  &ldquo;{f.snippet}&rdquo;
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <Lock className="w-3 h-3 text-red-600" />
                  <span className="text-[#6B5E62]">Kata kunci tersensor:</span>
                  {f.matches.slice(0, 5).map((m, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-red-50 text-red-800 border border-red-200 font-mono">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#C5A880]/30 text-xs text-[#6B5E62] leading-relaxed">
          <strong className="text-[#4A2E35] block mb-0.5">Catatan:</strong>
          Pemindaian bersifat read-only terhadap konten tersimpan. Penyaringan preventif aktif saat vendor mengunggah (lihat Portal Vendor → Portofolio).
        </div>
      </div>
    </div>
  );
}
