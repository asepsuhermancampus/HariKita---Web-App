# Katalog Vendor Masif + Beranda dari DB + Filter Kategori — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Seeder 275 vendor (25/kategori, satu kategori masing-masing, 25 jasa + 10 portofolio + gambar relevan), beranda baca dari DB (6 vendor/kategori + tombol "Lihat Selengkapnya" + blur CTA), navbar Login→Dashboard→ per role, logout di sidebar, skrip reset-session.

**Architecture:** Perluas seed-data (vendor generator per kategori + pool gambar relevan); tambah `VendorProfile.slug` (migrasi); query katalog baru (`catalog.ts`) untuk beranda & halaman kategori dari DB; beranda render 6/kategori + overlay blur `hk-ivory`. Navbar/sidebar/logout sudah diimplementasi (dikunci).

**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma (SQLite+Postgres), Tailwind + design-system, Lucide, `node:test` via `tsx`.

**Spec:** `docs/superpowers/specs/2026-09-24-vendor-catalog-db-home-design.md`

## Global Constraints

- Font `font-editorial` (judul) + `font-manrope` (body); warna token `hk-*`/brand (Charcoal/Taupe/Champagne/Soft Beige/Ivory). Tanpa hex ad-hoc (kecuali turunan teks status). Tanpa emoji (Lucide).
- Vendor **satu kategori** (tidak campur). 25 vendor/kategori; 25 jasa + 10 portofolio/vendor.
- Gambar **relevan per kategori** (pool per kategori, judul↔gambar cocok).
- Beranda menampilkan **6/kategori** + tombol **"Lihat Selengkapnya"** + blur gradient `hk-ivory`.
- Hanya vendor `verificationStatus="APPROVED"` tampil.
- Dua schema Prisma sinkron; backup `dev.db` sebelum db push; migrasi Neon untuk `slug`.
- Jangan ubah ledger/payment. Responsif tanpa overflow 375px.
- Verifikasi akhir tiap task: `npm run typecheck`; akhir fase: + `npm test` + `npm run build`.

---

### Task 1: Skema — kolom `VendorProfile.slug`

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma/schema.sqlite.prisma`

**Interfaces:**
- Produces: `VendorProfile.slug String? @unique`.

- [x] **Step 1: Backup dev.db**

Run: `copy prisma\dev.db prisma\dev.db.bak`

- [x] **Step 2: Tambah kolom di kedua schema**

Pada `model VendorProfile`, setelah `businessName`:
```prisma
  slug           String?              @unique // URL slug stabil (mis. "menganti-cinematic-<id8>")
```

- [x] **Step 3: Validate + generate + push**

```bash
npx prisma validate --schema prisma/schema.prisma
npx prisma validate --schema prisma/schema.sqlite.prisma
npm run generate
npm run generate:sqlite
$env:DATABASE_URL="file:" + ((Resolve-Path "prisma\dev.db").Path -replace '\\','/'); npx prisma db push --schema prisma/schema.sqlite.prisma --skip-generate
```
Expected: valid; db push sukses.

- [x] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/schema.sqlite.prisma prisma/dev.db
git commit -m "feat(catalog): add VendorProfile.slug column"
```

---

### Task 2: Util pemetaan kategori + slug

**Files:**
- Create: `src/lib/catalog-utils.ts`
- Test: `tests/catalog-utils.test.ts`

**Interfaces:**
- Produces:
  - `categoryNameToId(name: string): string` — `"Makeup Artist (MUA)"` → `"mua"`, dst (fallback `"prewed"`).
  - `buildVendorSlug(businessName: string, id: string): string`
  - `slugify(input: string): string`

- [x] **Step 1: Write the failing test**

```ts
// tests/catalog-utils.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { categoryNameToId, buildVendorSlug } from "../src/lib/catalog-utils";

test("categoryNameToId maps known categories", () => {
  assert.equal(categoryNameToId("Pre-wedding"), "prewed");
  assert.equal(categoryNameToId("Makeup Artist (MUA)"), "mua");
  assert.equal(categoryNameToId("Katering & Food Stalls"), "katering");
  assert.equal(categoryNameToId("Cute Illustrated Maps"), "denah");
});

test("categoryNameToId unknown -> fallback", () => {
  assert.equal(categoryNameToId("Ngelantur"), "prewed");
});

test("buildVendorSlug is url-safe and stable", () => {
  const s = buildVendorSlug("Menganti Cinematic & Studio", "abc123def456");
  assert.match(s, /^[a-z0-9-]+$/);
  assert.ok(s.includes("menganti"));
});
```

- [x] **Step 2: Run test — verify it fails**

Run: `npx tsx --test tests/catalog-utils.test.ts`
Expected: FAIL — modul belum ada.

- [x] **Step 3: Implementasi**

```ts
// src/lib/catalog-utils.ts
const CATEGORY_NAME_TO_ID: Record<string, string> = {
  "Pre-wedding": "prewed",
  "Busana Pengantin & Fitting": "busana",
  "Makeup Artist (MUA)": "mua",
  "Kotak Seserahan & Mahar": "seserahan",
  "Dokumentasi Foto-Video": "foto",
  "Dekorasi & Florist": "dekor",
  "Katering & Food Stalls": "katering",
  "Cakes & Dessert Corner": "cake",
  "Souvenir & Favors": "souvenir",
  "Undangan Digital & Amplop": "undangan",
  "Cute Illustrated Maps": "denah",
};

export function categoryNameToId(name: string): string {
  return CATEGORY_NAME_TO_ID[name] ?? "prewed";
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function buildVendorSlug(businessName: string, id: string): string {
  return `${slugify(businessName)}-${id.slice(-8)}`;
}
```

- [x] **Step 4: Run test + typecheck**

Run: `npx tsx --test tests/catalog-utils.test.ts && npm run typecheck`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add src/lib/catalog-utils.ts tests/catalog-utils.test.ts
git commit -m "feat(catalog): add category name->id + slug utils"
```

---

### Task 3: Generator data vendor (25/kategori)

**Files:**
- Create: `prisma/seed-data/vendors.ts`

**Interfaces:**
- Produces:
  - `interface VendorSeed { businessName: string; category: string; district: string; address: string; rating: number; reviewCount: number; igHandle: string; bankName: string; bankAccount: string; bankHolder: string; }`
  - `generateVendors(): VendorSeed[]` — 275 vendor (25 × 11 kategori), nama & atribut bervariasi per kategori.

- [x] **Step 1: Implementasi generator**

```ts
// prisma/seed-data/vendors.ts
export interface VendorSeed {
  businessName: string;
  category: string;
  district: string;
  address: string;
  rating: number;
  reviewCount: number;
  igHandle: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
}

const DISTRICTS = [
  "Kebumen", "Gombong", "Kutowinangun", "Karanganyar", "Alian", "Prembun",
  "Ayah", "Pejagoan", "Poncowarno", "Kuwarasan", "Buluspesantren", "Sruweng",
  "Adimulyo", "Puring", "Mirit", "Bonorowo", "Klirong", "Rowe", "Petanahan",
  "Ambal", "Kemusuk", "Padureso", "Sempor", "Sadang", "Karangsambung", "Poncowati",
];

const BANKS = ["BCA", "Mandiri", "BNI", "BRI", "BSI", "CIMB Niaga"];

// Awalan nama brand per kategori (biar nama realistis & unik)
const BRAND_PREFIX: Record<string, string[]> = {
  "Pre-wedding": ["Menganti", "Pradana", "Lumiere", "Aluna", "Kala", "Aksara", "Selaras", "Cahaya"],
  "Busana Pengantin & Fitting": ["Rarasati", "Griya", "Kartika", "Ayodya", "Sekar", "Dyandra", "Ayu", "Larasati"],
  "Makeup Artist (MUA)": ["Alula", "Sekar", "Mayang", "Kasih", "Ayunda", "Binar", "Kirana", "Melati"],
  "Kotak Seserahan & Mahar": ["Lestari", "Hantaran", "Puspa", "Kanti", "Dewi", "Wangi", "Ratih", "Sari"],
  "Dokumentasi Foto-Video": ["Pradana", "Lumen", "Focal", "Kriya", "Frame", "Sinema", "Rana", "Bingkai"],
  "Dekorasi & Florist": ["Asmara", "Flora", "Cempaka", "Taman", "Kembang", "Riang", "Anjani", "Seruni"],
  "Katering & Food Stalls": ["Dapur", "Rasa", "Boga", "Sari", "Warung", "Nusantara", "Gudeg", "Liwet"],
  "Cakes & Dessert Corner": ["L'Aura", "Manis", "Kue", "Sweet", "Pati", "Sugary", "Tart", "Bakehouse"],
  "Souvenir & Favors": ["Kriya", "Anyam", "Bingkisan", "Kenang", "Hadiah", "Souvenir", "Pandan", "Pita"],
  "Undangan Digital & Amplop": ["HariKita", "Kartu", "Undang", "Digital", "Aksara", "Wax", "Foil", "Lembar"],
  "Cute Illustrated Maps": ["Denah", "Kartun", "Peta", "Sketsa", "Ilustra", "Rute", "Arah", "Lokasi"],
};

const SUFFIX = ["Studio", "Kebumen", "House", "Works", "Galeri", "Kolektif", "Signature", "Pratama", "Kencana", "Aditya"];

const CATEGORIES = Object.keys(BRAND_PREFIX);

export function generateVendors(): VendorSeed[] {
  const out: VendorSeed[] = [];
  for (const category of CATEGORIES) {
    const prefixes = BRAND_PREFIX[category];
    for (let i = 0; i < 25; i++) {
      const prefix = prefixes[i % prefixes.length];
      const suffix = SUFFIX[i % SUFFIX.length];
      const n = i + 1;
      const businessName = `${prefix} ${suffix} ${n}`.replace(/\s+/g, " ").trim();
      const district = DISTRICTS[(out.length) % DISTRICTS.length];
      const rating = Math.round((4.6 + ((out.length % 5) * 0.1)) * 10) / 10;
      out.push({
        businessName,
        category,
        district,
        address: `Jl. ${prefix} No. ${n}, ${district}, Kebumen`,
        rating,
        reviewCount: 8 + ((out.length * 3) % 60),
        igHandle: `@${prefix.toLowerCase().replace(/[^a-z]/g, "")}.${n}`,
        bankName: BANKS[out.length % BANKS.length],
        bankAccount: String(1000000000 + out.length * 7919),
        bankHolder: businessName,
      });
    }
  }
  return out;
}
```

- [x] **Step 2: Sanity check via tsx**

Run:
```bash
npx tsx -e "import('./prisma/seed-data/vendors.ts').then(m=>{const v=m.generateVendors();console.log(v.length, v[0].businessName, v.at(-1)?.businessName)})"
```
Expected: `275 ...` dan contoh nama valid.

- [x] **Step 3: Commit**

```bash
git add prisma/seed-data/vendors.ts
git commit -m "feat(seed): vendor generator (25 per category)"
```

---

### Task 4: Pool gambar relevan per kategori

**Files:**
- Modify: `prisma/seed-data/vendor-services.ts` (perluas `IMG` menjadi ≥8 gambar per kategori, tematik)

**Interfaces:**
- Produces: `IMG` dengan ≥8 URL per kategori yang **relevan** (food untuk katering, makeup untuk MUA, dst).

- [x] **Step 1: Perluas `IMG`**

Tambah gambar per kategori agar tiap pool ≥8 (menggantikan/menambah yang ada). Contoh tambahan (Unsplash, tematik):
```ts
export const IMG = {
  prewed: [ /* 8 foto pasangan/outdoor/pantai */ ],
  busana: [ /* 8 foto busana pengantin/kebaya/gaun */ ],
  mua: [ /* 8 foto makeup/rias */ ],
  seserahan: [ /* 8 foto baki/hantaran/mahar */ ],
  dokumentasi: [ /* 8 foto kamera/liputan/wedding shoot */ ],
  dekorasi: [ /* 8 foto pelaminan/bunga/backdrop */ ],
  katering: [ /* 8 foto prasmanan/makanan/stall */ ],
  cake: [ /* 8 foto kue/dessert */ ],
  souvenir: [ /* 8 foto souvenir/favor/anyaman */ ],
  undangan: [ /* 8 foto undangan/cetak */ ],
  map: [ /* 8 foto denah/peta/ilustrasi */ ],
};
```
> Pilih foto Unsplash yang **jelas tematik** agar tidak "title tidak relevan dengan gambar".

- [x] **Step 2: Typecheck**

Run: `npm run typecheck`

- [x] **Step 3: Commit**

```bash
git add prisma/seed-data/vendor-services.ts
git commit -m "feat(seed): expand category image pools (relevant imagery)"
```

---

### Task 5: Seeder — 275 vendor (ganti loop lama)

**Files:**
- Modify: `prisma/seed.ts`

**Interfaces:**
- Consumes: `generateVendors`, `getServiceTemplates`, `getPortfolioTemplates`, `IMG`, `categoryImgKey`, `buildVendorSlug`.
- Produces: 275 vendor APPROVED, @25 jasa + @10 portofolio, akun `081300000001..275`.

- [x] **Step 1: Ganti sumber vendor**

Ganti `vendorsData` (11 vendor lama) → hasil `generateVendors()` (275). Loop:
```ts
const vendors = generateVendors();
for (let i = 0; i < vendors.length; i++) {
  const item = vendors[i];
  const n = i + 1;
  const phone = "081300" + String(n).padStart(6, "0"); // 081300000001..
  const user = await prisma.user.create({ data: {
    name: item.businessName, phone, email: `vendor${n}@harikita.id`,
    pin: DEFAULT_PIN, role: "VENDOR",
  }});
  await logPin(user.id);
  const vendor = await prisma.vendorProfile.create({ data: {
    userId: user.id,
    slug: buildVendorSlug(item.businessName, user.id),
    businessName: item.businessName,
    category: item.category,
    picName: item.businessName,
    city: "Kebumen",
    district: item.district,
    address: item.address,
    rating: item.rating,
    reviewCount: item.reviewCount,
    igHandle: item.igHandle,
    bankName: item.bankName, bankAccount: item.bankAccount, bankHolder: item.bankHolder,
    walletBalance: 0,
    verificationStatus: "APPROVED", isVerified: true, profileCompleted: true,
    ktpNumber: "3305" + String(100000000000 + i).slice(0, 12),
    revenueMethod: "BANK",
    desa: item.district, kecamatan: item.district, kabupaten: "Kebumen", postalCode: "54311",
    latitude: VENDOR_COORDS[i % VENDOR_COORDS.length][0],
    longitude: VENDOR_COORDS[i % VENDOR_COORDS.length][1],
  }});

  // 25 jasa
  const svc = getServiceTemplates(item.category);
  const imgPool = IMG[categoryImgKey(item.category)];
  for (let s = 0; s < svc.length; s++) {
    const t = svc[s];
    const price = Math.round((500000 + i * 15000) * t.priceFactor / 1000) * 1000;
    await prisma.servicePackage.create({ data: { /* ...seperti sebelumnya, imageUrl imgPool[s % imgPool.length] */ }});
  }
  // 10 portofolio
  const pf = getPortfolioTemplates(item.category);
  for (let p = 0; p < pf.length; p++) { /* ...imageUrl imgPool[...] */ }

  createdVendors.push({ id: vendor.id, businessName: item.businessName, packageId: <first>, basePrice: <first>, category: item.category });
}
```
> **Performa:** pertimbangkan `createMany` untuk jasa/portofolio (batch) agar seed tidak terlalu lama. Bila OrderItem butuh `packageId`, simpan id paket pertama per vendor.

- [x] **Step 2: Sesuaikan data turunan (komisi BA, order demo)**

`createdVendors` sekarang 275; referensi `vendorIndex` pada komisi BA & order demo tetap valid (index 0..10 dipakai) — pastikan `createdVendors.length >= 7`. Order demo tetap pakai `createdVendors[0]`.

- [x] **Step 3: Jalankan seed ke SQLite dulu**

```bash
$env:DATABASE_URL="file:" + ((Resolve-Path "prisma\dev.db").Path -replace '\\','/'); npm run db:seed
```
Expected: sukses; cetak ringkasan 275 vendor.

- [x] **Step 4: Verifikasi jumlah**

```bash
npx tsx -e "import('@prisma/client').then(async({PrismaClient})=>{const db=new PrismaClient();console.log('vendor',await db.vendorProfile.count(),'pkg',await db.servicePackage.count(),'pf',await db.vendorPortfolio.count());await db.\$disconnect()})"
```
Expected: vendor 275+, pkg ±6875, pf ±2750.

- [x] **Step 5: Commit**

```bash
git add prisma/seed.ts prisma/dev.db
git commit -m "feat(seed): 275 vendors with rich catalog (25 services + 10 portfolios each)"
```

---

### Task 6: Query katalog beranda (DB)

**Files:**
- Create: `src/server/queries/catalog.ts`
- Test: `tests/catalog-utils.test.ts` (tambah; contract-level)

**Interfaces:**
- Produces:
  - `interface HomeVendorCard { slug: string; businessName: string; categoryId: string; categoryTitle: string; district: string; rating: number; reviewCount: number; priceFrom: number | null; imageUrl: string | null; }`
  - `getHomeVendorsByCategory(limitPerCategory?: number): Promise<Record<string, HomeVendorCard[]>>`
  - `getVendorsByCategoryFromDb(categoryId: string): Promise<HomeVendorCard[]>`

- [x] **Step 1: Implementasi query**

```ts
// src/server/queries/catalog.ts
import { prisma } from "@/lib/prisma";
import { categoryNameToId } from "@/lib/catalog-utils";

export interface HomeVendorCard {
  slug: string;
  businessName: string;
  categoryId: string;
  categoryTitle: string;
  district: string;
  rating: number;
  reviewCount: number;
  priceFrom: number | null;
  imageUrl: string | null;
}

async function mapVendorRows(where: { verificationStatus: string; category?: string }, take?: number) {
  // Ambil vendor + 1 paket termurah + 1 portofolio (untuk gambar) per vendor
  return prisma.vendorProfile.findMany({
    where,
    orderBy: { rating: "desc" },
    take,
    include: {
      packages: { orderBy: { basePrice: "asc" }, take: 1 },
      portfolios: { orderBy: { likes: "desc" }, take: 1 },
    },
  });
}

export async function getHomeVendorsByCategory(limitPerCategory = 6) {
  // map kategoriId -> vendor cards (limit per kategori)
  const byCat: Record<string, HomeVendorCard[]> = {};
  // 11 kategori: query per kategori (bounded) atau satu query lalu grup di memori
  const rows = await prisma.vendorProfile.findMany({
    where: { verificationStatus: "APPROVED" },
    orderBy: { rating: "desc" },
    include: { packages: { orderBy: { basePrice: "asc" }, take: 1 }, portfolios: { take: 1 } },
  });
  for (const v of rows) {
    const cid = categoryNameToId(v.category);
    (byCat[cid] ??= []);
    if (byCat[cid].length < limitPerCategory) {
      byCat[cid].push(toCard(v, cid));
    }
  }
  return byCat;
}

export async function getVendorsByCategoryFromDb(categoryId: string) {
  const rows = await prisma.vendorProfile.findMany({
    where: { verificationStatus: "APPROVED" },
    orderBy: { rating: "desc" },
    include: { packages: { orderBy: { basePrice: "asc" }, take: 1 }, portfolios: { take: 1 } },
  });
  return rows.filter((v) => categoryNameToId(v.category) === categoryId).map((v) => toCard(v, categoryId));
}
```
> `toCard` memetakan `priceFrom` = paket termurah `basePrice`, `imageUrl` = gambar portofolio/paket pertama.

- [x] **Step 2: Typecheck**

Run: `npm run typecheck`

- [x] **Step 3: Commit**

```bash
git add src/server/queries/catalog.ts
git commit -m "feat(catalog): DB queries for home & category vendor listings"
```

---

### Task 7: Beranda baca DB + 6/kategori + blur CTA

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `getHomeVendorsByCategory`, `VENDOR_CATEGORIES`.

- [x] **Step 1: Ganti sumber data layanan dari DB**

Di `src/app/page.tsx`: hapus ketergantungan `getVendorsByCategory` (statis) untuk section layanan; panggil `getHomeVendorsByCategory(6)` (server). Tabs = `[{id:"all",label:"Semua Layanan"}] + VENDOR_CATEGORIES`.

- [x] **Step 2: Grid 6 vendor + blur + tombol**

Untuk tiap kategori (tab aktif), render:
```tsx
<section id="layanan" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
  {/* Tabs: Semua Layanan + 11 kategori */}
  {/* Grid 6 kartu vendor kategori aktif */}
  <div className="relative">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.slice(0,6).map((v) => <VendorCard key={v.slug} vendor={v} />)}
    </div>
    {/* Blur CTA di baris terbawah */}
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-hk-ivory via-hk-ivory/80 to-transparent" />
    <div className="absolute inset-x-0 bottom-0 flex justify-center pb-2">
      <Link href={`/vendor/kategori/${activeTab}`} className="pointer-events-auto ...">
        Lihat Selengkapnya <ArrowRight />
      </Link>
    </div>
  </div>
</section>
```
- "Semua Layanan" → render tiap kategori (header kategori + 6 vendor + tombol).
- Kartu: `<Image>` atau `<img>` gambar kategori, nama, kecamatan, rating, "Mulai Rp X".

> Bila ada komponen kartu vendor existing, pakai ulang; bila tidak, buat inline atau komponen kecil `VendorCard`.

- [x] **Step 3: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: PASS.

- [x] **Step 4: Verifikasi manual**

`npm run dev` → beranda menampilkan 6 vendor/kategori, blur di bawah grid, tombol "Lihat Selengkapnya".

- [x] **Step 5: Commit**

```bash
git add src/app/page.tsx src/components
git commit -m "feat(home): DB-driven vendor sections (6/category) with blur CTA"
```

---

### Task 8: Halaman kategori dari DB

**Files:**
- Modify: `src/app/vendor/kategori/[kategori]/page.tsx`

**Interfaces:**
- Consumes: `getVendorsByCategoryFromDb`.

- [x] **Step 1: Ganti sumber ke DB**

Baca `getVendorsByCategoryFromDb(params.kategori)` → tampilkan **semua** vendor kategori. Label kategori dari `VENDOR_CATEGORIES`.

- [x] **Step 2: Typecheck + build**

Run: `npm run typecheck && npm run build`

- [x] **Step 3: Commit**

```bash
git add src/app/vendor/kategori
git commit -m "feat(catalog): category page reads all vendors from DB"
```

---

### Task 9: Verifikasi navbar/sidebar/logout/reset-session

**Files:**
- Verify: `src/components/layout/Navbar.tsx`, `src/components/dashboard/DashboardSidebarNav.tsx`, `src/app/layout.tsx`, `scripts/reset-session.mjs`, `package.json`

- [x] **Step 1: Konfirmasi implementasi ada**

Cek: Navbar render "Dashboard →" bila `isLoggedIn`; sidebar tampilkan `userName` + tombol Keluar (`logoutAction`); `npm run reset-session` ada di package.json; tiap layout pass `userName`.

Run: `grep -rn "reset-session\|Dashboard\|logoutAction\|userName" src/components/dashboard src/components/layout package.json`

- [x] **Step 2: Typecheck + build**

Run: `npm run typecheck && npm run build`

- [x] **Step 3: (Bila ada yang kurang) lengkapi lalu commit**

```bash
git add -A
git commit -m "feat(nav): dashboard button by role, logout in sidebar, reset-session script"
```

---

### Task 10: Migrasi Neon + seed produksi

**Files:**
- Migrations + Neon

- [x] **Step 1: Buat migration slug (diff Neon → schema)**

Buat folder `prisma/migrations/<ts>_vendor_slug`, isi SQL dari `prisma migrate diff --from-url $DIRECT_URL --to-schema-datamodel prisma/schema.prisma --script` (tanpa BOM).

- [x] **Step 2: `migrate deploy` ke Neon**

```bash
npx prisma migrate deploy
```
Expected: applied.

- [x] **Step 3: Seed ke Neon**

```bash
npm run db:seed
```
Expected: 275 vendor + katalog kaya di Neon.

- [x] **Step 4: Commit migration**

```bash
git add prisma/migrations
git commit -m "chore(db): migration for VendorProfile.slug"
```

---

## Verifikasi Akhir

- [x] `npx prisma validate` (kedua schema) → valid
- [x] `npm run typecheck` → PASS
- [x] `npm test` → PASS
- [x] `npm run build` → PASS
- [x] Seed: 275 vendor, ±6875 jasa, ±2750 portofolio (Neon)
- [x] Beranda: 6/kategori + blur CTA + "Lihat Selengkapnya"; tiap kategori tidak tercampur
- [x] Navbar "Dashboard →" per role; logout di sidebar; nama vendor di samping logo
- [x] `npm run reset-session` bekerja

## Self-Review

**1. Spec coverage**
- 275 vendor 1 kategori → Task 3,5. ✅
- 25 jasa + 10 portofolio + gambar relevan → Task 4,5. ✅
- Beranda DB 6/kategori + blur CTA + Lihat Selengkapnya → Task 6,7. ✅
- Halaman kategori semua vendor → Task 8. ✅
- Navbar/sidebar/logout/reset → Task 9. ✅
- Slug + migrasi Neon → Task 1,10. ✅
- Akun login 081300000001..275 → Task 5. ✅

**2. Placeholder scan:** Tidak ada TBD/TODO. Langkah bertanda "…" mengacu potongan kode yang sudah ada di file (loop jasa/portofolio Task 5 sudah ditunjukkan bentuknya di seed saat ini).

**3. Type consistency:** `HomeVendorCard` (Task 6) dipakai Task 7/8. `categoryNameToId`/`buildVendorSlug` (Task 2) dipakai Task 5/6. `VendorSeed` (Task 3) dipakai Task 5. `IMG` (Task 4) dipakai Task 5.

**Catatan penyesuaian inline:** Task 5 menyuruh memakai `createMany` bila perlu (performa) — jaga konsistensi id paket untuk OrderItem.
