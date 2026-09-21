import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const nav = readFileSync(path.join(root, "src/app/admin/AdminSidebarNav.tsx"), "utf-8");

test("sidebar lists all admin routes incl. pengaturan sederajat", () => {
  for (const href of [
    "/admin",
    "/admin/verifikasi",
    "/admin/escrow",
    "/admin/dispute",
    "/admin/ba",
    "/admin/kalender",
    "/admin/audit-konten",
    "/admin/pengaturan",
  ]) {
    assert.ok(nav.includes(href), `missing ${href}`);
  }
});

test("sidebar uses lucide icons, no emoji", () => {
  assert.match(nav, /from "lucide-react"/);
  assert.doesNotMatch(nav, /[\u{1F300}-\u{1FAFF}]/u);
});
