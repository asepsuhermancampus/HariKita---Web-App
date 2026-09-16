"use server";

import { withTransactionRetry } from "@/lib/transaction-retry";
import { prisma } from "@/lib/prisma";
import { createOrder, processVendorDecision, replaceRejectedVendorItem } from "@/server/services/order-service";
import { claimHoldSlot } from "@/server/services/availability-service";
import { resolveCatalogItems } from "@/server/services/catalog-bridge";
import { DomainError } from "@/server/services/errors";
import { runAction, requireSession, optionalSession, revalidate, type ActionResult } from "./_shared";

/**
 * HariKita - Order Server Actions (Phase 2 transport layer)
 *
 * Menerima item katalog dari klien, me-resolve ke DB otoritatif, lalu membuat
 * Order + OrderItem + promosi slot dalam satu transaksi atomik.
 */

export interface CartLineInput {
  catalogVendorId: string;
  catalogPackageId: string;
  quantity?: number;
  holdToken: string;
  notes?: string;
}

export interface CreateOrderActionInput {
  eventDate: string;
  clientName: string;
  clientPhone: string;
  city?: string;
  notes?: string;
  items: CartLineInput[];
}

export interface CreateOrderActionResult {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  vendorResponseDueAt: string;
  itemIds: string[];
}

function validateOrderInput(input: CreateOrderActionInput): void {
  if (!input.eventDate) {
    throw new DomainError("INVALID_ORDER_TRANSITION", "Tanggal acara wajib diisi.");
  }
  if (!input.clientName?.trim() || input.clientName.trim().length < 2) {
    throw new DomainError("INVALID_ORDER_TRANSITION", "Nama pemesan minimal 2 karakter.");
  }
  if (!input.clientPhone?.trim()) {
    throw new DomainError("INVALID_ORDER_TRANSITION", "Nomor WhatsApp wajib diisi.");
  }
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new DomainError("INVALID_ORDER_TRANSITION", "Keranjang tidak boleh kosong.");
  }
  for (const item of input.items) {
    if (!item.holdToken) {
      throw new DomainError(
        "HOLD_TOKEN_INVALID",
        `Item ${item.catalogPackageId} tidak memiliki hold token. Klaim slot terlebih dahulu.`
      );
    }
  }
}

/**
 * Membuat pesanan dari item keranjang. Harga dihitung server dari DB (anti-tamper).
 * Lazy-registration: boleh tanpa login.
 */
export async function createOrderAction(
  input: CreateOrderActionInput
): Promise<ActionResult<CreateOrderActionResult>> {
  return runAction(async () => {
    validateOrderInput(input);
    const session = await optionalSession();

    const result = await withTransactionRetry(async (tx) => {
      // Resolusi otoritatif item katalog → DB.
      const resolved = await resolveCatalogItems(
        input.items.map((i) => ({
          vendorId: i.catalogVendorId,
          packageId: i.catalogPackageId,
        })),
        tx
      );

      // Petakan kembali hold token berdasarkan urutan item.
      const items = resolved.map((r, idx) => ({
        servicePackageId: r.packageId,
        quantity: input.items[idx].quantity ?? 1,
        holdToken: input.items[idx].holdToken,
        notes: input.items[idx].notes,
      }));

      return createOrder(
        {
          eventDate: input.eventDate,
          clientName: input.clientName.trim(),
          clientPhone: input.clientPhone.trim(),
          city: input.city ?? "Kebumen",
          notes: input.notes,
          userId: session?.userId ?? null,
          items,
        },
        tx
      );
    });

    revalidate(["/client", "/client/pesanan", "/vendor/inbox"]);

    return {
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      totalAmount: result.totalAmount,
      vendorResponseDueAt: result.vendorResponseDueAt.toISOString(),
      itemIds: result.itemIds,
    };
  });
}

/** Respon vendor (ACCEPT/REJECT) atas satu item pesanan. */
export async function vendorDecisionAction(input: {
  orderItemId: string;
  command: "ACCEPT" | "REJECT";
  rejectionReason?: string;
}): Promise<ActionResult<{ orderStatus: string; itemStatus: string }>> {
  return runAction(async () => {
    const session = await requireSession();
    if (session.role !== "VENDOR" && session.role !== "ADMIN") {
      throw new DomainError("UNAUTHORIZED_ORDER_ACCESS", "Hanya vendor yang dapat merespon pesanan.");
    }

    const result = await withTransactionRetry((tx) =>
      processVendorDecision(
        {
          orderItemId: input.orderItemId,
          command: input.command,
          rejectionReason: input.rejectionReason,
          vendorUserId: session.userId,
        },
        tx
      )
    );

    revalidate(["/vendor/inbox", "/client/pesanan", "/admin/kalender"]);
    return result;
  });
}

/** Menggantikan item vendor yang ditolak dengan vendor/paket baru. */
export async function replaceRejectedItemAction(input: {
  orderId: string;
  oldItemId: string;
  catalogVendorId: string;
  catalogPackageId: string;
  holdToken: string;
}): Promise<ActionResult<{ newItemId: string; orderStatus: string }>> {
  return runAction(async () => {
    const session = await requireSession();

    const result = await withTransactionRetry(async (tx) => {
      const resolved = await resolveCatalogItems(
        [{ vendorId: input.catalogVendorId, packageId: input.catalogPackageId }],
        tx
      );

      return replaceRejectedVendorItem(
        {
          orderId: input.orderId,
          oldItemId: input.oldItemId,
          newServicePackageId: resolved[0].packageId,
          newHoldToken: input.holdToken,
          changedBy: session.userId,
        },
        tx
      );
    });

    revalidate(["/client/pesanan", "/vendor/inbox"]);
    return result;
  });
}

export interface AutoHoldOrderInput {
  eventDate: string;
  clientName: string;
  clientPhone: string;
  city?: string;
  notes?: string;
  items: Array<{
    catalogVendorId: string;
    catalogPackageId: string;
    quantity?: number;
    notes?: string;
  }>;
}

/**
 * Membuat pesanan dengan mengklaim hold slot secara OTOMATIS di server
 * (claim → promote → createOrder) dalam satu transaksi.
 *
 * Disediakan untuk alur checkout yang tidak melalui builder (tidak ada hold token
 * yang sudah diklaim). Semua langkah tetap melewati AvailabilityService + OrderService.
 */
export async function createOrderWithAutoHoldAction(
  input: AutoHoldOrderInput
): Promise<ActionResult<CreateOrderActionResult>> {
  return runAction(async () => {
    if (!input.eventDate) {
      throw new DomainError("INVALID_ORDER_TRANSITION", "Tanggal acara wajib diisi.");
    }
    if (!input.clientName?.trim() || input.clientName.trim().length < 2) {
      throw new DomainError("INVALID_ORDER_TRANSITION", "Nama pemesan minimal 2 karakter.");
    }
    if (!input.clientPhone?.trim()) {
      throw new DomainError("INVALID_ORDER_TRANSITION", "Nomor WhatsApp wajib diisi.");
    }
    if (!Array.isArray(input.items) || input.items.length === 0) {
      throw new DomainError("INVALID_ORDER_TRANSITION", "Keranjang tidak boleh kosong.");
    }

    const session = await optionalSession();

    const result = await withTransactionRetry(async (tx) => {
      // Resolusi item katalog → DB otoritatif.
      const resolved = await resolveCatalogItems(
        input.items.map((i) => ({ vendorId: i.catalogVendorId, packageId: i.catalogPackageId })),
        tx
      );

      // Klaim hold untuk tiap item, kumpulkan token.
      const lines: CartLineInput[] = [];
      for (let idx = 0; idx < resolved.length; idx++) {
        const r = resolved[idx];
        const hold = await claimHoldSlot(
          { vendorId: r.vendorId, date: input.eventDate, userId: session?.userId ?? null },
          tx
        );
        lines.push({
          catalogVendorId: input.items[idx].catalogVendorId,
          catalogPackageId: input.items[idx].catalogPackageId,
          quantity: input.items[idx].quantity ?? 1,
          holdToken: hold.holdToken,
          notes: input.items[idx].notes,
        });
      }

      // Petakan ke bentuk createOrder (servicePackageId = packageId hasil resolusi).
      const serviceItems = lines.map((l, idx) => ({
        servicePackageId: resolved[idx].packageId,
        quantity: l.quantity ?? 1,
        holdToken: l.holdToken,
        notes: l.notes,
      }));

      return createOrder(
        {
          eventDate: input.eventDate,
          clientName: input.clientName.trim(),
          clientPhone: input.clientPhone.trim(),
          city: input.city ?? "Kebumen",
          notes: input.notes,
          userId: session?.userId ?? null,
          items: serviceItems,
        },
        tx
      );
    });

    revalidate(["/client", "/client/pesanan", "/vendor/inbox"]);
    return {
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      totalAmount: result.totalAmount,
      vendorResponseDueAt: result.vendorResponseDueAt.toISOString(),
      itemIds: result.itemIds,
    };
  });
}
