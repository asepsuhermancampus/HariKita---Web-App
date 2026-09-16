import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { persistWebhookEvent, processWebhookEvent, type VerifiedWebhookPayload } from "@/server/services/payment-webhook-service";

/**
 * HariKita - Payment Webhook Route Handler (Phase 2)
 *
 * POST /api/webhooks/payment
 *
 * Model dua fase (Phase 1D v9 §5):
 *   Fase A — persist event (idempotent via @@unique[provider,eventId]).
 *   Fase B — proses finansial (Serializable, via PaymentService).
 *
 * Keamanan (pilot):
 *   - Signature diverifikasi via header `x-harikita-signature` terhadap
 *     `HARIKITA_WEBHOOK_SECRET`. Bila secret tidak diset, mode sandbox menerima
 *     header `x-harikita-sandbox: true` agar alur uji tetap berjalan.
 *   - Verifikasi dilakukan SEBELUM menyentuh database.
 *
 * Respons HTTP mengikuti klasifikasi error (Phase 1D §13):
 *   200 — sukses / duplikat / penolakan bisnis permanen.
 *   401 — signature invalid.
 *   400 — payload tidak valid.
 *   500 — error sistem tak terduga (gateway akan retry).
 */

export const dynamic = "force-dynamic";

interface WebhookBody {
  provider?: string;
  eventId?: string;
  eventType?: string;
  data?: {
    attemptId?: string;
    providerTransactionId?: string;
    amount?: number;
  };
}

async function verifySignature(request: NextRequest, rawBody: string): Promise<boolean> {
  const secret = process.env.HARIKITA_WEBHOOK_SECRET;
  const sandbox = request.headers.get("x-harikita-sandbox") === "true";

  // Mode sandbox eksplisit (pilot). Wajib secret kosong agar tidak membuka celah di produksi.
  if (!secret) {
    return sandbox;
  }

  const provided = request.headers.get("x-harikita-signature");
  if (!provided) return false;

  // HMAC-SHA256 hex dari raw body.
  const { createHmac, timingSafeEqual } = await import("node:crypto");
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rawBody = await request.text();

  // 1. Verifikasi signature (di luar DB).
  const signatureOk = await verifySignature(request, rawBody);
  if (!signatureOk) {
    return NextResponse.json(
      { success: false, error: "WEBHOOK_SIGNATURE_INVALID" },
      { status: 401 }
    );
  }

  // 2. Parse body.
  let body: WebhookBody;
  try {
    body = JSON.parse(rawBody) as WebhookBody;
  } catch {
    return NextResponse.json({ success: false, error: "INVALID_JSON" }, { status: 400 });
  }

  const provider = body.provider;
  const eventId = body.eventId;
  const eventType = body.eventType ?? "payment.success";
  const data = body.data;

  if (!provider || !eventId || !data?.attemptId || !data.providerTransactionId || typeof data.amount !== "number") {
    return NextResponse.json({ success: false, error: "INVALID_PAYLOAD" }, { status: 400 });
  }

  const payload: VerifiedWebhookPayload = {
    attemptId: data.attemptId,
    provider,
    providerTransactionId: data.providerTransactionId,
    amount: data.amount,
  };

  try {
    // Fase A — persist (idempotent).
    const persisted = await persistWebhookEvent({
      provider,
      eventId,
      eventType,
      payload: JSON.stringify(payload),
    });

    // Fase B — proses.
    const outcome = await processWebhookEvent(persisted.eventId);

    switch (outcome.status) {
      case "PROCESSED":
      case "ALREADY_PROCESSED":
      case "PERMANENT_REJECTION":
        return NextResponse.json({ success: true, status: outcome.status }, { status: 200 });
      case "TRANSIENT_ERROR":
        return NextResponse.json({ success: false, status: outcome.status }, { status: 503 });
      case "UNEXPECTED_ERROR":
      default:
        return NextResponse.json({ success: false, status: outcome.status }, { status: 500 });
    }
  } catch (error) {
    // Unexpected system error → gateway boleh retry.
    console.error("[webhook/payment] unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "UNEXPECTED_SYSTEM_ERROR" },
      { status: 500 }
    );
  }
}
