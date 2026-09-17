import type { NotificationAdapter, SendMessageInput, SendMessageResult } from "./types";

/**
 * HariKita - Email Adapter (Resend-compatible)
 *
 * Env:
 *   EMAIL_PROVIDER_URL  — endpoint (default Resend)
 *   EMAIL_API_KEY       — API key
 *   EMAIL_FROM          — alamat pengirim
 *
 * Bila API key tidak diset → mode mock (ok), agar pilot tetap berjalan.
 */

export function createEmailAdapter(): NotificationAdapter {
  return {
    channel: "EMAIL",

    async send(input: SendMessageInput): Promise<SendMessageResult> {
      const apiKey = process.env.EMAIL_API_KEY;
      const url = process.env.EMAIL_PROVIDER_URL ?? "https://api.resend.com/emails";
      const from = process.env.EMAIL_FROM ?? "HariKita <no-reply@harikita.id>";

      if (!apiKey) {
        return { ok: true, providerMessageId: `MOCK-EMAIL-${Date.now()}` };
      }

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: input.to,
            subject: input.subject ?? "Notifikasi HariKita",
            text: input.body,
          }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          return { ok: false, error: `EMAIL_SEND_FAILED: ${res.status} ${text}`.trim() };
        }

        const data = (await res.json().catch(() => ({}))) as { id?: string };
        return { ok: true, providerMessageId: data.id ?? `EMAIL-${Date.now()}` };
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : String(error) };
      }
    },
  };
}
