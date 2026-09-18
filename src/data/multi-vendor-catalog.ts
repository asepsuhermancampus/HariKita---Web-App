/**
 * Master Katalog Multi-Vendor Kebumen
 * Menyediakan struktur data multi-vendor di 11 kategori layanan terpadu.
 *
 * Sumber data: `catalog-generator.ts` (deterministik, 220 vendor x 15 produk).
 */

import { generateCatalog } from "./catalog-generator";
import type { VendorProduct } from "./product-types";

export type { VendorProduct };

/**
 * @deprecated Gunakan `VendorProduct`. Alias dipertahankan sementara untuk
 * konsumen lama (mis. catalog-bridge) selama migrasi `packages` -> `products`.
 */
export type VendorPackage = VendorProduct;

export interface VendorPortfolioItem {
  id: string;
  url: string;
  caption: string;
  locationTag: string;
  styleTags: string[];
}

export interface VendorProfile {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  categoryTitle: string;
  district: string; // Kecamatan di Kebumen
  avatar: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  bio: string;
  tagline?: string;
  products: VendorProduct[];
  portfolio: VendorPortfolioItem[];
  blackoutDates: string[]; // YYYY-MM-DD
}

export const KEBUMEN_DISTRICTS = [
  "Kebumen Kota",
  "Gombong",
  "Karanganyar",
  "Kutowinangun",
  "Ayah",
  "Puring",
  "Petanahan",
  "Prembun",
  "Alian",
  "Sruweng",
  "Klirong",
  "Buluspesantren",
] as const;

export const MULTI_VENDOR_CATALOG: VendorProfile[] =
  generateCatalog() as unknown as VendorProfile[];
