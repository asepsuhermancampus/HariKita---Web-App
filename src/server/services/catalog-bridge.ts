import { prisma } from "@/lib/prisma";
import { MULTI_VENDOR_CATALOG, type VendorProfile, type VendorProduct } from "@/data/multi-vendor-catalog";
import { DomainError } from "@/server/services/errors";
import type { Prisma } from "@prisma/client";

/**
 * HariKita - Catalog Bridge
 *
 * Jembatan resolusi antara katalog statis (`multi-vendor-catalog.ts`, yang dipakai
 * UI builder/checkout dengan ID pendek seperti "v_prewed_01"/"pkg_prewed_basic")
 * dan entitas database (VendorProfile/ServicePackage dengan CUID).
 *
 * Tujuan: memungkinkan Server Action menerima identifer katalog dari klien, lalu
 * me-resolve ke record DB OTORITATIF untuk perhitungan harga (anti-tamper).
 *
 * Strategi resolusi:
 *   1. Cari ServicePackage langsung via `catalog:pkg:<packageId>` marker (bila ada).
 *   2. Fallback: cocokkan `VendorProfile.businessName` dengan nama vendor katalog,
 *      lalu pilih paket dengan kategori yang sama / harga terdekat.
 */

const CATALOG_MARKER_PREFIX = "catalog";

export interface ResolvedCatalogItem {
  vendorId: string;
  packageId: string;
  unitPrice: number;
  vendorName: string;
  packageName: string;
  categorySlug: string;
  unitType: string | null;
}

function findCatalogPackage(
  vendorId: string,
  packageId: string
): { vendor: VendorProfile; pkg: VendorProduct } {
  const vendor = MULTI_VENDOR_CATALOG.find((v) => v.id === vendorId);
  if (!vendor) {
    throw new DomainError(
      "ITEM_PACKAGE_MISMATCH",
      `Vendor katalog "${vendorId}" tidak ditemukan di katalog.`
    );
  }
  const pkg = vendor.products.find((p) => p.id === packageId);
  if (!pkg) {
    throw new DomainError(
      "ITEM_PACKAGE_MISMATCH",
      `Paket katalog "${packageId}" tidak ditemukan pada vendor "${vendorId}".`
    );
  }
  return { vendor, pkg };
}

/**
 * Me-resolve satu item katalog ke record DB otoritatif.
 * @throws {DomainError} bila vendor/paket tidak dapat dipetakan ke DB.
 */
export async function resolveCatalogItem(
  catalogVendorId: string,
  catalogPackageId: string,
  db: Prisma.TransactionClient | typeof prisma = prisma
): Promise<ResolvedCatalogItem> {
  const { vendor, pkg } = findCatalogPackage(catalogVendorId, catalogPackageId);

  // 1. Marker langsung (idempotent, ditulis oleh db:seed bila diterapkan).
  const markerPackage = await db.servicePackage.findFirst({
    where: { id: `${CATALOG_MARKER_PREFIX}:pkg:${catalogPackageId}` },
  });
  if (markerPackage) {
    return {
      vendorId: markerPackage.vendorId,
      packageId: markerPackage.id,
      unitPrice: markerPackage.unitPrice ?? markerPackage.basePrice,
      vendorName: vendor.name,
      packageName: markerPackage.name,
      categorySlug: markerPackage.category,
      unitType: markerPackage.unitType,
    };
  }

  // 2. Fallback berbasis nama vendor katalog → VendorProfile DB.
  const dbVendor = await db.vendorProfile.findFirst({
    where: { businessName: vendor.name },
    include: { packages: true },
  });
  if (!dbVendor) {
    throw new DomainError(
      "ITEM_PACKAGE_MISMATCH",
      `Vendor "${vendor.name}" belum tersedia di database. Jalankan seeding terlebih dahulu.`
    );
  }

  // Pilih paket: prioritas yang harganya paling dekat dengan katalog.
  const dbPackage =
    dbVendor.packages.find((p) => (p.unitPrice ?? p.basePrice) === pkg.price) ??
    dbVendor.packages[0];
  if (!dbPackage) {
    throw new DomainError(
      "ITEM_PACKAGE_MISMATCH",
      `Vendor "${vendor.name}" tidak memiliki paket layanan di database.`
    );
  }

  return {
    vendorId: dbVendor.id,
    packageId: dbPackage.id,
    unitPrice: dbPackage.unitPrice ?? dbPackage.basePrice,
    vendorName: dbVendor.businessName,
    packageName: dbPackage.name,
    categorySlug: dbPackage.category,
    unitType: dbPackage.unitType,
  };
}

/** Me-resolve banyak item katalog sekaligus (order dijaga). */
export async function resolveCatalogItems(
  items: Array<{ vendorId: string; packageId: string }>,
  db: Prisma.TransactionClient | typeof prisma = prisma
): Promise<ResolvedCatalogItem[]> {
  const resolved: ResolvedCatalogItem[] = [];
  for (const item of items) {
    resolved.push(await resolveCatalogItem(item.vendorId, item.packageId, db));
  }
  return resolved;
}
