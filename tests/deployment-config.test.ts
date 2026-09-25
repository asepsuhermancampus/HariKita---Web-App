import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { derivePaymentStatus } from "../src/server/queries/orders";

test("Vercel build deploys pending Prisma migrations before Next.js build", () => {
  const config = JSON.parse(
    readFileSync(path.join(process.cwd(), "vercel.json"), "utf8")
  ) as { buildCommand?: string };

  assert.equal(
    config.buildCommand,
    "npm run vercel:build"
  );
});

test("client dashboard routes do not fall back to fabricated account data", () => {
  const read = (file: string) => readFileSync(path.join(process.cwd(), file), "utf8");
  const orders = read("src/app/client/pesanan/ClientOrdersList.tsx");
  const schedule = read("src/app/client/jadwal/ClientJadwalClient.tsx");
  const invitations = read("src/app/client/undangan/page.tsx");

  assert.doesNotMatch(orders, /useOrders|mockOrders/);
  assert.doesNotMatch(schedule, /HKB-2026-001|ses-1|Alula MUA/);
  assert.doesNotMatch(invitations, /Bima & Citra|Rp 4\.850\.000|Keluarga Besar Bpk/);
});

test("client payment status follows paid installments, not optimistic order labels", () => {
  assert.equal(derivePaymentStatus("PENDING_CONFIRMATION", []), "UNPAID");
  assert.equal(
    derivePaymentStatus("IN_PROGRESS", [
      { type: "DP_30", status: "PAID" },
      { type: "SETTLEMENT_70", status: "PENDING" },
    ]),
    "DP_PAID"
  );
  assert.equal(
    derivePaymentStatus("FULLY_PAID", [
      { type: "DP_30", status: "PAID" },
      { type: "SETTLEMENT_70", status: "PAID" },
    ]),
    "FULLY_PAID"
  );
  assert.equal(
    derivePaymentStatus("REFUNDED", [{ type: "FULL_100", status: "PAID" }]),
    "UNPAID"
  );
});

test("Vercel preview builds cannot migrate the production database", () => {
  const pkg = JSON.parse(readFileSync(path.join(process.cwd(), "package.json"), "utf8")) as {
    scripts: Record<string, string>;
  };
  const script = readFileSync(path.join(process.cwd(), "scripts/vercel_build.mjs"), "utf8");
  assert.equal(pkg.scripts["vercel:build"], "node scripts/vercel_build.mjs");
  assert.match(script, /VERCEL_ENV === "production"/);
  assert.match(script, /db:migrate:deploy/);
});
