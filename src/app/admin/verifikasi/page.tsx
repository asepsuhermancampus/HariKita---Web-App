"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  MapPin,
  FileText,
  ExternalLink,
  Search,
  Filter,
  AlertCircle,
  Building,
} from "lucide-react";

interface VendorApplication {
  id: string;
  name: string;
  owner: string;
  category: string;
  district: string;
  ktpNumber: string;
  phone: string;
  portfolioSample: string;
  physicalStudioAddress: string;
  appliedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
}

export default function AdminVerifikasiPage() {
  const [vendors, setVendors] = useState<VendorApplication[]>([
    {
      id: "VREG-091",
      name: "Rembulan MUA & Hijab Styling",
      owner: "Siti Nurhaliza",
      category: "Makeup Artist (MUA)",
      district: "Gombong",
      ktpNumber: "3305128910920002",
      phone: "0813-8899-1234",
      portfolioSample: "https://instagram.com/rembulan_mua_kbm",
      physicalStudioAddress: "Jl. Yos Sudarso No. 45, Gombong, Kebumen",
      appliedAt: "13 September 2026",
      status: "PENDING",
    },
    {
      id: "VREG-092",
      name: "Bagas Katering Selera Tradisi",
      owner: "Bagas Wibowo",
      category: "Katering & Food Stalls",
      district: "Kutowinangun",
      ktpNumber: "3305141005880004",
      phone: "0852-7711-4455",
      portfolioSample: "Dapur Rasa Kutowinangun (Dinkes P-IRT Terlampir)",
      physicalStudioAddress: "Desa Kuwarisan RT 02/03, Kutowinangun, Kebumen",
      appliedAt: "14 September 2026",
      status: "PENDING",
    },
    {
      id: "VREG-089",
      name: "Menara Karst Menganti Photography",
      owner: "Ferry Pratama",
      category: "Pre-wedding Alam & Studio",
      district: "Ayah",
      ktpNumber: "3305011406950001",
      phone: "0821-3344-9988",
      portfolioSample: "Koleksi Sunset Tebing Menganti & Goa Barat",
      physicalStudioAddress: "Dusun Karangduwur, Ayah, Kebumen",
      appliedAt: "10 September 2026",
      status: "APPROVED",
    },
  ]);

  const [activeFilter, setActiveFilter] = useState<"ALL" | "PENDING" | "APPROVED">("PENDING");
  const [searchQuery, setSearchQuery] = useState("");

  const handleApprove = (id: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "APPROVED" } : v))
    );
  };

  const handleReject = (id: string) => {
    const reason = prompt("Masukkan alasan revisi / penolakan pendaftaran vendor:") || "Berkas identitas / studio fisik belum lengkap";
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "REJECTED", rejectionReason: reason } : v))
    );
  };

  const filtered = vendors.filter((v) => {
    const matchStatus = activeFilter === "ALL" || v.status === activeFilter;
    const matchSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const pendingCount = vendors.filter((v) => v.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#4A2E35] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs text-[#6B5E62] flex items-center gap-1 mb-1">
              <Link href="/admin" className="hover:text-[#4A2E35]">
                Super Admin
              </Link>
              <span>/</span>
              <span className="text-[#4A2E35] font-medium">Verifikasi Mitra</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A2E35]">
              Pusat Kurasi &amp; Verifikasi Mitra Vendor
            </h1>
            <p className="text-xs text-[#6B5E62] mt-0.5">
              Kurasi kelayakan calon vendor lokal Kebumen: validasi NIK KTP (Prefix 3305), alamat workshop fisik, dan uji standar portofolio.
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-white border border-[#C5A880] text-xs font-semibold text-[#4A2E35] shadow-2xs">
            Antrean Menunggu: <strong className="text-amber-700">{pendingCount} Mitra</strong>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#C5A880]/30 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter("PENDING")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === "PENDING"
                  ? "bg-[#4A2E35] text-white"
                  : "text-[#6B5E62] hover:text-[#4A2E35]"
              }`}
            >
              Menunggu Pemeriksaan ({pendingCount})
            </button>
            <button
              onClick={() => setActiveFilter("APPROVED")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === "APPROVED"
                  ? "bg-[#4A2E35] text-white"
                  : "text-[#6B5E62] hover:text-[#4A2E35]"
              }`}
            >
              Sudah Terverifikasi ({vendors.filter((v) => v.status === "APPROVED").length})
            </button>
            <button
              onClick={() => setActiveFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === "ALL"
                  ? "bg-[#4A2E35] text-white"
                  : "text-[#6B5E62] hover:text-[#4A2E35]"
              }`}
            >
              Semua ({vendors.length})
            </button>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-[#6B5E62] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama vendor / kecamatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#E5D7C7] text-xs focus:outline-none focus:border-[#C5A880]"
            />
          </div>
        </div>

        {/* Vendors to Verify List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-[#C5A880]/30 text-center text-[#6B5E62] text-xs italic">
              Tidak ada vendor dalam antrean ini.
            </div>
          ) : (
            filtered.map((v) => {
              const isApproved = v.status === "APPROVED";
              const isRejected = v.status === "REJECTED";
              const isKebumenNik = v.ktpNumber.startsWith("3305");

              return (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl border border-[#C5A880]/30 shadow-sm p-5 sm:p-6 space-y-4 hover:border-[#C5A880] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#FAF8F5]">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-[#4A2E35] px-2.5 py-1 rounded bg-[#FAF8F5] border border-[#E5D7C7]">
                        {v.id}
                      </span>
                      <span className="text-xs text-[#6B5E62]">Diajukan: {v.appliedAt}</span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        isApproved
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : isRejected
                          ? "bg-red-50 text-red-800 border border-red-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {isApproved
                        ? "Mitra Terverifikasi & Aktif di Katalog"
                        : isRejected
                        ? "Pendaftaran Ditolak / Perlu Revisi"
                        : "Menunggu Pemeriksaan Super Admin"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <h3 className="font-serif text-lg font-bold text-[#4A2E35]">
                        {v.name}
                      </h3>
                      <div className="text-[#C5A880] font-semibold">
                        Kategori: {v.category}
                      </div>
                      <div className="flex items-center gap-1.5 text-[#6B5E62]">
                        <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                        <span>Kecamatan {v.district}, Kebumen</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-[#6B5E62] pt-1">
                        <Building className="w-3.5 h-3.5 text-[#C5A880] shrink-0 mt-0.5" />
                        <span>Workshop: {v.physicalStudioAddress}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[#6B5E62] p-3 rounded-xl bg-[#FAF8F5] border border-[#E5D7C7]">
                      <div>
                        Penanggung Jawab: <strong className="text-[#4A2E35]">{v.owner}</strong>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>NIK KTP: <strong className="font-mono text-[#4A2E35]">{v.ktpNumber}</strong></span>
                        {isKebumenNik ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                            ✓ NIK Kebumen (3305)
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-semibold">
                            Non-Kebumen
                          </span>
                        )}
                      </div>
                      <div>
                        Sample Portofolio:{" "}
                        <span className="text-[#C5A880] font-medium">{v.portfolioSample}</span>
                      </div>
                      {v.rejectionReason && (
                        <div className="text-red-700 font-medium pt-1">
                          Catatan Revisi: {v.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-[#FAF8F5]">
                    {!isApproved && !isRejected && (
                      <>
                        <button
                          onClick={() => handleReject(v.id)}
                          className="px-3.5 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors"
                        >
                          Tolak &amp; Minta Revisi
                        </button>
                        <button
                          onClick={() => handleApprove(v.id)}
                          className="px-4 py-2 rounded-xl bg-[#4A2E35] text-white hover:bg-[#6B5E62] text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A880]" />
                          Setujui &amp; Terbitkan ke Katalog
                        </button>
                      </>
                    )}
                    {isApproved && (
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Vendor telah aktif di direktori dan menerima order escrow
                      </span>
                    )}
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
