# Profil Publik Vendor dari DB — Design Spec

> Status: Menunggu review → implementation plan.
> Tanggal: 2026-09-24
> Branch: `feat/vendor-public-profile-db`

## 1. Masalah

`/vendor/[slug]` (dan `/produk/[productSlug]`) memakai katalog **STATIS**
(`MULTI_VENDOR_CATALOG` + `getVendorBySlug`). Vendor hasil seeder (275, ada di DB,
mis. `griya-busana-rarasati`) **tidak ada di statis** → `getVendorBySlug` return
`undefined` → **fallback `MULTI_VENDOR_CATALOG[0]`** → salah tampil (mis.
"Paket Prasmanan Silver" untuk vendor Busana).

Tujuan: halaman profil publik vendor & produk baca dari **DB** (vendor APPROVED +
paket + portofolio), dipetakan ke bentuk UI yang dipakai.

## 2. Keputusan
- `/vendor/[slug]` → server component ambil vendor DB by `slug` (`verificationStatus="APPROVED"`), lalu render client dengan bentuk yang setara.
- Paket = `ServicePackage` → dipetakan ke `VendorProduct` (id, slug, name, price, unitType, unitLabel, min/max, image, desc, callTime, features, productTags).
- Portofolio = `VendorPortfolio` → `{ id, url, caption, locationTag, styleTags }`.
- Vendor tidak ditemukan (slug tak ada / bukan APPROVED) → **404** (bukan fallback).
- Tombol "+Rencana" (cart) tetap berfungsi.
- `/produk/[productSlug]` juga baca DB.

## 3. Model pemetaan (DB → UI)
```
VendorProfile + packages[25] + portfolios[10]
  → { id, slug, name=businessName, categoryId=categoryNameToId(category),
      categoryTitle=category, district, avatar/bio, coverImage=portofolio[0]|paket[0].imageUrl,
      rating, reviewCount, verified=isVerified,
      products: packages → VendorProduct,
      portfolio: portfolios → {id,url,caption,locationTag,styleTags} }
```
- `slug` produk: `slugify(name)-<id8>` (util di `catalog-utils`).
- `unitType` DB ("all_in"|"pax"|"baki"|"pcs"|"jam"|"set") → UI ("package"|"pax"|"piece"|"portion"). Peta sederhana.
- `callTime`: DB tak punya → default "-" atau dari `slaDays` (mis. "Standby H-0").
- `features`: `includes` JSON.

## 4. Query baru (`src/server/queries/catalog.ts` tambah)
- `getPublicVendorBySlug(slug): Promise<PublicVendor | null>`
- `getPublicProductBySlug(vendorSlug, productSlug): Promise<{ vendor; product } | null>`

## 5. File yang Disentuh
| File | Aksi |
|---|---|
| `src/server/queries/catalog.ts` | tambah query publik |
| `src/lib/catalog-utils.ts` | util `unitTypeDbToUi`, `buildProductSlug` |
| `src/app/vendor/[slug]/page.tsx` | server (fetch DB) + client terima prop |
| `src/components/vendor/PublicVendorProfileClient.tsx` | **Baru** (client, dari page lama) |
| `src/app/vendor/[slug]/produk/[productSlug]/page.tsx` | DB |
| `tests/catalog-utils.test.ts` | util baru |

## 6. Non-tujuan
- Tidak mengubah cart/builder logic (hanya sumber data vendor).
- Tidak menyentuh ledger/payment.
