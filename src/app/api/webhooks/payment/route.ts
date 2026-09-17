import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { persistWebhookEvent, processWebhookEvent } from "@/server/services/payment-webhook-service";
import { getGatewayAdapter } from "@/server/payments/registry";
import type { GatewayProvider } from "@/server/payments/types";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/rate-limit";

/**
 * HariKita - Payment Webhook Route Handler
 *
 * POST /api/webhooks/payment?provider=midtrans|xendit|simulated_qris
 *
 * Model dua fase (Phase 1D §5):
 *   Fase A — persist event (idempotent via @@unique[provider,eventId]).
 *   Fase B — proses finansial (Serializable, via PaymentService).
 *
 * Keamanan:
 *   - Verifikasi signature dilakukan OLEH ADAPTER provider masing-masing
 *     (Midtrans: SHA512; Xendit: x-callback-token; simulated: HMAC/sandbox),
 *     SEBELUM menyentuh database.
 *   - Provider ditentukan via query `?provider=` (default dari env).
 *
 * Respons HTTP (Phase 1D §13):
 *   200 — sukses / duplikat / penolakan bisnis permanen / event non-sukses.
 *   401 — signature invalid.
 *   400 — payload tidak valid.
 *   503 — contention sementara (gateway boleh retry).
 *   500 — error sistem tak terduga (gateway boleh retry).
 */

export const dynamic = "force-dynamic";

const VALID_PROVIDERS: GatewayProvider[] = ["midtrans", "xendit", "simulated_qris"];

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate limit dasar (60 permintaan / menit per IP). Process-local; lihat catatan.
  const ip = clientIpFromHeaders(request.headers);
  const rl = checkRateLimit({ key: `webhook:${ip}`, limit: 60, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  const url = new URL(request.url);
  const providerParam = url.searchParams.get("provider");
  const provider: GatewayProvider =
    providerParam && VALID_PROVIDERS.includes(providerParam as GatewayProvider)
      ? (providerParam as GatewayProvider)
      : "simulated_qris";

  const rawBody = await request.text();

  // 1. Verifikasi signature via adapter (di luar DB).
  let adapter;
  try {
    adapter = getGatewayAdapter(provider);
  } catch {
    return NextResponse.json({ success: false, error: "UNKNOWN_GATEWAY_PROVIDER" }, { status: 400 });
  }

  const verification = await adapter.verifyWebhook(request.headers, rawBody);
  if (!verification.ok || !verification.event) {
    return NextResponse.json(
      { success: false, error: verification.reason ?? "WEBHOOK_SIGNATURE_INVALID" },
      { status: 401 }
    );
  }

  const event = verification.event;

  // Event non-sukses (mis. pending/expired) → catat idempotent, tidak memproses finansial.
  if (!event.paid) {
    await persistWebhookEvent({
      provider: event.provider,
      eventId: event.eventId,
      eventType: event.eventType,
      payload: JSON.stringify(event),
    });
    return NextResponse.json({ success: true, status: "NON_PAID_EVENT_IGNORED" }, { status: 200 });
  }

  try {
    const persisted = await persistWebhookEvent({
      provider: event.provider,
      eventId: event.eventId,
      eventType: event.eventType,
      payload: JSON.stringify(event),
    });

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
    console.error("[webhook/payment] unexpected error:", error);
    return NextResponse.json({ success: false, error: "UNEXPECTED_SYSTEM_ERROR" }, { status: 500 });
  }
}
