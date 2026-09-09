"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { ALL_INVITATION_TEMPLATES } from "@/lib/templates/registry";
import {
  Sparkles,
  Check,
  Plus,
  Trash2,
  Calendar,
  ShieldCheck,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Sliders,
  Utensils,
  Gift,
  Camera,
  Scissors,
  Palette,
  Heart,
  Cake,
  Mail,
  Map,
} from "lucide-react";

interface ServiceItem {
  id: string;
  category: string;
  name: string;
  vendor: string;
  basePrice: number;
  unitType?: "pax" | "baki" | "pcs" | "all_in";
  unitPrice?: number;
  defaultUnit?: number;
  icon: any;
  description: string;
}

const KEBUMEN_SERVICES: ServiceItem[] = [
  {
    id: "prewed-1",
    category: "Pre-wedding",
    name: "Paket Prewed Pantai Menganti & Studio",
    vendor: "Menganti Cinematic & Studio",
    basePrice: 3500000,
    unitType: "all_in",
    icon: Camera,
    description: "2 Busana, outdoor pantai/bukit Menara Menganti, 25 foto edited, video teaser 60 detik.",
  },
  {
    id: "busana-1",
    category: "Busana Pengantin & Fitting",
    name: "Sewa Busana Akad & Resepsi (Fitting 2x)",
    vendor: "Griya Busana Rarasati",
    basePrice: 2800000,
    unitType: "all_in",
    icon: Scissors,
    description: "Sewa perdana kebaya/beskap adat Jawa, aksesori lengkap, dan jadwal fitting 2x terkoordinasi.",
  },
  {
    id: "mua-1",
    category: "Makeup Artist (MUA)",
    name: "Rias Pengantin Soft Glam / Adat Jawa",
    vendor: "Alula MUA & Hijab Styling",
    basePrice: 2200000,
    unitType: "all_in",
    icon: Palette,
    description: "Rias akad + resepsi, hijab do / hair styling premium, melati keraton asli, touch-up standby.",
  },
  {
    id: "seserahan-1",
    category: "Kotak Seserahan & Mahar",
    name: "Sewa & Hias Baki Akrilik Kayu Jati",
    vendor: "Hantaran Lestari Kebumen",
    basePrice: 1050000, // 7 baki dasar
    unitType: "baki",
    unitPrice: 150000,
    defaultUnit: 7,
    icon: Gift,
    description: "Baki akrilik kristal kombinasi kayu jati, hias bunga artifisial, kalkulator per kotak.",
  },
  {
    id: "foto-1",
    category: "Dokumentasi Foto-Video",
    name: "Liputan Akad & Resepsi + Drone Highlight",
    vendor: "Pradana Cinema & Story",
    basePrice: 4200000,
    unitType: "all_in",
    icon: Camera,
    description: "2 Fotografer + 1 Videografer, teaser Reels, all file di flashdisk kayu Kebumen eksklusif.",
  },
  {
    id: "dekor-1",
    category: "Dekorasi & Florist",
    name: "Pelaminan Intimate 4-6m Bunga Segar",
    vendor: "Asmara Flora & Pelaminan",
    basePrice: 5500000,
    unitType: "all_in",
    icon: Heart,
    description: "Backdrop pelaminan bunga segar, karpet jalan, standing flower 4 titik, photobooth lamaran.",
  },
  {
    id: "katering-1",
    category: "Katering & Food Stalls",
    name: "Prasmanan Harmoni Selera Kebumen",
    vendor: "Dapur Rasa Boga Kebumen",
    basePrice: 4500000, // 100 pax @ 45.000
    unitType: "pax",
    unitPrice: 45000,
    defaultUnit: 100,
    icon: Utensils,
    description: "Menu komplit khas Kebumen, waiter standby, gratis Sample Box Test Food.",
  },
  {
    id: "cake-1",
    category: "Cakes & Dessert Corner",
    name: "Tiered Wedding Cake & Dessert Table",
    vendor: "L'Aura Patisserie & Cakes",
    basePrice: 1600000,
    unitType: "all_in",
    icon: Cake,
    description: "Kue pengantin 2 tingkat senada dekorasi + dessert table (pudding, macarons, mini tarts).",
  },
  {
    id: "souvenir-1",
    category: "Souvenir & Favors",
    name: "Pouch Linen Anyaman Pandan Gombong",
    vendor: "Kriya Anyam Gombong",
    basePrice: 1500000, // 100 pcs @ 15.000
    unitType: "pcs",
    unitPrice: 15000,
    defaultUnit: 100,
    icon: Gift,
    description: "Pouch ramah lingkungan anyaman pandan & linen custom inisial, kemasan mika & kartu ucapan.",
  },
  {
    id: "undangan-1",
    category: "Undangan Digital & Amplop",
    name: "Website Undangan 65+ Tema & 100 Undangan Cetak",
    vendor: "HariKita Digital & Print",
    basePrice: 1250000,
    unitType: "all_in",
    icon: Mail,
    description: "Website undangan digital lengkap musik & RSVP + 100 pcs fisik cetak hardcover segel lilin.",
  },
  {
    id: "denah-1",
    category: "Cute Illustrated Maps",
    name: "Ilustrasi Denah Lokasi Kartun & Barcode QR",
    vendor: "Denah Kita Kartun Estetik",
    basePrice: 250000,
    unitType: "all_in",
    icon: Map,
    description: "Gambar kartun lucu rute venue Kebumen siap cetak + barcode QR Maps langsung.",
  },
];

export default function MixMatchBuilderPage() {
  // State: selected items map
  const [selectedItems, setSelectedItems] = useState<{ [id: string]: { count?: number } }>({
    "busana-1": { count: 1 },
    "mua-1": { count: 1 },
    "katering-1": { count: 100 },
    "undangan-1": { count: 1 },
  });

  // State: selected theme for digital invitation
  const [selectedThemeId, setSelectedThemeId] = useState("autumnelle");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const themeFromUrl = params.get("selectedTheme");
      if (themeFromUrl && ALL_INVITATION_TEMPLATES.some((t) => t.id === themeFromUrl)) {
        setSelectedThemeId(themeFromUrl);
      }
    }
  }, []);

  // State: checkout modal (Lazy registration)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);
  const [clientForm, setClientForm] = useState({
    name: "",
    phone: "",
    eventDate: "2026-11-20",
    venueAddress: "Gedung Pertemuan Setda Kebumen",
    notes: "",
  });

  // Calculate live total
  const calculateTotal = () => {
    let total = 0;
    KEBUMEN_SERVICES.forEach((service) => {
      const selected = selectedItems[service.id];
      if (selected) {
        if (service.unitType === "pax") {
          const pax = selected.count || service.defaultUnit || 100;
          total += pax * (service.unitPrice || 45000);
        } else if (service.unitType === "baki") {
          const baki = selected.count || service.defaultUnit || 7;
          total += baki * (service.unitPrice || 150000);
        } else if (service.unitType === "pcs") {
          const pcs = selected.count || service.defaultUnit || 100;
          total += pcs * (service.unitPrice || 15000);
        } else {
          total += service.basePrice;
        }
      }
    });
    return total;
  };

  const totalAmount = calculateTotal();
  const dpAmount = totalAmount * 0.3; // 30%
  const settlementAmount = totalAmount * 0.7; // 70%

  const toggleItem = (id: string, defaultCount: number = 1) => {
    setSelectedItems((prev) => {
      const copy = { ...prev };
      if (copy[id]) {
        delete copy[id];
      } else {
        copy[id] = { count: defaultCount };
      }
      return copy;
    });
  };

  const updateCount = (id: string, count: number) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: { count },
    }));
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrderSubmitted(true);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gold/15 text-plum-dark text-xs uppercase tracking-widest font-semibold border border-gold/30">
          <Sparkles className="w-3.5 h-3.5 text-gold-dark" />
          <span>Interactive Mix-and-Match Builder</span>
        </div>
        <h1 className="font-serif-luxury text-3xl sm:text-5xl text-plum font-bold tracking-tight">
          Simulator Racik Paket Pernikahan Kebumen
        </h1>
        <p className="text-sm text-plum-light leading-relaxed">
          Pilih vendor dan atur jumlah pax, baki, atau tema undangan sesuka Anda. Harga dan termin pembayaran DP 30% akan terkalkulasi secara otomatis dan transparan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: List of 11 Services */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs uppercase tracking-wider font-bold text-plum-light">
              Pilihan 11 Kategori Vendor Kebumen
            </span>
            <span className="text-xs font-semibold text-gold-dark">
              {Object.keys(selectedItems).length} Layanan Dipilih
            </span>
          </div>

          {KEBUMEN_SERVICES.map((service) => {
            const isSelected = !!selectedItems[service.id];
            const currentItem = selectedItems[service.id];
            const Icon = service.icon;

            return (
              <div
                key={service.id}
                className={`p-5 rounded-3xl border transition-all ${
                  isSelected
                    ? "bg-white border-gold shadow-md"
                    : "bg-white/60 border-gold/20 hover:border-gold/40"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                        isSelected ? "gold-gradient-bg text-plum-dark" : "bg-gold/10 text-plum-light"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark bg-gold/15 px-2 py-0.5 rounded-full">
                          {service.category}
                        </span>
                        <span className="text-xs text-plum-light font-medium">• {service.vendor}</span>
                      </div>
                      <h3 className="font-serif-luxury text-lg font-bold text-plum">
                        {service.name}
                      </h3>
                      <p className="text-xs text-plum-light leading-relaxed max-w-xl">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Checkbox Button */}
                  <button
                    onClick={() => toggleItem(service.id, service.defaultUnit || 1)}
                    className={`p-2.5 rounded-full border transition-all ${
                      isSelected
                        ? "gold-gradient-bg text-plum-dark border-gold shadow-xs"
                        : "border-gold/40 text-plum-light hover:bg-gold/15"
                    }`}
                    aria-label="Pilih layanan ini"
                  >
                    {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>

                {/* Sub-selectors (Pax / Baki / Theme Selector) */}
                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-gold/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {/* Unit Slider for Pax Catering */}
                    {service.unitType === "pax" && (
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <span className="font-bold text-plum">Jumlah Tamu (Pax):</span>
                        <input
                          type="range"
                          min="50"
                          max="500"
                          step="25"
                          value={currentItem?.count || 100}
                          onChange={(e) => updateCount(service.id, parseInt(e.target.value, 10))}
                          className="range range-xs range-primary w-40"
                        />
                        <span className="font-mono font-bold text-plum bg-gold/15 px-2.5 py-1 rounded-lg">
                          {currentItem?.count || 100} Pax
                        </span>
                      </div>
                    )}

                    {/* Unit Selector for Baki Seserahan */}
                    {service.unitType === "baki" && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-plum">Jumlah Baki:</span>
                        {[5, 7, 9, 11].map((bakiCount) => (
                          <button
                            key={bakiCount}
                            onClick={() => updateCount(service.id, bakiCount)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                              (currentItem?.count || 7) === bakiCount
                                ? "gold-gradient-bg text-plum-dark border-gold"
                                : "bg-[#FAF8F5] border-gold/20 text-plum-light"
                            }`}
                          >
                            {bakiCount} Kotak
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Theme Picker for Undangan Digital */}
                    {service.category === "Undangan Digital & Amplop" && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-plum">Pilihan Desain:</span>
                        <select
                          value={selectedThemeId}
                          onChange={(e) => setSelectedThemeId(e.target.value)}
                          className="select select-xs bg-[#FAF8F5] border-gold/30 text-plum font-semibold rounded-lg max-w-[200px]"
                        >
                          {ALL_INVITATION_TEMPLATES.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.title} ({t.category})
                            </option>
                          ))}
                        </select>
                        <Link
                          href={`/undangan/demo?theme=${selectedThemeId}`}
                          target="_blank"
                          className="text-[11px] text-gold-dark hover:underline font-bold"
                        >
                          Pratinjau
                        </Link>
                      </div>
                    )}

                    {/* Subtotal Calculation */}
                    <div className="ml-auto font-mono text-sm font-bold text-plum">
                      {service.unitType === "pax"
                        ? formatRupiah((currentItem?.count || 100) * (service.unitPrice || 45000))
                        : service.unitType === "baki"
                        ? formatRupiah((currentItem?.count || 7) * (service.unitPrice || 150000))
                        : service.unitType === "pcs"
                        ? formatRupiah((currentItem?.count || 100) * (service.unitPrice || 15000))
                        : formatRupiah(service.basePrice)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Sticky Summary & Checkout Card */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-gold/40 shadow-xl space-y-6">
            <div className="border-b border-gold/20 pb-4 space-y-1">
              <span className="text-[11px] uppercase tracking-wider font-bold text-gold-dark">
                Rincian Estimasi Acara
              </span>
              <h3 className="font-serif-luxury text-2xl font-bold text-plum">
                Paket Impian Hari H
              </h3>
            </div>

            {/* Selected Breakdown */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 text-xs">
              {Object.keys(selectedItems).length === 0 ? (
                <p className="text-plum-light text-center py-4 italic">
                  Belum ada layanan yang dipilih. Silakan pilih dari daftar 11 kategori di sebelah kiri.
                </p>
              ) : (
                KEBUMEN_SERVICES.filter((s) => selectedItems[s.id]).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-plum">
                    <span className="truncate max-w-[180px]">{item.name}</span>
                    <span className="font-mono font-bold">
                      {item.unitType === "pax"
                        ? formatRupiah((selectedItems[item.id]?.count || 100) * (item.unitPrice || 45000))
                        : item.unitType === "baki"
                        ? formatRupiah((selectedItems[item.id]?.count || 7) * (item.unitPrice || 150000))
                        : item.unitType === "pcs"
                        ? formatRupiah((selectedItems[item.id]?.count || 100) * (item.unitPrice || 15000))
                        : formatRupiah(item.basePrice)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Escrow Terms & Totals */}
            <div className="pt-4 border-t border-gold/20 space-y-3 bg-[#FAF8F5] p-4 rounded-2xl">
              <div className="flex items-center justify-between text-xs text-plum-light">
                <span>Total Estimasi Paket:</span>
                <span className="font-mono text-base font-bold text-plum">{formatRupiah(totalAmount)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-emerald-800 font-bold pt-1 border-t border-gold/15">
                <span>DP 30% (Kunci Tanggal):</span>
                <span className="font-mono text-sm">{formatRupiah(dpAmount)}</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-plum-light">
                <span>Pelunasan 70% (H-7):</span>
                <span className="font-mono font-medium">{formatRupiah(settlementAmount)}</span>
              </div>
            </div>

            {/* Escrow Trust Tag */}
            <div className="flex items-start gap-2 text-[11px] text-plum-light leading-snug">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Proteksi Rekening Bersama. DP dicairkan H-3 acara, pelunasan 70% baru dicairkan H+2 pasca-acara sukses di Kebumen.
              </span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => setIsCheckoutOpen(true)}
              disabled={totalAmount === 0}
              className="btn w-full gold-gradient-bg text-plum-dark font-bold text-sm rounded-full border-none shadow-md hover:brightness-105"
            >
              Ajukan Pesanan & Booking Tanggal
            </button>
          </div>
        </div>
      </div>

      {/* LAZY REGISTRATION CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl border border-gold/40 space-y-6 animate-fadeIn">
            {isOrderSubmitted ? (
              <div className="text-center space-y-4 py-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
                <h3 className="font-serif-luxury text-2xl font-bold text-plum">
                  Pesanan Berhasil Diajukan!
                </h3>
                <p className="text-xs text-plum-light leading-relaxed">
                  Terima kasih, <strong>{clientForm.name}</strong>. Invoice DP 30% ({formatRupiah(dpAmount)}) dan jadwal sesi fitting telah dibuat. Tim Concierge HariKita Kebumen akan segera menghubungi nomor WhatsApp Anda (<strong>{clientForm.phone}</strong>) untuk validasi jadwal.
                </p>
                <div className="pt-4 flex items-center justify-center gap-3">
                  <Link
                    href="/client"
                    className="btn btn-sm gold-gradient-bg text-plum-dark font-bold rounded-full border-none"
                  >
                    Buka Portal Klien
                  </Link>
                  <button
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setIsOrderSubmitted(false);
                    }}
                    className="btn btn-sm btn-ghost text-plum"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-gold-dark font-bold">
                    Pemesanan Praktis (Lazy Registration)
                  </span>
                  <h3 className="font-serif-luxury text-2xl font-bold text-plum">
                    Lengkapi Kontak Acara
                  </h3>
                  <p className="text-xs text-plum-light">
                    Tidak perlu kata sandi. Cukup nama dan nomor WhatsApp aktif.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-plum">Nama Calon Pengantin / Keluarga</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Bima & Citra"
                      value={clientForm.name}
                      onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                      className="input input-sm w-full bg-[#FAF8F5] border-gold/30 rounded-xl text-plum"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-plum">Nomor WhatsApp Aktif</label>
                    <input
                      type="tel"
                      required
                      placeholder="0812xxxxxxx"
                      value={clientForm.phone}
                      onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                      className="input input-sm w-full bg-[#FAF8F5] border-gold/30 rounded-xl text-plum"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-plum">Tanggal Acara</label>
                      <input
                        type="date"
                        required
                        value={clientForm.eventDate}
                        onChange={(e) => setClientForm({ ...clientForm, eventDate: e.target.value })}
                        className="input input-sm w-full bg-[#FAF8F5] border-gold/30 rounded-xl text-plum text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-plum">Kota Pelaksanaan</label>
                      <input
                        type="text"
                        disabled
                        value="Kabupaten Kebumen"
                        className="input input-sm w-full bg-gray-100 border-gray-300 rounded-xl text-plum text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-plum">Lokasi Acara (Gedung / Kediaman)</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Gedung Setda Kebumen"
                      value={clientForm.venueAddress}
                      onChange={(e) => setClientForm({ ...clientForm, venueAddress: e.target.value })}
                      className="input input-sm w-full bg-[#FAF8F5] border-gold/30 rounded-xl text-plum"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-gold/25 space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-plum">
                    <span>Invoice DP 30%:</span>
                    <span className="font-mono text-emerald-800">{formatRupiah(dpAmount)}</span>
                  </div>
                  <p className="text-[10px] text-plum-light">
                    Pembayaran DP dilakukan setelah jadwal diverifikasi oleh mitra vendor.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="btn btn-sm btn-ghost text-plum rounded-full"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm gold-gradient-bg text-plum-dark font-bold rounded-full border-none shadow-sm"
                  >
                    Konfirmasi Booking Tanggal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
