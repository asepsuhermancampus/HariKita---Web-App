"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cartStore } from "@/lib/cart-store";
import {
  mergeSelections,
  selectionsFromCartItems,
  CATEGORY_TO_SERVICE as categoryToServiceMap,
  VENDOR_TO_SERVICE as vendorToServiceMap,
} from "@/lib/builder-selection";
import { formatRupiah } from "@/lib/utils";
import { ALL_INVITATION_TEMPLATES } from "@/lib/templates/registry";
import { availabilityStore } from "@/lib/availability-store";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { checkAvailabilityMatrixAction, type MatrixResult } from "@/server/actions/availability-matrix";
import { MULTI_VENDOR_CATALOG } from "@/data/multi-vendor-catalog";
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
  AlertTriangle,
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

// Mapping categoryId/vendorId katalog → service ID kini diimpor dari
// "@/lib/builder-selection" (categoryToServiceMap, vendorToServiceMap).

export default function MixMatchBuilderPage() {
  // State: selected items map (awal kosong — diisi hanya bila akses via tombol "Pilih Layanan").
  const [selectedItems, setSelectedItems] = useState<{ [id: string]: { count?: number } }>({});

  // State: selected theme for digital invitation
  const [selectedThemeId, setSelectedThemeId] = useState("");

  // Baca URL param (auto-pilih layanan/tema) DAN hydrate dari cartStore,
  // lalu MERGE agar pilihan dari halaman /vendor/kategori/* tidak hilang.
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1) Hydrate dari cartStore (vendor yang dikumpulkan lintas halaman).
    const hydrated = selectionsFromCartItems(cartStore.getSnapshot().items);

    // 2) Auto-pilih dari URL param.
    const params = new URLSearchParams(window.location.search);
    const vendorParam = params.get("vendor");
    const catParam = params.get("cat");
    const serviceId =
      (vendorParam && vendorToServiceMap[vendorParam]) ||
      (catParam && (categoryToServiceMap[catParam] || vendorToServiceMap[catParam])) ||
      null;

    const fromUrl: { [id: string]: { count?: number } } = {};
    if (serviceId) {
      const service = KEBUMEN_SERVICES.find((s) => s.id === serviceId);
      if (service) fromUrl[serviceId] = { count: service.defaultUnit || 1 };
    }

    // 3) Merge: URL param menang atas hidrasi (bila bentrok), sisanya dipertahankan.
    setSelectedItems((prev) => mergeSelections(mergeSelections(prev, hydrated), fromUrl));

    // 4) Tema undangan dari URL.
    const themeFromUrl = params.get("selectedTheme");
    if (themeFromUrl && ALL_INVITATION_TEMPLATES.some((t) => t.id === themeFromUrl)) {
      setSelectedThemeId(themeFromUrl);
    }
  }, []);

  const router = useRouter();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);
  const checkoutDialogRef = useRef<HTMLDivElement>(null);
  const checkoutInitialFocusRef = useRef<HTMLButtonElement>(null);

  // Callback stabil (useCallback) supaya perubahan referensi dari re-render
  // (mis. saat mengetik di form) tidak me-restart focus trap & memindahkan
  // fokus kembali ke tombol "Batal".
  const closeCheckout = useCallback(() => setIsCheckoutOpen(false), []);

  // Focus trap + Escape untuk modal checkout (Phase 7 a11y).
  useFocusTrap(
    checkoutDialogRef,
    isCheckoutOpen,
    closeCheckout,
    checkoutInitialFocusRef
  );
  const [clientForm, setClientForm] = useState({
    name: "",
    phone: "",
    eventDate: "2026-11-20",
    venueAddress: "Gedung Pertemuan Setda Kebumen",
    notes: "",
  });

  // Reactive Availability Matrix (DB-backed, dengan fallback mock).
  const selectedVendors = KEBUMEN_SERVICES.filter((s) => selectedItems[s.id]).map((s) => s.vendor);
  const mockMatrixResult = availabilityStore.checkMatrix(clientForm.eventDate, selectedVendors);

  // Peta nama vendor → ID katalog (untuk resolve ke DB).
  const catalogIdByVendorName = React.useMemo(() => {
    const map: Record<string, { catalogVendorId: string; catalogPackageId: string }> = {};
    for (const v of MULTI_VENDOR_CATALOG) {
      map[v.name] = { catalogVendorId: v.id, catalogPackageId: v.packages[0]?.id ?? "" };
    }
    return map;
  }, []);

  const [dbMatrix, setDbMatrix] = React.useState<MatrixResult | null>(null);
  const [matrixPending, setMatrixPending] = React.useState(false);

  // Query ketersediaan nyata ketika tanggal/kategori berubah.
  React.useEffect(() => {
    const items = KEBUMEN_SERVICES.filter((s) => selectedItems[s.id])
      .map((s) => catalogIdByVendorName[s.vendor])
      .filter((x): x is { catalogVendorId: string; catalogPackageId: string } => Boolean(x?.catalogPackageId));

    if (!clientForm.eventDate || items.length === 0) {
      setDbMatrix(null);
      return;
    }

    let cancelled = false;
    setMatrixPending(true);
    checkAvailabilityMatrixAction({ eventDate: clientForm.eventDate, vendors: items })
      .then((res) => {
        if (!cancelled && res.success) setDbMatrix(res.data);
      })
      .finally(() => {
        if (!cancelled) setMatrixPending(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientForm.eventDate, selectedVendors.join(",")]);

  // Gunakan hasil DB bila ada; jika tidak, fallback ke mock.
  const matrixResult = dbMatrix ?? mockMatrixResult;

  // Calculate live total
  const calculateTotal = () => {
    let total = 0;
    Object.entries(selectedItems).forEach(([serviceId, itemState]) => {
      const service = KEBUMEN_SERVICES.find((s) => s.id === serviceId);
      if (!service) return;

      if (service.unitType && service.unitPrice) {
        const units = itemState.count || service.defaultUnit || 1;
        total += service.basePrice + units * service.unitPrice;
      } else {
        total += service.basePrice;
      }
    });
    return total;
  };

  const totalAmount = calculateTotal();
  const dpAmount = Math.round(totalAmount * 0.3);
  const settlementAmount = totalAmount - dpAmount;

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

  const syncToCart = () => {
    // Upsert: jangan clearCart — pertahankan kategori lain yang mungkin
    // dikumpulkan dari halaman /vendor/kategori/* tetapi belum diubah di builder.
    const builderServiceIds = new Set(
      KEBUMEN_SERVICES.filter((s) => selectedItems[s.id]).map((s) => s.id)
    );

    // Hapus dulu item cart yang kategorinya sedang di-drive builder,
    // agar tidak ada duplikat kategori; kategori lain tetap utuh.
    for (const item of cartStore.getSnapshot().items) {
      const serviceId =
        categoryToServiceMap[item.categoryId] || vendorToServiceMap[item.vendorId];
      if (serviceId && builderServiceIds.has(serviceId)) {
        cartStore.removeItem(item.id);
      }
    }

    KEBUMEN_SERVICES.filter((s) => selectedItems[s.id]).forEach((item) => {
      const current = selectedItems[item.id];
      const unitPrice =
        item.unitType && item.unitPrice
          ? item.basePrice + (current?.count || item.defaultUnit || 1) * item.unitPrice
          : item.basePrice;

      // Resolve ID katalog asli (v_*) dari nama vendor; fallback ke nama
      // ter-slug bila tidak ditemukan, supaya tidak pernah menulis "vendor_<id>".
      const catalog = catalogIdByVendorName[item.vendor];
      const vendorId =
        catalog?.catalogVendorId || item.vendor.toLowerCase().replace(/[^a-z0-9]/g, "-");

      // ServiceItem tidak punya field `categoryId`; turunkan dari peta
      // CATEGORY_TO_SERVICE agar konsisten dengan kunci cart yang dipakai
      // selectionsFromCartItems.
      const categoryId =
        Object.entries(categoryToServiceMap).find(([, sid]) => sid === item.id)?.[0] ??
        item.category.toLowerCase().replace(/[^a-z0-9]/g, "_");

      cartStore.addItem({
        categoryId,
        categoryTitle: item.category,
        vendorId,
        vendorName: item.vendor,
        district: "Kebumen Kota",
        packageId: catalog?.catalogPackageId || item.id,
        packageName: item.name,
        unitPrice,
        quantity: 1,
        callTime: "08:00 WIB",
        notes: item.description,
      });
    });

    if (clientForm.name || clientForm.phone) {
      cartStore.setCustomerInfo(clientForm.name, clientForm.phone);
    }
    if (clientForm.eventDate) {
      cartStore.setEventDate(clientForm.eventDate);
    }
    if (clientForm.venueAddress) {
      cartStore.setEventLocation(clientForm.venueAddress);
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    syncToCart();
    setIsOrderSubmitted(true);
    setTimeout(() => {
      router.push("/checkout");
    }, 600);
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
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark bg-gold/15 px-2 py-0.5 rounded-full">
                          {service.category}
                        </span>
                        <span className="text-xs text-plum-light font-medium">• {service.vendor}</span>
                        {availabilityStore.checkMatrix(clientForm.eventDate, [service.vendor]).isAllAvailable ? (
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            ✓ Siap Hadir
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                            Jadwal Terisi
                          </span>
                        )}
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
                        <label htmlFor={`pax-${service.id}`} className="font-bold text-plum">Jumlah Tamu (Pax):</label>
                        <input
                          id={`pax-${service.id}`}
                          type="range"
                          min="50"
                          max="500"
                          step="25"
                          value={currentItem?.count || 100}
                          onChange={(e) => updateCount(service.id, parseInt(e.target.value, 10))}
                          aria-valuetext={`${currentItem?.count || 100} pax`}
                          className="range range-xs range-primary w-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
                        />
                        <span className="font-mono font-bold text-plum bg-gold/15 px-2.5 py-1 rounded-lg" aria-hidden="true">
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
                          <option value="" disabled>
                            -- Pilih desain undangan --
                          </option>
                          {ALL_INVITATION_TEMPLATES.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.title} ({t.category})
                            </option>
                          ))}
                        </select>
                        <Link
                          href={`/undangan/demo?theme=${selectedThemeId || "autumnelle"}`}
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

            {/* Multi-Vendor Availability Matrix Box */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-gold/30 space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <label className="font-bold text-plum flex items-center gap-1.5 shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-gold-dark" />
                  <span>Tanggal Acara:</span>
                </label>
                <input
                  type="date"
                  value={clientForm.eventDate}
                  onChange={(e) => setClientForm((prev) => ({ ...prev, eventDate: e.target.value }))}
                  className="p-1.5 rounded-lg border border-gold/40 text-xs font-mono font-bold text-plum bg-white focus:outline-none focus:border-gold w-36"
                />
              </div>

              {selectedVendors.length > 0 && (
                matrixResult.isAllAvailable ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block">Matriks Ketersediaan 100% Bebas:</strong>
                      Seluruh {matrixResult.totalChecked} vendor terpilih siap hadir di Kebumen pada tanggal ini.
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-[11px] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block">Bentrok Jadwal Terdeteksi ({matrixResult.conflicts.length} Vendor):</strong>
                      {matrixResult.conflicts.map((c) => `${c.vendorName} (${c.reason})`).join(", ")}.
                    </div>
                  </div>
                )
              )}
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
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="builder-checkout-title"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            ref={checkoutDialogRef}
            className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl border border-gold/40 space-y-6 animate-fadeIn max-h-[90vh] overflow-y-auto"
          >
            {isOrderSubmitted ? (
              <div className="text-center space-y-4 py-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" aria-hidden="true" />
                <h3 id="builder-checkout-title" className="font-serif-luxury text-2xl font-bold text-plum">
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
                  <h3 id="builder-checkout-title" className="font-serif-luxury text-2xl font-bold text-plum">
                    Lengkapi Kontak Acara
                  </h3>
                  <p className="text-xs text-plum-light">
                    Tidak perlu kata sandi. Cukup nama dan nomor WhatsApp aktif.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label htmlFor="builder-name" className="text-xs font-bold text-plum">Nama Calon Pengantin / Keluarga</label>
                    <input
                      id="builder-name"
                      type="text"
                      required
                      placeholder="Contoh: Bima & Citra"
                      autoComplete="name"
                      value={clientForm.name}
                      onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                      className="focus-ring input input-sm w-full bg-[#FAF8F5] border-gold/30 rounded-xl text-plum"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="builder-phone" className="text-xs font-bold text-plum">Nomor WhatsApp Aktif</label>
                    <input
                      id="builder-phone"
                      type="tel"
                      required
                      placeholder="0812xxxxxxx"
                      autoComplete="tel"
                      inputMode="tel"
                      value={clientForm.phone}
                      onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                      className="focus-ring input input-sm w-full bg-[#FAF8F5] border-gold/30 rounded-xl text-plum"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="builder-event-date" className="text-xs font-bold text-plum">Tanggal Acara</label>
                      <input
                        id="builder-event-date"
                        type="date"
                        required
                        value={clientForm.eventDate}
                        onChange={(e) => setClientForm({ ...clientForm, eventDate: e.target.value })}
                        className="focus-ring input input-sm w-full bg-[#FAF8F5] border-gold/30 rounded-xl text-plum text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="builder-city" className="text-xs font-bold text-plum">Kota Pelaksanaan</label>
                      <input
                        id="builder-city"
                        type="text"
                        disabled
                        value="Kabupaten Kebumen"
                        className="input input-sm w-full bg-gray-100 border-gray-300 rounded-xl text-plum text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="builder-venue" className="text-xs font-bold text-plum">Lokasi Acara (Gedung / Kediaman)</label>
                    <input
                      id="builder-venue"
                      type="text"
                      required
                      placeholder="Contoh: Gedung Setda Kebumen"
                      value={clientForm.venueAddress}
                      onChange={(e) => setClientForm({ ...clientForm, venueAddress: e.target.value })}
                      className="focus-ring input input-sm w-full bg-[#FAF8F5] border-gold/30 rounded-xl text-plum"
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
                    ref={checkoutInitialFocusRef}
                    type="button"
                    onClick={closeCheckout}
                    className="focus-ring btn btn-sm btn-ghost text-plum rounded-full min-h-[44px]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="focus-ring btn btn-sm gold-gradient-bg text-plum-dark font-bold rounded-full border-none shadow-sm min-h-[44px]"
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
