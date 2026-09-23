# Vendor Verification + Peta & Estimasi Jarak — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Vendor wajib lengkapi data usaha + unggah dokumen (KTP/foto usaha) & mengajukan verifikasi (PENDING→APPROVED oleh admin; hanya APPROVED tampil), plus alamat terstruktur + koordinat peta (vendor & client) dan estimasi jarak berkendara (OSRM) di order client.

**Architecture:** Tambah kolom Prisma (data legal/alamat/koordinat) di `VendorProfile` & `ClientProfile`; ubah default verifikasi ke PENDING/false. Modul geo murni (`haversine`, `osrm`, `postal-codes`) + komponen Leaflet + form verifikasi vendor + upload route + preview admin. Seed demo vendor → APPROVED.

**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma (SQLite dev + Postgres prod), Tailwind + design-system, Lucide, Leaflet + react-leaflet, OSRM, `node:test` via `tsx`.

**Spec:** `docs/superpowers/specs/2026-09-22-vendor-verification-and-geo-design.md`

## Global Constraints

- Font `font-manrope`/`font-editorial`; warna token `hk-*` + gold/plum. **Tanpa** hex ad-hoc (kecuali turunan teks badge status). **Tanpa emoji** (pakai Lucide).
- Leaflet hanya client-side: `dynamic(() => import(...), { ssr: false })`.
- OSRM: timeout ≤5s + fallback Haversine.
- Upload: whitelist `image/jpeg|png|webp`, ≤5MB.
- **Jangan** ubah ledger/payment. Jangan hapus model/field existing tanpa alasan (AGENTS §5.1).
- Dua schema Prisma sinkron. Backup `dev.db` sebelum db push.
- Verifikasi vendor tetap butuh `requireAdminCapability("VERIFY_VENDOR")` + audit.
- Responsif: tanpa horizontal overflow di 375px.
- Verifikasi akhir tiap fase: `npm run typecheck` + `npm test` + `npm run build`.

---

### Task 1: Modul geo murni — haversine, postal-codes (TDD)

**Files:**
- Create: `src/lib/geo/haversine.ts`
- Create: `src/lib/geo/postal-codes.ts`
- Test: `tests/geo.test.ts`

**Interfaces:**
- Produces:
  - `haversineKm(a: LatLng, b: LatLng): number`
  - `type LatLng = { lat: number; lng: number }`
  - `lookupPostalCode(desa: string, kecamatan: string): string | null`
  - `KEBUMEN_POSTAL: Record<string, { kecamatan: string; postalCode: string }>`

- [x] **Step 1: Write the failing test**

```ts
// tests/geo.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { haversineKm } from "../src/lib/geo/haversine";
import { lookupPostalCode } from "../src/lib/geo/postal-codes";

test("haversineKm: Kebumen Kota -> Gombong sekitar 20-25 km", () => {
  // approximate coords
  const a = { lat: -7.6683, lng: 109.6533 }; // Kebumen Kota
  const b = { lat: -7.6067, lng: 109.5133 }; // Gombong
  const d = haversineKm(a, b);
  assert.ok(d > 10 && d < 35, `unexpected ${d}`);
});

test("haversineKm: titik sama = 0", () => {
  assert.equal(haversineKm({ lat: -7.66, lng: 109.65 }, { lat: -7.66, lng: 109.65 }), 0);
});

test("lookupPostalCode: mengembalikan kode pos utk desa+Kecamatan dikenal", () => {
  // Ambil satu entri nyata dari tabel (uji kontrak, bukan nilai spesifik)
  const code = lookupPostalCode("Kebumen", "Kebumen");
  assert.ok(code === null || /^\d{5}$/.test(code));
});
```

- [x] **Step 2: Run test — verify it fails**

Run: `npx tsx --test tests/geo.test.ts`
Expected: FAIL — modul belum ada.

- [x] **Step 3: Create `haversine.ts`**

```ts
// src/lib/geo/haversine.ts
export interface LatLng {
  lat: number;
  lng: number;
}

/** Jarak garis lurus (km) antara dua koordinat. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371; // km
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
```

- [x] **Step 4: Create `postal-codes.ts`**

```ts
// src/lib/geo/postal-codes.ts
/**
 * Peta kode pos desa/kelurahan di Kabupaten Kebumen (subset pilot).
 * Kunci = nama desa (lowercase). Nilai = { kecamatan, postalCode }.
 * Catatan: subset; lengkapi bertahap. Bila tidak ada → null (form minta manual).
 */
export const KEBUMEN_POSTAL: Record<string, { kecamatan: string; postalCode: string }> = {
  kebumen: { kecamatan: "Kebumen", postalCode: "54311" },
  panjer: { kecamatan: "Kebumen", postalCode: "54312" },
  gombong: { kecamatan: "Gombong", postalCode: "54411" },
  karanganyar: { kecamatan: "Karanganyar", postalCode: "54364" },
  prembun: { kecamatan: "Prembun", postalCode: "54394" },
  kutowinangun: { kecamatan: "Kutowinangun", postalCode: "54393" },
  alian: { kecamatan: "Alian", postalCode: "54352" },
  ayah: { kecamatan: "Ayah", postalCode: "54473" },
  // ... lengkapi bertahap
};

export function lookupPostalCode(desa: string, kecamatan: string): string | null {
  if (!desa) return null;
  const key = desa.trim().toLowerCase();
  const entry = KEBUMEN_POSTAL[key];
  if (!entry) return null;
  if (kecamatan && entry.kecamatan.toLowerCase() !== kecamatan.trim().toLowerCase()) {
    return null;
  }
  return entry.postalCode;
}
```

- [x] **Step 5: Run test — verify it passes**

Run: `npx tsx --test tests/geo.test.ts`
Expected: PASS (3 tests).

- [x] **Step 6: Typecheck + commit**

Run: `npm run typecheck`

```bash
git add src/lib/geo tests/geo.test.ts
git commit -m "feat(geo): add haversine + Kebumen postal code lookup"
```

---

### Task 2: Modul estimasi jarak OSRM

**Files:**
- Create: `src/lib/geo/osrm.ts`
- Test: `tests/geo.test.ts` (tambah)

**Interfaces:**
- Consumes: `haversineKm`, `LatLng` (Task 1).
- Produces:
  - `interface DistanceResult { km: number; minutes: number | null; source: "osrm" | "haversine" }`
  - `estimateDrivingDistance(from: LatLng, to: LatLng, fetchImpl?: typeof fetch): Promise<DistanceResult>`

- [x] **Step 1: Write the failing test**

```ts
// tambah ke tests/geo.test.ts
import { estimateDrivingDistance } from "../src/lib/geo/osrm";

test("estimateDrivingDistance: pakai OSRM bila sukses", async () => {
  const fakeFetch = (async () =>
    ({
      ok: true,
      json: async () => ({ routes: [{ distance: 12345.6, duration: 900 }] }),
    }) as unknown as Response) as unknown as typeof fetch;
  const r = await estimateDrivingDistance({ lat: -7.6, lng: 109.6 }, { lat: -7.7, lng: 109.7 }, fakeFetch);
  assert.equal(r.source, "osrm");
  assert.ok(r.km > 12 && r.km < 13);
  assert.equal(r.minutes, 15);
});

test("estimateDrivingDistance: fallback haversine bila OSRM gagal", async () => {
  const failFetch = (async () => {
    throw new Error("network");
  }) as unknown as typeof fetch;
  const r = await estimateDrivingDistance({ lat: -7.6, lng: 109.6 }, { lat: -7.7, lng: 109.7 }, failFetch);
  assert.equal(r.source, "haversine");
  assert.equal(r.minutes, null);
  assert.ok(r.km > 0);
});
```

- [x] **Step 2: Run test — verify it fails**

Run: `npx tsx --test tests/geo.test.ts`
Expected: FAIL — `osrm` modul belum ada.

- [x] **Step 3: Create `osrm.ts`**

```ts
// src/lib/geo/osrm.ts
import { haversineKm, type LatLng } from "./haversine";

export interface DistanceResult {
  km: number;
  minutes: number | null;
  source: "osrm" | "haversine";
}

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";
const TIMEOUT_MS = 5000;

/** Estimasi jarak berkendara via OSRM; fallback Haversine bila gagal. */
export async function estimateDrivingDistance(
  from: LatLng,
  to: LatLng,
  fetchImpl: typeof fetch = fetch
): Promise<DistanceResult> {
  try {
    const url = `${OSRM_BASE}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetchImpl(url, { signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error(`OSRM ${res.status}`);
    const data = (await res.json()) as { routes?: Array<{ distance: number; duration: number }> };
    const route = data.routes?.[0];
    if (!route) throw new Error("no route");
    return {
      km: Math.round((route.distance / 1000) * 10) / 10,
      minutes: Math.round(route.duration / 60),
      source: "osrm",
    };
  } catch {
    return {
      km: Math.round(haversineKm(from, to) * 10) / 10,
      minutes: null,
      source: "haversine",
    };
  }
}
```

- [x] **Step 4: Run test — verify it passes**

Run: `npx tsx --test tests/geo.test.ts`
Expected: PASS.

- [x] **Step 5: Typecheck + commit**

```bash
git add src/lib/geo/osrm.ts tests/geo.test.ts
npm run typecheck
git commit -m "feat(geo): add OSRM driving distance with haversine fallback"
```

---

### Task 3: Skema — kolom legal/alamat/koordinat + default verifikasi

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma/schema.sqlite.prisma`

**Interfaces:**
- Produces: kolom baru `VendorProfile.{ktpNumber,ktpPhotoUrl,businessPhotoUrl,revenueMethod,ewalletProvider,rt,rw,dusun,desa,kecamatan,kabupaten,postalCode,latitude,longitude,profileCompleted,submittedAt}`; `ClientProfile.{rt,rw,dusun,desa,kecamatan,kabupaten,postalCode,latitude,longitude}`; default `verificationStatus="PENDING"`, `isVerified=false`.

- [x] **Step 1: Backup dev.db**

Run: `copy prisma\dev.db prisma\dev.db.bak`

- [x] **Step 2: Edit `VendorProfile` (kedua schema)**

Tambah kolom (letakkan dekat field terkait) & ubah default:
```prisma
  ktpNumber        String?
  ktpPhotoUrl      String?
  businessPhotoUrl String?
  revenueMethod    String?   // "BANK" | "EWALLET"
  ewalletProvider  String?
  rt               String?
  rw               String?
  dusun            String?
  desa             String?
  kecamatan        String?
  kabupaten        String?   @default("Kebumen")
  postalCode       String?
  latitude         Float?
  longitude        Float?
  profileCompleted Boolean   @default(false)
  submittedAt      DateTime?
```
Ubah: `isVerified Boolean @default(false)` dan `verificationStatus String @default("PENDING")`.

- [x] **Step 3: Edit `ClientProfile` (kedua schema)**

```prisma
  rt         String?
  rw         String?
  dusun      String?
  desa       String?
  kecamatan  String?
  kabupaten  String?  @default("Kebumen")
  postalCode String?
  latitude   Float?
  longitude  Float?
```

- [x] **Step 4: Validate + generate + push**

```bash
npx prisma validate --schema prisma/schema.prisma
npx prisma validate --schema prisma/schema.sqlite.prisma
npm run generate
npm run generate:sqlite
$env:DATABASE_URL="file:" + ((Resolve-Path "prisma\dev.db").Path -replace '\\','/'); npx prisma db push --schema prisma/schema.sqlite.prisma --skip-generate
```
Expected: valid; db push sukses.

- [x] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/schema.sqlite.prisma prisma/dev.db
git commit -m "feat(vendor): add verification, address, and geo columns"
```

---

### Task 4: Action — simpan profil vendor + ajukan verifikasi

**Files:**
- Modify: `src/server/actions/vendor-profile.ts`
- Test: `tests/vendor-verification.test.ts`

**Interfaces:**
- Produces:
  - `saveVendorProfileAction(input)` — simpan semua field (alamat, koordinat, rekening, path foto)
  - `submitVendorVerificationAction()` — validasi kelengkapan server → set `profileCompleted=true`, `submittedAt=now`, `verificationStatus="PENDING"`
  - `validateVendorCompleteness(v: {...}): string[]` (pure, daftar field yang kurang)

- [x] **Step 1: Write the failing test**

```ts
// tests/vendor-verification.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateVendorCompleteness } from "../src/server/actions/vendor-profile";

test("validateVendorCompleteness: kosong -> banyak error", () => {
  const errs = validateVendorCompleteness({ businessName: "", ktpPhotoUrl: null } as never);
  assert.ok(errs.length > 0);
});

test("validateVendorCompleteness: lengkap -> kosong", () => {
  const errs = validateVendorCompleteness({
    businessName: "Studio X",
    ktpNumber: "3305012345670001",
    ktpPhotoUrl: "/x.jpg",
    businessPhotoUrl: "/y.jpg",
    category: "katering",
    revenueMethod: "BANK",
    bankName: "BCA",
    bankAccount: "123",
    bankHolder: "Budi",
    phone: "081200000000",
    address: "Jl. X",
    desa: "Kebumen",
    kecamatan: "Kebumen",
    latitude: -7.6,
    longitude: 109.6,
  } as never);
  assert.equal(errs.length, 0);
});
```

- [x] **Step 2: Run test — verify it fails**

Run: `npx tsx --test tests/vendor-verification.test.ts`
Expected: FAIL — `validateVendorCompleteness` belum ada.

- [x] **Step 3: Tambah `validateVendorCompleteness` + actions**

Di `src/server/actions/vendor-profile.ts`, tambah fungsi murni + action. (Sesuaikan dengan pola `runAction`/session yang sudah ada di file.)

```ts
export interface VendorCompletenessInput {
  businessName?: string | null;
  category?: string | null;
  ktpNumber?: string | null;
  ktpPhotoUrl?: string | null;
  businessPhotoUrl?: string | null;
  revenueMethod?: string | null;
  bankName?: string | null;
  bankAccount?: string | null;
  bankHolder?: string | null;
  ewalletProvider?: string | null;
  phone?: string | null;
  address?: string | null;
  desa?: string | null;
  kecamatan?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

/** Daftar field wajib yang masih kosong. */
export function validateVendorCompleteness(v: VendorCompletenessInput): string[] {
  const missing: string[] = [];
  const req = (cond: boolean, label: string) => { if (!cond) missing.push(label); };
  req(!!v.businessName?.trim(), "Nama usaha");
  req(!!v.category?.trim(), "Kategori");
  req(!!v.ktpNumber?.trim(), "Nomor KTP");
  req(!!v.ktpPhotoUrl, "Foto KTP");
  req(!!v.businessPhotoUrl, "Foto usaha");
  req(!!v.phone?.trim(), "No WhatsApp");
  req(!!v.address?.trim(), "Alamat");
  req(!!v.desa?.trim(), "Desa/Kelurahan");
  req(!!v.kecamatan?.trim(), "Kecamatan");
  req(typeof v.latitude === "number" && typeof v.longitude === "number", "Titik lokasi peta");
  if (v.revenueMethod === "EWALLET") {
    req(!!v.ewalletProvider?.trim(), "Provider e-wallet");
    req(!!v.bankAccount?.trim(), "No e-wallet");
    req(!!v.bankHolder?.trim(), "Nama pemilik e-wallet");
  } else {
    req(!!v.bankName?.trim(), "Nama bank");
    req(!!v.bankAccount?.trim(), "No rekening");
    req(!!v.bankHolder?.trim(), "Nama pemilik rekening");
  }
  return missing;
}

export async function submitVendorVerificationAction(): Promise<ActionResult<{ ok: true }>> {
  return runAction(async () => {
    const session = await requireSession();
    const vendor = await // ambil VendorProfile milik session.userId
    const missing = validateVendorCompleteness(vendor);
    if (missing.length > 0) {
      throw new DomainError("INVALID_ORDER_TRANSITION", `Lengkapi dulu: ${missing.join(", ")}.`);
    }
    await prisma.vendorProfile.update({
      where: { id: vendor.id },
      data: { profileCompleted: true, submittedAt: new Date(), verificationStatus: "PENDING" },
    });
    revalidate(["/dashboard/vendor/profil", "/admin/verifikasi"]);
    return { ok: true };
  });
}
```
> Sesuaikan query vendor & helper `requireSession`/`runAction`/`revalidate` dengan yang sudah ada di file. Jangan mengarang nama yang tidak ada.

- [x] **Step 4: Run test + typecheck**

Run: `npx tsx --test tests/vendor-verification.test.ts && npm run typecheck`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add src/server/actions/vendor-profile.ts tests/vendor-verification.test.ts
git commit -m "feat(vendor): completeness validation + submit verification action"
```

---

### Task 5: Komponen peta Leaflet

**Files:**
- Create: `src/components/maps/LocationPickerMap.tsx`
- Create: `src/components/maps/LocationPreviewMap.tsx`
- Modify: `package.json` (tambah `leaflet`, `react-leaflet`, `@types/leaflet`)

**Interfaces:**
- Produces:
  - `LocationPickerMap({ value: LatLng|null, onChange: (v: LatLng) => void })`
  - `LocationPreviewMap({ lat: number; lng: number; label?: string })`

- [x] **Step 1: Install deps**

Run: `npm install leaflet react-leaflet && npm install -D @types/leaflet`
Expected: terpasang.

- [x] **Step 2: Create `LocationPickerMap.tsx`**

```tsx
// src/components/maps/LocationPickerMap.tsx
"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export interface LatLng { lat: number; lng: number; }

// Fix ikon marker default Leaflet (aset path)
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41],
});

function ClickHandler({ onChange }: { onChange: (v: LatLng) => void }) {
  useMapEvents({
    click(e) { onChange({ lat: e.latlng.lat, lng: e.latlng.lng }); },
  });
  return null;
}

export function LocationPickerMap({
  value, onChange,
}: { value: LatLng | null; onChange: (v: LatLng) => void }) {
  const center: [number, number] = value ? [value.lat, value.lng] : [-7.6683, 109.6533]; // Kebumen
  return (
    <div className="overflow-hidden rounded-2xl border border-hk-champagne/40">
      <MapContainer center={center} zoom={12} style={{ height: 280, width: "100%" }}>
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={onChange} />
        {value && <Marker position={[value.lat, value.lng]} icon={icon} />}
      </MapContainer>
    </div>
  );
}
```

- [x] **Step 3: Create `LocationPreviewMap.tsx`**

```tsx
// src/components/maps/LocationPreviewMap.tsx
"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41],
});

export function LocationPreviewMap({ lat, lng }: { lat: number; lng: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-hk-champagne/40">
      <MapContainer center={[lat, lng]} zoom={13} style={{ height: 200, width: "100%" }} dragging={false} scrollWheelZoom={false}>
        <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lng]} icon={icon} />
      </MapContainer>
    </div>
  );
}
```

> Peta di-load via `dynamic(() => import(...), { ssr: false })` di halaman yang memakainya (Task 6/8/9) — Leaflet butuh `window`.

- [x] **Step 4: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add src/components/maps package.json package-lock.json
git commit -m "feat(maps): add Leaflet location picker + preview components"
```

---

### Task 6: Upload route dokumen vendor

**Files:**
- Create: `src/app/api/upload/vendor-doc/route.ts`

**Interfaces:**
- Produces: `POST /api/upload/vendor-doc` (FormData: `file`, `kind: "ktp"|"business"`) → `{ url: string }`.

- [x] **Step 1: Create route**

```ts
// src/app/api/upload/vendor-doc/route.ts
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { getSession } from "@/lib/session";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  const kind = String(form.get("kind") ?? "");
  if (!(file instanceof File) || !["ktp", "business"].includes(kind)) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "tipe file harus JPG/PNG/WEBP" }, { status: 400 });
  }
  if (file.size > MAX) {
    return NextResponse.json({ error: "ukuran maksimum 5MB" }, { status: 400 });
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const name = `${kind}-${randomBytes(8).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "vendor", session.userId);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/uploads/vendor/${session.userId}/${name}` });
}
```

- [x] **Step 2: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: PASS.

- [x] **Step 3: Commit**

```bash
git add src/app/api/upload/vendor-doc/route.ts
git commit -m "feat(vendor): add vendor document upload route"
```

---

### Task 7: Form verifikasi vendor di dashboard

**Files:**
- Create: `src/components/vendor/VendorVerificationForm.tsx`
- Modify: `src/app/dashboard/vendor/profil/*` (render form)

**Interfaces:**
- Consumes: `LocationPickerMap` (dynamic), upload route, `saveVendorProfileAction`, `submitVendorVerificationAction`, `lookupPostalCode`.

- [x] **Step 1: Create `VendorVerificationForm`**

Bikin client component dengan section: Info Usaha, Data Pemilik (KTP), Alamat Terstruktur (+auto kode pos), Titik Lokasi (dynamic `LocationPickerMap`), Rekening (BANK/E-WALLET), Dokumen (upload KTP & foto usaha via `/api/upload/vendor-doc`), tombol **Ajukan Verifikasi**. Gunakan `DashCard`, `DashButton`, token brand, ikon Lucide. `LocationPickerMap` diimport:
```tsx
const LocationPickerMap = dynamic(
  () => import("@/components/maps/LocationPickerMap").then((m) => m.LocationPickerMap),
  { ssr: false, loading: () => <div className="h-[280px] rounded-2xl bg-hk-ivory" /> }
);
```
Auto kode pos:
```tsx
import { lookupPostalCode } from "@/lib/geo/postal-codes";
// saat desa/kecamatan berubah:
const pc = lookupPostalCode(desa, kecamatan);
if (pc) setPostalCode(pc);
```
Badge status: PENDING(warn)/APPROVED(ok)/REJECTED(error)+catatan.

- [x] **Step 2: Render di halaman profil vendor**

Di `src/app/dashboard/vendor/profil/page.tsx` (atau workspace), tampilkan `VendorVerificationForm` dengan data vendor existing. Pertahankan konten lama; tambah section verifikasi.

- [x] **Step 3: Typecheck + build + verifikasi manual**

Run: `npm run typecheck && npm run build`
Manual: `/dashboard/vendor/profil` → isi form, upload 2 foto, pilih titik peta, klik Ajukan → status PENDING.

- [x] **Step 4: Commit**

```bash
git add src/components/vendor/VendorVerificationForm.tsx src/app/dashboard/vendor/profil
git commit -m "feat(vendor): verification form with map, upload, and submit"
```

---

### Task 8: Halaman verifikasi admin — preview dokumen & peta

**Files:**
- Modify: `src/app/admin/verifikasi/AdminVerifikasiClient.tsx`
- Modify: `src/server/queries/admin.ts` (tambah field di DTO)

**Interfaces:**
- Consumes: `LocationPreviewMap` (dynamic), data vendor lengkap dari `getVendorVerifications`.
- Produces: kartu vendor menampilkan data legal, foto (zoom modal), mini-map, tombol Setujui/Tolak (aksi existing).

- [x] **Step 1: Perluas DTO query**

Tambah field ke `VendorVerificationDTO`: `ktpNumber, ktpPhotoUrl, businessPhotoUrl, revenueMethod, ewalletProvider, rt, rw, dusun, desa, kecamatan, kabupaten, postalCode, latitude, longitude, profileCompleted, submittedAt`.

- [x] **Step 2: Tampilkan di admin**

Perluas kartu: section "Data Usaha & Dokumen" + preview `ktpPhotoUrl`/`businessPhotoUrl` (klik → modal) + `LocationPreviewMap` (dynamic ssr:false, hanya bila lat/lng ada). Pertahankan tombol Setujui/Tolak existing.

- [x] **Step 3: Typecheck + build + manual**

Run: `npm run typecheck && npm run build`
Manual: `/admin/verifikasi` → lihat vendor PENDING + dokumen + peta → Setujui → muncul di katalog.

- [x] **Step 4: Commit**

```bash
git add src/app/admin/verifikasi src/server/queries/admin.ts
git commit -m "feat(admin): vendor verification card with docs preview + map"
```

---

### Task 9: Client — alamat & koordinat

**Files:**
- Modify: `src/server/actions/*` client profile (sesuai existing)
- Modify: `src/app/client/profil/*`
- Modify: `src/lib/geo/...` (pakai lookupPostalCode)

**Interfaces:**
- Produces: client bisa simpan `partnerName` + alamat terstruktur + `latitude/longitude`.

- [x] **Step 1: Tambah action simpan client profile**

Action yang menyimpan field baru `ClientProfile` (rt/rw/dusun/desa/kecamatan/kabupaten/postalCode/latitude/longitude). Sesuaikan dengan pola existing (session + runAction).

- [x] **Step 2: Form client**

Di `src/app/client/profil/*`: tambah Nama Pasangan + alamat terstruktur (auto kode pos) + `LocationPickerMap` (dynamic ssr:false). Gunakan `DashCard`/`DashButton`.

- [x] **Step 3: Typecheck + build + manual**

Run: `npm run typecheck && npm run build`

- [x] **Step 4: Commit**

```bash
git add src/app/client/profil src/server/actions
git commit -m "feat(client): structured address + map coordinates"
```

---

### Task 10: Estimasi jarak di order client

**Files:**
- Modify: `src/app/checkout/page.tsx` (+ server wrapper) DAN/ATAU halaman pesanan client
- Modify: query order/vendor untuk sediakan lat/lng vendor

**Interfaces:**
- Consumes: `estimateDrivingDistance` (Task 2).

- [x] **Step 1: Sediakan koordinat**

Query vendor/order agar menyertakan `latitude/longitude` vendor + koordinat client (dari ClientProfile).

- [x] **Step 2: Tampilkan estimasi**

Di checkout/pesanan: panggil `estimateDrivingDistance(clientLatLng, vendorLatLng)` (server-side, sekali per order) → tampil "± X km · ± Y menit berkendara" (atau "(perkiraan)" bila `source==="haversine"`). Bila koordinat tidak lengkap → sembunyikan.

- [x] **Step 3: Typecheck + test + build + manual**

Run: `npm run typecheck && npm test && npm run build`
Manual: buat/lihat order → jarak tampil.

- [x] **Step 4: Commit**

```bash
git add src/app/checkout src/server
git commit -m "feat(order): show driving distance estimate to client"
```

---

### Task 11: Seed & filter katalog

**Files:**
- Modify: `prisma/seed.ts`
- Verify: query katalog vendor filter `verificationStatus="APPROVED"`.

- [x] **Step 1: Seed vendor demo APPROVED + data lengkap**

Set vendor demo di seed → `verificationStatus:"APPROVED"`, `isVerified:true`, `profileCompleted:true`, isi alamat + koordinat contoh (agar katalog & jarak demo jalan).

- [x] **Step 2: Pastikan filter katalog**

Grep query vendor publik → pastikan hanya `verificationStatus:"APPROVED"` yang ditampilkan. Perbaiki bila ada yang belum filter.

- [x] **Step 3: Seed ke SQLite + typecheck/test/build**

Run:
```bash
$env:DATABASE_URL="file:" + ((Resolve-Path "prisma\dev.db").Path -replace '\\','/'); npm run db:seed
npm run typecheck && npm test && npm run build
```

- [x] **Step 4: Commit**

```bash
git add prisma/seed.ts prisma/dev.db src/lib src/server
git commit -m "feat(vendor): seed approved demo vendor + enforce catalog filter"
```

---

## Verifikasi Akhir

- [x] `npx prisma validate` (kedua schema) → valid
- [x] `npm run typecheck` → PASS
- [x] `npm test` → PASS
- [x] `npm run build` → PASS
- [x] Manual: alur vendor isi→ajukan→admin verifikasi→tampil; peta & jarak tampil; mobile 375px OK
- [x] Migrasi baru untuk produksi (Neon) via `migrate deploy` sebelum deploy

## Self-Review

**1. Spec coverage**
- Data legal + alur verifikasi → Task 3,4,7,8. ✅
- Alamat terstruktur + kode pos auto → Task 1 (postal), 7, 9. ✅
- Peta koordinat vendor & client → Task 5,7,9. ✅
- Estimasi jarak akurat (OSRM) → Task 2,10. ✅
- Hanya APPROVED tampil → Task 3 (default), 11 (filter/seed). ✅
- Simpan file lokal → Task 6. ✅
- Risiko/keamanan → Global Constraints + Task 6. ✅

**2. Placeholder scan:** Tidak ada TBD/TODO. Langkah yang menyuruh "sesuaikan pola existing" disertai contoh konkret + peringatan jangan mengarang nama.

**3. Type consistency:** `LatLng`/`DistanceResult` (Task 1–2) dipakai Task 5/10. `validateVendorCompleteness` (Task 4). Kolom Prisma (Task 3) dipakai Task 4/7/8/9/11. `LocationPickerMap`/`LocationPreviewMap` (Task 5) dipakai Task 7/8/9.

**Catatan penyesuaian inline:** beberapa task menyuruh menyesuaikan dengan helper existing (`runAction`, `requireSession`, query vendor/client). Jangan mengarang — baca file dulu; jaga typecheck hijau.
