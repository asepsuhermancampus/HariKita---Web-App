"use client";

import React, { useState, useTransition } from "react";
import {
  User,
  Heart,
  Calendar,
  MapPin,
  Sparkles,
  Phone,
  Mail,
  FileEdit,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Save,
} from "lucide-react";
import {
  ClientProfileData,
  updateClientProfileAction,
} from "@/server/actions/client-profile";
import {
  KEBUMEN_DISTRICTS,
  EVENT_THEMES,
} from "@/lib/validations/client-profile";
import { DatePicker } from "@/components/harikita/ui";

interface ClientProfileFormProps {
  initialData: ClientProfileData;
}

export function ClientProfileForm({ initialData }: ClientProfileFormProps) {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    email: initialData.email || "",
    partnerName: initialData.partnerName || "",
    eventDate: initialData.eventDate || "",
    eventLocation: initialData.eventLocation || "",
    district: initialData.district || "Kebumen",
    themePreference: initialData.themePreference || "",
    notes: initialData.notes || "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  // Hitung persentase kelengkapan profil
  const calculateCompleteness = () => {
    let filled = 0;
    const fields = [
      formData.name,
      initialData.phone,
      formData.partnerName,
      formData.eventDate,
      formData.eventLocation,
      formData.district,
      formData.themePreference,
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
    // Clear error for that field when user types
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
    formPayload.set("name", formData.name);
    formPayload.set("email", formData.email);
    formPayload.set("partnerName", formData.partnerName);
    formPayload.set("eventDate", formData.eventDate);
    formPayload.set("eventLocation", formData.eventLocation);
    formPayload.set("district", formData.district);
    formPayload.set("themePreference", formData.themePreference);
    formPayload.set("notes", formData.notes);

    startTransition(async () => {
      const result = await updateClientProfileAction(formPayload);
      if (result.success) {
        setSuccessMessage(result.message || "Profil berhasil diperbarui!");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrorMessage(
          result.error || "Gagal menyimpan profil. Mohon periksa kembali form."
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
        <div role="status" aria-live="polite" className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h4 className="font-bold text-xs font-manrope">Pembaruan Berhasil</h4>
            <p className="text-xs text-emerald-700 mt-0.5 font-manrope">{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div role="alert" className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h4 className="font-bold text-xs font-manrope">Peringatan</h4>
            <p className="text-xs text-red-700 mt-0.5 font-manrope">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Progress Bar Kelengkapan Profil */}
      <div className="bg-white rounded-2xl p-5 border border-hk-champagne/40 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-hk-taupe" />
            <span className="text-xs font-bold text-hk-charcoal font-manrope">
              Kelengkapan Data Profil Acara
            </span>
          </div>
          <span className="text-xs font-manrope font-bold text-hk-taupe tabular-nums">
            {completeness}% Lengkap
          </span>
        </div>
        <div className="w-full bg-hk-soft-beige/60 rounded-full h-2.5 overflow-hidden border border-hk-champagne/30">
          <div
            className="bg-hk-taupe h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${completeness}%` }}
          />
        </div>
        <p className="text-[11px] text-hk-charcoal/70 mt-2 font-manrope">
          Lengkapi data pasangan dan lokasi acara agar vendor HariKita di
          Kebumen dapat menyusun rundown dan kalkulasi logistik secara presisi.
        </p>
      </div>

      {/* SECTION 1: Akun & Kontak Utama */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-hk-champagne/40 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-hk-champagne/30 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-hk-ivory border border-hk-champagne/40 flex items-center justify-center text-hk-taupe">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-editorial text-2xl font-normal text-hk-charcoal">
              1. Akun &amp; Kontak Utama
            </h2>
            <p className="text-xs text-hk-charcoal/70 font-manrope">
              Identitas resmi pemesan paket acara dan penerima konfirmasi escrow.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nama Lengkap */}
          <div>
            <label htmlFor="cpf-name" className="block text-xs font-bold text-hk-charcoal font-manrope mb-1.5">
              Nama Lengkap Klien <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="cpf-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Contoh: Bima Pratama"
                required
                className={`w-full py-2.5 px-3.5 rounded-xl border text-xs text-hk-charcoal placeholder:text-hk-charcoal/40 font-manrope transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-hk-charcoal ${
                  fieldErrors.name
                    ? "border-red-400 bg-red-50/50"
                    : "border-hk-champagne/60 focus:border-hk-taupe bg-hk-ivory/50 focus:bg-white"
                }`}
              />
            </div>
            {fieldErrors.name && (
              <p className="text-[11px] text-red-600 mt-1 font-manrope">
                {fieldErrors.name[0]}
              </p>
            )}
          </div>

          {/* Nomor WhatsApp (Read-Only) */}
          <div>
            <label className="block text-xs font-bold text-hk-charcoal font-manrope mb-1.5">
              Nomor WhatsApp (Akun Utama)
            </label>
            <div className="relative">
              <input
                type="text"
                value={initialData.phone}
                disabled
                className="w-full py-2.5 pl-3.5 pr-28 rounded-xl border border-hk-champagne/40 bg-hk-ivory/80 text-xs font-manrope tabular-nums text-hk-charcoal/70 cursor-not-allowed"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold font-manrope">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Terverifikasi</span>
              </span>
            </div>
            <p className="text-[10px] text-hk-charcoal/60 mt-1 font-manrope">
              Nomor WhatsApp terikat sebagai akun login dan saluran notifikasi vendor.
            </p>
          </div>

          {/* Email */}
          <div className="md:col-span-2">
            <label htmlFor="cpf-email" className="block text-xs font-bold text-hk-charcoal font-manrope mb-1.5">
              Alamat Email (Opsional)
            </label>
            <div className="relative">
              <input
                id="cpf-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@email.com (Untuk pengiriman e-invoice & kontrak)"
                className={`w-full py-2.5 px-3.5 rounded-xl border text-xs text-hk-charcoal placeholder:text-hk-charcoal/40 font-manrope transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-hk-charcoal ${
                  fieldErrors.email
                    ? "border-red-400 bg-red-50/50"
                    : "border-hk-champagne/60 focus:border-hk-taupe bg-hk-ivory/50 focus:bg-white"
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-[11px] text-red-600 mt-1 font-manrope">
                {fieldErrors.email[0]}
              </p>
            )}
            <p className="text-[10px] text-hk-charcoal/60 mt-1 font-manrope">
              Salinan PDF Digital Contract SLA dan tanda terima DP/Pelunasan akan dikirim ke email ini.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: Identitas Pasangan & Tanggal Acara */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-hk-champagne/40 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-hk-champagne/30 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-hk-ivory border border-hk-champagne/40 flex items-center justify-center text-hk-taupe">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-editorial text-2xl font-normal text-hk-charcoal">
              2. Pasangan &amp; Rencana Hari H
            </h2>
            <p className="text-xs text-hk-charcoal/70 font-manrope">
              Rincian mempelai dan koordinasi tempat pelaksanaan di wilayah Kebumen.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nama Pasangan */}
          <div>
            <label htmlFor="cpf-partner" className="block text-xs font-bold text-hk-charcoal font-manrope mb-1.5">
              Nama Pasangan Mempelai
            </label>
            <input
              id="cpf-partner"
              type="text"
              name="partnerName"
              value={formData.partnerName}
              onChange={handleChange}
              placeholder="Contoh: Citra Kirana"
              className={`w-full py-2.5 px-3.5 rounded-xl border text-xs text-hk-charcoal placeholder:text-hk-charcoal/40 font-manrope transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-hk-charcoal ${
                fieldErrors.partnerName
                  ? "border-red-400 bg-red-50/50"
                  : "border-hk-champagne/60 focus:border-hk-taupe bg-hk-ivory/50 focus:bg-white"
              }`}
            />
            {fieldErrors.partnerName && (
              <p className="text-[11px] text-red-600 mt-1 font-manrope">
                {fieldErrors.partnerName[0]}
              </p>
            )}
            <p className="text-[10px] text-hk-charcoal/60 mt-1 font-manrope">
              Akan tertera di sampul undangan dan kontrak kerja vendor bersama.
            </p>
          </div>

          {/* Tanggal Hari H Acara */}
          <div>
            <DatePicker
              id="cpf-event-date"
              name="eventDate"
              label="Tanggal Pelaksanaan Acara"
              value={formData.eventDate}
              onChange={(newDate) => {
                setFormData((prev) => ({ ...prev, eventDate: newDate }));
                if (fieldErrors.eventDate) {
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.eventDate;
                    return next;
                  });
                }
              }}
              error={fieldErrors.eventDate?.[0]}
              helperText="Digunakan untuk mengecek blackout dates & jadwal ketersediaan seluruh vendor di Kebumen."
              placeholder="Pilih tanggal pelaksanaan acara..."
              displayFormat="EEEE, dd MMMM yyyy"
            />
          </div>

          {/* Lokasi / Gedung / Rumah */}
          <div>
            <label htmlFor="cpf-event-location" className="block text-xs font-bold text-hk-charcoal font-manrope mb-1.5">
              Lokasi / Gedung / Kediaman
            </label>
            <input
              id="cpf-event-location"
              type="text"
              name="eventLocation"
              value={formData.eventLocation}
              onChange={handleChange}
              placeholder="Contoh: Gedung Pertemuan Setda Kebumen / Kediaman Mempelai"
              className={`w-full py-2.5 px-3.5 rounded-xl border text-xs text-hk-charcoal placeholder:text-hk-charcoal/40 font-manrope transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-hk-charcoal ${
                fieldErrors.eventLocation
                  ? "border-red-400 bg-red-50/50"
                  : "border-hk-champagne/60 focus:border-hk-taupe bg-hk-ivory/50 focus:bg-white"
              }`}
            />
            {fieldErrors.eventLocation && (
              <p className="text-[11px] text-red-600 mt-1 font-manrope">
                {fieldErrors.eventLocation[0]}
              </p>
            )}
          </div>

          {/* Kecamatan di Kebumen */}
          <div>
            <label htmlFor="cpf-district" className="block text-xs font-bold text-hk-charcoal font-manrope mb-1.5">
              Wilayah Kecamatan (Kabupaten Kebumen)
            </label>
            <select
              id="cpf-district"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="w-full py-2.5 px-3.5 rounded-xl border border-hk-champagne/60 focus:border-hk-taupe bg-hk-ivory/50 focus:bg-white text-xs text-hk-charcoal font-manrope transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-hk-charcoal"
            >
              {KEBUMEN_DISTRICTS.map((kec) => (
                <option key={kec} value={kec}>
                  Kecamatan {kec}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-hk-charcoal/60 mt-1 font-manrope">
              Fokus hyperlocal pilot: memastikan bebas biaya transport vendor lokal.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Preferensi Konsep & Catatan Acara */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-hk-champagne/40 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-hk-champagne/30 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-hk-ivory border border-hk-champagne/40 flex items-center justify-center text-hk-taupe">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-editorial text-2xl font-normal text-hk-charcoal">
              3. Preferensi Konsep &amp; Catatan Khusus
            </h2>
            <p className="text-xs text-hk-charcoal/70 font-manrope">
              Tuntunan tema riasan MUA, dekorasi panggung, dan arahan bagi vendor.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Preferensi Tema Adat / Gaya */}
          <div>
            <label htmlFor="cpf-theme" className="block text-xs font-bold text-hk-charcoal font-manrope mb-1.5">
              Preferensi Gaya Busana &amp; Dekorasi
            </label>
            <select
              id="cpf-theme"
              name="themePreference"
              value={formData.themePreference}
              onChange={handleChange}
              className="w-full py-2.5 px-3.5 rounded-xl border border-hk-champagne/60 focus:border-hk-taupe bg-hk-ivory/50 focus:bg-white text-xs text-hk-charcoal font-manrope transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-hk-charcoal"
            >
              <option value="">Pilih Preferensi Konsep...</option>
              {EVENT_THEMES.map((theme) => (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-hk-charcoal/60 mt-1 font-manrope">
              Menyelaraskan moodboard MUA, busana pengantin, florist, dan tema undangan digital Anda.
            </p>
          </div>

          {/* Catatan Khusus */}
          <div>
            <label htmlFor="cpf-notes" className="block text-xs font-bold text-hk-charcoal font-manrope mb-1.5">
              Catatan Impian / Permintaan Khusus ke Vendor
            </label>
            <textarea
              id="cpf-notes"
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Tuliskan catatan khusus untuk vendor, misalnya: orang tua menginginkan warna sage green, tidak menggunakan bunga melati tiruan, perlu 2 baki seserahan tambahan, dll."
              className="w-full p-3.5 rounded-xl border border-hk-champagne/60 focus:border-hk-taupe bg-hk-ivory/50 focus:bg-white text-xs text-hk-charcoal placeholder:text-hk-charcoal/40 font-manrope transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-hk-charcoal"
            />
          </div>
        </div>
      </div>

      {/* Tombol Simpan */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <p className="text-xs text-hk-charcoal/70 font-manrope">
          Perubahan profil akan disinkronkan ke seluruh invoice dan kontrak vendor terpilih.
        </p>

        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-hk-taupe hover:bg-[#78644e] text-white font-manrope font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-xs min-h-[44px] focus-visible:ring-2 focus-visible:ring-hk-charcoal focus-visible:ring-offset-2 disabled:opacity-60 cursor-pointer active:scale-98"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-hk-champagne" />
              <span>Menyimpan Data Profil...</span>
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
