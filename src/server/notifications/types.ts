/**
 * HariKita - Notification Channel Adapter Contract
 *
 * Kontrak provider notifikasi (WhatsApp/email). Sama polanya dengan payment
 * adapter: abstraksi agar service tidak bergantung SDK/provider tertentu.
 *
 * Prinsip (Phase 1D): panggilan jaringan eksternal terjadi DI LUAR transaksi DB.
 */

export type NotificationChannel = "WHATSAPP" | "EMAIL" | "IN_APP";

export interface SendMessageInput {
  to: string; // nomor HP (WA) atau email
  body: string;
  subject?: string; // untuk email
  meta?: Record<string, string>;
}

export interface SendMessageResult {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
}

export interface NotificationAdapter {
  readonly channel: NotificationChannel;
  /**
   * Mengirim satu pesan. Harus aman dipanggil tanpa konfigurasi (mock mode)
   * agar pilot tetap jalan — mengembalikan `ok: true` dengan providerMessageId
   * simulasi.
   */
  send(input: SendMessageInput): Promise<SendMessageResult>;
}
