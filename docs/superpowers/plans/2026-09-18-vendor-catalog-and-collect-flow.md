# Vendor Catalog Pages, Collect-Vendor Flow & Vendor Dashboard Relocation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add public `/vendor` (11-category catalog) and `/vendor/kategori/[kategori]` (per-vendor marketplace) pages, with a persistent "+ Rencana" collect flow that feeds the builder; relocate the vendor dashboard to `/dashboard/vendor/*`; and fix the builder's state/ID bugs.

**Architecture:** Reuse the existing localStorage-backed `cartStore` (key `hk_cart_v1`, dedupes one vendor per `categoryId`) as the cross-page selection store — no new store/provider. The builder hydrates from `cartStore` on mount and MERGES with URL params (currently it overwrites). The vendor dashboard moves from `src/app/vendor/**` to `src/app/dashboard/vendor/**`; the public profile `/vendor/[slug]` stays in place with its own clean layout. Middleware guard moves to `/dashboard/vendor/*`; `/vendor`, `/vendor/kategori/*`, `/vendor/[slug]` become public.

**Tech Stack:** Next.js App Router (server + client components), TypeScript, Tailwind CSS, lucide-react, `useSyncExternalStore` singleton stores, Node test runner (`tsx --test`).

**Spec:** `docs/superpowers/specs/2026-09-18-vendor-catalog-and-collect-flow-design.md`

## Global Constraints

- Kosakata kategori (stable join key, `categoryId`): `prewed, busana, mua, seserahan, foto, dekor, katering, cake, souvenir, undangan, denah`.
- Route katalog publik: `/vendor` dan `/vendor/kategori/[kategori]` — **publik**, tanpa guard.
- Route dashboard vendor: `/dashboard/vendor/*` — **dilindungi** role `VENDOR` atau `ADMIN`.
- Profil publik vendor tetap di `/vendor/[slug]`; back-link-nya tetap `/kategori/${vendor.categoryId}`.
- Data vendor perorangan dari `MULTI_VENDOR_CATALOG` (`src/data/multi-vendor-catalog.ts`) — filter `v.categoryId === kategori`.
- Store persisten: `cartStore` (`src/lib/cart-store.ts`, key `hk_cart_v1`). Tidak menambah dependency state baru.
- `vendorId` yang ditulis ke cart **harus** ID katalog asli (`v_*`), bukan `vendor_<serviceId>`.
- Dedupe cart: 1 vendor per `categoryId`.
- Komponen React baru yang memakai store/hook harus `"use client"`.
- Perintah verifikasi: `npm run typecheck`, `npm test`, `npm run build`.
- Commit di akhir tiap task.

---

## Struktur File

**Dibuat (baru):**
- `src/lib/vendor-categories.ts` — satu sumber kebenaran 11 kategori (id, title, icon, phase, shortDesc). Dipakai oleh `/vendor` index & homepage.
- `src/app/vendor/page.tsx` — index publik 11 card kategori (katalog/direktori).
- `src/app/vendor/kategori/[kategori]/page.tsx` — list vendor perorangan per kategori (marketplace) + tombol "+ Rencana" + bar ringkas.
- `src/app/vendor/[slug]/layout.tsx` — layout bersih untuk profil publik.
- `src/app/dashboard/vendor/**` — dashboard dipindah (dari `src/app/vendor/**`).
- `tests/vendor-categories.test.ts` — uji konsistensi kategori & lookup vendor.

**Dimodifikasi:**
- `src/app/page.tsx` — card homepage jadi "Lihat Layanan" → `/vendor/kategori/<id>`, hapus modal portofolio di section layanan.
- `src/app/builder/page.tsx` — hydrate dari cartStore + merge URL param; perbaiki `syncToCart` (skip clearCart, vendorId asli).
- `src/middleware.ts` — guard pindah ke `/dashboard/vendor/*`; `/vendor/*` publik; `getDashboardPath` VENDOR → `/dashboard/vendor/profil`.
- `src/lib/session.ts` — `getDashboardPath("VENDOR")` → `/dashboard/vendor/profil`.
- `src/lib/routes.ts` — `ROUTES.VENDOR.*` & registry → `/dashboard/vendor/*`; tambah `ROUTES.VENDOR_CATALOG`.
- `src/components/layout/Navbar.tsx` — link "Akses Portal" vendor → `/dashboard/vendor`.
- `src/components/vendor/VendorHeaderNav.tsx` — semua href → `/dashboard/vendor/*`.
- 6 breadcrumb di file dashboard (dompet, inbox, kalender, paket, portofolio, profil) → `/dashboard/vendor/*`.
- `src/app/auth/register-vendor/page.tsx` — `router.push("/dashboard/vendor")`.
- `src/app/vendor/profile/route.ts` → menjadi `src/app/dashboard/vendor/profile/route.ts` (redirect ke `/dashboard/vendor/profil`).
- `src/app/robots.ts` — disallow `/dashboard/vendor/*`.
- `src/server/actions/{vendor,vendor-profile,order,payment}.ts` — semua `revalidate`/`revalidatePath` → path baru.
- `src/lib/notification-store.ts` — URL WhatsApp template `/vendor/inbox` → `/dashboard/vendor/inbox`.

---

## Task 1: Sumber Kebenaran Kategori Vendor

Menghilangkan duplikasi 11 kategori dengan satu modul yang bisa diuji. Foundation untuk Task 2 & 3.

**Files:**
- Create: `src/lib/vendor-categories.ts`
- Test: `tests/vendor-categories.test.ts`

**Interfaces:**
- Produces:
  - `export type VendorCategoryId = "prewed" | "busana" | "mua" | "seserahan" | "foto" | "dekor" | "katering" | "cake" | "souvenir" | "undangan" | "denah";`
  - `export interface VendorCategory { id: VendorCategoryId; title: string; shortDesc: string; phase: "prewed_attire" | "main_event" | "details"; iconName: string; }`
  - `export const VENDOR_CATEGORIES: VendorCategory[]` — tepat 11 entri, urutan sesuai taxonomy.
  - `export function getVendorCategory(id: string): VendorCategory | undefined`
  - `export function getVendorsByCategory(id: string): VendorProfile[]` — filter `MULTI_VENDOR_CATALOG`.

- [x] **Step 1: Tulis test yang gagal**

Create `tests/vendor-categories.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  VENDOR_CATEGORIES,
  getVendorCategory,
  getVendorsByCategory,
} from "../src/lib/vendor-categories";
import { MULTI_VENDOR_CATALOG } from "../src/data/multi-vendor-catalog";

test("VENDOR_CATEGORIES has exactly 11 entries with unique ids", () => {
  assert.equal(VENDOR_CATEGORIES.length, 11);
  const ids = new Set(VENDOR_CATEGORIES.map((c) => c.id));
  assert.equal(ids.size, 11);
});

test("every category id is used by at least one catalog vendor", () => {
  for (const cat of VENDOR_CATEGORIES) {
    const vendors = getVendorsByCategory(cat.id);
    assert.ok(
      vendors.length >= 1,
      `category ${cat.id} should have at least one vendor`
    );
  }
});

test("getVendorsByCategory filters the catalog by categoryId", () => {
  const prewed = getVendorsByCategory("prewed");
  assert.ok(prewed.length >= 1);
  assert.ok(prewed.every((v) => v.categoryId === "prewed"));
  // sanity: count matches full catalog filter
  const expected = MULTI_VENDOR_CATALOG.filter((v) => v.categoryId === "prewed");
  assert.equal(prewed.length, expected.length);
});

test("getVendorCategory returns entry for known id and undefined otherwise", () => {
  assert.equal(getVendorCategory("mua")?.id, "mua");
  assert.equal(getVendorCategory("tidak-ada"), undefined);
});
```

- [x] **Step 2: Jalankan test, pastikan gagal**

Run: `npx tsx --test tests/vendor-categories.test.ts`
Expected: FAIL — `Cannot find module '../src/lib/vendor-categories'`.

- [x] **Step 3: Implementasi modul**

Create `src/lib/vendor-categories.ts`:

```ts
import { MULTI_VENDOR_CATALOG, type VendorProfile } from "@/data/multi-vendor-catalog";

export type VendorCategoryId =
  | "prewed"
  | "busana"
  | "mua"
  | "seserahan"
  | "foto"
  | "dekor"
  | "katering"
  | "cake"
  | "souvenir"
  | "undangan"
  | "denah";

export interface VendorCategory {
  id: VendorCategoryId;
  title: string;
  shortDesc: string;
  phase: "prewed_attire" | "main_event" | "details";
  iconName: string;
}

/**
 * Satu sumber kebenaran 11 kategori vendor Kebumen.
 * `id` WAJIB sama dengan `categoryId` di MULTI_VENDOR_CATALOG agar join stabil.
 */
export const VENDOR_CATEGORIES: VendorCategory[] = [
  { id: "prewed", title: "Pre-wedding Alam & Studio", shortDesc: "Sesi foto & video pra-acara di spot eksotis Kebumen.", phase: "prewed_attire", iconName: "Camera" },
  { id: "busana", title: "Busana Pengantin & Fitting", shortDesc: "Sewa kebaya, beskap adat, dan sesi fitting terkoordinasi.", phase: "prewed_attire", iconName: "Scissors" },
  { id: "mua", title: "Makeup Artist (MUA)", shortDesc: "Rias pengantin soft glam hingga adat Jawa keraton.", phase: "prewed_attire", iconName: "Palette" },
  { id: "seserahan", title: "Seserahan Akrilik & Mahar", shortDesc: "Hias baki akrilik, mahar, dan hantaran elegan.", phase: "main_event", iconName: "Gift" },
  { id: "foto", title: "Dokumentasi Foto & Video", shortDesc: "Liputan akad-resepsi, teaser, hingga drone highlight.", phase: "main_event", iconName: "Camera" },
  { id: "dekor", title: "Dekorasi Pelaminan & Florist", shortDesc: "Pelaminan bunga segar, backdrop, dan photobooth.", phase: "main_event", iconName: "Heart" },
  { id: "katering", title: "Katering Prasmanan & Stall", shortDesc: "Prasmanan khas Kebumen, stall, dan waiter standby.", phase: "main_event", iconName: "Utensils" },
  { id: "cake", title: "Cakes & Dessert Corner", shortDesc: "Kue pengantin bertingkat dan meja dessert.", phase: "details", iconName: "Cake" },
  { id: "souvenir", title: "Souvenir & Favors", shortDesc: "Suvenir anyaman pandan, pouch linen, dan cendera mata.", phase: "details", iconName: "Gift" },
  { id: "undangan", title: "Undangan Digital & Amplop", shortDesc: "Website undangan 65+ tema dan cetak fisik.", phase: "details", iconName: "Mail" },
  { id: "denah", title: "Cute Illustrated Maps", shortDesc: "Ilustrasi denah lokasi kartun siap cetak + QR.", phase: "details", iconName: "Map" },
];

export function getVendorCategory(id: string): VendorCategory | undefined {
  return VENDOR_CATEGORIES.find((c) => c.id === id);
}

export function getVendorsByCategory(id: string): VendorProfile[] {
  return MULTI_VENDOR_CATALOG.filter((v) => v.categoryId === id);
}
```

- [x] **Step 4: Jalankan test, pastikan lulus**

Run: `npx tsx --test tests/vendor-categories.test.ts`
Expected: PASS (4 tests).

- [x] **Step 5: Typecheck & commit**

Run: `npm run typecheck`
Expected: no errors.

```bash
git add src/lib/vendor-categories.ts tests/vendor-categories.test.ts
git commit -m "feat(vendor): add single source of truth for 11 vendor categories"
```

---

## Task 2: Halaman Index Publik `/vendor`

Halaman katalog/direktori 11 kategori, dibedakan dari halaman kategori (Task 3).

**Files:**
- Create: `src/app/vendor/page.tsx`
- Consumes: `VENDOR_CATEGORIES`, `getVendorsByCategory` dari Task 1.

**Interfaces:**
- Consumes: `VENDOR_CATEGORIES: VendorCategory[]`, `getVendorsByCategory(id): VendorProfile[]`
- Produces: route `GET /vendor` (komponen default `VendorCatalogIndexPage`).

- [x] **Step 1: Buat halaman index**

Create `src/app/vendor/page.tsx`:

```tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  Camera, Scissors, Palette, Gift, Heart, Utensils, Cake, Mail, Map,
  ArrowRight, Sparkles, Compass, Store,
} from "lucide-react";
import { VENDOR_CATEGORIES, getVendorsByCategory } from "@/lib/vendor-categories";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Camera, Scissors, Palette, Gift, Heart, Utensils, Cake, Mail, Map,
};

export default function VendorCatalogIndexPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-hk-soft-beige/70 text-hk-taupe text-xs font-manrope font-bold uppercase tracking-widest border border-hk-champagne/40">
          <Compass className="w-3.5 h-3.5" />
          <span>Katalog Vendor Kebumen</span>
        </div>
        <h1 className="font-editorial text-4xl sm:text-5xl text-hk-charcoal">
          11 Jenis Layanan Vendor Kebumen
        </h1>
        <p className="font-manrope text-sm text-hk-charcoal/70 leading-relaxed">
          Kenali setiap kategori layanan, lalu pilih vendor perorangan favorit Anda
          dan kumpulkan ke dalam rencana sebelum meracik paket di simulator.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/builder"
            className="inline-flex items-center gap-1.5 rounded-full bg-hk-taupe px-5 py-2.5 text-xs font-manrope font-bold text-white shadow-xs hover:bg-hk-charcoal transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Racik Paket Hari H</span>
          </Link>
        </div>
      </div>

      {/* Category Directory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {VENDOR_CATEGORIES.map((cat) => {
          const Icon = ICONS[cat.iconName] ?? Store;
          const vendorCount = getVendorsByCategory(cat.id).length;
          return (
            <Link
              key={cat.id}
              href={`/vendor/kategori/${cat.id}`}
              className="group relative p-6 rounded-3xl bg-white border border-hk-champagne/50 shadow-xs hover:border-hk-taupe hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col gap-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-hk-ivory border border-hk-champagne/60 flex items-center justify-center text-hk-taupe group-hover:scale-105 transition-transform shadow-2xs">
                <Icon className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="font-editorial text-2xl font-bold text-hk-charcoal group-hover:text-hk-taupe transition-colors">
                  {cat.title}
                </h2>
                <p className="font-manrope text-xs text-hk-charcoal/70 leading-relaxed">
                  {cat.shortDesc}
                </p>
              </div>
              <div className="mt-auto pt-3 border-t border-hk-champagne/40 flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-manrope font-bold uppercase tracking-wider bg-hk-soft-beige/70 text-hk-taupe border border-hk-champagne/40">
                  {vendorCount} vendor tersedia
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-manrope font-bold text-hk-charcoal group-hover:text-hk-taupe">
                  Lihat
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

- [x] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [x] **Step 3: Verifikasi manual**

Jalankan `npm run dev:next`, buka `http://localhost:3000/vendor`.
Expected: 11 card kategori tampil, tiap card menampilkan "X vendor tersedia" (prewed = 2, lainnya 1), tombol "Racik Paket Hari H" ada. Klik card → navigasi ke `/vendor/kategori/<id>` (halaman ini dibuat di Task 3 — untuk sekarang boleh 404, lanjut Task 3).

- [x] **Step 4: Commit**

```bash
git add src/app/vendor/page.tsx
git commit -m "feat(vendor): add public /vendor category directory index page"
```

---

## Task 3: Halaman `/vendor/kategori/[kategori]` + Collect Flow

Marketplace vendor perorangan per kategori, tombol "+ Rencana" persisten via `cartStore`, indikator "sudah di rencana", dan bar ringkas.

**Files:**
- Create: `src/app/vendor/kategori/[kategori]/page.tsx`
- Consumes: `getVendorCategory`, `getVendorsByCategory` (Task 1); `cartStore` / `useCart` (`src/lib/cart-store.ts`); `KEBUMEN_DISTRICTS`, `VendorProfile` (`src/data/multi-vendor-catalog.ts`).

**Interfaces:**
- Consumes:
  - `getVendorCategory(id: string): VendorCategory | undefined`
  - `getVendorsByCategory(id: string): VendorProfile[]`
  - `useCart(): { items: CartVendorItem[]; addItem(item: Omit<CartVendorItem,"id">): void; ... }`
  - `CartVendorItem` fields: `categoryId, categoryTitle, vendorId, vendorName, district, packageId, packageName, unitPrice, quantity, callTime, notes`.
- Produces: route `GET /vendor/kategori/[kategori]` (default export `VendorCategoryDetailPage`).

- [x] **Step 1: Buat halaman kategori**

Create `src/app/vendor/kategori/[kategori]/page.tsx`:

```tsx
"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Star, CheckCircle2, ArrowRight, Filter, ChevronLeft,
  Sparkles, Eye, Plus, Check,
} from "lucide-react";
import { KEBUMEN_DISTRICTS, type VendorProfile } from "@/data/multi-vendor-catalog";
import { getVendorCategory, getVendorsByCategory } from "@/lib/vendor-categories";
import { useCart } from "@/lib/cart-store";

interface PageProps {
  params: Promise<{ kategori: string }>;
}

export default function VendorCategoryDetailPage({ params }: PageProps) {
  const { kategori } = use(params);
  const category = getVendorCategory(kategori);
  const vendors = getVendorsByCategory(kategori);

  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [pendingSwap, setPendingSwap] = useState<VendorProfile | null>(null);

  const { items, addItem } = useCart();

  const filteredVendors = vendors.filter((v) => {
    if (selectedDistrict === "all") return true;
    return v.district.toLowerCase() === selectedDistrict.toLowerCase();
  });

  const plannedCount = items.length;
  const isPlanned = (vendorId: string) =>
    items.some((i) => i.vendorId === vendorId);

  const addVendorToPlan = (vendor: VendorProfile) => {
    const pkg = vendor.packages[0];
    if (!pkg) return;
    addItem({
      categoryId: vendor.categoryId,
      categoryTitle: vendor.categoryTitle,
      vendorId: vendor.id,
      vendorName: vendor.name,
      district: vendor.district,
      packageId: pkg.id,
      packageName: pkg.name,
      unitPrice: pkg.price,
      quantity: 1,
      callTime: pkg.callTime,
      notes: pkg.desc,
    });
  };

  const handlePlanClick = (vendor: VendorProfile) => {
    const existing = items.find((i) => i.categoryId === vendor.categoryId);
    if (existing && existing.vendorId !== vendor.id) {
      setPendingSwap(vendor);
      return;
    }
    addVendorToPlan(vendor);
  };

  const confirmSwap = () => {
    if (pendingSwap) addVendorToPlan(pendingSwap);
    setPendingSwap(null);
  };

  if (!category) {
    return (
      <div className="min-h-screen py-20 px-4 max-w-3xl mx-auto text-center space-y-4">
        <h1 className="font-editorial text-3xl text-hk-charcoal">
          Kategori tidak ditemukan
        </h1>
        <Link href="/vendor" className="text-hk-taupe font-manrope font-bold hover:underline">
          Kembali ke Katalog Vendor
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-manrope text-hk-charcoal/70">
        <Link href="/vendor" className="hover:text-hk-charcoal">Katalog Vendor</Link>
        <span>/</span>
        <span className="text-hk-charcoal font-bold">{category.title}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-hk-champagne/40 pb-6">
        <div className="space-y-2">
          <Link
            href="/vendor"
            className="inline-flex items-center gap-1.5 text-xs font-manrope font-semibold text-hk-taupe hover:underline mb-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Semua Kategori</span>
          </Link>
          <h1 className="font-editorial text-3xl sm:text-5xl text-hk-charcoal">
            Vendor {category.title}
          </h1>
          <p className="font-manrope text-sm text-hk-charcoal/70 max-w-2xl leading-relaxed">
            {vendors.length} mitra terverifikasi siap berkolaborasi. Tambahkan ke
            rencana Anda, lalu racik paketnya di simulator.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Filter className="w-4 h-4 text-hk-taupe" />
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="rounded-full border border-hk-champagne/60 bg-white px-4 py-2 text-xs font-manrope font-semibold text-hk-charcoal shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-hk-taupe"
          >
            <option value="all">Semua Kecamatan di Kebumen</option>
            {KEBUMEN_DISTRICTS.map((d) => (
              <option key={d} value={d}>Kecamatan {d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Vendor Grid */}
      {filteredVendors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => {
            const planned = isPlanned(vendor.id);
            return (
              <div
                key={vendor.id}
                className="group rounded-3xl bg-white border border-hk-champagne/50 shadow-xs hover:border-hk-taupe hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full bg-hk-charcoal overflow-hidden">
                    <Image
                      src={vendor.coverImage}
                      alt={vendor.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-manrope font-bold uppercase tracking-wider bg-white/90 text-hk-charcoal border border-hk-champagne/40 shadow-2xs flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-hk-taupe" />
                        <span>Kec. {vendor.district}</span>
                      </span>
                      {vendor.verified && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-manrope font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          <span>Terverifikasi</span>
                        </span>
                      )}
                    </div>
                    {planned && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-manrope font-bold bg-hk-taupe text-white shadow-2xs flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Di Rencana</span>
                      </span>
                    )}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-editorial text-2xl font-bold leading-tight">
                        {vendor.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs font-manrope">
                      <div className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{vendor.rating}</span>
                        <span className="text-hk-charcoal/50 font-normal">
                          ({vendor.reviewCount} ulasan)
                        </span>
                      </div>
                      <span className="text-hk-charcoal/60 text-[11px]">
                        {vendor.packages.length} Pilihan Paket
                      </span>
                    </div>
                    <p className="font-manrope text-xs text-hk-charcoal/70 leading-relaxed line-clamp-2">
                      {vendor.bio}
                    </p>
                    {vendor.packages[0] && (
                      <div className="pt-3 border-t border-hk-champagne/30 flex items-center justify-between text-xs font-manrope">
                        <div>
                          <span className="text-[10px] text-hk-charcoal/60 block">Mulai dari:</span>
                          <span className="font-mono font-bold text-hk-charcoal">
                            Rp {vendor.packages[0].price.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <span className="text-[10px] text-hk-taupe font-semibold bg-hk-soft-beige/70 px-2 py-0.5 rounded-full">
                          Call Time: {vendor.packages[0].callTime}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePlanClick(vendor)}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-manrope font-bold transition-all shadow-2xs ${
                      planned
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-hk-taupe text-white hover:bg-hk-charcoal"
                    }`}
                  >
                    {planned ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{planned ? "Sudah di Rencana" : "+ Rencana"}</span>
                  </button>
                  <Link
                    href={`/vendor/${vendor.slug}`}
                    className="flex items-center justify-center gap-1.5 rounded-full border border-hk-champagne/60 bg-hk-ivory px-4 py-2 text-xs font-manrope font-bold text-hk-charcoal hover:bg-hk-taupe hover:text-white transition-all shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Profil</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white border border-hk-champagne/40 space-y-3">
          <p className="font-editorial text-2xl text-hk-charcoal">
            Belum ada mitra di Kecamatan {selectedDistrict}.
          </p>
          <button
            onClick={() => setSelectedDistrict("all")}
            className="px-5 py-2 rounded-full bg-hk-taupe text-white text-xs font-manrope font-bold hover:bg-hk-charcoal transition-all"
          >
            Reset Filter Kecamatan
          </button>
        </div>
      )}

      {/* Sticky Summary Bar */}
      {plannedCount > 0 && (
        <div className="sticky bottom-4 z-30 mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-3 rounded-full bg-hk-charcoal text-white px-5 py-3 shadow-xl">
            <span className="font-manrope text-xs font-semibold">
              {plannedCount} layanan di rencana
            </span>
            <Link
              href="/builder"
              className="inline-flex items-center gap-1.5 rounded-full bg-hk-taupe px-4 py-1.5 text-xs font-manrope font-bold hover:bg-white hover:text-hk-charcoal transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Racik sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Swap Confirmation Modal */}
      {pendingSwap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 space-y-4 shadow-2xl">
            <h2 className="font-editorial text-2xl text-hk-charcoal">
              Ganti vendor {category.title}?
            </h2>
            <p className="font-manrope text-sm text-hk-charcoal/70 leading-relaxed">
              Kategori ini sudah berisi pilihan lain. Mengganti akan menghapus
              pilihan sebelumnya dan memakai{" "}
              <strong className="text-hk-charcoal">{pendingSwap.name}</strong>.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPendingSwap(null)}
                className="rounded-full border border-hk-champagne/60 bg-white px-4 py-2 text-xs font-manrope font-bold text-hk-charcoal hover:bg-hk-ivory transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmSwap}
                className="rounded-full bg-hk-taupe px-4 py-2 text-xs font-manrope font-bold text-white hover:bg-hk-charcoal transition-all"
              >
                Ganti Vendor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [x] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [x] **Step 3: Verifikasi manual**

`npm run dev:next`, buka:
1. `/vendor` → klik card "Pre-wedding Alam & Studio" → `/vendor/kategori/prewed` menampilkan 2 vendor (Menganti Cinematic, Lensa Walet).
2. Klik "+ Rencana" pada satu vendor → badge "Di Rencana" muncul, bar "1 layanan di rencana" muncul.
3. Buka `/vendor/kategori/busana` → klik vendor → bar jadi "2 layanan di rencana" (persist lintas halaman).
4. Kembali ke `/vendor/kategori/prewed`, klik "+ Rencana" pada vendor prewed **lainnya** → modal "Ganti vendor Pre-wedding?" muncul; klik "Ganti Vendor" → tetap 2 layanan total (dedupe per kategori).
5. Refresh halaman (F5) → badge & bar tetap (localStorage `hk_cart_v1`).
6. "Racik sekarang" → menuju `/builder`.

- [x] **Step 4: Commit**

```bash
git add "src/app/vendor/kategori/[kategori]/page.tsx"
git commit -m "feat(vendor): add /vendor/kategori/[kategori] marketplace with persistent +Rencana collect flow"
```

---

## Task 4: Layout Bersih untuk Profil Publik `/vendor/[slug]`

Memisahkan profil publik dari header nav dashboard.

**Files:**
- Create: `src/app/vendor/[slug]/layout.tsx`

**Interfaces:**
- Produces: layout passthrough (tanpa header dashboard) untuk segmen `/vendor/[slug]`.

- [x] **Step 1: Buat layout**

Create `src/app/vendor/[slug]/layout.tsx`:

```tsx
import React from "react";

/**
 * Layout profil publik vendor (/vendor/[slug]).
 * Sengaja polos — TANPA VendorHeaderNav dashboard, karena ini area publik.
 */
export default function PublicVendorProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

- [x] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [x] **Step 3: Verifikasi manual**

Buka `/vendor/menganti-cinematic` → halaman profil publik tampil **tanpa** bar nav dashboard (Data Diri, Kalender Blackout, dst). Tombol back mengarah ke `/kategori/prewed`.

- [x] **Step 4: Commit**

```bash
git add "src/app/vendor/[slug]/layout.tsx"
git commit -m "feat(vendor): give public vendor profile its own clean layout"
```

---

## Task 5: Relokasi Dashboard Vendor ke `/dashboard/vendor/*`

Pindahkan seluruh folder dashboard dan update semua link/breadcrumb.

**Files:**
- Move: `src/app/vendor/page.tsx` → `src/app/dashboard/vendor/page.tsx`
- Move: `src/app/vendor/layout.tsx` → `src/app/dashboard/vendor/layout.tsx`
- Move: `src/app/vendor/error.tsx` → `src/app/dashboard/vendor/error.tsx`
- Move: `src/app/vendor/dompet/**`, `inbox/**`, `kalender/**`, `paket/**`, `portofolio/**`, `profil/**`, `profile/**` → `src/app/dashboard/vendor/**`
- Modify: `src/components/vendor/VendorHeaderNav.tsx` (7 href)
- Modify: 6 breadcrumb + 1 cross-nav di file dashboard
- Modify: `src/app/auth/register-vendor/page.tsx:44`

**PENTING:** Jangan pindahkan `src/app/vendor/[slug]/page.tsx` (profil publik) dan `src/app/vendor/kategori/` (Task 3). Hanya folder dashboard.

- [x] **Step 1: Buat folder tujuan & pindahkan file dashboard**

```bash
New-Item -ItemType Directory -Force -Path "src/app/dashboard/vendor" | Out-Null
Move-Item -LiteralPath "src/app/vendor/page.tsx" "src/app/dashboard/vendor/page.tsx"
Move-Item -LiteralPath "src/app/vendor/layout.tsx" "src/app/dashboard/vendor/layout.tsx"
Move-Item -LiteralPath "src/app/vendor/error.tsx" "src/app/dashboard/vendor/error.tsx"
Move-Item -LiteralPath "src/app/vendor/dompet" "src/app/dashboard/vendor/dompet"
Move-Item -LiteralPath "src/app/vendor/inbox" "src/app/dashboard/vendor/inbox"
Move-Item -LiteralPath "src/app/vendor/kalender" "src/app/dashboard/vendor/kalender"
Move-Item -LiteralPath "src/app/vendor/paket" "src/app/dashboard/vendor/paket"
Move-Item -LiteralPath "src/app/vendor/portofolio" "src/app/dashboard/vendor/portofolio"
Move-Item -LiteralPath "src/app/vendor/profil" "src/app/dashboard/vendor/profil"
Move-Item -LiteralPath "src/app/vendor/profile" "src/app/dashboard/vendor/profile"
```

- [x] **Step 2: Verifikasi struktur folder**

Run: `Get-ChildItem -Recurse -Directory src/app/vendor, src/app/dashboard/vendor | Select-Object FullName`
Expected: `src/app/vendor/` hanya berisi `[slug]` dan `kategori`. `src/app/dashboard/vendor/` berisi page/layout/error + dompet, inbox, kalender, paket, portofolio, profil, profile.

- [x] **Step 3: Update VendorHeaderNav**

Di `src/components/vendor/VendorHeaderNav.tsx`, ganti semua href:
- `/vendor/profil` → `/dashboard/vendor/profil`
- `/vendor` → `/dashboard/vendor`
- `/vendor/kalender` → `/dashboard/vendor/kalender`
- `/vendor/paket` → `/dashboard/vendor/paket`
- `/vendor/portofolio` → `/dashboard/vendor/portofolio`
- `/vendor/inbox` → `/dashboard/vendor/inbox`
- `/vendor/dompet` → `/dashboard/vendor/dompet`

(Tepat 7 penggantian di array `navItems`.)

- [x] **Step 4: Update breadcrumb & cross-nav dashboard**

Ganti `/vendor` → `/dashboard/vendor` pada file-file ini:
- `src/app/dashboard/vendor/dompet/page.tsx` (breadcrumb)
- `src/app/dashboard/vendor/inbox/VendorInboxClient.tsx` (breadcrumb `/vendor` → `/dashboard/vendor`, dan `/vendor/kalender` → `/dashboard/vendor/kalender`)
- `src/app/dashboard/vendor/kalender/VendorKalenderClient.tsx`
- `src/app/dashboard/vendor/paket/VendorPaketClient.tsx`
- `src/app/dashboard/vendor/portofolio/VendorPortofolioClient.tsx`
- `src/app/dashboard/vendor/profil/VendorProfilWorkspace.tsx`

**JANGAN ubah** link `href={\`/vendor/${...}\`}` (profil publik) di `VendorPortofolioClient.tsx`.

- [x] **Step 5: Update redirect register vendor**

`src/app/auth/register-vendor/page.tsx:44`: `router.push("/vendor")` → `router.push("/dashboard/vendor")`.

- [x] **Step 6: Typecheck**

Run: `npm run typecheck`
Expected: no errors (pastikan tidak ada import rusak akibat pemindahan).

- [x] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor(vendor): relocate vendor dashboard to /dashboard/vendor/* and update links"
```

---

## Task 6: Route Registry, Middleware Guard & Session Redirect

**Files:**
- Modify: `src/lib/routes.ts`
- Modify: `src/middleware.ts`
- Modify: `src/lib/session.ts`

**Interfaces:**
- Produces:
  - `ROUTES.VENDOR.DASHBOARD = '/dashboard/vendor'`, dst.
  - `ROUTES.VENDOR_CATALOG = '/vendor'`, `ROUTES.VENDOR_CATEGORY: (id: string) => '/vendor/kategori/' + id`
  - `getDashboardPath("VENDOR")` → `/dashboard/vendor/profil` (di `middleware.ts` & `lib/session.ts`).

- [x] **Step 1: Update `src/lib/routes.ts`**

Ganti blok `VENDOR: { ... }` (baris 31-38) menjadi:

```ts
  // 4. Portal Mitra Vendor
  VENDOR: {
    DASHBOARD: '/dashboard/vendor',
    INBOX: '/dashboard/vendor/inbox',
    PORTOFOLIO: '/dashboard/vendor/portofolio',
    PAKET: '/dashboard/vendor/paket',
    KALENDER: '/dashboard/vendor/kalender',
    DOMPET: '/dashboard/vendor/dompet',
    PROFIL: '/dashboard/vendor/profil',
  },
```

Tambahkan di blok "Publik & Katalog Hyperlocal" (setelah baris `VENDOR_PROFILE`):

```ts
  VENDOR_CATALOG: '/vendor',
  VENDOR_CATEGORY: (id: string) => `/vendor/kategori/${id}`,
```

Update entri `ROUTE_REGISTRY` untuk kategori `vendor` (baris 115-120):

```ts
  { path: '/dashboard/vendor', label: 'Ringkasan Toko', category: 'vendor' },
  { path: '/dashboard/vendor/inbox', label: 'Kotak Masuk Order', category: 'vendor' },
  { path: '/dashboard/vendor/portofolio', label: 'Portofolio Mandiri', category: 'vendor' },
  { path: '/dashboard/vendor/paket', label: 'Daftar Paket & Harga', category: 'vendor' },
  { path: '/dashboard/vendor/kalender', label: 'Kalender Blackout Dates', category: 'vendor' },
  { path: '/dashboard/vendor/dompet', label: 'Dompet Saldo Escrow', category: 'vendor' },
```

- [x] **Step 2: Update `src/middleware.ts`**

Ganti `getDashboardPath` (baris 33-37):

```ts
function getDashboardPath(role: string): string {
  if (role === "ADMIN") return "/admin";
  if (role === "VENDOR") return "/dashboard/vendor/profil";
  return "/client/profil";
}
```

Ganti alias redirect (baris 44-50):

```ts
  // ── 0. Alias redirects ──
  if (pathname === "/dashboard/vendor/profile") {
    return NextResponse.redirect(new URL("/dashboard/vendor/profil", request.url));
  }
  if (pathname === "/client/profile") {
    return NextResponse.redirect(new URL("/client/profil", request.url));
  }
```

**Ganti** blok §3 & §4 (baris 77-123) dengan guard untuk `/dashboard/vendor`:

```ts
  // ── 3. Proteksi /dashboard/vendor/* → hanya VENDOR atau ADMIN ──
  if (pathname.startsWith("/dashboard/vendor")) {
    if (!session) {
      const url = new URL("/auth/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (session.role !== "VENDOR" && session.role !== "ADMIN") {
      return NextResponse.redirect(
        new URL(getDashboardPath(session.role), request.url)
      );
    }
    return NextResponse.next();
  }
```

**Catatan:** `/vendor/*` (index, kategori, [slug]) **tidak lagi dilindungi** — tidak perlu blok guard untuk `/vendor`. Hapus seluruh blok §3 lama (`pathname.startsWith("/vendor/")`) dan §4 lama (`pathname === "/vendor"`).

- [x] **Step 3: Update `src/lib/session.ts`**

Baris 63: `return "/vendor/profil";` → `return "/dashboard/vendor/profil";`

- [x] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [x] **Step 5: Verifikasi manual**

1. Buka `/dashboard/vendor` tanpa login → redirect `/auth/login?callbackUrl=/dashboard/vendor`.
2. Buka `/vendor` tanpa login → halaman katalog tampil (publik).
3. Buka `/vendor/kategori/prewed` tanpa login → tampil (publik).
4. Buka `/vendor/menganti-cinematic` tanpa login → tampil (publik).

- [x] **Step 6: Commit**

```bash
git add src/lib/routes.ts src/middleware.ts src/lib/session.ts
git commit -m "refactor(routes): guard /dashboard/vendor, make /vendor catalog public, update route registry"
```

---

## Task 7: Update Navbar "Akses Portal" Vendor

**Files:**
- Modify: `src/components/layout/Navbar.tsx:105`, `:203`

- [x] **Step 1: Update link desktop & mobile**

Di `Navbar.tsx`, ganti **dua** kemunculan `href="/vendor"` (baris 105 dropdown desktop, baris 203 grid mobile) menjadi `href="/dashboard/vendor"`.

- [x] **Step 2: Verifikasi tidak ada sisa link dashboard**

Run: `Select-String -Path "src/components/layout/Navbar.tsx" -Pattern 'href="/vendor"'`
Expected: tidak ada hasil. Label "Portal Mitra Vendor Kebumen" & "Vendor" tetap.

- [x] **Step 3: Commit**

```bash
git add src/components/layout/Navbar.tsx
git commit -m "refactor(navbar): point vendor portal link to /dashboard/vendor"
```

---

## Task 8: Update Robots, Notification URL & Server Action Revalidation

**Files:**
- Modify: `src/app/robots.ts:19-24`
- Modify: `src/lib/notification-store.ts:210`
- Modify: `src/server/actions/vendor.ts`
- Modify: `src/server/actions/vendor-profile.ts`
- Modify: `src/server/actions/order.ts`
- Modify: `src/server/actions/payment.ts`

- [x] **Step 1: Update robots disallow list**

Ganti entri `/vendor/*` (baris 19-24) menjadi `/dashboard/vendor/*`:

```ts
    "/dashboard/vendor/dompet",
    "/dashboard/vendor/inbox",
    "/dashboard/vendor/paket",
    "/dashboard/vendor/kalender",
    "/dashboard/vendor/profil",
    "/dashboard/vendor/profile",
```

- [x] **Step 2: Update notification URL template**

`src/lib/notification-store.ts:210`: `https://harikita.id/vendor/inbox` → `https://harikita.id/dashboard/vendor/inbox`.

- [x] **Step 3: Update semua revalidate/revalidatePath**

Ganti setiap path `/vendor/...` atau `/vendor` pada `revalidate([...])` / `revalidatePath(...)`:
- `src/server/actions/vendor.ts`: `/vendor/kalender` → `/dashboard/vendor/kalender`; `/vendor/paket` → `/dashboard/vendor/paket`; `/vendor/portofolio` → `/dashboard/vendor/portofolio`; `/vendor` → `/dashboard/vendor`. **Biarkan `/kategori` apa adanya.**
- `src/server/actions/vendor-profile.ts`: `/vendor/profil` → `/dashboard/vendor/profil`; `/vendor` → `/dashboard/vendor`.
- `src/server/actions/order.ts`: `... + "/vendor/inbox"` → `... + "/dashboard/vendor/inbox"` (semua 4 kemunculan).
- `src/server/actions/payment.ts`: `"${...}/vendor/dompet"` → `... /dashboard/vendor/dompet` (2 kemunculan).

- [x] **Step 4: Verify tidak ada sisa**

Run: `Select-String -Path "src/server/actions/*.ts" -Pattern '/vendor/'`
Expected: tidak ada hasil (kecuali komentar bila ada — pastikan bukan path revalidate).

- [x] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [x] **Step 6: Commit**

```bash
git add src/app/robots.ts src/lib/notification-store.ts src/server/actions/
git commit -m "chore(vendor): update robots, notification URL and revalidation paths to /dashboard/vendor"
```

---

## Task 9: Perbaiki Builder — Hydrate dari cartStore + Merge URL Param

Builder harus memuat vendor yang sudah dikumpulkan (dari cartStore) saat mount dan MERGE dengan URL param, bukan menimpa.

**Files:**
- Modify: `src/app/builder/page.tsx:209-237` (efek mount)
- Test: `tests/builder-hydration.test.ts` (uji helper murni)

**Interfaces:**
- Produces:
  - Fungsi murni `mergeSelections(base, extra)` diekspor dari `src/lib/builder-selection.ts` untuk diuji.
  - Efek mount builder memuat `cartStore.getSnapshot().items` → ubah ke `selectedItems` via peta kategori/vendor → merge.

- [x] **Step 1: Buat helper murni + test yang gagal**

Create `src/lib/builder-selection.ts`:

```ts
/**
 * Utilitas seleksi builder — fungsi murni agar mudah diuji.
 */
export type SelectionMap = { [id: string]: { count?: number } };

/**
 * Merge dua peta seleksi. `extra` menang atas `base` untuk key yang sama.
 * Tidak memutasi input.
 */
export function mergeSelections(
  base: SelectionMap,
  extra: SelectionMap
): SelectionMap {
  return { ...base, ...extra };
}

/** Kategori cart item → serviceId builder. */
export const CATEGORY_TO_SERVICE: Record<string, string> = {
  prewed: "prewed-1",
  busana: "busana-1",
  mua: "mua-1",
  seserahan: "seserahan-1",
  foto: "foto-1",
  dekor: "dekor-1",
  katering: "katering-1",
  cake: "cake-1",
  souvenir: "souvenir-1",
  undangan: "undangan-1",
  denah: "denah-1",
};

/** Vendor katalog ID → serviceId builder. */
export const VENDOR_TO_SERVICE: Record<string, string> = {
  v_prewed_01: "prewed-1",
  v_prewed_02: "prewed-1",
  v_busana_01: "busana-1",
  v_mua_01: "mua-1",
  v_seserahan_01: "seserahan-1",
  v_foto_01: "foto-1",
  v_dekor_01: "dekor-1",
  v_katering_01: "katering-1",
  v_cake_01: "cake-1",
  v_souvenir_01: "souvenir-1",
  v_undangan_01: "undangan-1",
  v_denah_01: "denah-1",
};

/**
 * Ubah daftar item cart → peta seleksi builder, memakai categoryId
 * (fallback vendorId). Item tanpa pemetaan diabaikan.
 */
export function selectionsFromCartItems(
  items: Array<{ categoryId: string; vendorId: string }>
): SelectionMap {
  const result: SelectionMap = {};
  for (const item of items) {
    const serviceId =
      CATEGORY_TO_SERVICE[item.categoryId] || VENDOR_TO_SERVICE[item.vendorId];
    if (serviceId) result[serviceId] = {};
  }
  return result;
}
```

Create `tests/builder-hydration.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mergeSelections,
  selectionsFromCartItems,
  CATEGORY_TO_SERVICE,
} from "../src/lib/builder-selection";

test("mergeSelections keeps base keys and lets extra win on collision", () => {
  const base = { "prewed-1": { count: 1 }, "mua-1": { count: 2 } };
  const extra = { "mua-1": { count: 5 }, "dekor-1": {} };
  const merged = mergeSelections(base, extra);
  assert.deepEqual(Object.keys(merged).sort(), ["dekor-1", "mua-1", "prewed-1"]);
  assert.equal(merged["mua-1"].count, 5);
  assert.equal(merged["prewed-1"].count, 1);
});

test("mergeSelections does not mutate inputs", () => {
  const base = { "prewed-1": {} };
  const extra = { "mua-1": {} };
  mergeSelections(base, extra);
  assert.deepEqual(Object.keys(base), ["prewed-1"]);
});

test("CATEGORY_TO_SERVICE covers all 11 categories", () => {
  assert.equal(Object.keys(CATEGORY_TO_SERVICE).length, 11);
});

test("selectionsFromCartItems maps cart items to service ids", () => {
  const items = [
    { categoryId: "prewed", vendorId: "v_prewed_02" },
    { categoryId: "katering", vendorId: "v_katering_01" },
  ];
  const sel = selectionsFromCartItems(items);
  assert.deepEqual(Object.keys(sel).sort(), ["katering-1", "prewed-1"]);
});

test("selectionsFromCartItems falls back to vendorId when category unknown", () => {
  const items = [{ categoryId: "unknown", vendorId: "v_mua_01" }];
  const sel = selectionsFromCartItems(items);
  assert.deepEqual(Object.keys(sel), ["mua-1"]);
});

test("selectionsFromCartItems ignores unmapped items", () => {
  const sel = selectionsFromCartItems([{ categoryId: "x", vendorId: "y" }]);
  assert.equal(Object.keys(sel).length, 0);
});
```

- [x] **Step 2: Jalankan test, pastikan gagal**

Run: `npx tsx --test tests/builder-hydration.test.ts`
Expected: FAIL — module not found.

- [x] **Step 3: Jalankan test setelah helper ada**

Run: `npx tsx --test tests/builder-hydration.test.ts`
Expected: PASS (6 tests).

- [x] **Step 4: Refactor builder — hapus peta lokal, pakai helper, hydrate + merge**

Di `src/app/builder/page.tsx`:

(a) Tambah import di atas (setelah import `cartStore`):

```tsx
import {
  mergeSelections,
  selectionsFromCartItems,
  CATEGORY_TO_SERVICE as categoryToServiceMap,
  VENDOR_TO_SERVICE as vendorToServiceMap,
} from "@/lib/builder-selection";
```

(b) **Hapus** deklarasi lokal `categoryToServiceMap` (baris 171-183) dan `vendorToServiceMap` (baris 186-199) — kini diimpor.

(c) Ganti isi efek mount (baris 209-237) agar hydrate dari cartStore **dan** merge URL param:

```tsx
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
```

- [x] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [x] **Step 6: Verifikasi manual**

1. `/vendor/kategori/prewed` → "+ Rencana" vendor → `/vendor/kategori/katering` → "+ Rencana" vendor.
2. Buka `/builder` → **dua** layanan (Pre-wedding + Katering) tampil terpilih.
3. `/builder?cat=dekor` → dekor ditambahkan, prewed & katering **tetap** terpilih (tidak tertimpa).

- [x] **Step 7: Commit**

```bash
git add src/lib/builder-selection.ts tests/builder-hydration.test.ts src/app/builder/page.tsx
git commit -m "fix(builder): hydrate selections from cartStore and merge (not overwrite) URL params"
```

---

## Task 10: Perbaiki Builder — syncToCart (jangan clearCart, vendorId asli)

**Files:**
- Modify: `src/app/builder/page.tsx:351-384` (`syncToCart`)

**Interfaces:**
- Consumes: `catalogIdByVendorName` (memo builder, baris 271-277), `cartStore.removeItem`, `cartStore.addItem`.
- Produces: perilaku upsert cart — item builder menggantikan item kategori yang sama tanpa menghapus kategori lain.

- [x] **Step 1: Ganti `syncToCart`**

Ganti seluruh fungsi `syncToCart` (baris 351-384) dengan:

```tsx
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

      cartStore.addItem({
        categoryId: item.categoryId ?? categoryToServiceMap[item.id] ?? item.category.toLowerCase().replace(/[^a-z0-9]/g, "_"),
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
```

**Catatan:** `item.categoryId` tidak ada pada `ServiceItem`; ekspresi di atas memakai peta kategori dari serviceId agar `categoryId` konsisten dengan `CATEGORY_TO_SERVICE`. Bila hasilnya tetap tidak pas, gunakan `Object.entries(categoryToServiceMap).find(([, sid]) => sid === item.id)?.[0]`. Pilih satu bentuk dan pastikan `categoryId` bertipe string.

- [x] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors. (Jika `item.categoryId` memicu error, ganti dengan lookup `Object.entries(categoryToServiceMap).find(...)`.)

- [x] **Step 3: Verifikasi manual — ID katalog asli**

1. Di `/builder`, pilih Katering + submit checkout.
2. Sebelum pindah, buka DevTools → Application → localStorage → `hk_cart_v1`.
3. Expected: item katering punya `"vendorId": "v_katering_01"` (BUKAN `"vendor_katering-1"`) dan `"packageId"` = ID paket katalog.
4. Submit → `/checkout` menampilkan item tanpa error.

- [x] **Step 4: Commit**

```bash
git add src/app/builder/page.tsx
git commit -m "fix(builder): upsert cart without clearing and write real catalog vendor IDs"
```

---

## Task 11: Homepage — Card "Lihat Layanan" & Hapus Modal Portofolio di Section Layanan

**Files:**
- Modify: `src/app/page.tsx` (section layanan baris ~642-711; pemakaian modal baris ~1044)

- [x] **Step 1: Ganti aksi card jadi "Lihat Layanan"**

Di dalam `filteredCategories.map(...)` (baris ~686-705), **hapus** tombol Portofolio (`<button onClick={() => handleOpenModal(item)}>`) dan ganti blok aksi menjadi:

```tsx
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/vendor/kategori/${item.id}`}
                      className="rounded-full border border-hk-champagne/60 bg-hk-taupe text-white px-3.5 py-1.5 text-xs font-manrope font-semibold hover:bg-hk-charcoal transition-all shadow-2xs inline-flex items-center gap-1"
                    >
                      <span>Lihat Layanan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
```

- [x] **Step 2: Bersihkan state & modal yang tak terpakai**

- Hapus pemakaian `<VendorPortfolioModal ... />` pada baris ~1044 **beserta** state `selectedVendor` / `isModalOpen` / `handleOpenModal` yang kini tidak dipakai di section layanan — **kecuali** masih dipakai di section lain. Cek dengan:
  Run: `Select-String -Path "src/app/page.tsx" -Pattern 'handleOpenModal|isModalOpen|selectedVendor|VendorPortfolioModal'`
  Jika hanya tersisa deklarasi (tak ada pemakaian JSX lain), hapus import `VendorPortfolioModal`, `dynamic`, `Eye`, dan `type VendorPortfolioData` bila tidak dipakai lagi. Jalankan `npm run typecheck` untuk memastikan tidak ada yang menggantung.

- [x] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no errors (tidak ada import/state menggantung).

- [x] **Step 4: Verifikasi manual**

Beranda → section "11 Kategori Layanan Terpadu": tiap card hanya punya tombol **"Lihat Layanan"** → klik → `/vendor/kategori/<id>`.

- [x] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(home): replace category card action with 'Lihat Layanan' -> /vendor/kategori/[id]"
```

---

## Task 12: Verifikasi Akhir & Build

**Files:** (tidak ada file baru — hanya verifikasi)

- [x] **Step 1: Jalankan seluruh test**

Run: `npm test`
Expected: semua test lulus, termasuk `vendor-categories.test.ts` & `builder-hydration.test.ts`.

- [x] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [x] **Step 3: Build produksi**

Run: `npm run build`
Expected: build sukses tanpa error. Perhatikan output route: `/vendor`, `/vendor/kategori/[kategori]`, `/vendor/[slug]`, `/dashboard/vendor`, `/dashboard/vendor/*`.

- [x] **Step 4: Sapu sisa link dashboard lama**

Run:
```powershell
Select-String -Path "src/**/*.ts","src/**/*.tsx" -Pattern 'href="/vendor"|"/vendor/(inbox|dompet|paket|kalender|portofolio|profil)"|push\("/vendor"'
```
Expected: tidak ada hasil (semua sudah `/dashboard/vendor`). Kemunculan `/vendor/<slug>` (profil publik) & `/vendor/kategori/` diperbolehkan.

- [x] **Step 5: Checklist E2E manual (dari spec §7)**

Jalankan `npm run dev:next` dan verifikasi seluruh checklist di spec bagian Testing & Definition of Done (katalog, collect flow, persist, swap, builder hydrate+merge, ID katalog, guard dashboard, publik, robots, homepage).

- [x] **Step 6: Commit final (bila ada perbaikan dari checklist)**

```bash
git add -A
git commit -m "test(vendor): finalize verification for catalog pages, collect flow and dashboard relocation"
```

---

## Self-Review (dilakukan penulis plan)

**1. Spec coverage:**
- §3 Routing baru → Task 2,3,4,5.
- §4 State & collect flow → Task 1,3,9,10.
- §4 tiga perbaikan bug → Task 9 (merge+hydrate), Task 10 (clearCart + vendorId asli).
- §5 UI dua tampilan berbeda → Task 2 (katalog), Task 3 (marketplace).
- §6 Navbar/homepage/link dashboard/session/middleware/robots/revalidate/notification → Task 5,6,7,8,11.
- §7 Testing & DoD → Task 12.

**2. Placeholder scan:** tidak ada TBD/TODO. Semua langkah berisi kode/aksi konkret.

**3. Type consistency:** `VendorCategoryId`, `VendorCategory`, `getVendorsByCategory`, `CATEGORY_TO_SERVICE`, `VENDOR_TO_SERVICE`, `mergeSelections`, `selectionsFromCartItems`, `CartVendorItem` konsisten antar task. Nama route `/dashboard/vendor/*` seragam.

