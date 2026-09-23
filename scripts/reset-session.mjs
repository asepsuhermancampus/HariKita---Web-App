/**
 * HariKita — Reset semua session (untuk testing).
 *
 * Sesi login disimpan di cookie browser & ditandatangani dengan
 * HARIKITA_SESSION_SECRET. Dengan MENGGANTI secret ini, semua cookie sesi lama
 * menjadi TIDAK VALID (signature mismatch) → efektif "logout semua" tanpa perlu
 * membersihkan cookie browser secara manual.
 *
 * Pakai:
 *   npm run reset-session
 * lalu restart `npm run dev` dan refresh browser.
 */
import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

const NEW_SECRET = randomBytes(48)
  .toString("base64")
  .replace(/\+/g, "-")
  .replace(/\//g, "_")
  .replace(/=+$/, "");

const root = process.cwd();
const files = [".env", ".env.local"];

let updated = false;
for (const f of files) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) continue;
  let content = fs.readFileSync(p, "utf-8");
  const line = `HARIKITA_SESSION_SECRET="${NEW_SECRET}"`;
  if (/^HARIKITA_SESSION_SECRET=.*$/m.test(content)) {
    content = content.replace(/^HARIKITA_SESSION_SECRET=.*$/m, line);
  } else {
    content += `\n# Rotated by reset-session (semua sesi lama invalid)\n${line}\n`;
  }
  fs.writeFileSync(p, content, "utf-8");
  updated = true;
  console.log(`✅ Diperbarui: ${f}`);
}

if (!updated) {
  console.log("⚠️  Tidak ada .env / .env.local. Set manual HARIKITA_SESSION_SECRET.");
  process.exit(1);
}

console.log("");
console.log("🔐 HARIKITA_SESSION_SECRET dirotasi -> semua sesi lama TIDAK VALID.");
console.log("   Langkah selanjutnya:");
console.log("   1. Hentikan dev server (Ctrl+C)");
console.log("   2. npm run dev");
console.log("   3. Refresh browser (Ctrl+Shift+R) — Anda akan diminta login ulang.");
