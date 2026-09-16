import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/**
 * HariKita - Server-side Query Layer (Phase 2)
 *
 * Query read-only dari database untuk portal (client/vendor/admin).
 * Semua fungsi menegakkan owner-scoping (anti-IDOR) kecuali dinyatakan admin-only.
 */

export interface OrderSummaryDTO {
  id: string;
  orderNumber: string;
  status: string;
  clientName: string;
  eventDate: string;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
}

export interface OrderDetailDTO extends OrderSummaryDTO {
  items: Array<{
    id: string;
    vendorName: string;
    categorySlug: string;
    packageName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    status: string;
  }>;
  installments: Array<{
    id: string;
    type: string;
    amount: number;
    status: string;
    dueAt: string | null;
    paidAt: string | null;
  }>;
}

function toSummary(order: {
  id: string;
  orderNumber: string;
  status: string;
  clientName: string;
  eventDate: Date;
  totalAmount: number;
  createdAt: Date;
  _count?: { items: number };
  items?: unknown[];
}): OrderSummaryDTO {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    clientName: order.clientName,
    eventDate: order.eventDate.toISOString(),
    totalAmount: order.totalAmount,
    itemCount: order._count?.items ?? order.items?.length ?? 0,
    createdAt: order.createdAt.toISOString(),
  };
}

/** Daftar order milik klien yang login. */
export async function getClientOrders(): Promise<OrderSummaryDTO[]> {
  const session = await getSession();
  if (!session) return [];

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  });
  return orders.map(toSummary);
}

/** Detail order milik klien (dengan guard kepemilikan). */
export async function getClientOrderDetail(orderId: string): Promise<OrderDetailDTO | null> {
  const session = await getSession();
  if (!session) return null;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, installments: true, _count: { select: { items: true } } },
  });
  if (!order) return null;
  if (order.userId !== session.userId && session.role !== "ADMIN") return null;

  return {
    ...toSummary(order),
    items: order.items.map((i) => ({
      id: i.id,
      vendorName: i.vendorNameSnapshot,
      categorySlug: i.categorySlug,
      packageName: i.packageName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      subtotal: i.subtotal,
      status: i.status,
    })),
    installments: order.installments.map((i) => ({
      id: i.id,
      type: i.type,
      amount: i.amount,
      status: i.status,
      dueAt: i.dueAt ? i.dueAt.toISOString() : null,
      paidAt: i.paidAt ? i.paidAt.toISOString() : null,
    })),
  };
}

/** Daftar order yang melibatkan vendor yang login (inbox vendor). */
export async function getVendorInboxItems() {
  const session = await getSession();
  if (!session) return [];

  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: session.userId } });
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

/** Ringkasan escrow untuk admin (order dengan pembayaran/ledger). */
export async function getAdminEscrowOverview() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;

  const [orders, journals] = await Promise.all([
    prisma.order.findMany({
      include: { installments: true, _count: { select: { items: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.ledgerJournal.findMany({
      include: { entries: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  return {
    orders: orders.map(toSummary),
    journalCount: journals.length,
    totalDebit: journals.reduce(
      (acc, j) => acc + j.entries.reduce((s, e) => s + e.debit, 0),
      0
    ),
    totalCredit: journals.reduce(
      (acc, j) => acc + j.entries.reduce((s, e) => s + e.credit, 0),
      0
    ),
  };
}

/** Order multi-vendor untuk master calendar admin (semua order, admin-only). */
export async function getAdminMasterCalendar() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return [];

  const orders = await prisma.order.findMany({
    where: { status: { notIn: ["CANCELLED", "EXPIRED"] } },
    include: { items: true },
    orderBy: { eventDate: "asc" },
    take: 200,
  });

  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    clientName: o.clientName,
    eventDate: o.eventDate.toISOString(),
    status: o.status,
    district: o.city,
    vendorCount: o.items.length,
  }));
}
