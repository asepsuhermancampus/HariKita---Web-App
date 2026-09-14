"use client";

import { useSyncExternalStore } from "react";
import { CartVendorItem } from "./cart-store";

export interface OrderItemRecord extends CartVendorItem {
  status: "PENDING_CONFIRMATION" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED";
}

export interface OrderFinancials {
  subtotal: number;
  platformFee: number; // 10% platform, hosting, server, and local curator fee
  escrowFee: number; // 0 (included in platform fee)
  totalAmount: number;
  dpAmount: number; // 30%
  pelunasanAmount: number; // 70%
}

export interface OrderRundownSlot {
  id: string;
  timeSlot: string; // e.g. "05:00 - 07:00 WIB"
  activity: string;
  picCategory: string;
  vendorName: string;
  district: string;
  status: "standby" | "otw" | "active" | "completed";
}

export interface OrderRecord {
  id: string;
  bookingId: string; // e.g. "HK-KBM-2026-001"
  customerName: string;
  customerWhatsApp: string;
  eventDate: string; // YYYY-MM-DD or formatted
  eventLocation: string; // venue name
  district: string; // Kecamatan di Kebumen
  paymentType: "dp_30" | "full_100";
  paymentStatus: "UNPAID" | "DP_PAID" | "FULLY_PAID";
  notes?: string;
  financials: OrderFinancials;
  items: OrderItemRecord[];
  rundown: OrderRundownSlot[];
  escrowStatus: {
    dpReleased: boolean; // H-3
    dpReleaseDate?: string;
    settlementReleased: boolean; // H+2
    settlementReleaseDate?: string;
  };
  createdAt: string;
}

const ORDERS_STORAGE_KEY = "hk_orders_history_v1";

// Mock Fallback Data (Jika pengguna baru pertama kali buka tanpa checkout)
const INITIAL_DEMO_ORDER: OrderRecord = {
  id: "order_demo_001",
  bookingId: "HKB-2026-001",
  customerName: "Siti Rahmawati & Dimas Pratama",
  customerWhatsApp: "081234567890",
  eventDate: "2026-10-24",
  eventLocation: "Gedung Bale Marmer Kebumen",
  district: "Kebumen Kota",
  paymentType: "dp_30",
  paymentStatus: "DP_PAID",
  notes: "Mohon busana pengantin dipastikan sudah ready H-1. Sesi foto prewed outdoor di Pantai Menganti.",
  financials: {
    subtotal: 15850000,
    platformFee: 1585000,
    escrowFee: 0,
    totalAmount: 17435000,
    dpAmount: 5230500, // 30% of total
    pelunasanAmount: 12204500, // 70% of total
  },
  items: [
    {
      id: "item_demo_1",
      categoryId: "prewed",
      categoryTitle: "Pre-wedding Alam & Studio",
      vendorId: "v_prewed_01",
      vendorName: "Menganti Cinematic & Studio",
      district: "Ayah",
      packageId: "pkg_prewed_basic",
      packageName: "Paket Pantai Menganti Sunset",
      unitPrice: 3500000,
      quantity: 1,
      callTime: "14:00 WIB",
      status: "CONFIRMED",
      notes: "Spot Pantai Menganti & bukit eksotis, 2 busana, drone aerial.",
    },
    {
      id: "item_demo_2",
      categoryId: "busana",
      categoryTitle: "Busana Pengantin & Fitting",
      vendorId: "v_busana_01",
      vendorName: "Griya Busana Rarasati",
      district: "Kebumen Kota",
      packageId: "pkg_busana_kebaya_perdana",
      packageName: "Sewa Perdana Kebaya Brokat Modern & Beskap Sikepan",
      unitPrice: 4200000,
      quantity: 1,
      callTime: "06:00 WIB",
      status: "CONFIRMED",
      notes: "Fitting 1 & final fitting di butik Rarasati Kebumen Kota.",
    },
    {
      id: "item_demo_3",
      categoryId: "mua",
      categoryTitle: "Makeup Artist (MUA)",
      vendorId: "v_mua_01",
      vendorName: "Alula MUA & Hijab",
      district: "Kebumen Kota",
      packageId: "pkg_mua_glam",
      packageName: "Rias Pengantin Soft Glam Akad & Resepsi",
      unitPrice: 2800000,
      quantity: 1,
      callTime: "04:30 WIB",
      status: "CONFIRMED",
      notes: "Tahan 12 jam, ronce melati asli, touch-up standby.",
    },
    {
      id: "item_demo_4",
      categoryId: "katering",
      categoryTitle: "Katering Prasmanan & Stall",
      vendorId: "v_katering_01",
      vendorName: "Dapur Rasa Boga Kebumen",
      district: "Kutowinangun",
      packageId: "pkg_katering_selaras",
      packageName: "Prasmanan Selaras 200 Pax + 2 Food Stalls",
      unitPrice: 5350000,
      quantity: 1,
      callTime: "09:00 WIB",
      status: "CONFIRMED",
      notes: "Free Sample Box Test Food diantar langsung ke rumah.",
    },
  ],
  rundown: [
    {
      id: "rd_1",
      timeSlot: "04:30 - 06:30 WIB",
      activity: "Sesi Rias MUA & Hijab Styling Pengantin",
      picCategory: "Makeup Artist (MUA)",
      vendorName: "Alula MUA & Hijab",
      district: "Kebumen Kota",
      status: "standby",
    },
    {
      id: "rd_2",
      timeSlot: "06:00 - 07:00 WIB",
      activity: "Fitting Akhir & Pemasangan Beskap Pengantin",
      picCategory: "Busana Pengantin & Fitting",
      vendorName: "Griya Busana Rarasati",
      district: "Kebumen Kota",
      status: "standby",
    },
    {
      id: "rd_3",
      timeSlot: "07:30 - 09:00 WIB",
      activity: "Prosesi Akad Nikah & Ijab Qabul",
      picCategory: "Dokumentasi",
      vendorName: "Menganti Cinematic & Studio",
      district: "Ayah",
      status: "standby",
    },
    {
      id: "rd_4",
      timeSlot: "09:30 - 13:00 WIB",
      activity: "Resepsi & Jamuan Prasmanan 200 Tamu",
      picCategory: "Katering Prasmanan",
      vendorName: "Dapur Rasa Boga Kebumen",
      district: "Kutowinangun",
      status: "standby",
    },
  ],
  escrowStatus: {
    dpReleased: false,
    dpReleaseDate: "2026-10-21 (H-3 Acara)",
    settlementReleased: false,
    settlementReleaseDate: "2026-10-26 (H+2 Acara)",
  },
  createdAt: "2026-09-14T08:00:00.000Z",
};

const SERVER_ORDERS_SNAPSHOT: OrderRecord[] = Object.freeze([INITIAL_DEMO_ORDER]) as unknown as OrderRecord[];

let memoryOrders: OrderRecord[] = SERVER_ORDERS_SNAPSHOT;
const orderListeners = new Set<() => void>();

function emitOrderChange() {
  for (const listener of orderListeners) {
    listener();
  }
}

function saveOrdersToStorage(orders: OrderRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error("Gagal menyimpan riwayat pesanan ke localStorage:", err);
  }
}

function loadOrdersFromStorage(): OrderRecord[] {
  if (typeof window === "undefined") return SERVER_ORDERS_SNAPSHOT;
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Gagal memuat riwayat pesanan dari localStorage:", err);
  }
  return SERVER_ORDERS_SNAPSHOT;
}

// Inisialisasi saat di browser
if (typeof window !== "undefined") {
  memoryOrders = loadOrdersFromStorage();

  window.addEventListener("storage", (e) => {
    if (e.key === ORDERS_STORAGE_KEY) {
      memoryOrders = loadOrdersFromStorage();
      emitOrderChange();
    }
  });
}

export const orderStore = {
  getSnapshot(): OrderRecord[] {
    return memoryOrders;
  },

  getServerSnapshot(): OrderRecord[] {
    return SERVER_ORDERS_SNAPSHOT;
  },

  subscribe(listener: () => void): () => void {
    orderListeners.add(listener);
    return () => {
      orderListeners.delete(listener);
    };
  },

  getAllOrders(): OrderRecord[] {
    return memoryOrders;
  },

  getOrderById(bookingId: string): OrderRecord | undefined {
    return memoryOrders.find(
      (o) => o.bookingId.toLowerCase() === bookingId.toLowerCase() || o.id === bookingId
    );
  },

  /**
   * Mengonversi isi keranjang aktif menjadi record pesanan permanen
   */
  createOrder(params: {
    bookingId: string;
    customerName: string;
    customerWhatsApp: string;
    eventDate: string;
    eventLocation: string;
    district?: string;
    paymentType: "dp_30" | "full_100";
    notes?: string;
    items: CartVendorItem[];
    subtotal: number;
  }): OrderRecord {
    const baseSubtotal = params.subtotal > 0 ? params.subtotal : 15850000;
    const platformFee = Math.round(baseSubtotal * 0.1); // 10% fee
    const escrowFee = 0; // included
    const totalAmount = baseSubtotal + platformFee;
    const dpAmount = Math.round(totalAmount * 0.3);
    const pelunasanAmount = totalAmount - dpAmount;

    // Generate automatic rundown based on items & call times
    const sortedItems = [...params.items].sort((a, b) => {
      const timeA = a.callTime || "08:00 WIB";
      const timeB = b.callTime || "08:00 WIB";
      return timeA.localeCompare(timeB);
    });

    const rundown: OrderRundownSlot[] = sortedItems.map((item, idx) => ({
      id: `rd_${Date.now()}_${idx}`,
      timeSlot: item.callTime ? `${item.callTime} - Selesai` : "08:00 - Selesai",
      activity: `Pelaksanaan Jasa ${item.categoryTitle} (${item.packageName})`,
      picCategory: item.categoryTitle,
      vendorName: item.vendorName,
      district: item.district,
      status: "standby",
    }));

    const newOrder: OrderRecord = {
      id: `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      bookingId: params.bookingId,
      customerName: params.customerName || "Calon Pengantin HariKita",
      customerWhatsApp: params.customerWhatsApp || "081234567890",
      eventDate: params.eventDate || "2026-10-24",
      eventLocation: params.eventLocation || "Kebumen Kota",
      district: params.district || "Kebumen Kota",
      paymentType: params.paymentType,
      paymentStatus: params.paymentType === "full_100" ? "FULLY_PAID" : "DP_PAID",
      notes: params.notes || "",
      financials: {
        subtotal: baseSubtotal,
        platformFee,
        escrowFee,
        totalAmount,
        dpAmount,
        pelunasanAmount,
      },
      items: sortedItems.map((it) => ({
        ...it,
        status: "CONFIRMED",
      })),
      rundown,
      escrowStatus: {
        dpReleased: false,
        dpReleaseDate: "H-3 Acara (Operasional)",
        settlementReleased: false,
        settlementReleaseDate: "H+2 Acara (Setelah Konfirmasi Klien)",
      },
      createdAt: new Date().toISOString(),
    };

    // Prepend order agar urutan terbaru di atas
    memoryOrders = [newOrder, ...memoryOrders.filter((o) => o.bookingId !== params.bookingId)];
    saveOrdersToStorage(memoryOrders);
    emitOrderChange();

    return newOrder;
  },

  updateOrderStatus(
    bookingId: string,
    updates: Partial<OrderRecord>
  ): OrderRecord | undefined {
    const targetIdx = memoryOrders.findIndex(
      (o) => o.bookingId.toLowerCase() === bookingId.toLowerCase() || o.id === bookingId
    );

    if (targetIdx >= 0) {
      const updated = {
        ...memoryOrders[targetIdx],
        ...updates,
      };
      memoryOrders[targetIdx] = updated;
      saveOrdersToStorage(memoryOrders);
      emitOrderChange();
      return updated;
    }
    return undefined;
  },
};

export function useOrders() {
  const orders = useSyncExternalStore(
    orderStore.subscribe,
    orderStore.getSnapshot,
    orderStore.getServerSnapshot
  );

  return {
    orders,
    createOrder: orderStore.createOrder,
    getOrderById: orderStore.getOrderById,
    updateOrderStatus: orderStore.updateOrderStatus,
  };
}
