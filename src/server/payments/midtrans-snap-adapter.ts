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
 * HariKita - Midtrans Snap Adapter
 *
 * Menggunakan Snap API untuk pembayaran lengkap (QRIS semua e-wallet/bank,
 * Virtual Account/transfer bank, dll.) dengan UI pembayaran siap pakai Midtrans.
 *
 * Alur:
 *   1. createCharge → POST /snap/v1/transactions → dapat `token` + `redirect_url`.
 *   2. Frontend menampilkan Snap popup (snap.js) ATAU redirect ke redirect_url.
 *   3. Status final tetap masuk via webhook `/api/webhooks/payment?provider=midtrans`.
 *
 * Verifikasi webhook: signature SHA512(order_id + status_code + gross_amount + serverKey)
 * (sama seperti Midtrans Core/notifikasi standar).
 *
 * Env:
 *   MIDTRANS_SERVER_KEY / MIDTRANS_IS_PRODUCTION / MIDTRANS_API_URL
 */

const PROVIDER: GatewayProvider = "midtrans";

function serverKey(): string {
  return process.env.MIDTRANS_SERVER_KEY ?? "";
}

function isProduction(): boolean {
  return process.env.MIDTRANS_IS_PRODUCTION === "true";
}

/** Snap base URL (host API Snap, bukan Core API). */
function snapBaseUrl(): string {
  if (process.env.MIDTRANS_SNAP_URL) return process.env.MIDTRANS_SNAP_URL;
  return isProduction()
    ? "https://app.midtrans.com/snap/v1"
    : "https://app.sandbox.midtrans.com/snap/v1";
}

interface MidtransNotification {
  transaction_id?: string;
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  transaction_status?: string;
  fraud_status?: string;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function createMidtransSnapAdapter(): PaymentGatewayAdapter {
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
      if (!key) return { ok: false, reason: "MIDTRANS_SERVER_KEY_MISSING" };

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
        eventId: body.transaction_id ?? `${orderId}:${transactionStatus}`,
        eventType: transactionStatus || "payment.notification",
        attemptId: orderId,
        providerTransactionId: body.transaction_id ?? orderId,
        amount: Number.isFinite(amount) ? amount : 0,
        paid,
      };
      return { ok: true, event };
    },

    async createCharge(input: CreateChargeInput): Promise<CreateChargeResult> {
      const key = serverKey();
      if (!key) throw new Error("MIDTRANS_SERVER_KEY_MISSING");

      const auth = Buffer.from(`${key}:`).toString("base64");
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

      const payload = {
        transaction_details: {
          // order_id = attemptId internal (dipakai untuk signature & rekonsiliasi).
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
        // Aktifkan metode: QRIS semua e-wallet/bank + transfer bank (VA).
        enabled_payments: [
          "qris",
          "gopay",
          "shopeepay",
          "other_qris",
          "bca_va",
          "bni_va",
          "bri_va",
          "mandiri_bill",
          "permata_va",
          "echannel",
        ],
        callbacks: {
          finish: `${baseUrl}/pembayaran/${input.orderId}`,
          error: `${baseUrl}/pembayaran/${input.orderId}`,
        },
      };

      const res = await fetch(`${snapBaseUrl()}/transactions`, {
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
        throw new Error(`MIDTRANS_SNAP_FAILED: ${res.status} ${text}`.trim());
      }

      const data = (await res.json()) as { token?: string; redirect_url?: string };

      return {
        providerTransactionId: data.token ?? input.attemptId,
        paymentUrl: data.redirect_url,
        qrString: undefined,
        status: "PENDING",
        raw: data,
      };
    },
  };
}
