import { prisma } from "@/lib/prisma";
import { categoryNameToId } from "@/lib/catalog-utils";

/**
 * HariKita - Katalog Query (DB)
 *
 * Membaca vendor APPROVED dari database untuk beranda & halaman kategori.
 * Menyertakan paket termurah (untuk "mulai dari") dan 1 portofolio (gambar).
 */

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

type VendorRow = {
  id: string;
  slug: string | null;
  businessName: string;
  category: string;
  district: string | null;
  rating: number;
  reviewCount: number;
  packages: Array<{ basePrice: number; imageUrl: string | null }>;
  portfolios: Array<{ imageUrl: string }>;
};

function toCard(v: VendorRow, categoryId: string): HomeVendorCard {
  return {
    slug: v.slug ?? v.id,
    businessName: v.businessName,
    categoryId,
    categoryTitle: v.category,
    district: v.district ?? "Kebumen",
    rating: v.rating,
    reviewCount: v.reviewCount,
    priceFrom: v.packages[0]?.basePrice ?? null,
    imageUrl: v.portfolios[0]?.imageUrl ?? v.packages[0]?.imageUrl ?? null,
  };
}

const INCLUDE = {
  packages: { orderBy: { basePrice: "asc" as const }, take: 1, select: { basePrice: true, imageUrl: true } },
  portfolios: { orderBy: { likes: "desc" as const }, take: 1, select: { imageUrl: true } },
};

/**
 * Vendor APPROVED dikelompokkan per categoryId. Tiap kategori dibatasi
 * `limitPerCategory` (default 6 di beranda).
 */
export async function getHomeVendorsByCategory(
  limitPerCategory = 6
): Promise<Record<string, HomeVendorCard[]>> {
  const rows = await prisma.vendorProfile.findMany({
    where: { verificationStatus: "APPROVED" },
    orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
    include: INCLUDE,
  });

  const byCat: Record<string, HomeVendorCard[]> = {};
  for (const v of rows) {
    const cid = categoryNameToId(v.category);
    (byCat[cid] ??= []);
    if (byCat[cid].length < limitPerCategory) {
      byCat[cid].push(toCard(v as VendorRow, cid));
    }
  }
  return byCat;
}

/** Semua vendor APPROVED untuk satu categoryId (halaman kategori). */
export async function getVendorsByCategoryFromDb(categoryId: string): Promise<HomeVendorCard[]> {
  const rows = await prisma.vendorProfile.findMany({
    where: { verificationStatus: "APPROVED" },
    orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
    include: INCLUDE,
  });
  return rows
    .filter((v) => categoryNameToId(v.category) === categoryId)
    .map((v) => toCard(v as VendorRow, categoryId));
}
