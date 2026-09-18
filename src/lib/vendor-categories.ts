import { MULTI_VENDOR_CATALOG, type VendorProfile } from "@/data/multi-vendor-catalog";
import type { VendorProduct } from "@/data/product-types";

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

/** Cari profil vendor berdasarkan slug publiknya (`/vendor/[slug]`). */
export function getVendorBySlug(slug: string): VendorProfile | undefined {
  return MULTI_VENDOR_CATALOG.find((v) => v.slug === slug);
}

/** Cari produk tertentu di dalam vendor (`/vendor/[slug]/produk/[productSlug]`). */
export function getProduct(
  vendorSlug: string,
  productSlug: string
): VendorProduct | undefined {
  const vendor = getVendorBySlug(vendorSlug);
  return vendor?.products.find((p) => p.slug === productSlug);
}
