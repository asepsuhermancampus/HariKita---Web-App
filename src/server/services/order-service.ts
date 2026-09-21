import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getStartOfDayWIB, addCalendarDaysWIB } from "@/lib/date-utils";
import { DomainError } from "./errors";
import {
  verifyAndPromoteSlot,
  releaseReservedSlot,
} from "./availability-service";
import {
  notifyOrderCreatedToVendor,
  notifyVendorDecisionToClient,
} from "./notification-templates";
import { getPlatformSettings } from "./platform-settings-service";

/**
 * HariKita - OrderService
 *
 * Mengorkestrasi siklus hidup `Order` & `OrderItem` dengan harga otoritatif server
 * (anti-tamper) dan evaluasi konsensus vendor (Phase 1D §3, §4, §9).
 *
 * Leaf dependencies: hanya AvailabilityService (untuk promosi/pelepasan slot).
 * Tidak pernah memanggil PaymentService.
 */

export type OrderTx = Prisma.TransactionClient;

/** Batas SLA respons vendor (jam). */
export const VENDOR_RESPONSE_SLA_HOURS = 24;
/** Batas pembayaran DP (jam). */
export const DP_DUE_HOURS = 24;

export const ACTIVE_ITEM_STATUSES = ["PENDING", "ACCEPTED"] as const;

export interface CreateOrderItemInput {
  servicePackageId: string;
  quantity?: number;
  holdToken: string;
  notes?: string;
}

export interface CreateOrderRequest {
  eventDate: string;
  clientName: string;
  clientPhone: string;
  city?: string;
  notes?: string;
  userId?: string | null;
  items: CreateOrderItemInput[];
}

export interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  vendorResponseDueAt: Date;
  itemIds: string[];
}

function generateOrderNumber(): string {
  const wib = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const ymd = `${wib.getUTCFullYear()}${String(wib.getUTCMonth() + 1).padStart(2, "0")}${String(
    wib.getUTCDate()
  ).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .toUpperCase()
    .padStart(6, "0");
  return `HK-${ymd}-${rand}`;
}

/** Mengambil seluruh item aktif (PENDING/ACCEPTED) untuk sebuah order. */
export async function getActiveItems(orderId: string, tx?: OrderTx) {
  const db = tx ?? prisma;
  return db.orderItem.findMany({
    where: { orderId, status: { in: [...ACTIVE_ITEM_STATUSES] } },
    orderBy: { createdAt: "asc" },
  });
}

/** Menghitung ulang totalAmount = SUM(subtotal item aktif) dan menulisnya. */
async function recalcTotalAmount(orderId: string, tx: OrderTx): Promise<number> {
  const activeItems = await tx.orderItem.findMany({
    where: { orderId, status: { in: [...ACTIVE_ITEM_STATUSES] } },
    select: { subtotal: true },
  });
  const total = activeItems.reduce((acc, i) => acc + i.subtotal, 0);
  await tx.order.update({ where: { id: orderId }, data: { totalAmount: total } });
  return total;
}

/**
 * Membuat pesanan multi-vendor dengan harga OTORITATIF dari database.
 * Nominal dari klien diabaikan mutlak; snapshot paket dibuat server.
 *
 * Alur (Phase 1D §9):
 *   1. Resolusi katalog (unitPrice, vendorId, snapshot) dari ServicePackage.
 *   2. Hitung subtotal & totalAmount di server.
 *   3. Promosikan slot HELD → RESERVED untuk setiap item.
 *   4. Set vendorResponseDueAt = now + 24h.
 *   5. Simpan Order + OrderItems dalam satu transaksi.
 *
 * @throws {DomainError} bila paket tidak ditemukan atau slot tidak valid.
 */
export async function createOrder(
  request: CreateOrderRequest,
  tx: OrderTx
): Promise<CreateOrderResult> {
  if (request.items.length === 0) {
    throw new DomainError("INVALID_ORDER_TRANSITION", "Pesanan harus memiliki minimal satu item.");
  }

  const db = tx;
  const eventDateWIB = getStartOfDayWIB(request.eventDate);

  // 1. Resolusi otoritatif seluruh paket lebih dulu.
  const resolved = await Promise.all(
    request.items.map(async (item) => {
      const pkg = await db.servicePackage.findUnique({
        where: { id: item.servicePackageId },
        include: { vendor: true },
      });
      if (!pkg) {
        throw new DomainError(
          "ITEM_PACKAGE_MISMATCH",
          `Paket layanan "${item.servicePackageId}" tidak ditemukan.`
        );
      }
      const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
      const unitPrice = pkg.unitPrice ?? pkg.basePrice;
      return { item, pkg, quantity, unitPrice, subtotal: quantity * unitPrice };
    })
  );

  const totalAmount = resolved.reduce((acc, r) => acc + r.subtotal, 0);
  const vendorResponseDueAt = new Date(
    Date.now() + VENDOR_RESPONSE_SLA_HOURS * 60 * 60 * 1000
  );

  // 2. Buat Order terlebih dahulu.
  const settings = await getPlatformSettings(db);
  const order = await db.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: request.userId ?? null,
      clientName: request.clientName,
      clientPhone: request.clientPhone,
      eventDate: eventDateWIB,
      city: request.city ?? "Kebumen",
      totalAmount,
      status: "PENDING_CONFIRMATION",
      notes: request.notes ?? null,
      vendorResponseDueAt,
      snapshotDpPct: settings.dpPct,
      snapshotSettlementPct: settings.settlementPct,
      snapshotPlatformFeePct: settings.platformFeePct,
    },
  });

  await db.orderStatusHistory.create({
    data: {
      orderId: order.id,
      fromStatus: null,
      toStatus: "PENDING_CONFIRMATION",
      reason: "Order submitted by client",
      changedBy: request.userId ?? "CLIENT",
    },
  });

  // 3. Buat OrderItem + promosikan slot, per item.
  const itemIds: string[] = [];
  for (const r of resolved) {
    const snapshot = JSON.stringify({
      description: r.pkg.description,
      slaDays: r.pkg.slaDays,
      includes: safeParseArr(r.pkg.includes),
      termsVersion: "v1.0",
      capturedAt: new Date().toISOString(),
    });

    const orderItem = await db.orderItem.create({
      data: {
        orderId: order.id,
        vendorId: r.pkg.vendorId,
        packageId: r.pkg.id,
        vendorNameSnapshot: r.pkg.vendor.businessName,
        vendorSlugSnapshot: null,
        categorySlug: r.pkg.category,
        serviceName: r.pkg.category,
        packageName: r.pkg.name,
        packageSnapshot: snapshot,
        snapshotVersion: "v1",
        unitType: r.pkg.unitType,
        quantity: r.quantity,
        unitPrice: r.unitPrice,
        subtotal: r.subtotal,
        status: "PENDING",
        vendorResponseDueAt,
      },
    });

    // Promosikan slot HELD → RESERVED dan ikat ke orderItem.
    await verifyAndPromoteSlot(
      {
        vendorId: r.pkg.vendorId,
        date: eventDateWIB,
        holdToken: r.item.holdToken,
        orderItemId: orderItem.id,
      },
      tx
    );

    itemIds.push(orderItem.id);
  }

  // Tulis notifikasi ke outbox vendor (dikirim oleh scheduler, di luar tx).
  await notifyOrderCreatedToVendor(order.id, tx);

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    totalAmount,
    vendorResponseDueAt,
    itemIds,
  };
}

export interface VendorDecisionInput {
  orderItemId: string;
  command: "ACCEPT" | "REJECT";
  rejectionReason?: string;
  vendorUserId: string;
  changedBy?: string;
}

/**
 * Memproses keputusan vendor (ACCEPT/REJECT) atas satu item, lalu mengevaluasi
 * konsensus agregat order (Phase 1D §3, §10.2):
 *   - Semua active item ACCEPTED → WAITING_DP (lock totalAmount + buat installment).
 *   - Ada REJECT dengan sisa active → PARTIALLY_ACCEPTED.
 *   - Semua item historis REJECTED (active = 0) → CANCELLED.
 *
 * @throws {DomainError} saat kepemilikan / status tidak valid.
 */
export async function processVendorDecision(
  input: VendorDecisionInput,
  tx: OrderTx
): Promise<{ orderStatus: string; itemStatus: string }> {
  const db = tx;

  const orderItem = await db.orderItem.findUnique({
    where: { id: input.orderItemId },
    include: { vendor: true, order: true },
  });
  if (!orderItem) {
    throw new DomainError("ORDER_ITEM_NOT_FOUND", `OrderItem "${input.orderItemId}" tidak ditemukan.`);
  }

  // Verifikasi kepemilikan vendor.
  if (orderItem.vendor.userId !== input.vendorUserId) {
    throw new DomainError(
      "UNAUTHORIZED_ORDER_ACCESS",
      "Vendor yang login bukan pemilik sah item ini.",
      { orderItemId: orderItem.id }
    );
  }

  if (orderItem.status !== "PENDING") {
    throw new DomainError(
      "INVALID_ORDER_TRANSITION",
      `Item sudah tidak PENDING (status=${orderItem.status}).`,
      { orderItemId: orderItem.id }
    );
  }

  const changedBy = input.changedBy ?? input.vendorUserId;
  const now = new Date();

  if (input.command === "ACCEPT") {
    await db.orderItem.update({
      where: { id: orderItem.id },
      data: { status: "ACCEPTED", confirmedAt: now },
    });
    await db.orderItemStatusHistory.create({
      data: {
        orderItemId: orderItem.id,
        fromStatus: "PENDING",
        toStatus: "ACCEPTED",
        reason: "Vendor accepted",
        changedBy,
      },
    });
  } else {
    if (!input.rejectionReason?.trim()) {
      throw new DomainError(
        "INVALID_ORDER_TRANSITION",
        "Alasan penolakan wajib diisi saat command = REJECT."
      );
    }
    await db.orderItem.update({
      where: { id: orderItem.id },
      data: { status: "REJECTED", rejectionReason: input.rejectionReason, rejectedAt: now },
    });
    await db.orderItemStatusHistory.create({
      data: {
        orderItemId: orderItem.id,
        fromStatus: "PENDING",
        toStatus: "REJECTED",
        reason: input.rejectionReason,
        changedBy,
      },
    });
    // Lepas slot RESERVED milik item yang ditolak.
    await releaseReservedSlot(orderItem.id, tx);
  }

  const nextOrderStatus = await evaluateOrderAggregate(orderItem.orderId, tx);

  // Notifikasi keputusan ke klien (outbox; dikirim scheduler).
  await notifyVendorDecisionToClient(
    orderItem.orderId,
    orderItem.vendor.businessName,
    orderItem.packageName,
    input.command === "ACCEPT",
    tx
  );

  return { orderStatus: nextOrderStatus, itemStatus: input.command === "ACCEPT" ? "ACCEPTED" : "REJECTED" };
}

/**
 * Mengevaluasi status agregat order berdasarkan item aktif & historis, lalu
 * menerapkan transisi yang diperlukan. Idempotent terhadap kondisi saat ini.
 *
 * @returns status order setelah evaluasi.
 */
export async function evaluateOrderAggregate(
  orderId: string,
  tx: OrderTx
): Promise<string> {
  const db = tx;
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new DomainError("ORDER_NOT_FOUND", `Order "${orderId}" tidak ditemukan.`);
  }

  const activeItems = await getActiveItems(orderId, tx);
  const allItems = await db.orderItem.findMany({ where: { orderId } });
  const historicalRejected = allItems.filter((i) => i.status === "REJECTED");

  const allAccepted =
    activeItems.length > 0 && activeItems.every((i) => i.status === "ACCEPTED");
  const hasRejected = historicalRejected.length > 0;
  const activePending = activeItems.some((i) => i.status === "PENDING");

  if (allAccepted) {
    return transitionToWaitingDp(order, tx);
  }

  if (activeItems.length === 0 && historicalRejected.length > 0) {
    await transitionOrder(order, "CANCELLED", "All items rejected, no replacement", "SYSTEM", tx);
    return "CANCELLED";
  }

  if (hasRejected) {
    await transitionOrder(
      order,
      "PARTIALLY_ACCEPTED",
      "At least one item rejected",
      "SYSTEM",
      tx
    );
    return "PARTIALLY_ACCEPTED";
  }

  if (activePending) {
    return order.status;
  }

  return order.status;
}

/**
 * Transisi ke WAITING_DP: kunci totalAmount (recalc final), set dpDueAt,
 * dan buat installment DP_30 (opsional FULL_100 bila requested).
 * Item aktif harus memiliki slot RESERVED.
 */
async function transitionToWaitingDp(
  order: { id: string; status: string },
  tx: OrderTx
): Promise<string> {
  const db = tx;

  const lockedTotal = await recalcTotalAmount(order.id, tx);
  const dpDueAt = new Date(Date.now() + DP_DUE_HOURS * 60 * 60 * 1000);

  await db.order.update({
    where: { id: order.id },
    data: { status: "WAITING_DP", totalAmount: lockedTotal, dpDueAt },
  });
  await db.orderStatusHistory.create({
    data: {
      orderId: order.id,
      fromStatus: order.status,
      toStatus: "WAITING_DP",
      reason: "All active items accepted; total locked",
      changedBy: "SYSTEM",
    },
  });

  // Buat installment DP_30 (jika belum ada).
  const existingDp = await db.paymentInstallment.findFirst({
    where: { orderId: order.id, type: "DP_30" },
  });
  if (!existingDp) {
    await db.paymentInstallment.create({
      data: {
        orderId: order.id,
        type: "DP_30",
        amount: lockedTotal,
        status: "PENDING",
        dueAt: dpDueAt,
      },
    });
  }

  return "WAITING_DP";
}

async function transitionOrder(
  order: { id: string; status: string },
  toStatus: string,
  reason: string,
  changedBy: string,
  tx: OrderTx
): Promise<void> {
  if (order.status === toStatus) return; // idempotent
  const db = tx;
  await db.order.update({ where: { id: order.id }, data: { status: toStatus } });
  await db.orderStatusHistory.create({
    data: { orderId: order.id, fromStatus: order.status, toStatus, reason, changedBy },
  });
}

/**
 * Mengganti item vendor yang ditolak dengan item baru pada kategori yang sama
 * (Phase 1D §3.4). Item lama tetap REJECTED (immutable); relasi ditautkan lewat
 * OrderItemStatusHistory. Kategori aktif tidak boleh duplikat.
 *
 * @throws {DomainError} bila kategori sudah memiliki item aktif lain.
 */
export async function replaceRejectedVendorItem(
  params: {
    orderId: string;
    oldItemId: string;
    newServicePackageId: string;
    newHoldToken: string;
    changedBy?: string;
  },
  tx: OrderTx
): Promise<{ newItemId: string; orderStatus: string }> {
  const db = tx;

  const oldItem = await db.orderItem.findUnique({ where: { id: params.oldItemId } });
  if (!oldItem || oldItem.orderId !== params.orderId) {
    throw new DomainError("ORDER_ITEM_NOT_FOUND", "Item lama tidak ditemukan pada order ini.");
  }
  if (oldItem.status !== "REJECTED") {
    throw new DomainError(
      "INVALID_ORDER_TRANSITION",
      "Hanya item yang REJECTED yang dapat digantikan."
    );
  }

  const order = await db.order.findUnique({ where: { id: params.orderId } });
  if (!order) {
    throw new DomainError("ORDER_NOT_FOUND", `Order "${params.orderId}" tidak ditemukan.`);
  }
  // Mutasi item dilarang setelah fase finansial (WAITING_DP ke atas).
  if (["WAITING_DP", "DP_PAID", "IN_PROGRESS", "WAITING_SETTLEMENT", "FULLY_PAID", "COMPLETED"].includes(order.status)) {
    throw new DomainError(
      "INVALID_ORDER_TRANSITION",
      `Order sudah masuk fase finansial (status=${order.status}); penggantian item dilarang.`
    );
  }

  // Kategori harus bebas dari item aktif lain (read-before-write).
  const existingActive = await db.orderItem.findFirst({
    where: {
      orderId: params.orderId,
      categorySlug: oldItem.categorySlug,
      status: { in: [...ACTIVE_ITEM_STATUSES] },
    },
  });
  if (existingActive) {
    throw new DomainError(
      "INVALID_ORDER_TRANSITION",
      `Kategori "${oldItem.categorySlug}" sudah memiliki item aktif lain.`
    );
  }

  const pkg = await db.servicePackage.findUnique({
    where: { id: params.newServicePackageId },
    include: { vendor: true },
  });
  if (!pkg) {
    throw new DomainError("ITEM_PACKAGE_MISMATCH", "Paket pengganti tidak ditemukan.");
  }

  const quantity = 1;
  const unitPrice = pkg.unitPrice ?? pkg.basePrice;
  const subtotal = quantity * unitPrice;

  const newItem = await db.orderItem.create({
    data: {
      orderId: params.orderId,
      vendorId: pkg.vendorId,
      packageId: pkg.id,
      vendorNameSnapshot: pkg.vendor.businessName,
      categorySlug: pkg.category,
      serviceName: pkg.category,
      packageName: pkg.name,
      packageSnapshot: JSON.stringify({
        description: pkg.description,
        slaDays: pkg.slaDays,
        includes: safeParseArr(pkg.includes),
        termsVersion: "v1.0",
        capturedAt: new Date().toISOString(),
      }),
      snapshotVersion: "v1",
      unitType: pkg.unitType,
      quantity,
      unitPrice,
      subtotal,
      status: "PENDING",
      vendorResponseDueAt: new Date(
        Date.now() + VENDOR_RESPONSE_SLA_HOURS * 60 * 60 * 1000
      ),
    },
  });

  await verifyAndPromoteSlot(
    {
      vendorId: pkg.vendorId,
      date: order.eventDate,
      holdToken: params.newHoldToken,
      orderItemId: newItem.id,
    },
    tx
  );

  // Catat relasi replacement.
  await db.orderItemStatusHistory.create({
    data: {
      orderItemId: oldItem.id,
      fromStatus: "REJECTED",
      toStatus: "REJECTED",
      reason: `REPLACED_BY_ITEM:${newItem.id}`,
      changedBy: params.changedBy ?? "CLIENT",
    },
  });

  await recalcTotalAmount(params.orderId, tx);
  const orderStatus = await evaluateOrderAggregate(params.orderId, tx);
  return { newItemId: newItem.id, orderStatus };
}

/**
 * Sweeper: mengevaluasi order yang melampaui SLA respons vendor atau batas DP,
 * lalu mentransisikan ke EXPIRED dan melepas seluruh slot RESERVED. Idempotent.
 *
 * @returns daftar orderId yang diexpire pada pemanggilan ini.
 */
export async function expireOrdersSweep(tx: OrderTx): Promise<string[]> {
  const db = tx;
  const now = new Date();
  const expiredIds: string[] = [];

  // 1. PENDING_CONFIRMATION/PARTIALLY_ACCEPTED dengan vendorResponseDueAt lewat.
  const overdueVendor = await db.order.findMany({
    where: {
      status: { in: ["PENDING_CONFIRMATION", "PARTIALLY_ACCEPTED"] },
      vendorResponseDueAt: { lt: now },
    },
  });

  for (const order of overdueVendor) {
    const items = await db.orderItem.findMany({
      where: { orderId: order.id, status: { in: [...ACTIVE_ITEM_STATUSES] } },
    });
    for (const item of items) {
      await db.orderItem.update({
        where: { id: item.id },
        data: { status: "REJECTED", rejectionReason: "VENDOR_SLA_EXPIRED", rejectedAt: now },
      });
      await db.orderItemStatusHistory.create({
        data: {
          orderItemId: item.id,
          fromStatus: item.status,
          toStatus: "REJECTED",
          reason: "VENDOR_SLA_EXPIRED",
          changedBy: "SYSTEM",
        },
      });
      await releaseReservedSlot(item.id, tx);
    }
    await transitionOrder(order, "EXPIRED", "Vendor response SLA expired", "SYSTEM", tx);
    await cancelPendingInstallments(order.id, tx);
    expiredIds.push(order.id);
  }

  // 2. WAITING_DP dengan dpDueAt lewat.
  const overdueDp = await db.order.findMany({
    where: { status: "WAITING_DP", dpDueAt: { lt: now } },
  });

  for (const order of overdueDp) {
    const items = await getActiveItems(order.id, tx);
    for (const item of items) {
      await releaseReservedSlot(item.id, tx);
      await db.orderItem.update({ where: { id: item.id }, data: { status: "CANCELLED" } });
      await db.orderItemStatusHistory.create({
        data: {
          orderItemId: item.id,
          fromStatus: item.status,
          toStatus: "CANCELLED",
          reason: "DP deadline expired",
          changedBy: "SYSTEM",
        },
      });
    }
    await transitionOrder(order, "EXPIRED", "DP deadline expired", "SYSTEM", tx);
    await cancelPendingInstallments(order.id, tx);
    expiredIds.push(order.id);
  }

  return expiredIds;
}

async function cancelPendingInstallments(orderId: string, tx: OrderTx): Promise<void> {
  await tx.paymentInstallment.updateMany({
    where: { orderId, status: "PENDING" },
    data: { status: "CANCELLED" },
  });
}

function safeParseArr(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Helper util: menambah hari kalender pada tanggal acara (WIB) — dipakai fitur
 * deadline H-3 / H-7 / H+2. Dipaparkan di sini agar OrderService mandiri.
 */
export function addWibDays(date: string | Date, days: number): string {
  return addCalendarDaysWIB(date, days);
}
