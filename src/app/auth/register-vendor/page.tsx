"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, ChevronLeft, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function AuthRegisterVendorPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [category, setCategory] = useState("dokumentasi-foto-video");
  const [district, setDistrict] = useState("Kebumen Kota");
  const [whatsapp, setWhatsapp] = useState("");
  const [ktpNumber, setKtpNumber] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [isAgreed, setIsAgreed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const categories = [
    { id: "prewedding", name: "1. Pre-wedding (Studio & Outdoor Alam)" },
    { id: "busana-pengantin", name: "2. Busana Pengantin & Fitting" },
    { id: "makeup-artist", name: "3. Makeup Artist (MUA & Hijab Styling)" },
    { id: "kotak-seserahan", name: "4. Kotak Seserahan, Hantaran & Mahar" },
    { id: "dokumentasi-foto-video", name: "5. Dokumentasi Foto-Video Hari H" },
    { id: "dekorasi-florist", name: "6. Dekorasi & Florist (Pelaminan/Backdrop)" },
    { id: "katering-food-stalls", name: "7. Katering & Food Stalls (Prasmanan & Gubukan)" },
    { id: "kue-dessert", name: "8. Kue Acara & Dessert Corner (Cakes & Dessert)" },
    { id: "souvenir-favors", name: "9. Souvenir & Wedding Favors Eksklusif" },
    { id: "undangan-digital", name: "10. Undangan Digital & Amplop Hybrid" },
    { id: "denah-lokasi", name: "11. Cute Illustrated Maps (Denah Kartun)" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAgreed) return;
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/vendor");
      }, 1500);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#4A2E35] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl space-y-6">
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#6B5E62] hover:text-[#4A2E35] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Kembali ke Beranda HariKita
          </Link>
          <div className="mt-4 font-serif text-3xl font-bold text-[#4A2E35] tracking-wide">
            HariKita
          </div>
          <p className="text-xs text-[#6B5E62] mt-1">
            Pendaftaran Kemitraan Vendor Lokal Kabupaten Kebumen
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#C5A880]/30 shadow-sm p-6 sm:p-8 space-y-5">
          {isSuccess ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#4A2E35]">
                Pendaftaran Berhasil Terkirim!
              </h3>
              <p className="text-xs text-[#6B5E62] max-w-sm mx-auto">
                Berkas Anda sedang diverifikasi oleh Tim Super Admin HariKita. Mengarahkan Anda ke Dashboard Vendor...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A2E35] font-semibold mb-1">
                    Nama Usaha / Studio Vendor:
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Contoh: Menganti Studio Foto"
                    required
                    className="w-full p-2.5 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div>
                  <label className="block text-[#4A2E35] font-semibold mb-1">
                    Nama Penanggung Jawab:
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Nama lengkap sesuai KTP"
                    required
                    className="w-full p-2.5 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A2E35] font-semibold mb-1">
                    Kategori Layanan (1 dari 11):
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#4A2E35] font-semibold mb-1">
                    Kecamatan Domisili di Kebumen:
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880]"
                  >
                    <option value="Kebumen Kota">Kebumen Kota</option>
                    <option value="Gombong">Gombong</option>
                    <option value="Karanganyar">Karanganyar</option>
                    <option value="Ayah">Ayah</option>
                    <option value="Kutowinangun">Kutowinangun</option>
                    <option value="Petanahan">Petanahan</option>
                    <option value="Prembun">Prembun</option>
                    <option value="Alian">Alian</option>
                    <option value="Sruweng">Sruweng</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A2E35] font-semibold mb-1">
                    NIK KTP Kebumen:
                  </label>
                  <input
                    type="text"
                    value={ktpNumber}
                    onChange={(e) => setKtpNumber(e.target.value)}
                    placeholder="3305xxxxxxxxxxxx"
                    required
                    className="w-full p-2.5 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div>
                  <label className="block text-[#4A2E35] font-semibold mb-1">
                    Nomor WhatsApp Resmi Toko:
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    required
                    className="w-full p-2.5 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#4A2E35] font-semibold mb-1">
                  Link Portofolio (Instagram / Google Drive):
                </label>
                <input
                  type="url"
                  value={portfolioLink}
                  onChange={(e) => setPortfolioLink(e.target.value)}
                  placeholder="https://instagram.com/nama_studio"
                  required
                  className="w-full p-2.5 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              {/* Terms Agreement */}
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5D7C7] space-y-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="mt-0.5 rounded text-[#4A2E35] focus:ring-[#C5A880]"
                  />
                  <span className="text-[11px] text-[#6B5E62] leading-relaxed">
                    Saya menyetujui komisi platform HariKita sebesar 10% untuk pemeliharaan server,
                    fasilitas rekening bersama (escrow 30% H-3 & 70% H+2), serta berkomitmen mematuhi
                    aturan anti-disintermediasi untuk melindungi kenyamanan dan keamanan transaksi calon pengantin di Kebumen.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || !isAgreed}
                className="w-full py-3 px-4 rounded-xl bg-[#4A2E35] text-white font-semibold text-xs hover:bg-[#6B5E62] transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Ajukan Kemitraan Vendor</span>
                    <ArrowRight className="w-4 h-4 text-[#C5A880]" />
                  </>
                )}
              </button>

              <div className="text-center text-xs text-[#6B5E62] pt-2 border-t border-[#FAF8F5]">
                Sudah terdaftar sebagai mitra?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-[#4A2E35] hover:text-[#C5A880] underline ml-1"
                >
                  Masuk di sini
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
