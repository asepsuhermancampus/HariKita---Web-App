import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/**
 * HariKita - Vendor Portal Query Layer (Phase 2)
 *
 * Query read-only untuk portal mitra vendor, seluruhnya owner-scoped
 * (berdasarkan VendorProfile milik sesi yang login).
 */

/** Mengambil VendorProfile milik sesi yang login (atau null). */
export async function getCurrentVendor() {
  const session = await getSession();
  if (!session) return null;
  return prisma.vendorProfile.findUnique({ where: { userId: session.userId } });
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
}

export interface VendorBlackoutDTO {
  id: string;
  vendorId: string;
  date: string; // YYYY-MM-DD
  reason: string;
}

/** Daftar blackout date milik vendor yang login (dari VendorAvailability). */
export async function getVendorBlackouts(): Promise<VendorBlackoutDTO[]> {
  const vendor = await getCurrentVendor();
  if (!vendor) return [];

  const slots = await prisma.vendorAvailability.findMany({
    where: { vendorId: vendor.id, status: "BLACKED_OUT" },
    orderBy: { date: "asc" },
  });

  return slots.map((s) => ({
    id: s.id,
    vendorId: s.vendorId,
    date: s.date.toISOString().split("T")[0],
    reason: "Tanggal Terkunci (Offline)",
  }));
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
