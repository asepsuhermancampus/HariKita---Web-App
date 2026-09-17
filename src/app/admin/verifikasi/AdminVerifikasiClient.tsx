"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  MapPin,
  Building,
  Search,
  AlertCircle,
  Star,
} from "lucide-react";
import { approveVendorAction, rejectVendorAction } from "@/server/actions/admin";
import type { VendorVerificationDTO } from "@/server/queries/admin";

/**
 * Pusat Verifikasi Mitra (client) — DB-first.
 * `dbVendors` dari database (VendorProfile.verificationStatus). Mock fallback
 * bila DB kosong (mis. belum login admin).
 */
export function AdminVerifikasiClient({ dbVendors }: { dbVendors: VendorVerificationDTO[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"PENDING" | "APPROVED" | "REJECTED" | "ALL">("PENDING");
  const [searchQuery, setSearchQuery] = useState("");

  const vendors = dbVendors;

  const handleApprove = (id: string) => {
    setMessage(null);
    startTransition(async () => {
      const res = await approveVendorAction({ vendorId: id });
      if (!res.success) setMessage(res.message || "Gagal menyetujui vendor.");
      else router.refresh();
    });
  };

  const handleReject = (id: string) => {
    const note =
      typeof window !== "undefined"
        ? window.prompt("Alasan revisi/penolakan (opsional):") ?? "Berkas belum lengkap."
        : "Berkas belum lengkap.";
    setMessage(null);
    startTransition(async () => {
      const res = await rejectVendorAction({ vendorId: id, note });
      if (!res.success) setMessage(res.message || "Gagal menolak vendor.");
      else router.refresh();
    });
  };

  const filtered = vendors.filter((v) => {
    const matchStatus = activeFilter === "ALL" || v.verificationStatus === activeFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      v.businessName.toLowerCase().includes(q) ||
      v.district.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const pendingCount = vendors.filter((v) => v.verificationStatus === "PENDING").length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#4A2E35] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs text-[#6B5E62] flex items-center gap-1 mb-1">
              <Link href="/admin" className="hover:text-[#4A2E35]">Super Admin</Link>
              <span>/</span>
              <span className="text-[#4A2E35] font-medium">Verifikasi Mitra</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A2E35]">
              Pusat Kurasi &amp; Verifikasi Mitra Vendor
            </h1>
            <p className="text-xs text-[#6B5E62] mt-0.5">
              Setujui atau minta revisi mitra vendor lokal Kebumen sebelum tampil di katalog.
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white border border-[#C5A880] text-xs font-semibold shadow-2xs">
            Antrean Menunggu: <strong className="text-amber-700">{pendingCount} Mitra</strong>
          </div>
        </div>

        {/* Filter + search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#C5A880]/30 shadow-sm">
          <div className="flex items-center gap-2" role="group" aria-label="Filter status verifikasi vendor">
            {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                aria-pressed={activeFilter === f}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeFilter === f ? "bg-[#4A2E35] text-white" : "text-[#6B5E62] hover:text-[#4A2E35]"
                }`}
              >
                {f === "PENDING"
                  ? `Menunggu (${pendingCount})`
                  : f === "APPROVED"
                  ? `Terverifikasi (${vendors.filter((v) => v.verificationStatus === "APPROVED").length})`
                  : f === "REJECTED"
                  ? `Ditolak (${vendors.filter((v) => v.verificationStatus === "REJECTED").length})`
                  : `Semua (${vendors.length})`}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-[#6B5E62] absolute left-3 top-2.5" aria-hidden="true" />
            <input
              type="search"
              placeholder="Cari nama / kecamatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#E5D7C7] text-xs focus:outline-none focus:border-[#C5A880]"
            />
          </div>
        </div>

        {message && (
          <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
            <AlertCircle className="w-4 h-4" /> <span>{message}</span>
          </div>
        )}

        {/* List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-[#C5A880]/30 text-center text-[#6B5E62] text-xs italic">
              Tidak ada vendor dalam antrean ini.
            </div>
          ) : (
            filtered.map((v) => {
              const isApproved = v.verificationStatus === "APPROVED";
              const isRejected = v.verificationStatus === "REJECTED";
              return (
                <div key={v.id} className="bg-white rounded-2xl border border-[#C5A880]/30 shadow-sm p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#FAF8F5]">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[#FAF8F5] border border-[#E5D7C7]">
                        {v.id.slice(0, 10)}
                      </span>
                      <span className="text-xs text-[#6B5E62]">Diajukan: {v.createdAt}</span>
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
                      {isApproved ? "Terverifikasi" : isRejected ? "Ditolak / Revisi" : "Menunggu Pemeriksaan"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <h3 className="font-serif text-lg font-bold text-[#4A2E35]">{v.businessName}</h3>
                      <div className="text-[#C5A880] font-semibold">Kategori: {v.category}</div>
                      <div className="flex items-center gap-1.5 text-[#6B5E62]">
                        <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>Kecamatan {v.district}, Kebumen</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-[#6B5E62] pt-1">
                        <Building className="w-3.5 h-3.5 text-[#C5A880] mt-0.5" />
                        <span>Alamat: {v.address}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[#6B5E62] p-3 rounded-xl bg-[#FAF8F5] border border-[#E5D7C7]">
                      <div>PIC: <strong className="text-[#4A2E35]">{v.picName ?? "-"}</strong></div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>{v.rating.toFixed(1)} ({v.reviewCount} ulasan)</span>
                      </div>
                      {v.igHandle && <div>IG: <strong className="text-[#4A2E35]">{v.igHandle}</strong></div>}
                      {v.verificationNote && (
                        <div className="text-red-700 font-medium pt-1">Catatan: {v.verificationNote}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-[#FAF8F5]">
                    {!isApproved && (
                      <button
                        onClick={() => handleApprove(v.id)}
                        disabled={isPending}
                        className="px-4 py-2 rounded-xl bg-[#4A2E35] text-white hover:bg-[#6B5E62] text-xs font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A880]" />
                        Setujui &amp; Terbitkan
                      </button>
                    )}
                    {!isRejected && (
                      <button
                        onClick={() => handleReject(v.id)}
                        disabled={isPending}
                        className="px-3.5 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Tolak / Minta Revisi
                      </button>
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
