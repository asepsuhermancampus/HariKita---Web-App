import type { NotificationAdapter, SendMessageInput, SendMessageResult } from "./types";

/**
 * HariKita - WhatsApp Adapter (Fonnte-compatible)
 *
 * Env:
 *   WHATSAPP_PROVIDER_URL  — endpoint kirim (default Fonnte)
 *   WHATSAPP_API_TOKEN     — token provider
 *
 * Bila token tidak diset → mode mock (log + ok), agar pilot tetap berjalan.
 */

export function createWhatsAppAdapter(): NotificationAdapter {
  return {
    channel: "WHATSAPP",

    async send(input: SendMessageInput): Promise<SendMessageResult> {
      const token = process.env.WHATSAPP_API_TOKEN;
      const url = process.env.WHATSAPP_PROVIDER_URL ?? "https://api.fonnte.com/send";

      if (!token) {
        // Mode mock (pilot/dev).
        return { ok: true, providerMessageId: `MOCK-WA-${Date.now()}` };
      }

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ target: input.to, message: input.body }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          return { ok: false, error: `WHATSAPP_SEND_FAILED: ${res.status} ${text}`.trim() };
        }

        const data = (await res.json().catch(() => ({}))) as { id?: string | string[] };
        const id = Array.isArray(data.id) ? data.id[0] : data.id;
        return { ok: true, providerMessageId: id ?? `WA-${Date.now()}` };
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : String(error) };
      }
    },
  };
}
