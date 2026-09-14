"use client";

import { useSyncExternalStore } from "react";
import { OrderRecord } from "./order-store";

export interface VendorNotificationRecord {
  id: string;
  bookingId: string;
  vendorId: string;
  vendorName: string;
  categoryId: string;
  clientName: string;
  packageName: string;
  price: number;
  dpAmount: number;
  eventDate: string;
  callTime: string;
  venue: string;
  status: "NEW" | "CONFIRMED";
  inboxDelivered: boolean;
  whatsappDispatched: boolean;
  notes?: string;
  timestamp: string;
}

const NOTIFICATIONS_STORAGE_KEY = "hk_notifications_outbox_v1";

const INITIAL_DEMO_NOTIFICATIONS: VendorNotificationRecord[] = [
  {
    id: "notif_demo_01",
    bookingId: "HKB-2026-001",
    vendorId: "v_prewed_01",
    vendorName: "Menganti Cinematic & Studio",
    categoryId: "prewed",
    clientName: "Siti Rahmawati & Dimas Pratama",
    packageName: "Paket Pantai Menganti Sunset",
    price: 3500000,
    dpAmount: 1050000,
    eventDate: "2026-10-24",
    callTime: "14:00 WIB",
    venue: "Pantai Menganti & Pendopo Kebumen",
    status: "NEW",
    inboxDelivered: true,
    whatsappDispatched: true,
    notes: "Sesi sunrise jam 05:30 di Menganti, lanjut resepsi akad jam 08:00.",
    timestamp: "2026-09-14T08:00:00.000Z",
  },
  {
    id: "notif_demo_02",
    bookingId: "HKB-2026-004",
    vendorId: "v_prewed_01",
    vendorName: "Menganti Cinematic & Studio",
    categoryId: "prewed",
    clientName: "Rizky & Amanda",
    packageName: "Liputan Hari H & Flashdisk Box",
    price: 2500000,
    dpAmount: 750000,
    eventDate: "2026-11-25",
    callTime: "06:30 WIB",
    venue: "Hotel Mexolie Kebumen",
    status: "CONFIRMED",
    inboxDelivered: true,
    whatsappDispatched: true,
    notes: "Sesi resepsi indoor, butuh 2 videographer & 1 pilot drone.",
    timestamp: "2026-09-13T10:15:00.000Z",
  },
  {
    id: "notif_demo_03",
    bookingId: "HKB-2026-001",
    vendorId: "v_busana_01",
    vendorName: "Griya Busana Rarasati",
    categoryId: "busana",
    clientName: "Siti Rahmawati & Dimas Pratama",
    packageName: "Sewa Perdana Kebaya Brokat Modern & Beskap Sikepan",
    price: 4200000,
    dpAmount: 1260000,
    eventDate: "2026-10-24",
    callTime: "06:00 WIB",
    venue: "Gedung Bale Marmer Kebumen",
    status: "NEW",
    inboxDelivered: true,
    whatsappDispatched: true,
    notes: "Jadwal fitting 1 disepakati 2 minggu sebelum hari H.",
    timestamp: "2026-09-14T08:00:00.000Z",
  },
];

let memoryNotifications: VendorNotificationRecord[] = INITIAL_DEMO_NOTIFICATIONS;
const notifListeners = new Set<() => void>();

function emitNotifChange() {
  for (const listener of notifListeners) {
    listener();
  }
}

function saveNotificationsToStorage(records: VendorNotificationRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error("Gagal menyimpan notifikasi outbox ke localStorage:", err);
  }
}

function loadNotificationsFromStorage(): VendorNotificationRecord[] {
  if (typeof window === "undefined") return INITIAL_DEMO_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Gagal memuat notifikasi outbox dari localStorage:", err);
  }
  return INITIAL_DEMO_NOTIFICATIONS;
}

// Inisialisasi di browser
if (typeof window !== "undefined") {
  memoryNotifications = loadNotificationsFromStorage();

  window.addEventListener("storage", (e) => {
    if (e.key === NOTIFICATIONS_STORAGE_KEY) {
      memoryNotifications = loadNotificationsFromStorage();
      emitNotifChange();
    }
  });
}

export const notificationStore = {
  getSnapshot(): VendorNotificationRecord[] {
    return memoryNotifications;
  },

  getServerSnapshot(): VendorNotificationRecord[] {
    return INITIAL_DEMO_NOTIFICATIONS;
  },

  subscribe(listener: () => void): () => void {
    notifListeners.add(listener);
    return () => {
      notifListeners.delete(listener);
    };
  },

  getAll(): VendorNotificationRecord[] {
    return memoryNotifications;
  },

  getByVendorId(vendorId: string): VendorNotificationRecord[] {
    return memoryNotifications.filter(
      (n) => n.vendorId === vendorId || vendorId === "all"
    );
  },

  /**
   * Mengirimkan notifikasi ke masing-masing vendor yang ada di pesanan (Double Notification)
   */
  dispatchFromOrder(order: OrderRecord) {
    const newNotifs: VendorNotificationRecord[] = order.items.map((item, idx) => ({
      id: `notif_${Date.now()}_${idx}`,
      bookingId: order.bookingId,
      vendorId: item.vendorId,
      vendorName: item.vendorName,
      categoryId: item.categoryId,
      clientName: order.customerName,
      packageName: item.packageName,
      price: item.unitPrice * item.quantity,
      dpAmount: Math.round(item.unitPrice * item.quantity * 0.3),
      eventDate: order.eventDate,
      callTime: item.callTime || "08:00 WIB",
      venue: `${order.eventLocation}, Kecamatan ${order.district}`,
      status: "NEW",
      inboxDelivered: true,
      whatsappDispatched: true, // Simulated auto-dispatch via WhatsApp Gateway
      notes: order.notes || item.notes || "Pesanan baru melalui Rekening Bersama HariKita.",
      timestamp: new Date().toISOString(),
    }));

    // Prepend notifikasi baru
    memoryNotifications = [...newNotifs, ...memoryNotifications];
    saveNotificationsToStorage(memoryNotifications);
    emitNotifChange();
  },

  confirmOrder(notifId: string) {
    memoryNotifications = memoryNotifications.map((n) =>
      n.id === notifId ? { ...n, status: "CONFIRMED" } : n
    );
    saveNotificationsToStorage(memoryNotifications);
    emitNotifChange();
  },

  triggerWhatsAppReminder(notif: VendorNotificationRecord): string {
    const message = encodeURIComponent(
      `Halo Mitra Vendor *${notif.vendorName}*!\n\n` +
      `Ada pesanan baru HariKita untuk Anda:\n` +
      `• Kode Booking: ${notif.bookingId}\n` +
      `• Calon Pengantin: ${notif.clientName}\n` +
      `• Paket: ${notif.packageName}\n` +
      `• Tanggal Acara: ${notif.eventDate}\n` +
      `• Call Time: ${notif.callTime}\n` +
      `• Lokasi: ${notif.venue}\n` +
      `• Nilai Jasa: Rp ${notif.price.toLocaleString("id-ID")}\n` +
      `• Status: DP 30% Terkunci di Escrow (Rp ${notif.dpAmount.toLocaleString("id-ID")})\n\n` +
      `Mohon buka portal Anda untuk konfirmasi & kunci tanggal acara: https://harikita.id/vendor/inbox`
    );
    return `https://wa.me/?text=${message}`;
  },
};

export function useNotifications(vendorId?: string) {
  const records = useSyncExternalStore(
    notificationStore.subscribe,
    notificationStore.getSnapshot,
    notificationStore.getServerSnapshot
  );

  const filtered = vendorId && vendorId !== "all"
    ? records.filter((r) => r.vendorId === vendorId)
    : records;

  return {
    notifications: filtered,
    allNotifications: records,
    dispatchFromOrder: notificationStore.dispatchFromOrder,
    confirmOrder: notificationStore.confirmOrder,
    triggerWhatsAppReminder: notificationStore.triggerWhatsAppReminder,
  };
}
