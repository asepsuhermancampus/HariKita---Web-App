import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withTransactionRetry } from "@/lib/transaction-retry";
import { prisma } from "@/lib/prisma";
import { expireOrdersSweep } from "@/server/services/order-service";
import { sweepExpiredHolds } from "@/server/services/availability-service";
import { sweepUnprocessedEvents } from "@/server/services/payment-webhook-service";
import { checkPayoutEligibility, executePayoutForOrder } from "@/server/services/payout-service";

/**
 * HariKita - Scheduled Sweeper Endpoint
 *
 * GET/POST /api/cron/sweep?secret=<HARIKITA_CRON_SECRET>
 *
 * Menjalankan seluruh pekerjaan berkala yang idempotent:
 *  1. expireOrdersSweep     — order melewati SLA vendor / batas DP → EXPIRED.
 *  2. sweepExpiredHolds     — slot HELD kedaluwarsa (15 menit) → OPEN.
 *  3. sweepUnprocessedEvents — event webhook tertinggal (processed=false) → proses.
 *  4. payout sweep          — pencairan DP H-3 / pelunasan H+2 yang layak.
 *
 * Keamanan: wajib cocok dengan HARIKITA_CRON_SECRET (query `secret` ATAU header
 * `x-cron-secret`). Bila secret belum dikonfigurasi, endpoint menolak (503) agar
 * tidak terbuka di produksi.
 *
 * Dapat dipanggil oleh: Vercel Cron, GitHub Actions, cron server, atau manual.
 */

export const dynamic = "force-dynamic";

function authorize(request: NextRequest): boolean {
  const secret = process.env.HARIKITA_CRON_SECRET;
  if (!secret) return false;

  const url = new URL(request.url);
  const provided = url.searchParams.get("secret") ?? request.headers.get("x-cron-secret") ?? "";
  if (provided.length !== secret.length) return false;

  let diff = 0;
  for (let i = 0; i < secret.length; i++) diff |= provided.charCodeAt(i) ^ secret.charCodeAt(i);
  return diff === 0;
}

async function runSweep(): Promise<Record<string, unknown>> {
  // 1. Expire orders (SLA vendor + DP deadline).
  const expiredOrderIds = await withTransactionRetry((tx) => expireOrdersSweep(tx));

  // 2. Sweep expired holds + 3. webhook sweeper (di luar TX karena multi-event).
  const releasedHolds = await withTransactionRetry((tx) => sweepExpiredHolds(tx));
  const webhookSweep = await sweepUnprocessedEvents();

  // 4. Payout sweep: evaluasi seluruh order aktif untuk kedua tranche.
  const activeOrders = await prisma.order.findMany({
    where: { status: { notIn: ["CANCELLED", "EXPIRED", "REFUNDED"] } },
    select: { id: true },
    take: 500,
  });

  const payoutResults: Array<{ orderId: string; tranche: string; created: boolean; reason?: string }> = [];
  for (const { id } of activeOrders) {
    for (const tranche of ["DP_DISBURSEMENT", "SETTLEMENT_PAYOUT"] as const) {
      const result = await withTransactionRetry(async (tx) => {
        const eligibility = await checkPayoutEligibility(id, tranche, tx);
        if (!eligibility.eligible) {
          return { created: false, reason: eligibility.reason };
        }
        const payout = await executePayoutForOrder(
          { orderId: id, tranche, amount: eligibility.amount },
          tx
        );
        return { created: payout.created, reason: payout.created ? "EXECUTED" : "ALREADY_PAID_OUT" };
      });
      if (result.created) {
        payoutResults.push({ orderId: id, tranche, created: true });
      }
    }
  }

  return {
    expiredOrders: expiredOrderIds.length,
    releasedHolds,
    webhookSweep,
    payoutsExecuted: payoutResults.length,
    payouts: payoutResults,
  };
}

async function handle(request: NextRequest): Promise<NextResponse> {
  if (!authorize(request)) {
    return NextResponse.json(
      { success: false, error: "UNAUTHORIZED_CRON" },
      { status: 401 }
    );
  }

  const startedAt = Date.now();
  try {
    const summary = await runSweep();
    return NextResponse.json(
      { success: true, durationMs: Date.now() - startedAt, summary },
      { status: 200 }
    );
  } catch (error) {
    console.error("[cron/sweep] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "SWEEP_FAILED",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return handle(request);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return handle(request);
}
