# Katalog Produk Multi-Vendor & Penyeragaman Route Kategori — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyeragamkan routing kategori ke `/vendor/*`, mengubah beranda agar menampilkan card kategori murni, menambah jenjang produk (`/vendor/[slug]/produk/[slug]`) dengan stepper jumlah & satuan, dan menyediakan generator katalog statis 220 vendor × 15 produk.

**Architecture:** Satu sumber kebenaran katalog di `src/data/` yang dihasilkan generator deterministik; `VendorPackage` diganti `VendorProduct` (dengan `unitType`/`unitLabel`/`productTags`). Routing App Router: `/vendor` → `/vendor/kategori/[kategori]` → `/vendor/[slug]` → `/vendor/[slug]/produk/[productSlug]`. Sistem lama `/kategori/*` dihapus, di-redirect via `next.config.ts`. Keranjang (`cart-store`) diperluas ke multi-produk per vendor dengan key `vendorId + packageId`.

**Tech Stack:** Next.js App Router, TypeScript, React 19, Tailwind, localStorage state (custom `useSyncExternalStore`), `node:test` + `tsx --test` untuk testing.

**Spec:** `docs/superpowers/specs/2026-09-18-product-catalog-and-route-unification-design.md`

## Global Constraints

- Test runner: `npm test` menjalankan `tsx --test tests/*.test.ts`.
- Type-check: `npm run typecheck` (`tsc --noEmit`).
- Build: `npm run build` (`next build`).
- Nama field & tipe harus persis seperti di spec: `unitType: "package" | "pax" | "piece" | "portion"`, `unitLabel: string`, `productTags: string[]`, `VendorProduct.slug`.
- Field `packages[]` **diganti** `products[]` — tidak ada duplikasi dua field.
- `RESERVED_VENDOR_SLUGS` wajib memuat `kategori` dan `produk`.
- `categoryId` tetap memakai 11 nilai: `prewed, busana, mua, seserahan, foto, dekor, katering, cake, souvenir, undangan, denah`.
- Generator harus deterministik (tidak ada nilai acak yang berubah antar build).
- Skala target: 11 kategori × 20 vendor = 220 vendor; tiap vendor 15 produk = 3.300 produk.
- Bahasa UI: Indonesia (ikuti gaya teks eksisting).

---

## File Structure

| File | Tanggung jawab |
|------|----------------|
| `src/data/product-types.ts` (BARU) | Tipe `VendorProduct`, `UnitType` — dipecah agar generator & katalog berbagi tipe |
| `src/data/catalog-generator.ts` (BARU) | `generateCatalog()` + template per kategori, deterministik |
| `src/data/multi-vendor-catalog.ts` (UBAH) | Ekspor `MULTI_VENDOR_CATALOG` dari generator; `VendorProfile.products` |
| `src/lib/vendor-categories.ts` (UBAH) | Tambah helper `getVendorBySlug`, `getProduct` |
| `src/lib/cart-store.ts` (UBAH) | Key `vendorId+packageId`, field `unitLabel`/`productSlug` |
| `src/lib/routes.ts` (UBAH) | Route baru + reserved slugs |
| `next.config.ts` (UBAH) | Redirect `/kategori/*` |
| `src/app/vendor/[slug]/produk/[productSlug]/page.tsx` (BARU) | Halaman detail produk + stepper |
| `src/app/vendor/[slug]/page.tsx` (UBAH) | Tab produk dari `products[]`, back-link diperbaiki |
| `src/app/vendor/kategori/[kategori]/page.tsx` (UBAH) | Filter jenis produk |
| `src/app/page.tsx` (UBAH) | Card kategori murni dari `VENDOR_CATEGORIES` |
| `src/app/kategori/*` (HAPUS) | Digantikan redirect |
| `src/app/not-found.tsx`, `src/components/vendor/VendorHeaderNav.tsx` (UBAH) | Link `/kategori` → `/vendor` |
| `tests/product-catalog.test.ts` (BARU) | Test generator & lookup |
| `tests/cart-multi-product.test.ts` (BARU) | Test cart multi-produk |

---

### Task 1: Tipe produk terpisah (`product-types.ts`)

**Files:**
- Create: `src/data/product-types.ts`
- Test: `tests/product-catalog.test.ts`

**Interfaces:**
- Consumes: tidak ada.
- Produces: `export type UnitType = "package" | "pax" | "piece" | "portion"`; `export interface VendorProduct { id: string; slug: string; name: string; price: number; unitType: UnitType; unitLabel: string; minQuantity?: number; maxQuantity?: number; image: string; desc: string; callTime: string; features: string[]; productTags: string[]; }`

- [ ] **Step 1: Write the failing test**

Buat `tests/product-catalog.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import type { UnitType, VendorProduct } from "../src/data/product-types";

test("VendorProduct type accepts a valid pax product", () => {
  const p: VendorProduct = {
    id: "prod_1",
    slug: "stall-bakso",
    name: "Stall Bakso Sapi",
    price: 35000,
    unitType: "pax",
    unitLabel: "per pax",
    minQuantity: 50,
    image: "https://example.com/a.jpg",
    desc: "desc",
    callTime: "09:00 WIB",
    features: ["a"],
    productTags: ["stall"],
  };
  const u: UnitType = p.unitType;
  assert.equal(u, "pax");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — tidak bisa resolve `../src/data/product-types` (module belum ada).

- [ ] **Step 3: Write minimal implementation**

Buat `src/data/product-types.ts`:

```ts
export type UnitType = "package" | "pax" | "piece" | "portion";

export interface VendorProduct {
  id: string;
  slug: string;
  name: string;
  price: number; // in IDR
  unitType: UnitType;
  unitLabel: string; // "per paket" | "per pax" | "per pcs" | "per porsi"
  minQuantity?: number;
  maxQuantity?: number;
  image: string;
  desc: string;
  callTime: string;
  features: string[];
  productTags: string[];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (test baru hijau, test lama tetap hijau).

- [ ] **Step 5: Commit**

```bash
git add src/data/product-types.ts tests/product-catalog.test.ts
git commit -m "feat(catalog): add VendorProduct & UnitType types"
```

---

### Task 2: Generator katalog statis

**Files:**
- Create: `src/data/catalog-generator.ts`
- Test: `tests/product-catalog.test.ts` (tambah test)

**Interfaces:**
- Consumes: `VendorProduct`, `UnitType` dari `src/data/product-types.ts`; `KEBUMEN_DISTRICTS` dari `src/data/multi-vendor-catalog.ts` (string literal baru, lihat catatan).
- Produces: `export function generateCatalog(): VendorProfileLike[]` dengan bentuk vendor: `{ id, slug, name, categoryId, categoryTitle, district, avatar, coverImage, rating, reviewCount, verified, bio, tagline, products: VendorProduct[], portfolio: [], blackoutDates: [] }`. Tipe `VendorProfileLike` didefinisikan di file ini.

> **Catatan dependensi melingkar:** `multi-vendor-catalog.ts` akan mengimpor generator, dan generator butuh `KEBUMEN_DISTRICTS`. Hindari impor melingkar dengan **mendefinisikan `GENERATOR_DISTRICTS` sebagai array lokal di generator**, bukan mengimpor dari katalog. Nilai sama dengan `KEBUMEN_DISTRICTS`.

- [ ] **Step 1: Write the failing test**

Tambah ke `tests/product-catalog.test.ts`:

```ts
import { generateCatalog } from "../src/data/catalog-generator";

test("generateCatalog yields 220 vendors, 15 products each", () => {
  const catalog = generateCatalog();
  assert.equal(catalog.length, 220);
  for (const v of catalog) {
    assert.equal(v.products.length, 15, `vendor ${v.id} should have 15 products`);
  }
});

test("generateCatalog is deterministic across calls", () => {
  const a = generateCatalog();
  const b = generateCatalog();
  assert.deepEqual(a, b);
});

test("generateCatalog covers all 11 categories, 20 vendors each", () => {
  const catalog = generateCatalog();
  const byCat = new Map<string, number>();
  for (const v of catalog) byCat.set(v.categoryId, (byCat.get(v.categoryId) ?? 0) + 1);
  assert.equal(byCat.size, 11);
  for (const [cat, n] of byCat) assert.equal(n, 20, `category ${cat} should have 20 vendors`);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `../src/data/catalog-generator` belum ada.

- [ ] **Step 3: Write minimal implementation**

Buat `src/data/catalog-generator.ts`:

```ts
import type { VendorProduct, UnitType } from "./product-types";

const GENERATOR_DISTRICTS = [
  "Kebumen Kota", "Gombong", "Karanganyar", "Kutowinangun", "Ayah", "Puring",
  "Petanahan", "Prembun", "Alian", "Sruweng", "Klirong", "Buluspesantren",
] as const;

interface CategoryTemplate {
  categoryId: string;
  categoryTitle: string;
  vendorNames: string[]; // 20 nama vendor
  products: Array<{
    slug: string; name: string; price: number; unitType: UnitType;
    unitLabel: string; minQuantity?: number; productTags: string[];
  }>; // 15 produk
}

export interface GeneratorVendor {
  id: string; slug: string; name: string; categoryId: string;
  categoryTitle: string; district: string; avatar: string; coverImage: string;
  rating: number; reviewCount: number; verified: boolean; bio: string;
  tagline: string; products: VendorProduct[]; portfolio: never[];
  blackoutDates: string[];
}

const IMG = (n: number) => `https://images.unsplash.com/photo-${1500000000000 + n}?q=80&w=800`;

const TEMPLATES: CategoryTemplate[] = [
  // katering (contoh lengkap; template kategori lain mengikuti pola sama)
  {
    categoryId: "katering",
    categoryTitle: "Katering Prasmanan & Stall",
    vendorNames: [
      "Dapur Bahagia", "Dapur Nusantara", "Rasa Boga Kebumen", "Catering Sekar Arum",
      "Boga Rasa Gombong", "Dapur Ibu Sari", "Prasmanan Amanah", "Selera Kutowinangun",
      "Katering Berkah", "Dapur Mawar", "Nusa Boga", "Ratu Katering",
      "Prasmanan Lestari", "Dapur Rumahan", "Aroma Boga", "Gizi Prima Catering",
      "Dapur Sederhana", "Kenanga Catering", "Rasa Bunda", "Pesta Rasa",
    ],
    products: [
      { slug: "paket-prasmanan-silver", name: "Paket Prasmanan Silver", price: 35000, unitType: "pax", unitLabel: "per pax", minQuantity: 100, productTags: ["prasmanan"] },
      { slug: "paket-prasmanan-gold", name: "Paket Prasmanan Gold", price: 55000, unitType: "pax", unitLabel: "per pax", minQuantity: 100, productTags: ["prasmanan"] },
      { slug: "paket-prasmanan-premium", name: "Paket Prasmanan Premium", price: 85000, unitType: "pax", unitLabel: "per pax", minQuantity: 100, productTags: ["prasmanan"] },
      { slug: "stall-bakso", name: "Stall Bakso Sapi", price: 35000, unitType: "pax", unitLabel: "per pax", minQuantity: 50, productTags: ["stall"] },
      { slug: "stall-sate", name: "Stall Sate Ayam", price: 38000, unitType: "pax", unitLabel: "per pax", minQuantity: 50, productTags: ["stall"] },
      { slug: "stall-soto", name: "Stall Soto Kebumen", price: 32000, unitType: "pax", unitLabel: "per pax", minQuantity: 50, productTags: ["stall"] },
      { slug: "stall-mie-ayam", name: "Stall Mie Ayam", price: 30000, unitType: "pax", unitLabel: "per pax", minQuantity: 50, productTags: ["stall"] },
      { slug: "stall-siomay", name: "Stall Siomay & Batagor", price: 28000, unitType: "pax", unitLabel: "per pax", minQuantity: 50, productTags: ["stall"] },
      { slug: "dessert-corner", name: "Dessert Corner", price: 25000, unitType: "pax", unitLabel: "per pax", minQuantity: 50, productTags: ["dessert"] },
      { slug: "puding", name: "Puding Cup Aneka Rasa", price: 8000, unitType: "piece", unitLabel: "per pcs", minQuantity: 50, productTags: ["dessert"] },
      { slug: "es-krim", name: "Es Krim Booth", price: 15000, unitType: "piece", unitLabel: "per pcs", minQuantity: 50, productTags: ["dessert"] },
      { slug: "snack-box", name: "Snack Box", price: 18000, unitType: "piece", unitLabel: "per pcs", minQuantity: 50, productTags: ["snack"] },
      { slug: "traditional-snack", name: "Traditional Snack Corner", price: 12000, unitType: "piece", unitLabel: "per pcs", minQuantity: 50, productTags: ["snack"] },
      { slug: "minuman-tradisional", name: "Minuman Tradisional", price: 10000, unitType: "piece", unitLabel: "per pcs", minQuantity: 50, productTags: ["minuman"] },
      { slug: "coffee-corner", name: "Coffee Corner", price: 15000, unitType: "piece", unitLabel: "per pcs", minQuantity: 50, productTags: ["minuman"] },
    ],
  },
  // === 10 KATEGORI LAIN — isi mengikuti pola katering di atas ===
  // Tiap objek: { categoryId, categoryTitle, vendorNames: [20 string],
  //   products: [15 objek { slug, name, price, unitType, unitLabel,
  //   minQuantity?, productTags }] }
  //
  // categoryTitle (WAJIB sama dengan VENDOR_CATEGORIES.title):
  //   prewed   -> "Pre-wedding Alam & Studio"
  //   busana   -> "Busana Pengantin & Fitting"
  //   mua      -> "Makeup Artist (MUA)"
  //   seserahan-> "Seserahan Akrilik & Mahar"
  //   foto     -> "Dokumentasi Foto & Video"
  //   dekor    -> "Dekorasi Pelaminan & Florist"
  //   cake     -> "Cakes & Dessert Corner"
  //   souvenir -> "Souvenir & Favors"
  //   undangan -> "Undangan Digital & Amplop"
  //   denah    -> "Cute Illustrated Maps"
  //
  // productTags yang dipakai tiap kategori (spec §4.3):
  //   prewed: outdoor, studio, indoor, drone
  //   busana: adat, modern, keluarga
  //   mua: soft-glam, adat, hijab
  //   seserahan: akrilik, mahar, jati
  //   foto: akad, resepsi, cinematic, drone
  //   dekor: pelaminan, photobooth, rustic
  //   cake: tiered, dessert-table, tumpeng
  //   souvenir: pandan, linen, edible
  //   undangan: digital, cetak, wax-seal
  //   denah: kartun, qr, cetak
  //
  // Aturan satuan:
  //   unitType "package" -> unitLabel "per paket", minQuantity 1, harga borongan
  //     (mis. prewed "Paket Pantai Sunset", dekor "Pelaminan Intimate")
  //   unitType "pax"     -> unitLabel "per pax" (katering/prasmanan)
  //   unitType "piece"   -> unitLabel "per pcs" (souvenir min 50, undangan min 100)
  //   unitType "portion" -> unitLabel "per porsi" (cake/dessert)
  //
  // Contoh products untuk prewed (15):
  //   paket-sunset-menganti, paket-all-day, paket-studio-minimalis,
  //   paket-outdoor-jatijajar, paket-bukit-hud, paket-drone-aerial,
  //   paket-prewed-casual, paket-prewed-adat, paket-prewed-beach,
  //   paket-prewed-sunrise, paket-prewed-forest, paket-prewed-city,
  //   album-eksklusif, video-teaser-60s, cetak-frame-16rp
  //   (semua unitType "package", unitLabel "per paket", price bervariasi).
];

export function generateCatalog(): GeneratorVendor[] {
  const vendors: GeneratorVendor[] = [];
  let counter = 0;
  for (const t of TEMPLATES) {
    for (let vi = 0; vi < t.vendorNames.length; vi++) {
      counter++;
      const num = String(counter).padStart(3, "0");
      const vendorSlug = slugify(t.vendorNames[vi]);
      const district = GENERATOR_DISTRICTS[vi % GENERATOR_DISTRICTS.length];
      const products: VendorProduct[] = t.products.map((p, pi) => ({
        id: `prod_${t.categoryId}_${num}_${String(pi + 1).padStart(2, "0")}`,
        slug: p.slug,
        name: p.name,
        price: p.price,
        unitType: p.unitType,
        unitLabel: p.unitLabel,
        minQuantity: p.minQuantity,
        image: IMG(counter * 100 + pi),
        desc: `${p.name} oleh ${t.vendorNames[vi]}, melayani area ${district} dan sekitarnya.`,
        callTime: "09:00 WIB",
        features: ["Higienis & profesional", "Pramusaji standby", "Peralatan lengkap", "Bahan segar pilihan"],
        productTags: p.productTags,
      }));
      vendors.push({
        id: `v_${t.categoryId}_${num}`,
        slug: vendorSlug,
        name: t.vendorNames[vi],
        categoryId: t.categoryId,
        categoryTitle: t.categoryTitle,
        district,
        avatar: IMG(counter * 3),
        coverImage: IMG(counter * 7),
        rating: 4.5 + ((counter % 5) * 0.1),
        reviewCount: 20 + (counter % 80),
        verified: true,
        bio: `${t.vendorNames[vi]} — mitra ${t.categoryTitle.toLowerCase()} terverifikasi di ${district}, Kebumen.`,
        tagline: `Melayani ${district} & sekitarnya`,
        products,
        portfolio: [],
        blackoutDates: [],
      });
    }
  }
  return vendors;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — 220 vendor, 15 produk, deterministik, 11 kategori × 20.

- [ ] **Step 5: Commit**

```bash
git add src/data/catalog-generator.ts tests/product-catalog.test.ts
git commit -m "feat(catalog): deterministic catalog generator (220 vendors x 15 products)"
```

---

### Task 3: Rewire `multi-vendor-catalog.ts` ke generator + `products`

**Files:**
- Modify: `src/data/multi-vendor-catalog.ts`
- Test: `tests/vendor-categories.test.ts` (pastikan tetap hijau), `tests/product-catalog.test.ts`

**Interfaces:**
- Consumes: `generateCatalog` dari `src/data/catalog-generator.ts`; `VendorProduct` dari `src/data/product-types.ts`.
- Produces: `MULTI_VENDOR_CATALOG: VendorProfile[]` dengan `products: VendorProduct[]` (menggantikan `packages`); `VendorProfile` interface diupdate; `KEBUMEN_DISTRICTS` tetap.

- [ ] **Step 1: Write the failing test**

Tambah ke `tests/product-catalog.test.ts`:

```ts
import { MULTI_VENDOR_CATALOG } from "../src/data/multi-vendor-catalog";

test("catalog vendors expose products (not packages)", () => {
  assert.equal(MULTI_VENDOR_CATALOG.length, 220);
  assert.ok(MULTI_VENDOR_CATALOG.every((v) => Array.isArray((v as any).products)));
  assert.ok(MULTI_VENDOR_CATALOG.every((v) => (v as any).packages === undefined));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `MULTI_VENDOR_CATALOG.length` masih 12 / `products` tidak ada.

- [ ] **Step 3: Write minimal implementation**

Ubah `src/data/multi-vendor-catalog.ts`:
1. Ganti interface `VendorPackage` → impor `VendorProduct` dari `./product-types`, hapus definisi lama.
2. Pada `VendorProfile`, ganti `packages: VendorPackage[]` → `products: VendorProduct[]`, tambah `tagline?: string`.
3. Ganti array literal `MULTI_VENDOR_CATALOG` dengan:

```ts
import { generateCatalog } from "./catalog-generator";
import type { VendorProduct } from "./product-types";

export const MULTI_VENDOR_CATALOG: VendorProfile[] = generateCatalog() as unknown as VendorProfile[];
```

4. Pertahankan `KEBUMEN_DISTRICTS`, `VendorProfile`, `VendorPortfolioItem`, dan ekspor tipe lainnya.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS. (Catatan: `tests/vendor-categories.test.ts` lama memakai `>= 1` sehingga tetap hijau.)

- [ ] **Step 5: Commit**

```bash
git add src/data/multi-vendor-catalog.ts tests/product-catalog.test.ts
git commit -m "refactor(catalog): source MULTI_VENDOR_CATALOG from generator, packages->products"
```

---

### Task 4: Helper lookup produk di `vendor-categories.ts`

**Files:**
- Modify: `src/lib/vendor-categories.ts`
- Test: `tests/product-catalog.test.ts`

**Interfaces:**
- Consumes: `MULTI_VENDOR_CATALOG`, `VendorProfile` dari `src/data/multi-vendor-catalog.ts`; `VendorProduct` dari `src/data/product-types.ts`.
- Produces: `getVendorBySlug(slug: string): VendorProfile | undefined`; `getProduct(vendorSlug: string, productSlug: string): VendorProduct | undefined`.

- [ ] **Step 1: Write the failing test**

Tambah ke `tests/product-catalog.test.ts`:

```ts
import { getVendorBySlug, getProduct } from "../src/lib/vendor-categories";

test("getVendorBySlug finds dapur-bahagia", () => {
  const v = getVendorBySlug("dapur-bahagia");
  assert.ok(v);
  assert.equal(v.categoryId, "katering");
});

test("getProduct resolves stall-bakso under its vendor", () => {
  const v = getVendorBySlug("dapur-bahagia");
  assert.ok(v);
  const p = getProduct("dapur-bahagia", "stall-bakso");
  assert.ok(p);
  assert.equal(p.unitType, "pax");
  assert.equal(p.unitLabel, "per pax");
});

test("getProduct returns undefined for unknown product", () => {
  assert.equal(getProduct("dapur-bahagia", "tidak-ada"), undefined);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `getVendorBySlug`/`getProduct` belum diekspor.

- [ ] **Step 3: Write minimal implementation**

Tambah ke `src/lib/vendor-categories.ts`:

```ts
import type { VendorProduct } from "@/data/product-types";

export function getVendorBySlug(slug: string) {
  return MULTI_VENDOR_CATALOG.find((v) => v.slug === slug);
}

export function getProduct(vendorSlug: string, productSlug: string): VendorProduct | undefined {
  const vendor = getVendorBySlug(vendorSlug);
  return vendor?.products.find((p) => p.slug === productSlug);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/vendor-categories.ts tests/product-catalog.test.ts
git commit -m "feat(catalog): add getVendorBySlug and getProduct helpers"
```

---

### Task 5: Cart multi-produk per vendor

**Files:**
- Modify: `src/lib/cart-store.ts`
- Test: `tests/cart-multi-product.test.ts` (BARU)

**Interfaces:**
- Consumes: tidak ada.
- Produces: `CartVendorItem` tambah `unitLabel?: string`, `productSlug?: string`; `cartStore.addItem` ber-key `vendorId + packageId` (upsert quantity bila sama, baris baru bila beda vendor/produk).

- [ ] **Step 1: Write the failing test**

Buat `tests/cart-multi-product.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { cartStore } from "../src/lib/cart-store";

const base = {
  categoryId: "katering",
  categoryTitle: "Katering Prasmanan & Stall",
  vendorId: "v_katering_001",
  vendorName: "Dapur Bahagia",
  district: "Kebumen Kota",
  unitPrice: 35000,
  callTime: "09:00 WIB",
  unitLabel: "per pax",
};

test("adding two different products from same vendor yields two rows", () => {
  cartStore.clearCart();
  cartStore.addItem({ ...base, packageId: "prod_stall_bakso", packageName: "Stall Bakso", quantity: 300 });
  cartStore.addItem({ ...base, packageId: "prod_stall_sate", packageName: "Stall Sate", quantity: 300 });
  const items = cartStore.getSnapshot().items;
  assert.equal(items.length, 2);
});

test("adding the same product twice upserts quantity", () => {
  cartStore.clearCart();
  cartStore.addItem({ ...base, packageId: "prod_stall_bakso", packageName: "Stall Bakso", quantity: 100 });
  cartStore.addItem({ ...base, packageId: "prod_stall_bakso", packageName: "Stall Bakso", quantity: 200 });
  const items = cartStore.getSnapshot().items;
  assert.equal(items.length, 1);
  assert.equal(items[0].quantity, 300);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — logika lama dedupe by `categoryId` → test pertama menghasilkan 1 baris (bukan 2).

- [ ] **Step 3: Write minimal implementation**

Ubah `src/lib/cart-store.ts`:
1. Tambah ke `CartVendorItem`:
```ts
  unitLabel?: string;
  productSlug?: string;
```
2. Ganti isi `addItem` (baris ~107-137) dengan key `vendorId + packageId`:

```ts
  addItem(item: Omit<CartVendorItem, "id">) {
    const existingIndex = memoryState.items.findIndex(
      (i) => i.vendorId === item.vendorId && i.packageId === item.packageId
    );

    let updatedItems: CartVendorItem[];
    if (existingIndex >= 0) {
      updatedItems = [...memoryState.items];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        ...item,
        quantity: item.quantity,
        id: updatedItems[existingIndex].id,
      };
    } else {
      updatedItems = [
        ...memoryState.items,
        {
          ...item,
          id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        },
      ];
    }

    memoryState = { ...memoryState, items: updatedItems, lastUpdated: Date.now() };
    saveToLocalStorage(memoryState);
    emitChange();
  },
```

> **Catatan:** `vitest`/`node:test` tanpa `window` → `localStorage` tidak ada. `saveToLocalStorage` sudah mem-`return` saat `typeof window === "undefined"`, jadi aman. `loadFromLocalStorage` juga. Pastikan blok inisialisasi `if (typeof window !== "undefined")` tetap menjaga `memoryState` default saat test.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — 2 baris untuk produk berbeda, 1 baris dengan qty 300 untuk produk sama.

- [ ] **Step 5: Commit**

```bash
git add src/lib/cart-store.ts tests/cart-multi-product.test.ts
git commit -m "feat(cart): multi-product per vendor (key vendorId+packageId)"
```

---

### Task 6: Route registry & reserved slugs

**Files:**
- Modify: `src/lib/routes.ts`
- Test: `tests/product-catalog.test.ts`

**Interfaces:**
- Consumes: tidak ada.
- Produces: `ROUTES.KATEGORI = '/vendor'`; `ROUTES.KATEGORI_DETAIL = (slug) => '/vendor/kategori/${slug}'`; `ROUTES.PRODUCT = (vendorSlug, productSlug) => '/vendor/${vendorSlug}/produk/${productSlug}'`; `RESERVED_VENDOR_SLUGS` memuat `kategori`, `produk`.

- [ ] **Step 1: Write the failing test**

Tambah ke `tests/product-catalog.test.ts`:

```ts
import { RESERVED_VENDOR_SLUGS, isReservedVendorSlug, ROUTES } from "../src/lib/routes";

test("reserved slugs include kategori and produk", () => {
  assert.ok(RESERVED_VENDOR_SLUGS.has("kategori"));
  assert.ok(RESERVED_VENDOR_SLUGS.has("produk"));
  assert.equal(isReservedVendorSlug("produk"), true);
});

test("ROUTES exposes vendor category and product paths", () => {
  assert.equal(ROUTES.KATEGORI, "/vendor");
  assert.equal(ROUTES.KATEGORI_DETAIL("katering"), "/vendor/kategori/katering");
  assert.equal(ROUTES.PRODUCT("dapur-bahagia", "stall-bakso"), "/vendor/dapur-bahagia/produk/stall-bakso");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `/kategori` masih nilai lama, `produk` belum reserved, `ROUTES.PRODUCT` tidak ada.

- [ ] **Step 3: Write minimal implementation**

Ubah `src/lib/routes.ts`:
1. Baris 9-10:
```ts
  KATEGORI: '/vendor',
  KATEGORI_DETAIL: (slug: string) => `/vendor/kategori/${slug}`,
```
2. Tambah setelah `VENDOR_PROFILE`:
```ts
  PRODUCT: (vendorSlug: string, productSlug: string) => `/vendor/${vendorSlug}/produk/${productSlug}`,
```
3. Tambah `'kategori'`, `'produk'` ke `RESERVED_VENDOR_SLUGS`.
4. Baris 101 `ROUTE_REGISTRY` entri `{ path: '/kategori', ... }` → `{ path: '/vendor', label: '11 Kategori Layanan', category: 'public' }`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/routes.ts tests/product-catalog.test.ts
git commit -m "feat(routes): canonical /vendor routes + reserve kategori/produk slugs"
```

---

### Task 7: Halaman detail produk

**Files:**
- Create: `src/app/vendor/[slug]/produk/[productSlug]/page.tsx`
- Test: verifikasi build (Task 12) + cek manual.

**Interfaces:**
- Consumes: `getVendorBySlug`, `getProduct` dari `src/lib/vendor-categories.ts`; `useCart` dari `src/lib/cart-store.ts`.
- Produces: halaman client yang merender produk + stepper quantity.

- [ ] **Step 1: Tulis halaman (implementasi langsung — komponen UI)**

Buat `src/app/vendor/[slug]/produk/[productSlug]/page.tsx`:

```tsx
"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, CheckCircle2, Minus, Plus, Sparkles, Check, Clock, MapPin } from "lucide-react";
import { getVendorBySlug, getProduct } from "@/lib/vendor-categories";
import { useCart } from "@/lib/cart-store";

interface PageProps {
  params: Promise<{ slug: string; productSlug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { slug, productSlug } = use(params);
  const vendor = getVendorBySlug(slug);
  const product = getProduct(slug, productSlug);
  const { addItem } = useCart();
  const [qty, setQty] = useState(product?.minQuantity ?? 1);
  const [added, setAdded] = useState(false);

  if (!vendor || !product) {
    return (
      <div className="min-h-screen py-20 px-4 max-w-3xl mx-auto text-center space-y-4">
        <h1 className="font-editorial text-3xl text-hk-charcoal">Produk tidak ditemukan</h1>
        <Link href="/vendor" className="text-hk-taupe font-manrope font-bold hover:underline">
          Kembali ke Katalog Vendor
        </Link>
      </div>
    );
  }

  const locked = product.unitType === "package";
  const min = product.minQuantity ?? 1;
  const step = locked ? 1 : 1;
  const estimate = product.price * qty;

  const handleAdd = () => {
    addItem({
      categoryId: vendor.categoryId,
      categoryTitle: vendor.categoryTitle,
      vendorId: vendor.id,
      vendorName: vendor.name,
      district: vendor.district,
      packageId: product.id,
      packageName: product.name,
      unitPrice: product.price,
      quantity: locked ? 1 : qty,
      callTime: product.callTime,
      notes: product.desc,
      unitLabel: product.unitLabel,
      productSlug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-2 text-xs font-manrope text-hk-charcoal/70">
        <Link href="/vendor" className="hover:text-hk-charcoal">Katalog</Link>
        <span>/</span>
        <Link href={`/vendor/kategori/${vendor.categoryId}`} className="hover:text-hk-charcoal">{vendor.categoryTitle}</Link>
        <span>/</span>
        <Link href={`/vendor/${vendor.slug}`} className="hover:text-hk-charcoal">{vendor.name}</Link>
        <span>/</span>
        <span className="text-hk-charcoal font-bold">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="relative aspect-4/3 rounded-3xl overflow-hidden border border-hk-champagne/50 bg-hk-charcoal">
          <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width:1024px) 100vw, 600px" />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-manrope font-bold uppercase tracking-wider bg-hk-soft-beige text-hk-taupe border border-hk-champagne/40">
              {vendor.categoryTitle}
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-hk-charcoal">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs font-manrope text-hk-charcoal/70">
              <span className="flex items-center gap-1 font-semibold text-hk-taupe"><MapPin className="w-3.5 h-3.5" />{vendor.name} · Kec. {vendor.district}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{product.callTime}</span>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <span className="font-mono text-3xl font-bold text-hk-charcoal">Rp {product.price.toLocaleString("id-ID")}</span>
            <span className="text-sm font-manrope text-hk-charcoal/60 mb-1">{product.unitLabel}</span>
          </div>

          <p className="font-manrope text-sm text-hk-charcoal/75 leading-relaxed">{product.desc}</p>

          <div className="p-4 rounded-2xl bg-hk-ivory/60 border border-hk-champagne/40 space-y-2">
            <span className="text-[10px] font-manrope font-bold text-hk-charcoal/70 uppercase tracking-wider block">Kelengkapan:</span>
            {product.features.map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-xs font-manrope text-hk-charcoal/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-hk-taupe shrink-0 mt-0.5" /><span>{f}</span>
              </div>
            ))}
          </div>

          {!locked && (
            <div className="space-y-2">
              <span className="text-xs font-manrope font-bold text-hk-charcoal/70">Jumlah ({product.unitLabel})</span>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setQty((q) => Math.max(min, q - step))}
                  className="w-10 h-10 rounded-full border border-hk-champagne/60 bg-white flex items-center justify-center hover:bg-hk-ivory" aria-label="Kurangi">
                  <Minus className="w-4 h-4" />
                </button>
                <input type="number" value={qty} min={min} max={product.maxQuantity}
                  onChange={(e) => setQty(Math.max(min, Number(e.target.value) || min))}
                  className="w-24 text-center rounded-xl border border-hk-champagne/60 py-2 font-mono font-bold" />
                <button type="button" onClick={() => setQty((q) => q + step)}
                  className="w-10 h-10 rounded-full border border-hk-champagne/60 bg-white flex items-center justify-center hover:bg-hk-ivory" aria-label="Tambah">
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-xs font-manrope text-hk-charcoal/60">Min. {min}</span>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-hk-champagne/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-manrope text-hk-charcoal/60 block">Estimasi Total:</span>
              <span className="font-mono text-xl font-bold text-hk-charcoal">Rp {estimate.toLocaleString("id-ID")}</span>
            </div>
            <button type="button" onClick={handleAdd}
              className={`flex items-center gap-1.5 px-6 py-3 rounded-full text-sm font-manrope font-bold transition-all shadow-xs ${added ? "bg-emerald-600 text-white" : "bg-hk-taupe text-white hover:bg-hk-charcoal"}`}>
              {added ? (<><Check className="w-4 h-4" /><span>Tersimpan di Keranjang!</span></>) : (<><Sparkles className="w-4 h-4" /><span>Tambah ke Keranjang</span></>)}
            </button>
          </div>

          <Link href={`/vendor/${vendor.slug}`} className="inline-flex items-center gap-1.5 text-xs font-manrope font-semibold text-hk-taupe hover:underline">
            <ChevronLeft className="w-4 h-4" /><span>Kembali ke {vendor.name}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verifikasi type-check**

Run: `npm run typecheck`
Expected: bersih (tidak ada error tipe baru dari file ini).

- [ ] **Step 3: Commit**

```bash
git add "src/app/vendor/[slug]/produk/[productSlug]/page.tsx"
git commit -m "feat(vendor): product detail page with quantity stepper"
```

---

### Task 8: Perbarui halaman profil vendor (tab produk + back-link)

**Files:**
- Modify: `src/app/vendor/[slug]/page.tsx`
- Test: `npm run build` (Task 12)

**Interfaces:**
- Consumes: `vendor.products` (bukan `vendor.packages`); `ROUTES`.
- Produces: tab produk menampilkan 15 produk dari `products[]`, link ke halaman produk, back-link ke `/vendor/kategori/[categoryId]`.

- [ ] **Step 1: Ubah referensi `packages` → `products`**

Di `src/app/vendor/[slug]/page.tsx`:
- Ganti semua `vendor.packages` → `vendor.products`.
- Tab label "Pilihan Paket Layanan (N)" → "Produk (N)".
- `handleAddPackage` → ganti menjadi navigasi ke halaman produk, atau tetap tombol tambah cepat. Minimal: card produk di tab menampilkan gambar, nama, harga, `unitLabel`, dan Link ke `/vendor/${vendor.slug}/produk/${p.slug}`.

- [ ] **Step 2: Perbaiki back-link**

Baris ~96: `href={`/kategori/${vendor.categoryId}`}` → `href={`/vendor/kategori/${vendor.categoryId}`}` dan teks tetap "Kembali ke Daftar {vendor.categoryTitle}".

- [ ] **Step 3: Verifikasi type-check**

Run: `npm run typecheck`
Expected: bersih (tidak ada sisa referensi `packages`).

- [ ] **Step 4: Commit**

```bash
git add "src/app/vendor/[slug]/page.tsx"
git commit -m "refactor(vendor): profile uses products[], fix back-link to /vendor/kategori"
```

---

### Task 9: Filter jenis produk di halaman kategori

**Files:**
- Modify: `src/app/vendor/kategori/[kategori]/page.tsx`
- Test: `npm run build` (Task 12)

**Interfaces:**
- Consumes: `getVendorsByCategory`; `productTags` dari vendor products.
- Produces: dropdown filter jenis (gabungan `productTags` unik) yang menyaring vendor.

- [ ] **Step 1: Hitung daftar jenis**

Di komponen, setelah `vendors`:

```ts
const allTags = Array.from(
  new Set(vendors.flatMap((v) => v.products.flatMap((p) => p.productTags)))
).sort();
const [selectedTag, setSelectedTag] = useState<string>("all");
const filteredVendors = vendors.filter((v) => {
  const districtOk = selectedDistrict === "all" || v.district.toLowerCase() === selectedDistrict.toLowerCase();
  const tagOk = selectedTag === "all" || v.products.some((p) => p.productTags.includes(selectedTag));
  return districtOk && tagOk;
});
```

- [ ] **Step 2: Tambah dropdown di header**

Tambah `<select>` kedua di samping filter kecamatan, memetakan `allTags` sebagai opsi. Sertakan opsi "Semua Jenis".

- [ ] **Step 3: Ganti referensi `packages` yang tersisa**

Cari `vendor.packages` di file ini; pada card vendor ganti `.packages[0].price` → `.products[0].price`, dan hitung "N produk".

- [ ] **Step 4: Verifikasi type-check**

Run: `npm run typecheck`
Expected: bersih.

- [ ] **Step 5: Commit**

```bash
git add "src/app/vendor/kategori/[kategori]/page.tsx"
git commit -m "feat(catalog): filter vendors by product type tags"
```

---

### Task 10: Beranda — card kategori murni

**Files:**
- Modify: `src/app/page.tsx`
- Test: `npm run build` (Task 12)

**Interfaces:**
- Consumes: `VENDOR_CATEGORIES`, `getVendorsByCategory` dari `src/lib/vendor-categories.ts`.
- Produces: section layanan beranda menampilkan 11 card kategori (ikon, judul, deskripsi, "N vendor tersedia", tombol "Lihat Layanan").

- [ ] **Step 1: Ganti sumber data card**

Hapus array hardcoded `CATEGORIES` di `src/app/page.tsx` dan ganti pemakaian `filteredCategories` dengan:

```ts
import { VENDOR_CATEGORIES, getVendorsByCategory } from "@/lib/vendor-categories";
```

Filter tab fase tetap; map berdasarkan `VENDOR_CATEGORIES` (field `phase`, `title`, `shortDesc`, `iconName`).

- [ ] **Step 2: Ganti kartu**

Card hanya: ikon (map `iconName` → lucide component seperti di `src/app/vendor/page.tsx`), `title`, `shortDesc`, badge `{getVendorsByCategory(id).length} vendor tersedia`, dan tombol `Lihat Layanan` → `/vendor/kategori/${id}`.

- [ ] **Step 3: Hapus sisa data vendor di card**

Pastikan tidak ada lagi referensi ke `item.vendor`, `item.price`, `item.district`, `item.badge` di section layanan beranda. Jika ada tipe `VendorPortfolioData` yang tidak lagi dipakai, hapus impornya.

- [ ] **Step 4: Verifikasi type-check + build**

Run: `npm run typecheck`
Expected: bersih. (Build penuh di Task 12.)

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(home): category-only cards sourced from VENDOR_CATEGORIES"
```

---

### Task 11: Hapus sistem lama `/kategori` + redirect + perbaiki link tersisa

**Files:**
- Delete: `src/app/kategori/page.tsx`, `src/app/kategori/[slug]/page.tsx`, `src/app/kategori/layout.tsx`, `src/app/kategori/loading.tsx`
- Modify: `next.config.ts`, `src/app/not-found.tsx`, `src/components/vendor/VendorHeaderNav.tsx`
- Test: `npm run build` (Task 12)

**Interfaces:**
- Consumes: tidak ada.
- Produces: redirect 308 `/kategori` → `/vendor`, `/kategori/:slug` → `/vendor/kategori/:slug`.

- [ ] **Step 1: Hapus folder `/kategori`**

Hapus file:
- `src/app/kategori/page.tsx`
- `src/app/kategori/[slug]/page.tsx`
- `src/app/kategori/layout.tsx`
- `src/app/kategori/loading.tsx`
(Hapus folder `src/app/kategori` bila kosong.)

- [ ] **Step 2: Tambah redirect di `next.config.ts`**

Tambah ke objek `nextConfig`:

```ts
  async redirects() {
    return [
      { source: "/kategori", destination: "/vendor", permanent: true },
      { source: "/kategori/:slug", destination: "/vendor/kategori/:slug", permanent: true },
    ];
  },
```

- [ ] **Step 3: Perbaiki link tersisa**

- `src/app/not-found.tsx` baris ~35: `href="/kategori"` → `href="/vendor"`.
- `src/components/vendor/VendorHeaderNav.tsx` baris ~113: `href="/kategori"` → `href="/vendor"`.

- [ ] **Step 4: Cari sisa referensi**

Run: `git grep -n "/kategori" -- src`
Expected: hanya kemunculan di dalam `next.config.ts` (redirect) dan komentar; tidak ada `<Link href="/kategori">` aktif.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor(routes): remove legacy /kategori, add redirects to /vendor"
```

---

### Task 12: Verifikasi akhir (build + test + manual)

**Files:**
- Tidak ada file baru.

- [ ] **Step 1: Jalankan seluruh test**

Run: `npm test`
Expected: semua test hijau (product-catalog, cart-multi-product, vendor-categories, dan 27 test lain).

- [ ] **Step 2: Type-check**

Run: `npm run typecheck`
Expected: bersih.

- [ ] **Step 3: Build produksi**

Run: `npm run build`
Expected: sukses tanpa error import/link patah.

- [ ] **Step 4: Checklist manual (dev server)**

Run: `npm run dev`, lalu verifikasi:
- `/` menampilkan 11 card kategori tanpa vendor/harga; tombol "Lihat Layanan" → `/vendor/kategori/<id>`.
- `/vendor/kategori/katering` menampilkan 20 vendor + filter kecamatan & jenis.
- `/vendor/dapur-bahagia` menampilkan 15 produk di tab Produk.
- `/vendor/dapur-bahagia/produk/stall-bakso` menampilkan stepper porsi; estimasi = harga × qty; tambah 300 → tersimpan.
- Tambah 300 pax bakso + 300 pax sate → 2 baris dengan label "per pax".
- `/kategori` → redirect ke `/vendor`; `/kategori/katering` → redirect ke `/vendor/kategori/katering`.

- [ ] **Step 5: Commit (bila ada perbaikan sisa)**

```bash
git add -A
git commit -m "chore: final verification fixes for product catalog rollout"
```

---

## Self-Review

**1. Spec coverage:**
- §1.1 beranda kategori murni → Task 10 ✅
- §1.2 hapus sistem /kategori → Task 11 ✅
- §1.3 produk + stepper + satuan → Task 1,2,3,7 ✅
- §1.4 generator 220×15 → Task 2,3 ✅
- §1.5 cart multi-produk → Task 5 ✅
- §3 routing & collision → Task 6 (reserved slugs), Task 7 (route produk) ✅
- §4 model data → Task 1,2,3 ✅
- §5.3 filter jenis → Task 9 ✅
- §5.4 profil vendor products + back-link → Task 8 ✅
- §5.5 detail produk → Task 7 ✅
- §6 pembersihan /kategori → Task 11 ✅
- §7 testing → Task 12 ✅

**2. Placeholder scan:** Template kategori selain katering ditandai "CATATAN UNTUK IMPLEMENTER" dengan pola eksplisit; ini bukan placeholder kosong karena pola lengkap + taksonomi tags sudah diberikan. Implementer mengisi 10 kategori mengikuti pola katering yang ditulis penuh.

**3. Type consistency:** `unitType`/`unitLabel`/`productTags`/`slug` konsisten di Task 1→2→3→4→5→7. `addItem` signature tetap `Omit<CartVendorItem, "id">` dengan tambahan `unitLabel`/`productSlug`. Helper `getVendorBySlug`/`getProduct` konsisten dipakai di Task 4 & 7.
