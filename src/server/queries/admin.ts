import { prisma } from "@/lib/prisma";
import { canViewAdmin } from "@/server/auth/admin-guard";
import { scanForContactLeaks } from "@/server/services/content-audit";

/**
 * HariKita - Admin Query Layer (Phase 9)
 *
 * Query read-only untuk admin (admin-only). Semua fungsi memeriksa capability VIEW_ADMIN
 * lewat helper bersama `canViewAdmin` (satu sumber otorisasi admin).
 */

export interface VendorVerificationDTO {
  id: string;
  businessName: string;
  category: string;
  district: string;
  address: string;
  picName: string | null;
  igHandle: string | null;
  tiktokHandle: string | null;
  rating: number;
  reviewCount: number;
  verificationStatus: string;
  verificationNote: string | null;
  isVerified: boolean;
  createdAt: string;
  // Verifikasi & geo
  ktpNumber: string | null;
  ktpPhotoUrl: string | null;
  businessPhotoUrl: string | null;
  revenueMethod: string | null;
  ewalletProvider: string | null;
  bankName: string | null;
  bankAccount: string | null;
  bankHolder: string | null;
  rt: string | null;
  rw: string | null;
  dusun: string | null;
  desa: string | null;
  kecamatan: string | null;
  kabupaten: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  profileCompleted: boolean;
  submittedAt: string | null;
}

/** Daftar vendor untuk kurasi/verifikasi. */
export async function getVendorVerifications(
  status?: "PENDING" | "APPROVED" | "REJECTED"
): Promise<VendorVerificationDTO[]> {
  if (!(await canViewAdmin())) return [];

  const vendors = await prisma.vendorProfile.findMany({
    where: status ? { verificationStatus: status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return vendors.map((v) => ({
    id: v.id,
    businessName: v.businessName,
    category: v.category,
    district: v.district ?? "Kebumen",
    address: v.address,
    picName: v.picName,
    igHandle: v.igHandle,
    tiktokHandle: v.tiktokHandle,
    rating: v.rating,
    reviewCount: v.reviewCount,
    verificationStatus: v.verificationStatus,
    verificationNote: v.verificationNote,
    isVerified: v.isVerified,
    createdAt: v.createdAt.toISOString().split("T")[0],
    ktpNumber: v.ktpNumber,
    ktpPhotoUrl: v.ktpPhotoUrl,
    businessPhotoUrl: v.businessPhotoUrl,
    revenueMethod: v.revenueMethod,
    ewalletProvider: v.ewalletProvider,
    bankName: v.bankName,
    bankAccount: v.bankAccount,
    bankHolder: v.bankHolder,
    rt: v.rt,
    rw: v.rw,
    dusun: v.dusun,
    desa: v.desa,
    kecamatan: v.kecamatan,
    kabupaten: v.kabupaten,
    postalCode: v.postalCode,
    latitude: v.latitude,
    longitude: v.longitude,
    profileCompleted: v.profileCompleted,
    submittedAt: v.submittedAt ? v.submittedAt.toISOString().split("T")[0] : null,
  }));
}

export interface ContentAuditFinding {
  scope: string;
  refId: string;
  owner: string;
  snippet: string;
  matches: string[];
}

/** Memindai deskripsi vendor & caption portofolio terhadap kebocoran kontak. */
export async function getContentAuditFindings(): Promise<ContentAuditFinding[]> {
  if (!(await canViewAdmin())) return [];

  const findings: ContentAuditFinding[] = [];

  const vendors = await prisma.vendorProfile.findMany({
    select: { id: true, businessName: true, description: true, slaGuarantees: true },
  });
  for (const v of vendors) {
    for (const [field, text] of [
      ["description", v.description],
      ["slaGuarantees", v.slaGuarantees],
    ] as const) {
      if (!text) continue;
      const scan = scanForContactLeaks(text);
      if (scan.flagged) {
        findings.push({
          scope: `vendor.${field}`,
          refId: v.id,
          owner: v.businessName,
          snippet: text.slice(0, 160),
          matches: scan.matches,
        });
      }
    }
  }

  const portfolios = await prisma.vendorPortfolio.findMany({
    select: { id: true, title: true, caption: true, vendor: { select: { businessName: true } } },
  });
  for (const p of portfolios) {
    const text = `${p.title} ${p.caption ?? ""}`;
    const scan = scanForContactLeaks(text);
    if (scan.flagged) {
      findings.push({
        scope: "portfolio.caption",
        refId: p.id,
        owner: p.vendor.businessName,
        snippet: text.slice(0, 160),
        matches: scan.matches,
      });
    }
  }

  return findings;
}

export interface DisputeAdminDTO {
  id: string;
  orderId: string;
  orderNumber: string;
  clientName: string;
  totalAmount: number;
  orderStatus: string;
  reason: string;
  description: string;
  status: string;
  resolution: string | null;
  createdAt: string;
}

/** Daftar sengketa untuk admin. */
export async function getDisputes(status?: string): Promise<DisputeAdminDTO[]> {
  if (!(await canViewAdmin())) return [];

  const disputes = await prisma.dispute.findMany({
    where: status ? { status } : undefined,
    include: { order: { select: { orderNumber: true, clientName: true, totalAmount: true, status: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return disputes.map((d) => ({
    id: d.id,
    orderId: d.orderId,
    orderNumber: d.order.orderNumber,
    clientName: d.order.clientName,
    totalAmount: d.order.totalAmount,
    orderStatus: d.order.status,
    reason: d.reason,
    description: d.description,
    status: d.status,
    resolution: d.resolution,
    createdAt: d.createdAt.toISOString(),
  }));
}

/** Ringkasan funnel dari AnalyticsTelemetry (10 tahap → jumlah per eventType). */
export async function getFunnelTelemetry(): Promise<Array<{ eventType: string; count: number }>> {
  if (!(await canViewAdmin())) return [];

  const grouped = await prisma.analyticsTelemetry.groupBy({
    by: ["eventType"],
    _count: { _all: true },
  });

  return grouped.map((g) => ({ eventType: g.eventType, count: g._count._all }));
}
