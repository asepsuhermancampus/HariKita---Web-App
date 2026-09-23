# Profil Publik Vendor dari DB — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline). Steps pakai checkbox.

**Goal:** `/vendor/[slug]` & `/vendor/[slug]/produk/[productSlug]` membaca vendor + paket + portofolio dari DB (bukan katalog statis), agar vendor hasil seeder tampil benar.

**Architecture:** Tambah query `getPublicVendorBySlug`/`getPublicProductBySlug` di `catalog.ts`; util pemetaan unit type & slug produk; ubah `vendor/[slug]/page.tsx` jadi server yang fetch DB lalu render client baru (dari page lama).

**Tech Stack:** Next.js 15, Prisma, TypeScript, `node:test` via tsx.

**Spec:** `docs/superpowers/specs/2026-09-24-vendor-public-profile-db-design.md`

## Global Constraints
- Font/warna design-system. Tanpa emoji. Jangan ubah cart/builder logic & ledger.
- Hanya vendor APPROVED tampil. Slug tak ada → 404.
- Verifikasi: `npm run typecheck` + `npm test` + `npm run build`.

---

### Task 1: Util pemetaan unit type + slug produk

**Files:** Modify `src/lib/catalog-utils.ts`; Test `tests/catalog-utils.test.ts`

- [ ] **Step 1: Test gagal**
```ts
import { unitTypeDbToUi, buildProductSlug } from "../src/lib/catalog-utils";
test("unitTypeDbToUi maps", () => {
  assert.equal(unitTypeDbToUi("pax"), "pax");
  assert.equal(unitTypeDbToUi("pcs"), "piece");
  assert.equal(unitTypeDbToUi("all_in"), "package");
  assert.equal(unitTypeDbToUi(undefined), "package");
});
test("buildProductSlug url-safe", () => {
  assert.match(buildProductSlug("Paket Sewa Kebaya Beaded", "abc12345"), /^[a-z0-9-]+$/);
});
```
- [ ] **Step 2: Run — gagal** (`npx tsx --test tests/catalog-utils.test.ts`)
- [ ] **Step 3: Implementasi**
```ts
export type UiUnitType = "package" | "pax" | "piece" | "portion";
export function unitTypeDbToUi(db?: string | null): UiUnitType {
  switch (db) {
    case "pax": return "pax";
    case "pcs": case "baki": case "set": return "piece";
    case "jam": return "portion";
    default: return "package";
  }
}
export function buildProductSlug(name: string, id: string): string {
  return `${slugify(name)}-${id.slice(-8)}`;
}
```
- [ ] **Step 4: Run — lulus** + `npm run typecheck`
- [ ] **Step 5: Commit** `feat(catalog): add unitType map + product slug utils`

---

### Task 2: Query publik vendor & produk

**Files:** Modify `src/server/queries/catalog.ts`

- [ ] **Step 1: Implementasi**
Definisikan `PublicVendorProduct`, `PublicVendor`; `getPublicVendorBySlug(slug)`, `getPublicProductBySlug(vendorSlug, productSlug)`.
- [ ] **Step 2: Typecheck**
- [ ] **Step 3: Commit** `feat(catalog): public vendor/product queries from DB`

---

### Task 3: `/vendor/[slug]` baca DB

**Files:** Modify `src/app/vendor/[slug]/page.tsx` → server; Create `src/components/vendor/PublicVendorProfileClient.tsx` (dari page lama).

- [ ] **Step 1:** Pindahkan isi lama ke client, terima `vendor` prop (bentuk `PublicVendor`).
- [ ] **Step 2:** `page.tsx` server: `getPublicVendorBySlug`, `notFound()` bila null.
- [ ] **Step 3:** typecheck + build.
- [ ] **Step 4: Commit** `feat(vendor): public profile reads from DB`

---

### Task 4: `/vendor/[slug]/produk/[productSlug]` DB

**Files:** Modify halaman produk.

- [ ] **Step 1:** Server fetch `getPublicProductBySlug` → render (client terima prop).
- [ ] **Step 2:** typecheck + build.
- [ ] **Step 3: Commit** `feat(vendor): product detail reads from DB`

---

### Verifikasi Akhir
- [ ] `npm run typecheck` / `npm test` / `npm run build` PASS
- [ ] `/vendor/griya-busana-rarasati` menampilkan vendor BUSANA (bukan Prasmanan)
- [ ] Vendor tak ada → 404

## Self-Review
- Spec coverage: query DB (T2), halaman profil (T3), produk (T4), util (T1). ✅
- Type consistency: `PublicVendor`/`PublicVendorProduct` dipakai T2→T3/T4.
