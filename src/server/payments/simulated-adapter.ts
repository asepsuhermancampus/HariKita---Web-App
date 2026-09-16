import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  CreateChargeInput,
  CreateChargeResult,
  GatewayProvider,
  PaymentGatewayAdapter,
  VerifyWebhookResult,
} from "./types";

/**
 * HariKita - Simulated QRIS Adapter (pilot/sandbox)
 *
 * Tidak memanggil jaringan. Verifikasi webhook memakai HMAC-SHA256 terhadap
 * `HARIKITA_WEBHOOK_SECRET` (atau mode sandbox eksplisit bila secret kosong).
 */

const PROVIDER: GatewayProvider = "simulated_qris";

export function createSimulatedAdapter(): PaymentGatewayAdapter {
  return {
    provider: PROVIDER,

    async verifyWebhook(headers: Headers, rawBody: string): Promise<VerifyWebhookResult> {
      const secret = process.env.HARIKITA_WEBHOOK_SECRET;
      const sandbox = headers.get("x-harikita-sandbox") === "true";

      if (!secret) {
        return sandbox ? { ok: true } : { ok: false, reason: "WEBHOOK_SIGNATURE_INVALID" };
      }

      const provided = headers.get("x-harikita-signature");
      if (!provided) return { ok: false, reason: "WEBHOOK_SIGNATURE_INVALID" };

      const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
      const a = Buffer.from(provided, "utf8");
      const b = Buffer.from(expected, "utf8");
      const ok = a.length === b.length && timingSafeEqual(a, b);
      return ok ? { ok: true } : { ok: false, reason: "WEBHOOK_SIGNATURE_INVALID" };
    },

    async createCharge(input: CreateChargeInput): Promise<CreateChargeResult> {
      return {
        providerTransactionId: `SIM-${input.attemptId.slice(-8)}-${Date.now()}`,
        paymentUrl: `/pembayaran/${input.orderId}`,
        status: "PENDING",
      };
    },
  };
}
