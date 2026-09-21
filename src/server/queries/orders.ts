import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { canViewAdmin } from "@/server/auth/admin-guard";

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

/**
 * View-model pesanan yang selaras dengan bentuk yang diharapkan halaman portal
 * (order-store legacy), sehingga UI tidak perlu dirombak.
 */
export interface OrderViewModel {
  id: string;
  bookingId: string;
  customerName: string;
  customerWhatsApp: string;
  eventDate: string;
  eventLocation: string;
  district: string;
  paymentStatus: "UNPAID" | "DP_PAID" | "FULLY_PAID";
  paymentType: "dp_30" | "full_100";
  status: string;
  notes: string;
  financials: {
    subtotal: number;
    platformFee: number;
    totalAmount: number;
    dpAmount: number;
    pelunasanAmount: number;
  };
  items: Array<{
    id: string;
    vendorName: string;
    categoryTitle: string;
    categoryId: string;
    packageName: string;
    unitPrice: number;
    quantity: number;
    status: string;
  }>;
  escrowStatus: {
    dpReleased: boolean;
    settlementReleased: boolean;
  };
  createdAt: string;
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

/** Derive paymentStatus (UNPAID/DP_PAID/FULLY_PAID) dari status order. */
function derivePaymentStatus(status: string): "UNPAID" | "DP_PAID" | "FULLY_PAID" {
  if (["FULLY_PAID", "COMPLETED"].includes(status)) return "FULLY_PAID";
  if (["DP_PAID", "IN_PROGRESS", "WAITING_SETTLEMENT", "DISPUTED", "REFUND_PENDING", "REFUNDED"].includes(status)) {
    return "DP_PAID";
  }
  return "UNPAID";
}

/** Memetakan order Prisma (dengan items) ke OrderViewModel untuk portal. */
function toViewModel(order: {
  id: string;
  orderNumber: string;
  clientName: string;
  clientPhone: string;
  eventDate: Date;
  city: string;
  totalAmount: number;
  status: string;
  notes: string | null;
  createdAt: Date;
  items: Array<{
    id: string;
    vendorNameSnapshot: string;
    categorySlug: string;
    packageName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    status: string;
  }>;
}): OrderViewModel {
  const dpAmount = Math.floor((order.totalAmount * 30) / 100);
  const pelunasanAmount = order.totalAmount - dpAmount;
  const paymentStatus = derivePaymentStatus(order.status);
  return {
    id: order.id,
    bookingId: order.orderNumber,
    customerName: order.clientName,
    customerWhatsApp: order.clientPhone,
    eventDate: order.eventDate.toISOString().split("T")[0],
    eventLocation: order.city,
    district: order.city,
    paymentStatus,
    paymentType: "dp_30",
    status: order.status,
    notes: order.notes ?? "",
    financials: {
      subtotal: order.totalAmount,
      platformFee: Math.round(order.totalAmount * 0.1),
      totalAmount: order.totalAmount,
      dpAmount,
      pelunasanAmount,
    },
    items: order.items.map((i) => ({
      id: i.id,
      vendorName: i.vendorNameSnapshot,
      categoryTitle: i.categorySlug,
      categoryId: i.categorySlug,
      packageName: i.packageName,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      status: i.status,
    })),
    escrowStatus: {
      dpReleased: ["IN_PROGRESS", "WAITING_SETTLEMENT", "FULLY_PAID", "COMPLETED"].includes(order.status),
      settlementReleased: ["COMPLETED"].includes(order.status),
    },
    createdAt: order.createdAt.toISOString(),
  };
}

/** Daftar order milik klien (view-model untuk portal). */
export async function getClientOrderViewModels(): Promise<OrderViewModel[]> {
  const session = await getSession();
  if (!session) return [];

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return orders.map(toViewModel);
}

/** Detail order klien menurut orderNumber ATAU id (view-model). */
export async function getClientOrderViewModelByBooking(
  bookingId: string
): Promise<OrderViewModel | null> {
  const session = await getSession();
  if (!session) return null;

  const order = await prisma.order.findFirst({
    where: { OR: [{ orderNumber: bookingId }, { id: bookingId }] },
    include: { items: true },
  });
  if (!order) return null;
  if (order.userId !== session.userId && session.role !== "ADMIN") return null;
  return toViewModel(order);
}

/** Semua order sebagai view-model (khusus admin). */
export async function getAdminOrderViewModels(): Promise<OrderViewModel[]> {
  if (!(await canViewAdmin())) return [];

  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return orders.map(toViewModel);
}

/** Ringkasan saldo escrow dari ledger (total credit CLIENT_ESCROW yang tertahan). */
export async function getEscrowBalance(): Promise<number> {
  const entries = await prisma.ledgerEntry.findMany({
    where: { accountId: "2010_CLIENT_ESCROW" },
  });
  // Saldo escrow = Σ credit - Σ debit pada akun CLIENT_ESCROW.
  return entries.reduce((acc, e) => acc + e.credit - e.debit, 0);
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
  if (!(await canViewAdmin())) return null;

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
  if (!(await canViewAdmin())) return [];

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

/** DTO event kalender master admin (untuk UI master calendar). */
export interface AdminCalendarEventDTO {
  id: string;
  date: string;
  client: string;
  venue: string;
  district: string;
  vendorsCount: number;
  totalAmount: number;
  vendors: { name: string; role: string; callTime: string }[];
  status: "TERKUNCI_DP" | "LUNAS_ESCROW" | "SELESAI";
}

/** Mengambil event kalender master dari DB (admin-only) untuk UI master calendar. */
export async function getAdminCalendarEvents(): Promise<AdminCalendarEventDTO[]> {
  if (!(await canViewAdmin())) return [];

  const orders = await prisma.order.findMany({
    where: { status: { notIn: ["CANCELLED", "EXPIRED"] } },
    include: { items: true },
    orderBy: { eventDate: "asc" },
    take: 200,
  });

  return orders.map((o) => {
    let status: AdminCalendarEventDTO["status"] = "TERKUNCI_DP";
    if (o.status === "COMPLETED") status = "SELESAI";
    else if (o.status === "FULLY_PAID") status = "LUNAS_ESCROW";

    return {
      id: o.orderNumber,
      date: o.eventDate.toISOString().split("T")[0],
      client: o.clientName,
      venue: o.city,
      district: o.city,
      vendorsCount: o.items.length,
      totalAmount: o.totalAmount,
      vendors: o.items.map((i) => ({
        name: i.vendorNameSnapshot || i.serviceName,
        role: i.categorySlug,
        callTime: "08:00 WIB",
      })),
      status,
    };
  });
}

// ── Sesi Fisik & Rundown (untuk /client/jadwal) ────────────────────────────────

export interface PhysicalSessionDTO {
  id: string;
  type: string;
  title: string;
  vendor: string;
  category: string;
  scheduledDate: string;
  status: string;
  notes: string;
  location: string;
}

export interface RundownRowDTO {
  id: string;
  timeSlot: string;
  activity: string;
  picName: string | null;
  location: string | null;
}

/** Mengambil sesi fisik milik order klien yang login. */
export async function getClientPhysicalSessions(): Promise<PhysicalSessionDTO[]> {
  const session = await getSession();
  if (!session) return [];

  const sessions = await prisma.physicalSession.findMany({
    where: { order: { userId: session.userId } },
    include: { order: { include: { items: true } } },
    orderBy: { scheduledDate: "asc" },
  });

  return sessions.map((s) => ({
    id: s.id,
    type: s.type,
    title: s.notes || s.type,
    vendor: s.order.items[0]?.vendorNameSnapshot ?? "Mitra Vendor",
    category: s.order.items[0]?.categorySlug ?? "Layanan",
    scheduledDate: s.scheduledDate.toISOString().split("T")[0],
    status: s.status,
    notes: s.notes ?? "",
    location: s.location,
  }));
}

/** Mengambil rundown hari H milik order klien yang login. */
export async function getClientRundown(): Promise<RundownRowDTO[]> {
  const session = await getSession();
  if (!session) return [];

  const rows = await prisma.eventRundown.findMany({
    where: { order: { userId: session.userId } },
    orderBy: { sortOrder: "asc" },
  });

  return rows.map((r) => ({
    id: r.id,
    timeSlot: r.timeSlot,
    activity: r.activity,
    picName: r.picName,
    location: r.location,
  }));
}

/** View-model koordinasi (order + item + rundown) untuk /hub-koordinasi. */
export async function getCoordinationData(bookingId?: string) {
  const session = await getSession();
  if (!session) return null;

  const order = bookingId
    ? await prisma.order.findFirst({
        where: {
          OR: [{ orderNumber: bookingId }, { id: bookingId }],
        },
        include: { items: true, rundowns: { orderBy: { sortOrder: "asc" } } },
      })
    : await prisma.order.findFirst({
        where: { userId: session.userId },
        include: { items: true, rundowns: { orderBy: { sortOrder: "asc" } } },
        orderBy: { createdAt: "desc" },
      });

  if (!order) return null;
  if (order.userId !== session.userId && session.role !== "ADMIN") return null;

  return {
    order: toViewModel({ ...order, items: order.items }),
    rundown: order.rundowns.map((r) => ({
      id: r.id,
      timeSlot: r.timeSlot,
      activity: r.activity,
      picName: r.picName,
      location: r.location,
    })),
  };
}
