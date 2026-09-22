"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit2,
  Trash2,
  Calculator,
  Clock,
  AlertCircle,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { Modal } from "@/components/harikita/ui";
import { DashPageHeader } from "@/components/dashboard";
import {
  createPackageAction,
  updatePackageAction,
  deletePackageAction,
  type PackageInput,
} from "@/server/actions/vendor";
import type { VendorPackageDTO } from "@/server/queries/vendor";

const EMPTY_FORM: PackageInput = {
  name: "",
  description: "",
  category: "",
  basePrice: 0,
  unitType: "all_in",
  slaDays: 7,
};

/**
 * Manajemen Paket Vendor (client component).
 * `dbPackages` dari database; `vendorResolved` menentukan mode aksi (DB vs mock).
 */
export function VendorPaketClient({
  dbPackages,
  vendorResolved,
  feeBreakdown,
}: {
  dbPackages: VendorPackageDTO[];
  vendorResolved: boolean;
  feeBreakdown: Array<{ label: string; pct: number }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [expandedFeeIds, setExpandedFeeIds] = useState<string[]>([]);

  const toggleFeeBreakdown = (pkgId: string) => {
    setExpandedFeeIds((prev) =>
      prev.includes(pkgId) ? prev.filter((id) => id !== pkgId) : [...prev, pkgId]
    );
  };

  // Fallback mock bila vendor belum ter-resolve.
  const mockPackages: VendorPackageDTO[] = [
    {
      id: "pkg-1",
      name: "Paket Sunset Pantai Menganti (Cinematic)",
      description:
        "Liputan video sinematik 4K, 1 menit teaser Reels/TikTok, 50 foto teredit tone hangat, all raw files.",
      category: "Pre-wedding",
      basePrice: 3_500_000,
      unitPrice: null,
      unitType: "all_in",
      minUnit: null,
      maxUnit: null,
      slaDays: 7,
      isActive: true,
    },
  ];

  const packages = vendorResolved ? dbPackages : mockPackages;

  // Modal form state.
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PackageInput>(EMPTY_FORM);

  const platformFeeRate = 0.1;

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
    setMessage(null);
  };

  const openEdit = (pkg: VendorPackageDTO) => {
    setEditingId(pkg.id);
    setForm({
      name: pkg.name,
      description: pkg.description,
      category: pkg.category,
      basePrice: pkg.basePrice,
      unitType: pkg.unitType ?? "all_in",
      slaDays: pkg.slaDays,
    });
    setIsFormOpen(true);
    setMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorResolved) {
      setMessage("Mode demo: aksi penyimpanan memerlukan login vendor.");
      return;
    }
    startTransition(async () => {
      const res = editingId
        ? await updatePackageAction({ ...form, id: editingId })
        : await createPackageAction(form);
      if (res.success) {
        setIsFormOpen(false);
        setMessage(null);
        router.refresh();
      } else {
        setMessage(res.message || "Gagal menyimpan paket.");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!vendorResolved) {
      setMessage("Mode demo: aksi hapus memerlukan login vendor.");
      return;
    }
    startTransition(async () => {
      const res = await deletePackageAction({ id });
      if (res.success) {
        setMessage(null);
        router.refresh();
      } else {
        setMessage(res.message || "Gagal menghapus paket.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <DashPageHeader
        title="Manajemen Paket & Harga"
        description="Atur daftar paket yang dapat dipilih langsung oleh calon pengantin di katalog dan mix-and-match builder."
        action={
          <button
            onClick={openCreate}
            className="focus-ring inline-flex min-h-11 items-center gap-1.5 self-start rounded-xl bg-hk-taupe px-3.5 text-xs font-semibold text-white hover:bg-hk-charcoal"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Paket Baru
          </button>
        }
      />
      <div className="space-y-6">
        {message && (
          <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <AlertCircle className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        {/* Commission Transparency Card */}
        <div className="bg-white rounded-2xl border border-[#C5A880]/30 shadow-sm p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#C5A880]" />
            <h3 className="font-serif text-base font-bold text-[#4A2E35]">
              Transparansi Potongan &amp; Biaya Platform HariKita
            </h3>
          </div>
          <p className="text-xs text-[#6B5E62] leading-relaxed">
            HariKita mengenakan komisi operasional tetap sebesar <strong>10%</strong> dari nilai pesanan yang berhasil.
            Biaya ini dialokasikan untuk pemeliharaan server database, proteksi rekening bersama (escrow),
            sistem pengingat WhatsApp otomatis, serta promosi vendor ke seluruh calon pengantin di Kabupaten Kebumen.
          </p>
        </div>

        {/* Packages List */}
        <div className="space-y-4">
          {packages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#C5A880]/30 p-8 text-center text-[#6B5E62] text-xs italic">
              Belum ada paket. Tambahkan paket pertama Anda.
            </div>
          ) : (
            packages.map((pkg) => {
              const platformFee = Math.round(pkg.basePrice * platformFeeRate);
              const netIncome = pkg.basePrice - platformFee;

              return (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl border border-[#C5A880]/30 shadow-sm p-5 sm:p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 pb-3 border-b border-[#FAF8F5]">
                    <div>
                      <h4 className="font-serif text-lg font-bold text-[#4A2E35]">
                        {pkg.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-[#6B5E62] mt-1">
                        <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>Kategori: <strong>{pkg.category}</strong> • SLA {pkg.slaDays} hari</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                        Aktif di Katalog
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#6B5E62] leading-relaxed">{pkg.description}</p>

                  {/* Calculation Breakdown Box with Floating Transparency Dropdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5D7C7] text-xs">
                    <div>
                      <span className="text-[#6B5E62] block text-[11px]">Harga Publik (Klien Bayar):</span>
                      <strong className="font-mono text-sm text-[#4A2E35]">
                        {formatRupiah(pkg.basePrice)}
                      </strong>
                    </div>

                    {/* Komisi Column with Floating Dropdown */}
                    <div className="relative">
                      <div className="flex items-center gap-1">
                        <span className="text-[#6B5E62] text-[11px]">Komisi Platform HariKita (10%):</span>
                        <button
                          type="button"
                          onClick={() => toggleFeeBreakdown(pkg.id)}
                          className={`inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#EDE6DC] hover:bg-[#E2D8CC] text-[#4A2E35] transition-all cursor-pointer shadow-xs ${
                            expandedFeeIds.includes(pkg.id) ? "bg-[#E2D8CC]" : ""
                          }`}
                          aria-label="Rincian alokasi komisi platform 10%"
                        >
                          <ChevronDown
                            className={`w-3.5 h-3.5 stroke-[2.2] transition-transform duration-200 ${
                              expandedFeeIds.includes(pkg.id) ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>

                      <div className="font-mono text-sm text-red-700 font-semibold mt-0.5">
                        - {formatRupiah(platformFee)}
                      </div>

                      {/* Sleek Floating Dropdown Menu */}
                      {expandedFeeIds.includes(pkg.id) && (
                        <>
                          {/* Backdrop to close on outside click */}
                          <div
                            className="fixed inset-0 z-30 cursor-default"
                            onClick={() => toggleFeeBreakdown(pkg.id)}
                          />

                          {/* Floating Popover Container */}
                          <div className="absolute left-0 top-full mt-2 z-40 w-[350px] sm:w-[385px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white border border-[#E5D7C7] shadow-xl shadow-[#4A2E35]/10 p-3.5 space-y-2 text-xs animate-in fade-in zoom-in-95 duration-150">
                            <div className="flex items-center justify-between pb-2 border-b border-[#FAF8F5]">
                              <div className="flex items-center gap-1.5 text-[#4A2E35] font-semibold text-xs">
                                <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                                <span>Alokasi Komisi 10%</span>
                              </div>
                              <span className="font-mono font-bold text-xs text-red-700">
                                - {formatRupiah(platformFee)}
                              </span>
                            </div>

                            <div className="space-y-1.5 text-[11px]">
                              {feeBreakdown.length === 0 ? (
                                <p className="px-1.5 py-1 text-[11px] italic text-[#6B5E62]">
                                  Rincian komponen belum diatur admin.
                                </p>
                              ) : (
                                feeBreakdown.map((c) => (
                                  <div
                                    key={c.label}
                                    className="grid grid-cols-[1fr_auto_auto] items-center gap-2 p-1.5 rounded-lg hover:bg-[#FAF8F5] transition-colors"
                                  >
                                    <span className="flex items-center gap-2 text-[#4A2E35] min-w-0">
                                      <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                                      <span className="whitespace-nowrap">{c.label}</span>
                                    </span>
                                    <span className="w-10 text-center font-mono text-[10.5px] text-[#6B5E62] shrink-0">
                                      {c.pct}%
                                    </span>
                                    <span className="font-mono text-[11px] font-semibold text-[#4A2E35] text-right shrink-0">
                                      {formatRupiah(Math.round((pkg.basePrice * c.pct) / 100))}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div>
                      <span className="text-emerald-800 block text-[11px] font-semibold">Estimasi Bersih Vendor (90%):</span>
                      <strong className="font-mono text-base text-emerald-700">
                        {formatRupiah(netIncome)}
                      </strong>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      disabled={isPending}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50 flex items-center gap-1 disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                    <button
                      onClick={() => openEdit(pkg)}
                      className="px-3 py-1.5 rounded-lg border border-[#E5D7C7] text-[#4A2E35] text-xs font-semibold hover:bg-[#FAF8F5] flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3 text-[#C5A880]" /> Edit Rincian
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? "Edit Paket Layanan" : "Tambah Paket Baru"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label htmlFor="pkg-name" className="block text-[#4A2E35] font-semibold mb-1">Nama Paket:</label>
            <input
              id="pkg-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="focus-ring w-full p-2.5 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880]"
            />
          </div>
          <div>
            <label htmlFor="pkg-category" className="block text-[#4A2E35] font-semibold mb-1">Kategori:</label>
            <input
              id="pkg-category"
              type="text"
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Contoh: Busana Pengantin & Fitting"
              className="focus-ring w-full p-2.5 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880]"
            />
          </div>
          <div>
            <label htmlFor="pkg-price" className="block text-[#4A2E35] font-semibold mb-1">Harga Dasar (Rp):</label>
            <input
              id="pkg-price"
              type="number"
              required
              min={1}
              value={form.basePrice}
              onChange={(e) => setForm({ ...form, basePrice: parseInt(e.target.value || "0", 10) })}
              className="focus-ring w-full p-2.5 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880]"
            />
          </div>
          <div>
            <label htmlFor="pkg-desc" className="block text-[#4A2E35] font-semibold mb-1">Deskripsi:</label>
            <textarea
              id="pkg-desc"
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="focus-ring w-full p-2.5 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#FAF8F5]">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="focus-ring px-4 py-2 rounded-full border border-[#E5D7C7] text-[#4A2E35] hover:bg-[#FAF8F5] min-h-[44px]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              aria-busy={isPending}
              className="focus-ring px-5 py-2 rounded-full bg-[#4A2E35] text-white font-semibold hover:bg-[#6B5E62] transition-colors shadow-sm disabled:opacity-50 min-h-[44px]"
            >
              {isPending ? "Menyimpan..." : "Simpan Paket"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
