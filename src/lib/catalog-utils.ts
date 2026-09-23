/**
 * Util katalog: pemetaan nama kategori → id, dan slug vendor.
 */

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

/** Nama kategori (VendorProfile.category) → id kategori (VENDOR_CATEGORIES). */
export function categoryNameToId(name: string): string {
  return CATEGORY_NAME_TO_ID[name] ?? "prewed";
}

/** Buat slug URL-safe dari teks bebas. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Slug vendor stabil: nama-slug + 8 karakter terakhir id. */
export function buildVendorSlug(businessName: string, id: string): string {
  return `${slugify(businessName)}-${id.slice(-8)}`;
}

/** Tipe unit UI (dipakai komponen katalog). */
export type UiUnitType = "package" | "pax" | "piece" | "portion";

/** Peta unit type DB (ServicePackage.unitType) → UI. */
export function unitTypeDbToUi(db?: string | null): UiUnitType {
  switch (db) {
    case "pax":
      return "pax";
    case "pcs":
    case "baki":
    case "set":
      return "piece";
    case "jam":
      return "portion";
    default:
      return "package";
  }
}

/** Slug produk stabil: nama-slug + 8 karakter terakhir id. */
export function buildProductSlug(name: string, id: string): string {
  return `${slugify(name)}-${id.slice(-8)}`;
}
