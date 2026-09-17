#!/usr/bin/env node
/**
 * HariKita — CC0 Backsound Fetcher
 *
 * Mengunduh track backsound dari AUDIO_MANIFEST, memverifikasi sha256,
 * menolak entri non-CC0, lalu menulis catatan lisensi ke public/audio/LICENSES.md.
 *
 * Pemakaian:
 *   node scripts/fetch-cc0-audio.mjs            # unduh yang belum ada
 *   node scripts/fetch-cc0-audio.mjs --force    # unduh ulang semua
 *   node scripts/fetch-cc0-audio.mjs --verify   # hanya verifikasi sha256
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DEST_DIR = join(ROOT, "public", "audio", "backsound");
const LICENSES_PATH = join(ROOT, "public", "audio", "LICENSES.md");
const MANIFEST_PATH = join(ROOT, "src", "lib", "sound", "audioManifest.ts");

const ALLOWED = new Set(["CC0-1.0", "Public-Domain"]);
const args = new Set(process.argv.slice(2));
const FORCE = args.has("--force");
const VERIFY_ONLY = args.has("--verify");

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

async function loadManifest() {
  const src = await readFile(MANIFEST_PATH, "utf8");
  // Ambil objek literal di dalam AUDIO_MANIFEST = [ ... ];
  // Lewati anotasi tipe (mis. `AudioManifestEntry[]`): cari `=` dulu,
  // baru `[` pertama sesudahnya.
  const start = src.indexOf("AUDIO_MANIFEST");
  const assign = src.indexOf("=", start);
  const eq = src.indexOf("[", assign);
  const end = src.lastIndexOf("];");
  const arrayLiteral = src.slice(eq, end + 1);

  // Ubah literal TS (objek literal dgn kunci tanpa tanda kutip) menjadi JSON.
  const jsonish = arrayLiteral
    .replace(/,\s*([\]}])/g, "$1")
    .replace(/'/g, '"')
    .replace(/([,{]\s*)([A-Za-z_$][A-Za-z0-9_$]*)\s*:/g, '$1"$2":');
  return JSON.parse(jsonish);
}

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function fetchBuffer(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const manifest = await loadManifest();
  if (!Array.isArray(manifest) || manifest.length === 0) {
    throw new Error("AUDIO_MANIFEST kosong atau tidak terbaca.");
  }

  // Guardrail lisensi — berlaku di --verify maupun unduhan.
  for (const e of manifest) {
    if (!ALLOWED.has(e.license)) {
      throw new Error(`Ditolak: track ${e.id} berlisensi "${e.license}" (hanya CC0-1.0 / Public-Domain).`);
    }
    if (String(e.file ?? e.filename ?? "").includes("http") === false && !e.filename) {
      throw new Error(`Track ${e.id} tidak punya filename.`);
    }
  }

  await mkdir(DEST_DIR, { recursive: true });

  const records = [];
  for (const e of manifest) {
    const dest = join(DEST_DIR, e.filename);
    let buf;

    if (VERIFY_ONLY || (await exists(dest) && !FORCE)) {
      buf = await readFile(dest);
    } else {
      if (String(e.sourceUrl).includes("example.com")) {
        console.warn(`[skip] ${e.id}: sourceUrl masih placeholder (${e.sourceUrl}). Isi dulu sumber CC0 asli.`);
        records.push({ ...e, present: false });
        continue;
      }
      console.log(`[get ] ${e.id} <- ${e.sourceUrl}`);
      buf = await fetchBuffer(e.sourceUrl);
      await writeFile(dest, buf);
    }

    const digest = sha256(buf);
    const recorded = /^[a-f0-9]{64}$/.test(e.sha256) && e.sha256 !== "0".repeat(64);
    if (recorded && digest !== e.sha256) {
      throw new Error(`sha256 mismatch untuk ${e.id}: tercatat ${e.sha256}, aktual ${digest}`);
    }
    records.push({ ...e, present: true, actualSha256: digest });
  }

  const lines = [
    "# Backsound Audio Licenses",
    "",
    "Seluruh backtrack di bawah ini berlisensi **CC0-1.0 / Public Domain** — bebas",
    "digunakan komersial tanpa atribusi. File di-self-host di `public/audio/backsound/`.",
    "",
    "| Track ID | Title | Mood | License | Author | Source | Retrieved | SHA-256 |",
    "|---|---|---|---|---|---|---|---|",
  ];
  for (const r of records) {
    if (!r.present) {
      lines.push(`| ${r.id} | ${r.title} | ${r.mood} | ${r.license} | ${r.author} | ${r.sourceUrl} | ${r.retrievedAt} | _(belum diunduh)_ |`);
    } else {
      lines.push(`| ${r.id} | ${r.title} | ${r.mood} | ${r.license} | ${r.author} | ${r.sourceUrl} | ${r.retrievedAt} | \`${r.actualSha256}\` |`);
    }
  }
  lines.push("", "> Dihasilkan otomatis oleh `scripts/fetch-cc0-audio.mjs`. Jangan edit manual.");
  await writeFile(LICENSES_PATH, lines.join("\n") + "\n", "utf8");

  console.log(`\nOK. ${records.filter((r) => r.present).length}/${records.length} track siap.`);
  console.log(`Lisensi ditulis ke ${LICENSES_PATH}`);
}

main().catch((err) => {
  console.error("GAGAL:", err.message);
  process.exit(1);
});
