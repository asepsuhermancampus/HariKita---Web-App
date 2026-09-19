import { Resend } from "resend";

/**
 * HariKita - Email Service
 *
 * Membungkus Resend untuk pengiriman OTP & notifikasi PIN. Bila
 * `RESEND_API_KEY` kosong ATAU `OTP_DEV_MODE === "true"`, email TIDAK
 * dikirim; kode dikembalikan sebagai `devCode` dan di-log ke console server
 * agar alur dapat diuji tanpa email asli.
 */

export interface SendResult {
  sent: boolean;
  devMode: boolean;
  devCode?: string;
}

/** True bila sedang mode dev (tanpa kirim email asli). */
export function isDevMode(): boolean {
  return !process.env.RESEND_API_KEY || process.env.OTP_DEV_MODE === "true";
}

function fromAddress(): string {
  return process.env.OTP_EMAIL_FROM || "HariKita <onboarding@resend.dev>";
}

/** Template HTML bergaya HariKita (ivory / champagne / charcoal). */
function wrapEmail(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html><html lang="id"><body style="margin:0;background:#F8F6F1;font-family:Manrope,Arial,sans-serif;color:#2B2B2B;">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
    <div style="text-align:center;font-family:Georgia,serif;font-size:30px;font-weight:bold;color:#2B2B2B;letter-spacing:1px;">HariKita</div>
    <div style="height:3px;width:64px;background:#C9A88A;border-radius:3px;margin:12px auto 24px;"></div>
    <div style="background:#ffffff;border:1px solid #E8DED1;border-radius:16px;padding:28px 24px;">
      <h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 12px;color:#2B2B2B;">${title}</h1>
      ${bodyHtml}
    </div>
    <p style="font-size:11px;color:#8a8078;text-align:center;margin-top:20px;">Email otomatis dari HariKita — jangan balas pesan ini.</p>
  </div>
</body></html>`;
}

/** Kirim kode OTP 6-digit ke email. */
export async function sendOtpEmail(
  to: string,
  code: string,
  purpose: "REGISTER" | "RESET_PIN"
): Promise<SendResult> {
  if (isDevMode()) {
    console.log(`[OTP][DEV] ${purpose} → ${to} | kode: ${code}`);
    return { sent: false, devMode: true, devCode: code };
  }

  const title = purpose === "REGISTER" ? "Verifikasi Pendaftaran" : "Reset PIN";
  const html = wrapEmail(
    title,
    `<p style="font-size:13px;line-height:1.6;">Gunakan kode berikut untuk melanjutkan. Kode berlaku <strong>5 menit</strong>:</p>
     <div style="font-family:Consolas,monospace;font-size:34px;font-weight:bold;letter-spacing:8px;text-align:center;background:#F8F6F1;border:1px dashed #C9A88A;border-radius:12px;padding:18px;margin:16px 0;color:#88735B;">${code}</div>
     <p style="font-size:12px;color:#8a8078;">Jika Anda tidak meminta kode ini, abaikan email ini.</p>`
  );

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: fromAddress(),
      to,
      subject: `Kode OTP HariKita — ${title}`,
      html,
    });
    if (error) {
      console.error("[email-service] Resend error:", error);
      return { sent: false, devMode: false };
    }
    return { sent: true, devMode: false };
  } catch (err) {
    console.error("[email-service] Gagal mengirim OTP:", err);
    return { sent: false, devMode: false };
  }
}

/** Kirim notifikasi PIN berhasil diubah. */
export async function sendPinChangedEmail(to: string, name: string): Promise<SendResult> {
  const html = wrapEmail(
    "PIN Berhasil Diubah",
    `<p style="font-size:13px;line-height:1.6;">Halo ${name}, PIN akun HariKita Anda baru saja diubah.</p>
     <p style="font-size:12px;color:#8a8078;">Jika ini bukan Anda, segera hubungi tim HariKita.</p>`
  );
  if (isDevMode()) {
    console.log(`[EMAIL][DEV] PIN changed → ${to}`);
    return { sent: false, devMode: true };
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: fromAddress(),
      to,
      subject: "PIN HariKita Berhasil Diubah",
      html,
    });
    if (error) {
      console.error("[email-service] Resend error:", error);
      return { sent: false, devMode: false };
    }
    return { sent: true, devMode: false };
  } catch (err) {
    console.error("[email-service] Gagal mengirim notifikasi PIN:", err);
    return { sent: false, devMode: false };
  }
}
