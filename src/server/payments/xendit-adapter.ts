import type {
  CreateChargeInput,
  CreateChargeResult,
  GatewayProvider,
  PaymentGatewayAdapter,
  NormalizedGatewayEvent,
  VerifyWebhookResult,
} from "./types";

/**
 * HariKita - Xendit Adapter
 *
 * Verifikasi webhook Xendit: header `x-callback-token` harus sama dengan
 * `XENDIT_CALLBACK_TOKEN` (constant-time compare).
 *
 * Env:
 *   XENDIT_SECRET_KEY      — API secret key
 *   XENDIT_CALLBACK_TOKEN  — token verifikasi webhook
 *   XENDIT_API_URL         — override base URL (opsional)
 *
 * Pemetaan: `external_id`/`reference_id` dipetakan ke `attemptId` HariKita.
 */

const PROVIDER: GatewayProvider = "xendit";

function secretKey(): string {
  return process.env.XENDIT_SECRET_KEY ?? "";
}

function callbackToken(): string {
  return process.env.XENDIT_CALLBACK_TOKEN ?? "";
}

function baseUrl(): string {
  return process.env.XENDIT_API_URL ?? "https://api.xendit.co";
}

interface XenditCallback {
  id?: string;
  external_id?: string;
  reference_id?: string;
  status?: string;
  amount?: number;
  paid_amount?: number;
  payment_method?: string;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function createXenditAdapter(): PaymentGatewayAdapter {
  return {
    provider: PROVIDER,

    async verifyWebhook(headers: Headers, rawBody: string): Promise<VerifyWebhookResult> {
      const expected = callbackToken();
      if (!expected) {
        return { ok: false, reason: "XENDIT_CALLBACK_TOKEN_MISSING" };
      }
      const provided = headers.get("x-callback-token") ?? "";
      if (!constantTimeEqual(provided, expected)) {
        return { ok: false, reason: "WEBHOOK_SIGNATURE_INVALID" };
      }

      let body: XenditCallback;
      try {
        body = JSON.parse(rawBody) as XenditCallback;
      } catch {
        return { ok: false, reason: "INVALID_JSON" };
      }

      const attemptId = body.external_id ?? body.reference_id ?? "";
      if (!attemptId) {
        return { ok: false, reason: "WEBHOOK_FIELDS_MISSING" };
      }

      const status = (body.status ?? "").toUpperCase();
      const paid = status === "PAID" || status === "SETTLED" || status === "SUCCEEDED";

      const event: NormalizedGatewayEvent = {
        provider: PROVIDER,
        eventId: body.id ?? `${attemptId}:${status}`,
        eventType: status || "payment.callback",
        attemptId,
        providerTransactionId: body.id ?? attemptId,
        amount: body.paid_amount ?? body.amount ?? 0,
        paid,
      };
      return { ok: true, event };
    },

    async createCharge(input: CreateChargeInput): Promise<CreateChargeResult> {
      const key = secretKey();
      if (!key) {
        throw new Error("XENDIT_SECRET_KEY_MISSING");
      }

      const auth = Buffer.from(`${key}:`).toString("base64");
      const payload = {
        external_id: input.attemptId,
        amount: input.amount,
        description: input.description,
        payment_method: "QRIS",
        customer: {
          given_names: input.clientName,
          mobile_number: input.clientPhone,
        },
      };

      const res = await fetch(`${baseUrl()}/qr_codes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
          "api-version": "2022-07-31",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`XENDIT_CHARGE_FAILED: ${res.status} ${text}`.trim());
      }

      const data = (await res.json()) as {
        id?: string;
        qr_string?: string;
        status?: string;
      };

      return {
        providerTransactionId: data.id ?? input.attemptId,
        qrString: data.qr_string,
        status: "PENDING",
        raw: data,
      };
    },
  };
}
