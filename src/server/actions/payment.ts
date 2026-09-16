"use server";

import { withTransactionRetry } from "@/lib/transaction-retry";
import { prisma } from "@/lib/prisma";
import {
  createPaymentAttempt,
  processPaymentSuccess,
  runPayoutSweep,
} from "@/server/services/payment-service";
import type { PayoutTranche } from "@/server/services/ledger-service";
import { persistWebhookEvent, processWebhookEvent } from "@/server/services/payment-webhook-service";
import { DomainError } from "@/server/services/errors";
import { getGatewayAdapter, getDefaultProvider } from "@/server/payments/registry";
import type { GatewayProvider } from "@/server/payments/types";
import { runAction, requireSession, revalidate, type ActionResult } from "./_shared";

/**
 * HariKita - Payment Server Actions (Phase 2 transport layer)
 *
 * Di produksi, konfirmasi pembayaran berasal dari webhook gateway (lihat
 * /api/webhooks/payment). Untuk pilot/sandbox, `simulatePaymentSuccessAction`
 * menyediakan alur end-to-end yang tetap melewati PaymentService + ledger.
 */

/** Membuat PaymentAttempt (idempotent) untuk sebuah installment. */
export async function createPaymentAttemptAction(input: {
  orderId: string;
  provider?: string;
}): Promise<ActionResult<{ attemptId: string; installmentId: string; amount: number }>> {
  return runAction(async () => {
    const session = await requireSession();

    const result = await withTransactionRetry(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: input.orderId },
        include: { installments: true },
      });
      if (!order) {
        throw new DomainError("ORDER_NOT_FOUND", `Order "${input.orderId}" tidak ditemukan.`);
      }
      // Anti-IDOR: klien hanya boleh membuat attempt untuk order miliknya (jika login).
      if (order.userId && order.userId !== session.userId && session.role !== "ADMIN") {
        throw new DomainError("UNAUTHORIZED_ORDER_ACCESS", "Order bukan milik sesi ini.");
      }

      // Pilih installment berikutnya yang belum dibayar: DP_30, lalu SETTLEMENT_70.
      const pending =
        order.installments.find((i) => i.type === "DP_30" && i.status === "PENDING") ??
        order.installments.find((i) => i.type === "SETTLEMENT_70" && i.status === "PENDING");
      if (!pending) {
        throw new DomainError("INSTALLMENT_ALREADY_PAID", "Tidak ada tagihan aktif untuk pesanan ini.");
      }

      const attempt = await createPaymentAttempt(
        {
          installmentId: pending.id,
          provider: input.provider ?? "simulated_qris",
          clientGeneratedRef: `client-${Date.now()}`,
        },
        tx
      );

      return { attemptId: attempt.attemptId, installmentId: pending.id, amount: pending.amount };
    });

    return result;
  });
}

/**
 * Simulasi pembayaran berhasil (pilot/sandbox). Membuat attempt bila belum ada
 * lalu memproses pembayaran melalui PaymentService (ledger + order + availability).
 * Di produksi digantikan webhook gateway.
 */
export async function simulatePaymentSuccessAction(input: {
  orderId: string;
  provider?: string;
}): Promise<ActionResult<{ orderStatus: string; installmentType: string }>> {
  return runAction(async () => {
    const provider = input.provider ?? "simulated_qris";

    const result = await withTransactionRetry(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: input.orderId },
        include: { installments: true },
      });
      if (!order) {
        throw new DomainError("ORDER_NOT_FOUND", `Order "${input.orderId}" tidak ditemukan.`);
      }

      const pending =
        order.installments.find((i) => i.type === "DP_30" && i.status === "PENDING") ??
        order.installments.find((i) => i.type === "SETTLEMENT_70" && i.status === "PENDING");
      if (!pending) {
        throw new DomainError("INSTALLMENT_ALREADY_PAID", "Tidak ada tagihan aktif untuk pesanan ini.");
      }

      const attempt = await createPaymentAttempt(
        {
          installmentId: pending.id,
          provider,
          clientGeneratedRef: `sim-${Date.now()}`,
        },
        tx
      );

      const paid = await processPaymentSuccess(
        {
          attemptId: attempt.attemptId,
          provider,
          providerTransactionId: `SIM-${pending.id.slice(-6)}-${Date.now()}`,
          amount: pending.amount,
        },
        tx
      );

      return { orderStatus: paid.orderStatus, installmentType: paid.installmentType };
    });

    revalidate(["/client", "/client/pesanan", "/vendor/dompet", "/admin/escrow"]);
    return result;
  });
}

/** Menjalankan payout sweep untuk kandidat order (biasanya dipanggil cron/admin). */
export async function runPayoutSweepAction(
  candidates: Array<{ orderId: string; tranche: PayoutTranche }>
): Promise<ActionResult<{ eligible: string[]; executed: string[]; skipped: Array<{ orderId: string; tranche: string; reason: string }> }>> {
  return runAction(async () => {
    const session = await requireSession();
    if (session.role !== "ADMIN") {
      throw new DomainError("UNAUTHORIZED_ORDER_ACCESS", "Hanya admin yang dapat menjalankan payout.");
    }

    const result = await withTransactionRetry((tx) => runPayoutSweep(candidates, tx));
    revalidate(["/admin/escrow", "/vendor/dompet"]);
    return {
      eligible: result.eligible,
      executed: result.executed,
      skipped: result.skipped.map((s) => ({ orderId: s.orderId, tranche: s.tranche, reason: s.reason })),
    };
  });
}

/**
 * Menerima event webhook (Phase A persist + Phase B process) dari transport HTTP.
 * Dipakai oleh route handler `/api/webhooks/payment`.
 */
export async function ingestWebhookAction(input: {
  provider: string;
  eventId: string;
  eventType: string;
  payload: string;
}): Promise<ActionResult<{ processed: boolean; status: string }>> {
  return runAction(async () => {
    const persisted = await persistWebhookEvent({
      provider: input.provider,
      eventId: input.eventId,
      eventType: input.eventType,
      payload: input.payload,
    });

    const outcome = await processWebhookEvent(persisted.eventId);
    return {
      processed: outcome.status === "PROCESSED" || outcome.status === "ALREADY_PROCESSED",
      status: outcome.status,
    };
  });
}

/** Util: daftar order milik klien yang sedang login (untuk dropdown internal). */
export async function listMyOrdersAction(): Promise<
  ActionResult<Array<{ id: string; orderNumber: string; status: string; totalAmount: number }>>
> {
  return runAction(async () => {
    const session = await requireSession();
    const orders = await prisma.order.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, orderNumber: true, status: true, totalAmount: true },
      take: 50,
    });
    return orders;
  });
}

/**
 * Membuat charge di payment gateway untuk sebuah order (attempt + external call).
 *
 * PENTING (Phase 1D §3.2): panggilan jaringan gateway dilakukan DI LUAR transaksi
 * database — attempt dibuat dahulu dalam TX, kemudian charge dipanggil, lalu
 * referensi transaksi disimpan. Tidak ada network call di dalam `withTransactionRetry`.
 */
export async function createChargeAction(input: {
  orderId: string;
  provider?: GatewayProvider;
}): Promise<
  ActionResult<{
    attemptId: string;
    providerTransactionId: string;
    amount: number;
    paymentUrl?: string;
    qrString?: string;
  }>
> {
  return runAction(async () => {
    const session = await requireSession();
    const provider = input.provider ?? getDefaultProvider();

    // 1. TX 1: buat/lock attempt untuk installment PENDING.
    const attemptInfo = await withTransactionRetry(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: input.orderId },
        include: { installments: true },
      });
      if (!order) {
        throw new DomainError("ORDER_NOT_FOUND", `Order "${input.orderId}" tidak ditemukan.`);
      }
      if (order.userId && order.userId !== session.userId && session.role !== "ADMIN") {
        throw new DomainError("UNAUTHORIZED_ORDER_ACCESS", "Order bukan milik sesi ini.");
      }

      const pending =
        order.installments.find((i) => i.type === "DP_30" && i.status === "PENDING") ??
        order.installments.find((i) => i.type === "SETTLEMENT_70" && i.status === "PENDING");
      if (!pending) {
        throw new DomainError("INSTALLMENT_ALREADY_PAID", "Tidak ada tagihan aktif untuk pesanan ini.");
      }

      const attempt = await createPaymentAttempt(
        {
          installmentId: pending.id,
          provider,
          clientGeneratedRef: `charge-${Date.now()}`,
        },
        tx
      );

      return {
        attemptId: attempt.attemptId,
        installmentId: pending.id,
        amount: pending.amount,
        clientName: order.clientName,
        clientPhone: order.clientPhone,
        orderNumber: order.orderNumber,
      };
    });

    // 2. External call ke gateway (DI LUAR transaksi DB).
    const adapter = getGatewayAdapter(provider);
    const charge = await adapter.createCharge({
      attemptId: attemptInfo.attemptId,
      installmentId: attemptInfo.installmentId,
      orderId: input.orderId,
      amount: attemptInfo.amount,
      clientName: attemptInfo.clientName,
      clientPhone: attemptInfo.clientPhone,
      description: `HariKita ${attemptInfo.orderNumber} - ${input.orderId}`,
    });

    // 3. TX 2: simpan referensi transaksi gateway ke attempt.
    await prisma.paymentAttempt.update({
      where: { id: attemptInfo.attemptId },
      data: {
        providerTransactionId: charge.providerTransactionId,
        status: "PENDING",
      },
    });

    return {
      attemptId: attemptInfo.attemptId,
      providerTransactionId: charge.providerTransactionId,
      amount: attemptInfo.amount,
      paymentUrl: charge.paymentUrl,
      qrString: charge.qrString,
    };
  });
}
