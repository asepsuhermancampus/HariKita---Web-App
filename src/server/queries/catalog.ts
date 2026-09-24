import { prisma } from "@/lib/prisma";
import { categoryNameToId, buildProductSlug, unitTypeDbToUi, type UiUnitType } from "@/lib/catalog-utils";

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

// -- Profil publik vendor & produk (dari DB) ------------------------------

export interface PublicVendorProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  unitType: UiUnitType;
  unitLabel: string;
  minQuantity?: number;
  maxQuantity?: number;
  image: string;
  desc: string;
  callTime: string;
  features: string[];
  productTags: string[];
  galleryImages: string[];
}

export interface PublicVendor {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  categoryTitle: string;
  district: string;
  avatar: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  bio: string;
  /** Status kurasi vendor: "PENDING" | "APPROVED" | "REJECTED". */
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  products: PublicVendorProduct[];
  portfolio: Array<{ id: string; title: string; url: string; caption: string; locationTag: string; styleTags: string[]; images: string[]; likes: number }>;
}

const UNIT_LABEL: Record<UiUnitType, string> = {
  package: "per paket",
  pax: "per pax",
  piece: "per pcs",
  portion: "per porsi",
};

function toPublicProduct(p: {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  unitType: string | null;
  unitPrice: number | null;
  minUnit: number | null;
  maxUnit: number | null;
  slaDays: number;
  imageUrl: string | null;
  galleryImages: string | null;
  includes: string | null;
  category: string;
}): PublicVendorProduct {
  const uiUnit = unitTypeDbToUi(p.unitType);
  let features: string[] = [];
  try {
    const parsed = p.includes ? JSON.parse(p.includes) : [];
    if (Array.isArray(parsed)) features = parsed.map((x) => String(x));
  } catch {
    features = [];
  }
  let gallery: string[] = [];
  try {
    const parsed = p.galleryImages ? JSON.parse(p.galleryImages) : [];
    if (Array.isArray(parsed)) gallery = parsed.map((x) => String(x));
  } catch {
    gallery = [];
  }
  if (gallery.length === 0 && p.imageUrl) gallery = [p.imageUrl];
  return {
    id: p.id,
    slug: buildProductSlug(p.name, p.id),
    name: p.name,
    price: p.basePrice,
    unitType: uiUnit,
    unitLabel: UNIT_LABEL[uiUnit],
    minQuantity: p.minUnit ?? undefined,
    maxQuantity: p.maxUnit ?? undefined,
    image: p.imageUrl ?? "",
    desc: p.description,
    callTime: "Standby H-0",
    features,
    productTags: [p.category],
    galleryImages: gallery,
  };
}

/**
 * Profil vendor publik berdasarkan slug.
 *
 * Vendor APPROVED tayang penuh. Vendor PENDING juga dapat dibuka (owner bisa
 * memeriksa profilnya sendiri) dengan penanda "Menunggu Verifikasi". Vendor
 * REJECTED diblokir dari publik.
 */
export async function getPublicVendorBySlug(slug: string): Promise<PublicVendor | null> {
  const v = await prisma.vendorProfile.findFirst({
    where: { slug, verificationStatus: { not: "REJECTED" } },
    include: {
      packages: { orderBy: { basePrice: "asc" } },
      portfolios: { orderBy: { likes: "desc" } },
    },
  });
  if (!v) return null;

  const categoryId = categoryNameToId(v.category);
  const products = v.packages.map(toPublicProduct);
  const portfolio = v.portfolios.map((p) => ({
    id: p.id,
    title: p.title,
    likes: p.likes,
    url: p.imageUrl,
    caption: p.caption ?? "",
    locationTag: p.locationTag ?? "",
    styleTags: (() => {
      try {
        const arr = p.styleTags ? JSON.parse(p.styleTags) : [];
        return Array.isArray(arr) ? arr.map((x) => String(x)) : [];
      } catch {
        return [];
      }
    })(),
    images: (() => {
      try {
        const arr = p.images ? JSON.parse(p.images) : [];
        const list = Array.isArray(arr) ? arr.map((x) => String(x)) : [];
        return list.length > 0 ? list : [p.imageUrl];
      } catch {
        return [p.imageUrl];
      }
    })(),
  }));

  return {
    id: v.id,
    slug: v.slug ?? v.id,
    name: v.businessName,
    categoryId,
    categoryTitle: v.category,
    district: v.district ?? "Kebumen",
    avatar: portfolio[0]?.url ?? products[0]?.image ?? "",
    coverImage: portfolio[0]?.url ?? products[0]?.image ?? "",
    rating: v.rating,
    reviewCount: v.reviewCount,
    verified: v.isVerified,
    bio: v.description ?? "",
    verificationStatus: (v.verificationStatus as "PENDING" | "APPROVED" | "REJECTED") ?? "PENDING",
    products,
    portfolio,
  };
}

/** Detail produk vendor publik. */
export async function getPublicProductBySlug(
  vendorSlug: string,
  productSlug: string
): Promise<{ vendor: PublicVendor; product: PublicVendorProduct } | null> {
  const vendor = await getPublicVendorBySlug(vendorSlug);
  if (!vendor) return null;
  const product = vendor.products.find((p) => p.slug === productSlug);
  if (!product) return null;
  return { vendor, product };
}
