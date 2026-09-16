import { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withTransactionRetry, isContentionError } from "@/lib/transaction-retry";
import { DomainError, UnexpectedSystemError } from "./errors";
import { processPaymentSuccess, type PaymentTx } from "./payment-service";

/**
 * HariKita - PaymentWebhookService
 *
 * [OWNS: PaymentWebhookEvent]. Mengamankan pintu masuk webhook pembayaran dengan
 * model dua fase + durable sweeper (Phase 1D v9 §5, §13).
 *
 * Fase A — persist event (transaksi standalone ringan), idempotent via
 *           @@unique([provider, eventId]).
 * Fase B — proses finansial (Serializable, shared tx via PaymentService).
 *
 * Klasifikasi error (3 kategori):
 *  1. Transient contention → retry via withTransactionRetry; processed tetap false.
 *  2. Permanent business rejection → processed=true + errorMessage; HTTP 200.
 *  3. Unexpected system error → processed tetap false; HTTP 500.
 */

/** Payload webhook yang telah diverifikasi & dinormalisasi transport layer. */
export interface VerifiedWebhookPayload {
  attemptId: string;
  provider: string;
  providerTransactionId: string;
  amount: number;
}

export interface PersistWebhookInput {
  provider: string;
  eventId: string;
  eventType: string;
  payload: string; // JSON string (verified)
}

export interface PersistWebhookResult {
  eventId: string;
  duplicate: boolean;
}

/**
 * FASE A — Menyimpan event webhook secara idempotent.
 * Bila `(provider, eventId)` sudah ada → kembalikan `duplicate: true` (no-op).
 */
export async function persistWebhookEvent(
  input: PersistWebhookInput,
  client?: Pick<PrismaClient, "paymentWebhookEvent">
): Promise<PersistWebhookResult> {
  const db = client ?? prisma;

  // Pre-check idempotent.
  const existing = await db.paymentWebhookEvent.findUnique({
    where: { provider_eventId: { provider: input.provider, eventId: input.eventId } },
  });
  if (existing) {
    return { eventId: existing.id, duplicate: true };
  }

  try {
    const created = await db.paymentWebhookEvent.create({
      data: {
        provider: input.provider,
        eventId: input.eventId,
        eventType: input.eventType,
        payload: input.payload,
        processed: false,
      },
    });
    return { eventId: created.id, duplicate: false };
  } catch (error) {
    // Concurrent duplicate → idempotent.
    if (isUniqueConstraintOn(error, "eventId")) {
      const raced = await db.paymentWebhookEvent.findUnique({
        where: { provider_eventId: { provider: input.provider, eventId: input.eventId } },
      });
      if (raced) return { eventId: raced.id, duplicate: true };
    }
    throw error;
  }
}

export type ProcessOutcome =
  | { status: "PROCESSED"; reason: string }
  | { status: "ALREADY_PROCESSED"; reason: string }
  | { status: "PERMANENT_REJECTION"; reason: string }
  | { status: "TRANSIENT_ERROR"; reason: string }
  | { status: "UNEXPECTED_ERROR"; reason: string };

/**
 * FASE B — Memproses event webhook di dalam Serializable transaction.
 *
 * Idempotency (Phase 1D v9 §5.3): re-read event; jika `processed` atau installment
 * sudah PAID → early exit idempotent. Transaksi yang kalah pada P2034 retry akan
 * membaca status terbaru dan langsung keluar.
 */
export async function processWebhookEvent(
  webhookEventId: string,
  client?: Pick<PrismaClient, "$transaction">
): Promise<ProcessOutcome> {
  try {
    return await withTransactionRetry(
      async (tx) => {
      const event = await tx.paymentWebhookEvent.findUnique({ where: { id: webhookEventId } });
      if (!event) {
        // Event hilang — anggap permanent (tidak akan berubah bila retry).
        return { status: "PERMANENT_REJECTION", reason: "EVENT_NOT_FOUND" } as ProcessOutcome;
      }
      if (event.processed) {
        return { status: "ALREADY_PROCESSED", reason: "EVENT_ALREADY_PROCESSED" } as ProcessOutcome;
      }

      let payload: VerifiedWebhookPayload;
      try {
        payload = JSON.parse(event.payload) as VerifiedWebhookPayload;
      } catch {
        await markPermanentRejection(tx, event.id, "INVALID_PAYLOAD_JSON");
        return { status: "PERMANENT_REJECTION", reason: "INVALID_PAYLOAD_JSON" } as ProcessOutcome;
      }

      try {
        const result = await processPaymentSuccess(
          {
            attemptId: payload.attemptId,
            provider: payload.provider,
            providerTransactionId: payload.providerTransactionId,
            amount: payload.amount,
          },
          tx
        );

        await tx.paymentWebhookEvent.update({
          where: { id: event.id },
          data: { processed: true, processedAt: new Date() },
        });

        return {
          status: "PROCESSED",
          reason: result.outcome === "ALREADY_PAID" ? "INSTALLMENT_ALREADY_PAID" : "PROCESSED",
        } as ProcessOutcome;
      } catch (err) {
        if (err instanceof DomainError) {
          // Permanent business rejection → tandai processed + catat alasan.
          await markPermanentRejection(tx, event.id, err.code);
          return { status: "PERMANENT_REJECTION", reason: err.code } as ProcessOutcome;
        }
        // Unexpected → biarkan processed=false, lempar agar rollback.
        throw err;
      }
      },
      client ? { client } : undefined
    );
  } catch (error) {
    if (isContentionError(error)) {
      return { status: "TRANSIENT_ERROR", reason: "CONTENTION_RETRIES_EXHAUSTED" };
    }
    // Unexpected system error → processed tetap false.
    return {
      status: "UNEXPECTED_ERROR",
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

async function markPermanentRejection(
  tx: PaymentTx,
  eventId: string,
  reason: string
): Promise<void> {
  await tx.paymentWebhookEvent.update({
    where: { id: eventId },
    data: {
      processed: true,
      processedAt: new Date(),
      errorMessage: `PERMANENT_REJECTION: ${reason}`,
    },
  });
}

/**
 * Alur lengkap transport: persist (Fase A) lalu proses (Fase B).
 * Mengembalikan status HTTP yang tepat untuk gateway.
 */
export async function handleIncomingWebhook(
  input: PersistWebhookInput,
  client?: PrismaClient
): Promise<{ httpStatus: number; outcome: ProcessOutcome | { status: "DUPLICATE"; reason: string } }> {
  const persisted = await persistWebhookEvent(input, client);

  const outcome = await processWebhookEvent(persisted.eventId, client);

  switch (outcome.status) {
    case "PROCESSED":
    case "ALREADY_PROCESSED":
      return { httpStatus: 200, outcome };
    case "PERMANENT_REJECTION":
      // Gateway tidak perlu retry payload invalid secara bisnis.
      return { httpStatus: 200, outcome };
    case "TRANSIENT_ERROR":
      // Biarkan gateway retry.
      return { httpStatus: 503, outcome };
    case "UNEXPECTED_ERROR":
    default:
      return { httpStatus: 500, outcome };
  }
}

/** Sweeper: memproses ulang event `processed = false` yang tertinggal > threshold. */
export async function sweepUnprocessedEvents(
  olderThanMs = 60_000,
  limit = 20,
  client?: PrismaClient
): Promise<{ scanned: number; processed: number; failed: number }> {
  const db = client ?? prisma;
  const cutoff = new Date(Date.now() - olderThanMs);
  const stuck = await db.paymentWebhookEvent.findMany({
    where: { processed: false, createdAt: { lte: cutoff } },
    take: limit,
    orderBy: { createdAt: "asc" },
  });

  let processedCount = 0;
  let failed = 0;

  for (const event of stuck) {
    const outcome = await processWebhookEvent(event.id, client);
    if (outcome.status === "PROCESSED" || outcome.status === "ALREADY_PROCESSED" || outcome.status === "PERMANENT_REJECTION") {
      processedCount++;
    } else {
      // Transient / unexpected → biarkan, alert operasional.
      failed++;
    }
  }

  return { scanned: stuck.length, processed: processedCount, failed };
}

function isUniqueConstraintOn(error: unknown, field: string): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: unknown; meta?: { target?: unknown } };
  if (e.code !== "P2002") return false;
  const target = e.meta?.target;
  if (Array.isArray(target)) return target.includes(field) || target.includes("provider");
  if (typeof target === "string") return target.includes(field) || target.includes("provider");
  return false;
}

// Re-export agar transport layer punya satu pintu.
export { DomainError, UnexpectedSystemError };
