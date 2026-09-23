import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { toWibDateString } from "@/lib/date-utils";

/**
 * HariKita - Vendor Portal Query Layer (Phase 2)
 *
 * Query read-only untuk portal mitra vendor, seluruhnya owner-scoped
 * (berdasarkan VendorProfile milik sesi yang login).
 */

/** Mengambil VendorProfile milik sesi yang login (atau null). */
export async function getCurrentVendor() {
  try {
    const session = await getSession();
    if (!session) return null;
    return await prisma.vendorProfile.findUnique({ where: { userId: session.userId } });
  } catch (err) {
    console.error("[getCurrentVendor] Query failed:", err);
    return null;
  }
}

export interface VendorPackageDTO {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  unitPrice: number | null;
  unitType: string | null;
  minUnit: number | null;
  maxUnit: number | null;
  slaDays: number;
  isActive: boolean;
}

/** Daftar paket milik vendor yang login. */
export async function getVendorPackages(): Promise<VendorPackageDTO[]> {
  try {
    const vendor = await getCurrentVendor();
    if (!vendor) return [];

    const packages = await prisma.servicePackage.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: "desc" },
    });

    return packages.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      basePrice: p.basePrice,
      unitPrice: p.unitPrice,
      unitType: p.unitType,
      minUnit: p.minUnit,
      maxUnit: p.maxUnit,
      slaDays: p.slaDays,
      // Model ServicePackage belum punya flag aktif; semua dianggap aktif.
      isActive: true,
    }));
  } catch (err) {
    console.error("[getVendorPackages] Query failed:", err);
    return [];
  }
}

export interface VendorBlackoutDTO {
  id: string;
  vendorId: string;
  date: string; // YYYY-MM-DD
  reason: string;
}

/** Daftar blackout date milik vendor yang login (dari VendorAvailability). */
export async function getVendorBlackouts(): Promise<VendorBlackoutDTO[]> {
  try {
    const vendor = await getCurrentVendor();
    if (!vendor) return [];

    const slots = await prisma.vendorAvailability.findMany({
      where: { vendorId: vendor.id, status: "BLACKED_OUT" },
      orderBy: { date: "asc" },
    });

    return slots.map((s) => ({
      id: s.id,
      vendorId: s.vendorId,
        date: toWibDateString(s.date),
      reason: "Tanggal Terkunci (Offline)",
    }));
  } catch (err) {
    console.error("[getVendorBlackouts] Query failed:", err);
    return [];
  }
}

/** Profil vendor ringkas untuk header portal. */
export async function getVendorSummary() {
  const vendor = await getCurrentVendor();
  if (!vendor) return null;
  return {
    id: vendor.id,
    businessName: vendor.businessName,
    category: vendor.category,
    isVerified: vendor.isVerified,
    walletBalance: vendor.walletBalance,
  };
}

export interface VendorPortfolioDTO {
  id: string;
  title: string;
  locationTag: string;
  categoryTag: string;
  styleTags: string[];
  caption: string;
  imageUrl: string;
  likes: number;
  createdAt: string;
}

function parseTags(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

/** Daftar portofolio milik vendor yang login. */
export async function getVendorPortfolios(): Promise<VendorPortfolioDTO[]> {
  const vendor = await getCurrentVendor();
  if (!vendor) return [];

  const posts = await prisma.vendorPortfolio.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: "desc" },
  });

  return posts.map((p) => ({
    id: p.id,
    title: p.title,
    locationTag: p.locationTag ?? "",
    categoryTag: p.categoryTag ?? "",
    styleTags: parseTags(p.styleTags),
    caption: p.caption ?? "",
    imageUrl: p.imageUrl,
    likes: p.likes,
    createdAt: p.createdAt.toISOString().split("T")[0],
  }));
}

/** Portofolio publik milik vendor (berdasarkan businessName). */
export async function getVendorPortfoliosByName(businessName: string): Promise<VendorPortfolioDTO[]> {
  const vendor = await prisma.vendorProfile.findFirst({ where: { businessName } });
  if (!vendor) return [];

  const posts = await prisma.vendorPortfolio.findMany({
    where: { vendorId: vendor.id, isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  return posts.map((p) => ({
    id: p.id,
    title: p.title,
    locationTag: p.locationTag ?? "",
    categoryTag: p.categoryTag ?? "",
    styleTags: parseTags(p.styleTags),
    caption: p.caption ?? "",
    imageUrl: p.imageUrl,
    likes: p.likes,
    createdAt: p.createdAt.toISOString().split("T")[0],
  }));
}

export interface VendorInboxItemDTO {
  id: string;
  orderId: string;
  orderNumber: string;
  clientName: string;
  eventDate: string;
  serviceName: string;
  packageName: string;
  subtotal: number;
  status: string;
  rejectionReason: string | null;
  vendorResponseDueAt: string | null;
}

/** Daftar item pesanan yang masuk ke vendor yang login (inbox). */
export async function getVendorInbox(): Promise<VendorInboxItemDTO[]> {
  const vendor = await getCurrentVendor();
  if (!vendor) return [];

  const items = await prisma.orderItem.findMany({
    where: { vendorId: vendor.id },
    include: { order: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return items.map((i) => ({
    id: i.id,
    orderId: i.orderId,
    orderNumber: i.order.orderNumber,
    clientName: i.order.clientName,
    eventDate: i.order.eventDate.toISOString(),
    serviceName: i.serviceName,
    packageName: i.packageName,
    subtotal: i.subtotal,
    status: i.status,
    rejectionReason: i.rejectionReason,
    vendorResponseDueAt: i.vendorResponseDueAt ? i.vendorResponseDueAt.toISOString() : null,
  }));
}

/** Rincian komponen platform fee (dari config admin). Read-only untuk vendor. */
export async function getPlatformFeeBreakdown(): Promise<
  Array<{ label: string; pct: number }>
> {
  const { getPlatformSettings } = await import("@/server/services/platform-settings-service");
  const s = await getPlatformSettings();
  return s.components.map((c) => ({ label: c.label, pct: c.pct }));
}
