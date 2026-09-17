import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import type { PrismaClient } from "@prisma/client";
import { createTestDb, type TestDb } from "./helpers/test-db";
import {
  enqueueNotification,
  deliverNotification,
  flushPendingNotifications,
} from "../src/server/services/notification-service";
import { getNotificationAdapter } from "../src/server/notifications/registry";

let ctx: TestDb;
let prisma: PrismaClient;

before(async () => {
  ctx = await createTestDb();
  prisma = ctx.prisma;
});

after(async () => {
  await ctx.cleanup();
});

test("enqueueNotification writes a PENDING outbox row (no network)", async () => {
  const { id } = await enqueueNotification(
    {
      channel: "WHATSAPP",
      templateKey: "ORDER_CREATED_VENDOR",
      recipientType: "VENDOR",
      recipientRef: "081234567890",
      body: "Pesanan baru",
    },
    prisma
  );
  const row = await prisma.notification.findUniqueOrThrow({ where: { id } });
  assert.equal(row.status, "PENDING");
  assert.equal(row.channel, "WHATSAPP");
  assert.equal(row.attempts, 0);
});

test("deliverNotification marks SENT (mock adapter when no creds)", async () => {
  delete process.env.WHATSAPP_API_TOKEN;
  const { id } = await enqueueNotification(
    {
      channel: "WHATSAPP",
      templateKey: "DP_PAID_CLIENT",
      recipientType: "CLIENT",
      recipientRef: "081200000000",
      body: "DP diterima",
    },
    prisma
  );
  const res = await deliverNotification(id, prisma);
  assert.equal(res.status, "SENT");
  const row = await prisma.notification.findUniqueOrThrow({ where: { id } });
  assert.equal(row.status, "SENT");
  assert.ok(row.sentAt);
  assert.equal(row.attempts, 1);
});

test("deliverNotification is idempotent for already-SENT rows", async () => {
  const { id } = await enqueueNotification(
    {
      channel: "WHATSAPP",
      templateKey: "DP_PAID_CLIENT",
      recipientType: "CLIENT",
      recipientRef: "0812",
      body: "x",
    },
    prisma
  );
  await deliverNotification(id, prisma);
  const second = await deliverNotification(id, prisma);
  assert.equal(second.status, "SKIPPED");
  const row = await prisma.notification.findUniqueOrThrow({ where: { id } });
  assert.equal(row.attempts, 1); // tidak bertambah
});

test("deliverNotification marks FAILED when recipient missing", async () => {
  const { id } = await enqueueNotification(
    {
      channel: "EMAIL",
      templateKey: "DP_PAID_CLIENT",
      recipientType: "CLIENT",
      // tanpa recipientRef
      body: "x",
    },
    prisma
  );
  const res = await deliverNotification(id, prisma);
  assert.equal(res.status, "FAILED");
  const row = await prisma.notification.findUniqueOrThrow({ where: { id } });
  assert.equal(row.status, "FAILED");
  assert.equal(row.lastError, "MISSING_RECIPIENT");
});

test("IN_APP notifications are auto-marked SENT", async () => {
  const { id } = await enqueueNotification(
    {
      channel: "IN_APP",
      templateKey: "DP_PAID_CLIENT",
      recipientType: "CLIENT",
      body: "in-app",
    },
    prisma
  );
  const res = await deliverNotification(id, prisma);
  assert.equal(res.status, "SENT");
});

test("flushPendingNotifications sends all PENDING", async () => {
  // Bersihkan dulu.
  await prisma.notification.updateMany({ data: { status: "SENT" } });
  for (let i = 0; i < 3; i++) {
    await enqueueNotification(
      {
        channel: "WHATSAPP",
        templateKey: "ORDER_CREATED_VENDOR",
        recipientType: "VENDOR",
        recipientRef: `08120000000${i}`,
        body: `msg ${i}`,
      },
      prisma
    );
  }
  const res = await flushPendingNotifications(50, prisma);
  assert.ok(res.sent >= 3);
});

test("registry returns correct notification adapter per channel", () => {
  assert.equal(getNotificationAdapter("WHATSAPP").channel, "WHATSAPP");
  assert.equal(getNotificationAdapter("EMAIL").channel, "EMAIL");
});
