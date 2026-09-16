"use client";

import React, { useState, useTransition } from "react";
import {
  Store,
  User,
  MapPin,
  Sparkles,
  Phone,
  Mail,
  Building2,
  Instagram,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  FileCheck2,
} from "lucide-react";
import {
  VendorProfileData,
  updateVendorProfileAction,
} from "@/server/actions/vendor-profile";
import {
  KEBUMEN_DISTRICTS,
  VENDOR_CATEGORIES,
  SUPPORTED_BANKS,
} from "@/lib/validations/vendor-profile";

interface VendorProfileFormProps {
  initialData: VendorProfileData;
}

export function VendorProfileForm({ initialData }: VendorProfileFormProps) {
  const [formData, setFormData] = useState({
    businessName: initialData.businessName || "",
    category: initialData.category || "Busana Pengantin & Fitting",
    picName: initialData.picName || "",
    email: initialData.email || "",
    district: initialData.district || "Kebumen",
    address: initialData.address || "",
    description: initialData.description || "",
    slaGuarantees: initialData.slaGuarantees || "",
    igHandle: initialData.igHandle || "",
    tiktokHandle: initialData.tiktokHandle || "",
    bankName: initialData.bankName || "Bank Central Asia (BCA)",
    bankAccount: initialData.bankAccount || "",
    bankHolder: initialData.bankHolder || "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  // Hitung persentase kelengkapan profil studio
  const calculateCompleteness = () => {
    let filled = 0;
    const fields = [
      formData.businessName,
      formData.category,
      formData.picName,
      initialData.phone,
      formData.address,
      formData.district,
      formData.description,
      formData.bankName,
      formData.bankAccount,
      formData.bankHolder,
    ];
    fields.forEach((f) => {
      if (f && f.trim() !== "") filled += 1;
    });
    return Math.round((filled / fields.length) * 100);
  };

  const completeness = calculateCompleteness();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setFieldErrors({});

    const formPayload = new FormData();
    formPayload.set("businessName", formData.businessName);
    formPayload.set("category", formData.category);
    formPayload.set("picName", formData.picName);
    formPayload.set("email", formData.email);
    formPayload.set("district", formData.district);
    formPayload.set("address", formData.address);
    formPayload.set("description", formData.description);
    formPayload.set("slaGuarantees", formData.slaGuarantees);
    formPayload.set("igHandle", formData.igHandle);
    formPayload.set("tiktokHandle", formData.tiktokHandle);
    formPayload.set("bankName", formData.bankName);
    formPayload.set("bankAccount", formData.bankAccount);
    formPayload.set("bankHolder", formData.bankHolder);

    startTransition(async () => {
      const result = await updateVendorProfileAction(formPayload);
      if (result.success) {
        setSuccessMessage(result.message || "Profil studio berhasil diperbarui!");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrorMessage(
          result.error || "Gagal menyimpan profil studio. Mohon periksa isian Anda."
        );
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-manrope">
      {/* Feedback Alerts */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-xs">Pembaruan Berhasil</h4>
            <p className="text-xs text-emerald-700 mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-xs">Peringatan</h4>
            <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Progress Bar Kelengkapan Studio */}
      <div className="bg-white rounded-2xl p-5 border border-hk-champagne/40 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-hk-taupe" />
            <span className="text-xs font-bold text-hk-charcoal">
              Kelengkapan Profil Studio &amp; Rekening Mitra
            </span>
          </div>
          <span className="text-xs font-bold text-hk-taupe tabular-nums">
            {completeness}% Lengkap
          </span>
        </div>
        <div className="w-full bg-hk-soft-beige/60 rounded-full h-2.5 overflow-hidden border border-hk-champagne/30">
          <div
            className="bg-hk-taupe h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${completeness}%` }}
          />
        </div>
        <p className="text-[11px] text-hk-charcoal/70 mt-2">
          Profil studio yang lengkap dan rekening terverifikasi meningkatkan kepercayaan calon pengantin serta mempercepat pencairan escrow.
        </p>
      </div>

      {/* SECTION 1: Identitas Bisnis & Layanan */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-hk-champagne/40 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-hk-champagne/30 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-hk-ivory border border-hk-champagne/40 flex items-center justify-center text-hk-taupe">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-editorial text-2xl font-normal text-hk-charcoal">
              1. Identitas Studio &amp; Kategori Layanan
            </h2>
            <p className="text-xs text-hk-charcoal/70">
              Nama merek resmi yang ditampilkan pada etalase katalog publik HariKita.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nama Bisnis / Studio */}
          <div>
            <label className="block text-xs font-bold text-hk-charcoal mb-1.5">
              Nama Bisnis / Studio <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="Contoh: Griya Busana Rarasati"
              required
              className={`w-full py-2.5 px-3.5 rounded-xl border text-xs text-hk-charcoal placeholder:text-hk-charcoal/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-hk-charcoal ${
                fieldErrors.businessName
                  ? "border-red-400 bg-red-50/50"
                  : "border-hk-champagne/60 focus:border-hk-taupe bg-hk-ivory/50 focus:bg-white"
              }`}
            />
            {fieldErrors.businessName && (
              <p className="text-[11px] text-red-600 mt-1">
                {fieldErrors.businessName[0]}
              </p>
            )}
          </div>

          {/* Kategori Layanan */}
          <div>
            <label className="block text-xs font-bold text-hk-charcoal mb-1.5">
              Kategori Layanan Utama <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full py-2.5 px-3.5 rounded-xl border border-hk-champagne/60 focus:border-hk-taupe bg-hk-ivory/50 focus:bg-white text-xs text-hk-charcoal focus:outline-none transition-all focus-visible:ring-2 focus-visible:ring-hk-charcoal"
            >
              {VENDOR_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* PIC / Penanggung Jawab */}
          <div>
            <label className="block text-xs font-bold text-hk-charcoal mb-1.5">
              Nama Pemilik / PIC Vendor
            </label>
            <input
              type="text"
              name="picName"
              value={formData.picName}
              onChange={handleChange}
              placeholder="Contoh: Hj. Rarasati Ambarwati"
              className="w-full py-2.5 px-3.5 rounded-xl border border-hk-champagne/60 focus:border-hk-taupe bg-hk-ivory/50 focus:bg-white text-xs text-hk-charcoal placeholder:text-hk-charcoal/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-hk-charcoal"
            />
          </div>

          {/* Nomor WhatsApp (Akun Utama Login - Read Only) */}
          <div>
            <label className="block text-xs font-bold text-hk-charcoal mb-1.5">
              Nomor WhatsApp (Akun Utama)
            </label>
            <div className="relative">
              <input
                type="text"
                value={initialData.phone}
                disabled
                className="w-full py-2.5 pl-3.5 pr-28 rounded-xl border border-hk-champagne/40 bg-hk-ivory/80 text-xs tabular-nums text-hk-charcoal/70 cursor-not-allowed"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Terverifikasi</span>
              </span>
            </div>
            <p className="text-[10px] text-hk-charcoal/60 mt-1">
              Nomor terikat sebagai kanal dispatch pesanan dan notifikasi escrow otomatis.
            </p>
          </div>

          {/* Email Penagihan */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-hk-charcoal mb-1.5">
              Email Resmi Studio (Untuk Laporan Invoice &amp; SLA)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="studio@email.com"
              className={`w-full py-2.5 px-3.5 rounded-xl border text-xs text-hk-charcoal placeholder:text-hk-charcoal/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-hk-charcoal ${
                fieldErrors.email
                  ? "border-red-400 bg-red-50/50"
                  : "border-hk-champagne/60 focus:border-hk-taupe bg-hk-ivory/50 focus:bg-white"
              }`}
            />
            {fieldErrors.email && (
              <p className="text-[11px] text-red-600 mt-1">
                {fieldErrors.email[0]}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: Lokasi Studio & Wilayah Kebumen */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-hk-champagne/40 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-hk-champagne/30 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-hk-ivory border border-hk-champagne/40 flex items-center justify-center text-hk-taupe">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-editorial text-2xl font-normal text-hk-charcoal">
              2. Alamat Studio &amp; Wilayah Kebumen
            </h2>
            <p className="text-xs text-hk-charcoal/70">
              Digunakan untuk kalkulasi jarak GPS in-app dan arahan rute menuju venue acara.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Kecamatan */}
          <div>
            <label className="block text-xs font-bold text-hk-charcoal mb-1.5">
              Wilayah Kecamatan (Kabupaten Kebumen)
            </label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="w-full py-2.5 px-3.5 rounded-xl border border-hk-champagne/60 focus:border-hk-taupe bg-hk-ivory/50 focus:bg-white text-xs text-hk-charcoal focus:outline-none transition-all focus-visible:ring-2 focus-visible:ring-hk-charcoal"
            >
              {KEBUMEN_DISTRICTS.map((kec) => (
                <option key={kec} value={kec}>
                  Kecamatan {kec}
                </option>
              ))}
            </select>
          </div>

          {/* Kota */}
          <div>
            <label className="block text-xs font-bold text-hk-charcoal mb-1.5">
              Kota / Kabupaten Pilot
            </label>
            <input
              type="text"
              value="Kabupaten Kebumen, Jawa Tengah"
              disabled
              className="w-full py-2.5 px-3.5 rounded-xl border border-hk-champagne/40 bg-hk-ivory/80 text-xs text-hk-charcoal/70 cursor-not-allowed"
            />
          </div>

          {/* Alamat Lengkap Studio */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-hk-charcoal mb-1.5">
              Alamat Lengkap Studio / Butik / Workshop <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              placeholder="Contoh: Jl. Pahlawan No. 12, RT 02/RW 04, Kebumen Kota"
              required
              className={`w-full p-3 rounded-xl border text-xs text-hk-charcoal placeholder:text-hk-charcoal/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-hk-charcoal ${
                fieldErrors.address
                  ? "border-red-400 bg-red-50/50"
                  : "border-hk-champagne/60 focus:border-hk-taupe bg-hk-ivory/50 focus:bg-white"
              }`}
            />
            {fieldErrors.address && (
              <p className="text-[11px] text-red-600 mt-1">
                {fieldErrors.address[0]}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: Rekening Bank Penarikan Saldo (Payout) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-hk-champagne/40 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-hk-champagne/30 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-hk-ivory border border-hk-champagne/40 flex items-center justify-center text-hk-taupe">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-editorial text-2xl font-normal text-hk-charcoal">
              3. Rekening Bank Penarikan Saldo (Escrow Payout)
            </h2>
            <p className="text-xs text-hk-charcoal/70">
              Rekening tujuan pencairan hak bersih vendor 90% (DP 30% pada H-3 &amp; Pelunasan 70% pada H+2).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bank */}
          <div>
            <label className="block text-xs font-bold text-hk-charcoal mb-1.5">
              Nama Bank
            </label>
            <select
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              className="w-full py-2.5 px-3.5 rounded-xl border border-hk-champagne/60 focus:border-hk-taupe bg-hk-ivory/50 focus:bg-white text-xs text-hk-charcoal focus:outline-none transition-all focus-visible:ring-2 focus-visible:ring-hk-charcoal"
            >
              {SUPPORTED_BANKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Nomor Rekening */}
          <div>
            <label className="block text-xs font-bold text-hk-charcoal mb-1.5">
              Nomor Rekening
            </label>
            <input
              type="text"
              name="bankAccount"
              value={formData.bankAccount}
              onChange={handleChange}
              placeholder="Contoh: 8277-0192-33"
              className="w-full py-2.5 px-3.5 rounded-xl border border-hk-champagne/60 focus:border-hk-taupe bg-hk-ivory/50 focus:bg-white text-xs text-hk-charcoal font-mono placeholder:text-hk-charcoal/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-hk-charcoal"
            />
          </div>

          {/* Atas Nama Rekening */}
          <div>
            <label className="block text-xs font-bold text-hk-charcoal mb-1.5">
              Atas Nama (Sesuai Buku Tabungan)
            </label>
            <input
              type="text"
              name="bankHolder"
              value={formData.bankHolder}
              onChange={handleChange}
              placeholder="Contoh: Griya Busana Rarasati"
              className="w-full py-2.5 px-3.5 rounded-xl border border-hk-champagne/60 focus:border-hk-taupe bg-hk-ivory/50 focus:bg-white text-xs text-hk-charcoal placeholder:text-hk-charcoal/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-hk-charcoal"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: Bio Studio, Media Sosial & Komitmen SLA */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-hk-champagne/40 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-hk-champagne/30 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-hk-ivory border border-hk-champagne/40 flex items-center justify-center text-hk-taupe">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-editorial text-2xl font-normal text-hk-charcoal">
              4. Bio Layanan &amp; Pernyataan Komitmen SLA
            </h2>
            <p className="text-xs text-hk-charcoal/70">
              Profil kreatif dan standar jaminan kepuasan pengantin.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-bold text-hk-charcoal mb-1.5">
              Deskripsi Studio &amp; Pengalaman Layanan
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Tuliskan pengalaman studio, spesialisasi adat/modern, dan keunggulan jasa Anda di Kebumen..."
              className="w-full p-3 rounded-xl border border-hk-champagne/60 focus:border-hk-taupe bg-hk-ivory/50 focus:bg-white text-xs text-hk-charcoal placeholder:text-hk-charcoal/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-hk-charcoal"
            />
          </div>

          {/* SLA Commitment */}
          <div>
            <label className="block text-xs font-bold text-hk-charcoal mb-1.5">
              Pernyataan Jaminan SLA &amp; Pergantian Kru Cadangan
            </label>
            <textarea
              name="slaGuarantees"
              rows={2}
              value={formData.slaGuarantees}
              onChange={handleChange}
              placeholder="Contoh: Tim kami menjamin tiba di lokasi minimal 60 menit sebelum call time dan menyiapkan kru cadangan setara jika terjadi situasi darurat."
              className="w-full p-3 rounded-xl border border-hk-champagne/60 focus:border-hk-taupe bg-hk-ivory/50 focus:bg-white text-xs text-hk-charcoal placeholder:text-hk-charcoal/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-hk-charcoal"
            />
          </div>

          {/* Social Media Handles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-hk-charcoal mb-1.5">
                Username Instagram (Tanpa @)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-hk-charcoal/50 text-xs">@</span>
                <input
                  type="text"
                  name="igHandle"
                  value={formData.igHandle}
                  onChange={handleChange}
                  placeholder="griya_rarasati"
                  className="w-full py-2.5 pl-7 pr-3.5 rounded-xl border border-hk-champagne/60 focus:border-hk-taupe bg-hk-ivory/50 focus:bg-white text-xs text-hk-charcoal placeholder:text-hk-charcoal/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-hk-charcoal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-hk-charcoal mb-1.5">
                Username TikTok (Tanpa @)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-hk-charcoal/50 text-xs">@</span>
                <input
                  type="text"
                  name="tiktokHandle"
                  value={formData.tiktokHandle}
                  onChange={handleChange}
                  placeholder="rarasati_wedding"
                  className="w-full py-2.5 pl-7 pr-3.5 rounded-xl border border-hk-champagne/60 focus:border-hk-taupe bg-hk-ivory/50 focus:bg-white text-xs text-hk-charcoal placeholder:text-hk-charcoal/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-hk-charcoal"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tombol Simpan */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <p className="text-xs text-hk-charcoal/70">
          Perubahan profil akan disinkronkan ke katalog publik dan tanda terima e-invoice vendor.
        </p>

        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-hk-taupe hover:bg-[#78644e] text-white font-manrope font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-xs min-h-[44px] focus-visible:ring-2 focus-visible:ring-hk-charcoal focus-visible:ring-offset-2 disabled:opacity-60 cursor-pointer active:scale-98"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-hk-champagne" />
              <span>Menyimpan Profil Studio...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-hk-champagne" />
              <span>Simpan Perubahan Profil</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
