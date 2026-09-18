/**
 * HariKita - Tipe Produk Vendor
 *
 * Dipecah ke file terpisah agar `catalog-generator.ts` dan `multi-vendor-catalog.ts`
 * dapat berbagi definisi tipe tanpa saling mengimpor (menghindari dependensi melingkar).
 */

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
