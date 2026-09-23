import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const nav = readFileSync(path.join(root, "src/components/dashboard/nav-config.ts"), "utf-8");

test("nav config covers all role routes", () => {
  const routes = [
    "/admin", "/admin/verifikasi", "/admin/escrow", "/admin/dispute",
    "/admin/ba", "/admin/kalender", "/admin/audit-konten", "/admin/pengaturan",
    "/dashboard/vendor", "/dashboard/vendor/inbox", "/dashboard/vendor/kalender",
    "/dashboard/vendor/dompet", "/dashboard/vendor/paket", "/dashboard/vendor/portofolio",
    "/dashboard/vendor/profil",
    "/dashboard/ba", "/dashboard/ba/vendor", "/dashboard/ba/komisi", "/dashboard/ba/dompet",
    "/client", "/client/pesanan", "/client/jadwal", "/client/undangan", "/client/profil",
  ];
  for (const r of routes) assert.ok(nav.includes(r), `missing ${r}`);
});

test("nav config uses icon names (strings), no emoji", () => {
  // icon disimpan sebagai nama string (aman serialisasi server→client)
  assert.match(nav, /icon:\s*"/);
  assert.doesNotMatch(nav, /[\u{1F300}-\u{1FAFF}]/u);
});
