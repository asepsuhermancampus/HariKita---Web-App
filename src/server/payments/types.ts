/**
 * HariKita - Payment Gateway Adapter Contract
 *
 * Abstraksi provider pembayaran (Midtrans/Xendit/simulated) agar webhook route
 * dan Server Action tidak bergantung pada detail SDK/provider tertentu.
 *
 * Prinsip (Phase 1D):
 *  - Verifikasi signature dilakukan DI LUAR transaksi database.
 *  - Adapter hanya menormalkan payload → `NormalizedGatewayEvent`.
 *  - Tidak ada panggilan jaringan di dalam `withTransactionRetry`.
 */

export type GatewayProvider = "midtrans" | "xendit" | "simulated_qris";

/** Event webhook yang telah dinormalkan dari payload provider manapun. */
export interface NormalizedGatewayEvent {
  provider: GatewayProvider;
  /** ID unik event (untuk idempotency @@unique[provider,eventId]). */
  eventId: string;
  eventType: string;
  /** attemptId internal HariKita (dikirim sebagai order_id/metadata/reference_id). */
  attemptId: string;
  /** Referensi transaksi riil dari provider. */
  providerTransactionId: string;
  amount: number;
  /** true jika pembayaran sukses. */
  paid: boolean;
}

export interface VerifyWebhookResult {
  ok: boolean;
  reason?: string;
  event?: NormalizedGatewayEvent;
}

export interface PaymentGatewayAdapter {
  readonly provider: GatewayProvider;
  /**
   * Memverifikasi signature webhook & menormalkan payload.
   * Dipanggil SEBELUM menyentuh database.
   */
  verifyWebhook(headers: Headers, rawBody: string): Promise<VerifyWebhookResult>;
  /**
   * Membuat charge/transaksi di gateway. Mengembalikan referensi pembayaran.
   * Dipanggil DI LUAR transaksi DB (external network call).
   */
  createCharge(input: CreateChargeInput): Promise<CreateChargeResult>;
}

export interface CreateChargeInput {
  attemptId: string;
  installmentId: string;
  orderId: string;
  amount: number;
  clientName: string;
  clientPhone: string;
  description: string;
}

export interface CreateChargeResult {
  providerTransactionId: string;
  /** URL pembayaran / QRIS untuk ditampilkan ke klien (bila ada). */
  paymentUrl?: string;
  qrString?: string;
  /** Status awal setelah createCharge. */
  status: "PENDING" | "PAID" | "FAILED";
  raw?: unknown;
}
