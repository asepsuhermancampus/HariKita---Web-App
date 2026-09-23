/**
 * Uji kirim email OTP via Resend (mode produksi).
 *
 * Pakai:
 *   npx tsx scripts/test-resend-email.ts alamat@email.com
 *
 * Membaca RESEND_API_KEY & OTP_EMAIL_FROM dari environment (.env / .env.local).
 * Cara termudah: pastikan sudah `npm run dev` minimal sekali, atau jalankan
 * dengan variabel yang dimuat. Skrip ini memuat .env.local secara manual.
 */
import fs from "node:fs";
import path from "node:path";

// Muat .env lalu .env.local (override) agar sama seperti runtime Next.js.
function loadEnv(file: string) {
  const p = path.join(process.cwd(), file);
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf-8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}
loadEnv(".env");
loadEnv(".env.local");

async function main() {
  const to = process.argv[2];
  if (!to) {
    console.error("Pakai: npx tsx scripts/test-resend-email.ts alamat@email.com");
    process.exit(1);
  }

  const key = process.env.RESEND_API_KEY;
  const devMode = process.env.OTP_DEV_MODE === "true";

  console.log("RESEND_API_KEY terisi:", key ? `ya (${key.slice(0, 6)}..., ${key.length} char)` : "TIDAK ❌");
  console.log("OTP_EMAIL_FROM:", process.env.OTP_EMAIL_FROM ?? "(default)");
  console.log("OTP_DEV_MODE:", process.env.OTP_DEV_MODE ?? "(tidak diset)");

  if (!key) {
    console.error("\n❌ RESEND_API_KEY kosong. Isi dulu di .env.local.");
    process.exit(1);
  }
  if (devMode) {
    console.error('\n❌ OTP_DEV_MODE="true" — masih mode dev. Set ke "false" di .env.local.');
    process.exit(1);
  }

  // Impor dinamis setelah env dimuat.
  const { sendOtpEmail } = await import("../src/server/services/email-service");
  const code = "123456";
  console.log(`\nMengirim email OTP ke ${to} ...`);
  const res = await sendOtpEmail(to, code, "REGISTER");
  console.log("Hasil:", JSON.stringify(res));
  if (res.sent) {
    console.log("\n✅ Email terkirim. Cek inbox (dan folder spam) " + to);
  } else {
    console.log("\n❌ Email TIDAK terkirim. Cek pesan error di log di atas.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
