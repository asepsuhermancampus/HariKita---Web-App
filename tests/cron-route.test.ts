import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";

/**
 * Cron sweep route — auth guard tests.
 * Memverifikasi endpoint menolak akses tanpa/secret salah (tidak menjalankan sweep).
 */

import { GET, POST } from "../src/app/api/cron/sweep/route";

const saved: Record<string, string | undefined> = {};
before(() => {
  saved.HARIKITA_CRON_SECRET = process.env.HARIKITA_CRON_SECRET;
});
after(() => {
  if (saved.HARIKITA_CRON_SECRET === undefined) delete process.env.HARIKITA_CRON_SECRET;
  else process.env.HARIKITA_CRON_SECRET = saved.HARIKITA_CRON_SECRET;
});

function req(url: string, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(url, { method: "GET", headers });
}

test("cron: rejects when secret not configured (503-equivalent 401 guard)", async () => {
  delete process.env.HARIKITA_CRON_SECRET;
  const res = await GET(req("http://localhost/api/cron/sweep"));
  assert.equal(res.status, 401);
  const body = await res.json();
  assert.equal(body.success, false);
  assert.equal(body.error, "UNAUTHORIZED_CRON");
});

test("cron: rejects wrong secret via query", async () => {
  process.env.HARIKITA_CRON_SECRET = "correct-secret";
  const res = await GET(req("http://localhost/api/cron/sweep?secret=wrong"));
  assert.equal(res.status, 401);
});

test("cron: rejects missing secret when configured", async () => {
  process.env.HARIKITA_CRON_SECRET = "correct-secret";
  const res = await GET(req("http://localhost/api/cron/sweep"));
  assert.equal(res.status, 401);
});

test("cron: POST also guarded", async () => {
  process.env.HARIKITA_CRON_SECRET = "correct-secret";
  const res = await POST(new NextRequest("http://localhost/api/cron/sweep", { method: "POST" }));
  assert.equal(res.status, 401);
});
