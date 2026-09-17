import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createHash, createHmac } from "node:crypto";

/**
 * Payment adapter tests — verifikasi signature & normalisasi payload.
 * Tidak memanggil jaringan; hanya menguji `verifyWebhook` (murni).
 */

import { createSimulatedAdapter } from "../src/server/payments/simulated-adapter";
import { createMidtransAdapter } from "../src/server/payments/midtrans-adapter";
import { createMidtransSnapAdapter } from "../src/server/payments/midtrans-snap-adapter";
import { createXenditAdapter } from "../src/server/payments/xendit-adapter";
import { getGatewayAdapter, getDefaultProvider } from "../src/server/payments/registry";

const ENV_KEYS = [
  "HARIKITA_WEBHOOK_SECRET",
  "MIDTRANS_SERVER_KEY",
  "MIDTRANS_IS_PRODUCTION",
  "XENDIT_CALLBACK_TOKEN",
  "XENDIT_SECRET_KEY",
  "HARIKITA_PAYMENT_PROVIDER",
] as const;

const saved: Record<string, string | undefined> = {};
before(() => {
  for (const k of ENV_KEYS) saved[k] = process.env[k];
});
after(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

function headers(map: Record<string, string>): Headers {
  return new Headers(map);
}

// ── Simulated adapter ────────────────────────────────────────────────────────
test("simulated: sandbox header accepted when no secret configured", async () => {
  delete process.env.HARIKITA_WEBHOOK_SECRET;
  const adapter = createSimulatedAdapter();
  const res = await adapter.verifyWebhook(headers({ "x-harikita-sandbox": "true" }), "{}");
  assert.equal(res.ok, true);
});

test("simulated: rejected without sandbox header when no secret", async () => {
  delete process.env.HARIKITA_WEBHOOK_SECRET;
  const adapter = createSimulatedAdapter();
  const res = await adapter.verifyWebhook(headers({}), "{}");
  assert.equal(res.ok, false);
});

test("simulated: HMAC verified when secret configured", async () => {
  process.env.HARIKITA_WEBHOOK_SECRET = "test-secret";
  const adapter = createSimulatedAdapter();
  const body = '{"x":1}';
  const sig = createHmac("sha256", "test-secret").update(body).digest("hex");
  const good = await adapter.verifyWebhook(headers({ "x-harikita-signature": sig }), body);
  assert.equal(good.ok, true);
  const bad = await adapter.verifyWebhook(headers({ "x-harikita-signature": "wrong" }), body);
  assert.equal(bad.ok, false);
});

// ── Midtrans adapter ─────────────────────────────────────────────────────────
test("midtrans: valid SHA512 signature verified and normalized", async () => {
  process.env.MIDTRANS_SERVER_KEY = "SB-Mid-server-test";
  const adapter = createMidtransAdapter();

  const orderId = "attempt_abc123";
  const statusCode = "200";
  const grossAmount = "5230500.00";
  const signature = createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}SB-Mid-server-test`)
    .digest("hex");

  const body = JSON.stringify({
    transaction_id: "txn-999",
    order_id: orderId,
    status_code: statusCode,
    gross_amount: grossAmount,
    signature_key: signature,
    transaction_status: "settlement",
    fraud_status: "accept",
  });

  const res = await adapter.verifyWebhook(headers({}), body);
  assert.equal(res.ok, true);
  assert.equal(res.event?.paid, true);
  assert.equal(res.event?.attemptId, orderId);
  assert.equal(res.event?.providerTransactionId, "txn-999");
  assert.equal(res.event?.amount, 5_230_500);
});

test("midtrans: invalid signature rejected", async () => {
  process.env.MIDTRANS_SERVER_KEY = "SB-Mid-server-test";
  const adapter = createMidtransAdapter();
  const body = JSON.stringify({
    order_id: "abc",
    status_code: "200",
    gross_amount: "1000.00",
    signature_key: "deadbeef",
    transaction_status: "settlement",
  });
  const res = await adapter.verifyWebhook(headers({}), body);
  assert.equal(res.ok, false);
});

test("midtrans: pending status is not marked paid", async () => {
  process.env.MIDTRANS_SERVER_KEY = "key";
  const adapter = createMidtransAdapter();
  const gross = "1000.00";
  const sig = createHash("sha512").update(`o1${"201"}${gross}key`).digest("hex");
  const body = JSON.stringify({
    order_id: "o1",
    status_code: "201",
    gross_amount: gross,
    signature_key: sig,
    transaction_status: "pending",
  });
  const res = await adapter.verifyWebhook(headers({}), body);
  assert.equal(res.ok, true);
  assert.equal(res.event?.paid, false);
});

// ── Xendit adapter ───────────────────────────────────────────────────────────
test("xendit: valid callback token verified", async () => {
  process.env.XENDIT_CALLBACK_TOKEN = "cb-token-123";
  const adapter = createXenditAdapter();
  const body = JSON.stringify({
    id: "qr_123",
    external_id: "attempt_xyz",
    status: "PAID",
    amount: 2000000,
  });
  const res = await adapter.verifyWebhook(headers({ "x-callback-token": "cb-token-123" }), body);
  assert.equal(res.ok, true);
  assert.equal(res.event?.paid, true);
  assert.equal(res.event?.attemptId, "attempt_xyz");
  assert.equal(res.event?.amount, 2_000_000);
});

test("xendit: wrong/missing callback token rejected", async () => {
  process.env.XENDIT_CALLBACK_TOKEN = "cb-token-123";
  const adapter = createXenditAdapter();
  const res = await adapter.verifyWebhook(headers({ "x-callback-token": "nope" }), "{}");
  assert.equal(res.ok, false);
});

// ── Registry ─────────────────────────────────────────────────────────────────
test("registry returns the correct adapter per provider", () => {
  assert.equal(getGatewayAdapter("midtrans").provider, "midtrans");
  assert.equal(getGatewayAdapter("xendit").provider, "xendit");
  assert.equal(getGatewayAdapter("simulated_qris").provider, "simulated_qris");
});

test("getDefaultProvider falls back to simulated_qris", () => {
  delete process.env.HARIKITA_PAYMENT_PROVIDER;
  assert.equal(getDefaultProvider(), "simulated_qris");
  process.env.HARIKITA_PAYMENT_PROVIDER = "midtrans";
  assert.equal(getDefaultProvider(), "midtrans");
});

// ── Midtrans Snap adapter ────────────────────────────────────────────────────
test("midtrans-snap: valid SHA512 signature verified and normalized", async () => {
  process.env.MIDTRANS_SERVER_KEY = "SB-Mid-server-snap";
  const adapter = createMidtransSnapAdapter();
  const orderId = "attempt_snap1";
  const statusCode = "200";
  const grossAmount = "1000000.00";
  const signature = createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}SB-Mid-server-snap`)
    .digest("hex");

  const res = await adapter.verifyWebhook(
    headers({}),
    JSON.stringify({
      transaction_id: "snap-txn-1",
      order_id: orderId,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signature,
      transaction_status: "settlement",
      fraud_status: "accept",
    })
  );
  assert.equal(res.ok, true);
  assert.equal(res.event?.paid, true);
  assert.equal(res.event?.attemptId, orderId);
  assert.equal(res.event?.amount, 1_000_000);
});

test("midtrans-snap: invalid signature rejected", async () => {
  process.env.MIDTRANS_SERVER_KEY = "SB-Mid-server-snap";
  const adapter = createMidtransSnapAdapter();
  const res = await adapter.verifyWebhook(
    headers({}),
    JSON.stringify({
      order_id: "x",
      status_code: "200",
      gross_amount: "1000.00",
      signature_key: "bad",
      transaction_status: "settlement",
    })
  );
  assert.equal(res.ok, false);
});
