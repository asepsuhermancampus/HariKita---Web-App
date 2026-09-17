import { prisma } from "@/lib/prisma";
import { enqueueNotification, type NotificationTemplateKey } from "./notification-service";
import type { Prisma } from "@prisma/client";

/**
 * HariKita - Notification Template Dispatcher
 *
 * Menyusun isi pesan dari data order/item dan menulis ke outbox. Dipanggil dari
 * dalam transaksi bisnis (tanpa jaringan).
 */

type TxClient = Prisma.TransactionClient;

function rupiah(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

/** Notifikasi ke vendor saat order baru dibuat. */
export async function notifyOrderCreatedToVendor(
  orderId: string,
  tx: TxClient
): Promise<void> {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { vendor: { include: { user: true } } } } },
  });
  if (!order) return;

  for (const item of order.items) {
    await enqueueNotification(
      {
        channel: "WHATSAPP",
        templateKey: "ORDER_CREATED_VENDOR",
        recipientType: "VENDOR",
        recipientName: item.vendor.businessName,
        recipientRef: item.vendor.user?.phone,
        orderId,
        payload: { orderNumber: order.orderNumber, packageName: item.packageName },
        body:
          `Halo ${item.vendor.businessName}, ada pesanan baru di HariKita.\n\n` +
          `No. Pesanan: ${order.orderNumber}\n` +
          `Paket: ${item.packageName}\n` +
          `Tanggal Acara: ${order.eventDate.toISOString().split("T")[0]}\n` +
          `Nilai: ${rupiah(item.subtotal)}\n\n` +
          `Mohon respon (terima/tolak) dalam 24 jam melalui portal vendor.`,
      },
      tx
    );
  }
}

/** Notifikasi ke klien atas keputusan vendor. */
export async function notifyVendorDecisionToClient(
  orderId: string,
  vendorName: string,
  packageName: string,
  accepted: boolean,
  tx: TxClient
): Promise<void> {
  const order = await tx.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  const templateKey: NotificationTemplateKey = accepted
    ? "ORDER_ACCEPTED_CLIENT"
    : "ORDER_REJECTED_CLIENT";

  await enqueueNotification(
    {
      channel: "WHATSAPP",
      templateKey,
      recipientType: "CLIENT",
      recipientName: order.clientName,
      recipientRef: order.clientPhone,
      orderId,
      payload: { vendorName, packageName, accepted },
      body: accepted
        ? `Kabar baik, ${order.clientName}! Pesanan ${order.orderNumber} untuk ${packageName} dari ${vendorName} telah DITERIMA. Status: menunggu konfirmasi vendor lain.`
        : `Mohon maaf, ${order.clientName}. Pesanan ${order.orderNumber} untuk ${packageName} dari ${vendorName} DITOLAK. Anda dapat memilih vendor pengganti melalui portal klien.`,
    },
    tx
  );
}

/** Notifikasi DP terbayar (ke klien & vendor). */
export async function notifyDpPaid(orderId: string, amount: number, tx: TxClient): Promise<void> {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { vendor: { include: { user: true } } } } },
  });
  if (!order) return;

  await enqueueNotification(
    {
      channel: "WHATSAPP",
      templateKey: "DP_PAID_CLIENT",
      recipientType: "CLIENT",
      recipientName: order.clientName,
      recipientRef: order.clientPhone,
      orderId,
      payload: { amount },
      body: `Pembayaran DP 30% (${rupiah(amount)}) untuk pesanan ${order.orderNumber} telah KAMI TERIMA dan aman di rekening bersama. Tanggal acara Anda terkunci. Terima kasih!`,
    },
    tx
  );

  for (const item of order.items) {
    await enqueueNotification(
      {
        channel: "WHATSAPP",
        templateKey: "DP_PAID_VENDOR",
        recipientType: "VENDOR",
        recipientName: item.vendor.businessName,
        recipientRef: item.vendor.user?.phone,
        orderId,
        payload: { amount, packageName: item.packageName },
        body: `DP untuk pesanan ${order.orderNumber} (${item.packageName}) telah dibayar klien dan aman di escrow HariKita. Dana operasional Anda cair pada H-3 acara.`,
      },
      tx
    );
  }
}

/** Notifikasi jadwal sesi fisik dibuat (ke klien). */
export async function notifySessionScheduled(
  orderId: string,
  sessionTitle: string,
  scheduledDate: string,
  tx: TxClient
): Promise<void> {
  const order = await tx.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  await enqueueNotification(
    {
      channel: "WHATSAPP",
      templateKey: "SESSION_SCHEDULED_CLIENT",
      recipientType: "CLIENT",
      recipientName: order.clientName,
      recipientRef: order.clientPhone,
      orderId,
      payload: { sessionTitle, scheduledDate },
      body: `Jadwal baru untuk pesanan ${order.orderNumber}: "${sessionTitle}" pada ${scheduledDate}. Mohon konfirmasi kehadiran melalui portal klien.`,
    },
    tx
  );
}
