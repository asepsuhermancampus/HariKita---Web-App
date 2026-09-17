import type { Prisma } from "@prisma/client";
import { executePayout, type PayoutTranche, type PayoutResult } from "./ledger-service";

/**
 * HariKita - Payout Service (facade)
 *
 * Lapisan tipis di atas `LedgerService.executePayout` untuk pencairan dana ke
 * vendor (DP_DISBURSEMENT H-3 & SETTLEMENT_PAYOUT H+2). Kelayakan (5 financial
 * guards) ditegakkan oleh `checkPayoutEligibility` di payment-service; pemanggil
 * (scheduler/cron) WAJIB memeriksa kelayakan sebelum memanggil fungsi ini.
 *
 * Exact-once dijamin oleh `journalNumber` deterministik di ledger-service.
 */

export type PayoutTx = Prisma.TransactionClient;

export interface ExecutePayoutForOrderInput {
  orderId: string;
  tranche: PayoutTranche;
  amount: number;
}

/** Menjalankan payout exact-once untuk sebuah order + tranche. */
export async function executePayoutForOrder(
  input: ExecutePayoutForOrderInput,
  tx?: PayoutTx
): Promise<PayoutResult> {
  return executePayout(
    {
      orderId: input.orderId,
      tranche: input.tranche,
      amount: input.amount,
    },
    tx
  );
}

export type { PayoutTranche, PayoutResult };
export { checkPayoutEligibility } from "./payment-service";
