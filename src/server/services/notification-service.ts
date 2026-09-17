import type { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getNotificationAdapter } from "@/server/notifications/registry";
import type { NotificationChannel } from "@/server/notifications/types";

/**
 * HariKita - NotificationService (Outbox Pattern)
 *
 * Semua notifikasi ditulis dulu ke tabel `Notification` (status PENDING) di dalam
 * transaksi bisnis (tanpa panggilan jaringan), lalu dikirim oleh worker/scheduler
 * (di luar transaksi). Pola ini menjaga transaksi DB tetap cepat & atomik.
 */

type TxClient = Prisma.TransactionClient;

export type NotificationTemplateKey =
  | "ORDER_CREATED_VENDOR"
  | "ORDER_ACCEPTED_CLIENT"
  | "ORDER_REJECTED_CLIENT"
  | "DP_PAID_VENDOR"
  | "DP_PAID_CLIENT"
  | "PAYOUT_DP_VENDOR"
  | "PAYOUT_SETTLEMENT_VENDOR"
  | "SESSION_SCHEDULED_CLIENT";

export interface EnqueueNotificationInput {
  channel: NotificationChannel;
  templateKey: NotificationTemplateKey;
  recipientType: "CLIENT" | "VENDOR" | "ADMIN";
  recipientName?: string;
  recipientRef?: string; // nomor HP / email
  orderId?: string;
  payload?: Record<string, unknown>;
  body: string;
}

/**
 * Menulis notifikasi ke outbox (dalam tx bisnis). TIDAK mengirim jaringan.
 */
export async function enqueueNotification(
  input: EnqueueNotificationInput,
  tx?: TxClient
): Promise<{ id: string }> {
  const db = tx ?? prisma;
  const created = await db.notification.create({
    data: {
      channel: input.channel,
      status: "PENDING",
      templateKey: input.templateKey,
      recipientType: input.recipientType,
      recipientName: input.recipientName ?? null,
      recipientRef: input.recipientRef ?? null,
      orderId: input.orderId ?? null,
      payload: input.payload ? JSON.stringify(input.payload) : null,
      body: input.body,
    },
  });
  return { id: created.id };
}

/**
 * Mengirim satu notifikasi berdasarkan id (diluar transaksi DB).
 * Idempotent: notifikasi yang sudah SENT dilewati.
 */
export async function deliverNotification(
  notificationId: string,
  client?: Pick<PrismaClient, "notification">
): Promise<{ status: "SENT" | "FAILED" | "SKIPPED"; error?: string }> {
  const db = client ?? prisma;
  const notif = await db.notification.findUnique({ where: { id: notificationId } });
  if (!notif) return { status: "SKIPPED", error: "NOT_FOUND" };
  if (notif.status === "SENT") return { status: "SKIPPED", error: "ALREADY_SENT" };

  // IN_APP cukup ditandai terkirim (tampil di UI).
  if (notif.channel === "IN_APP") {
    await db.notification.update({
      where: { id: notif.id },
      data: { status: "SENT", sentAt: new Date(), attempts: { increment: 1 } },
    });
    return { status: "SENT" };
  }

  if (!notif.recipientRef) {
    await db.notification.update({
      where: { id: notif.id },
      data: { status: "FAILED", lastError: "MISSING_RECIPIENT", attempts: { increment: 1 } },
    });
    return { status: "FAILED", error: "MISSING_RECIPIENT" };
  }

  const adapter = getNotificationAdapter(notif.channel as "WHATSAPP" | "EMAIL");
  const result = await adapter.send({ to: notif.recipientRef, body: notif.body });

  if (result.ok) {
    await db.notification.update({
      where: { id: notif.id },
      data: {
        status: "SENT",
        sentAt: new Date(),
        attempts: { increment: 1 },
        lastError: null,
      },
    });
    return { status: "SENT" };
  }

  await db.notification.update({
    where: { id: notif.id },
    data: { status: "FAILED", lastError: result.error ?? "UNKNOWN", attempts: { increment: 1 } },
  });
  return { status: "FAILED", error: result.error };
}

/**
 * Mengirim seluruh notifikasi PENDING (dipanggil scheduler). Idempotent.
 */
export async function flushPendingNotifications(
  limit = 50,
  client?: Pick<PrismaClient, "notification">
): Promise<{ scanned: number; sent: number; failed: number }> {
  const db = client ?? prisma;
  const pending = await db.notification.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  let sent = 0;
  let failed = 0;
  for (const n of pending) {
    const res = await deliverNotification(n.id, client);
    if (res.status === "SENT") sent++;
    else if (res.status === "FAILED") failed++;
  }
  return { scanned: pending.length, sent, failed };
}

/** Daftar notifikasi untuk sebuah order (untuk UI/admin). */
export async function getNotificationsForOrder(orderId: string) {
  return prisma.notification.findMany({
    where: { orderId },
    orderBy: { createdAt: "desc" },
  });
}
