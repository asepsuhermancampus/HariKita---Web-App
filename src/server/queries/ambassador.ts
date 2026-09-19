import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/**
 * HariKita - Brand Ambassador Query Layer
 *
 * Query read-only untuk dashboard BA (owner-scoped) dan panel admin.
 */

/** BrandAmbassador milik sesi login (atau null). */
export async function getCurrentAmbassador() {
  try {
    const session = await getSession();
    if (!session || session.role !== "BA") return null;
    return await prisma.brandAmbassador.findUnique({ where: { userId: session.userId } });
  } catch (err) {
    console.error("[getCurrentAmbassador] Query failed:", err);
    return null;
  }
}

export async function getAmbassadorSummary() {
  const ba = await getCurrentAmbassador();
  if (!ba) return null;

  const [recruitedCount, commissionAgg] = await Promise.all([
    prisma.vendorProfile.count({ where: { recruitedById: ba.id } }),
    prisma.ambassadorCommission.aggregate({
      where: { ambassadorId: ba.id, status: "CREDITED" },
      _sum: { commissionAmount: true },
    }),
  ]);

  return {
    displayName: ba.displayName,
    referralCode: ba.referralCode,
    walletBalance: ba.walletBalance,
    commissionPct: ba.commissionPct,
    recruitedCount,
    totalCommission: commissionAgg._sum.commissionAmount ?? 0,
  };
}

export async function getAmbassadorRecruitedVendors() {
  const ba = await getCurrentAmbassador();
  if (!ba) return [];
  const vendors = await prisma.vendorProfile.findMany({
    where: { recruitedById: ba.id },
    orderBy: { createdAt: "desc" },
  });
  return vendors.map((v) => ({
    id: v.id,
    businessName: v.businessName,
    category: v.category,
    createdAt: v.createdAt.toISOString().split("T")[0],
  }));
}

export async function getAmbassadorCommissions() {
  const ba = await getCurrentAmbassador();
  if (!ba) return [];
  const rows = await prisma.ambassadorCommission.findMany({
    where: { ambassadorId: ba.id },
    include: { vendor: true, order: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return rows.map((c) => ({
    id: c.id,
    orderNumber: c.order.orderNumber,
    vendorName: c.vendor.businessName,
    baseAmount: c.baseAmount,
    commissionAmount: c.commissionAmount,
    pct: c.commissionPct,
    createdAt: c.createdAt.toISOString().split("T")[0],
  }));
}

export async function getAmbassadorWithdrawals() {
  const ba = await getCurrentAmbassador();
  if (!ba) return [];
  const rows = await prisma.ambassadorWithdrawal.findMany({
    where: { ambassadorId: ba.id },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((w) => ({
    id: w.id,
    amount: w.amount,
    status: w.status,
    bankName: w.bankName,
    bankAccount: w.bankAccount,
    bankHolder: w.bankHolder,
    createdAt: w.createdAt.toISOString().split("T")[0],
  }));
}

export async function listAmbassadors() {
  const rows = await prisma.brandAmbassador.findMany({
    include: { _count: { select: { recruitedVendors: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((b) => ({
    id: b.id,
    displayName: b.displayName,
    referralCode: b.referralCode,
    commissionPct: b.commissionPct,
    isActive: b.isActive,
    walletBalance: b.walletBalance,
    recruitedCount: b._count.recruitedVendors,
  }));
}

/**
 * Daftar penarikan dompet BA (default: PENDING) untuk panel admin.
 * Menyertakan identitas BA agar admin dapat memverifikasi tujuan transfer.
 */
export async function listAmbassadorWithdrawals(status: "PENDING" | "PAID" | "REJECTED" | "ALL" = "PENDING") {
  const rows = await prisma.ambassadorWithdrawal.findMany({
    where: status === "ALL" ? {} : { status },
    include: { ambassador: true },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((w) => ({
    id: w.id,
    amount: w.amount,
    status: w.status,
    bankName: w.bankName,
    bankAccount: w.bankAccount,
    bankHolder: w.bankHolder,
    createdAt: w.createdAt.toISOString().split("T")[0],
    ambassadorId: w.ambassadorId,
    ambassadorName: w.ambassador.displayName,
    referralCode: w.ambassador.referralCode,
    walletBalance: w.ambassador.walletBalance,
  }));
}
