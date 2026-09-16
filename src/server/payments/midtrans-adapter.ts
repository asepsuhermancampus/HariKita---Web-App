import { createHash } from "node:crypto";
import type {
  CreateChargeInput,
  CreateChargeResult,
  GatewayProvider,
  PaymentGatewayAdapter,
  NormalizedGatewayEvent,
  VerifyWebhookResult,
} from "./types";

/**
 * HariKita - Midtrans Adapter
 *
 * Verifikasi signature webhook Midtrans:
 *   signature_key = SHA512(order_id + status_code + gross_amount + serverKey)
 *
 * Env:
 *   MIDTRANS_SERVER_KEY   — server key (Sandbox/Production)
 *   MIDTRANS_IS_PRODUCTION — "true" untuk production endpoint
 *   MIDTRANS_API_URL      — override base URL (opsional)
 *
 * Catatan: `order_id` pada webhook dipetakan ke `attemptId` internal HariKita.
 */

const PROVIDER: GatewayProvider = "midtrans";

function serverKey(): string {
  return process.env.MIDTRANS_SERVER_KEY ?? "";
}

function isProduction(): boolean {
  return process.env.MIDTRANS_IS_PRODUCTION === "true";
}

function baseUrl(): string {
  if (process.env.MIDTRANS_API_URL) return process.env.MIDTRANS_API_URL;
  return isProduction()
    ? "https://api.midtrans.com/v2"
    : "https://api.sandbox.midtrans.com/v2";
}

/** Midtrans mengirim status_code & gross_amount sebagai string/number. */
interface MidtransNotification {
  transaction_id?: string;
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  transaction_status?: string;
  fraud_status?: string;
  payment_type?: string;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function createMidtransAdapter(): PaymentGatewayAdapter {
  return {
    provider: PROVIDER,

    async verifyWebhook(_headers: Headers, rawBody: string): Promise<VerifyWebhookResult> {
      let body: MidtransNotification;
      try {
        body = JSON.parse(rawBody) as MidtransNotification;
      } catch {
        return { ok: false, reason: "INVALID_JSON" };
      }

      const key = serverKey();
      if (!key) {
        return { ok: false, reason: "MIDTRANS_SERVER_KEY_MISSING" };
      }

      const orderId = body.order_id ?? "";
      const statusCode = body.status_code ?? "";
      const grossAmount = body.gross_amount ?? "";
      const signature = body.signature_key ?? "";

      if (!orderId || !statusCode || !grossAmount || !signature) {
        return { ok: false, reason: "WEBHOOK_FIELDS_MISSING" };
      }

      const expected = createHash("sha512")
        .update(`${orderId}${statusCode}${grossAmount}${key}`)
        .digest("hex");

      if (!constantTimeEqual(signature, expected)) {
        return { ok: false, reason: "WEBHOOK_SIGNATURE_INVALID" };
      }

      const transactionStatus = body.transaction_status ?? "";
      const fraudStatus = body.fraud_status ?? "";
      const paid =
        (transactionStatus === "capture" && fraudStatus === "accept") ||
        transactionStatus === "settlement";

      const amount = Math.round(Number(grossAmount));
      const event: NormalizedGatewayEvent = {
        provider: PROVIDER,
        // eventId stabil: transaction_id, fallback order_id+status.
        eventId: body.transaction_id ?? `${orderId}:${transactionStatus}`,
        eventType: transactionStatus || "payment.notification",
        attemptId: orderId, // order_id dipetakan ke attemptId
        providerTransactionId: body.transaction_id ?? orderId,
        amount: Number.isFinite(amount) ? amount : 0,
        paid,
      };

      return { ok: true, event };
    },

    async createCharge(input: CreateChargeInput): Promise<CreateChargeResult> {
      const key = serverKey();
      if (!key) {
        throw new Error("MIDTRANS_SERVER_KEY_MISSING");
      }

      const auth = Buffer.from(`${key}:`).toString("base64");
      const payload = {
        payment_type: "qris",
        transaction_details: {
          order_id: input.attemptId,
          gross_amount: input.amount,
        },
        customer_details: {
          first_name: input.clientName,
          phone: input.clientPhone,
        },
        item_details: [
          {
            id: input.installmentId,
            price: input.amount,
            quantity: 1,
            name: input.description.slice(0, 50),
          },
        ],
      };

      const res = await fetch(`${baseUrl()}/charge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`MIDTRANS_CHARGE_FAILED: ${res.status} ${text}`.trim());
      }

      const data = (await res.json()) as {
        transaction_id?: string;
        qr_string?: string;
        actions?: Array<{ name?: string; url?: string }>;
      };

      const qrUrl = data.actions?.find((a) => a.name === "generate-qr-code")?.url;
      return {
        providerTransactionId: data.transaction_id ?? input.attemptId,
        qrString: data.qr_string,
        paymentUrl: qrUrl,
        status: "PENDING",
        raw: data,
      };
    },
  };
}
