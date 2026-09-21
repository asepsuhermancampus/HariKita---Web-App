"use client";

import { useSyncExternalStore } from "react";

export interface CartVendorItem {
  id: string; // unique item id
  categoryId: string; // prewed, busana, mua, seserahan, dll
  categoryTitle: string;
  vendorId: string;
  vendorName: string;
  district: string;
  packageId: string;
  packageName: string;
  unitPrice: number; // in IDR
  quantity: number;
  callTime?: string; // e.g. "05:00 WIB"
  notes?: string;
  iconName?: string;
  unitLabel?: string; // "per pax" | "per paket" | "per pcs" | "per porsi"
  productSlug?: string; // slug produk di katalog (untuk deep-link)
}

export interface CartState {
  items: CartVendorItem[];
  eventDate: string; // YYYY-MM-DD
  eventLocation: string;
  customerName: string;
  customerWhatsApp: string;
  paymentType: "dp_30" | "full_100";
  notes: string;
  lastUpdated: number;
}

const STORAGE_KEY = "hk_cart_v1";

const DEFAULT_STATE: CartState = {
  items: [],
  eventDate: "",
  eventLocation: "Kebumen Kota",
  customerName: "",
  customerWhatsApp: "",
  paymentType: "dp_30",
  notes: "",
  lastUpdated: 0,
};

let memoryState: CartState = DEFAULT_STATE;
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function saveToLocalStorage(state: CartState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Gagal menyimpan draf racikan ke localStorage:", err);
  }
}

function loadFromLocalStorage(): CartState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.items)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Gagal memuat draf racikan dari localStorage:", err);
  }
  return DEFAULT_STATE;
}

// Inisialisasi saat di browser
if (typeof window !== "undefined") {
  memoryState = loadFromLocalStorage();

  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      memoryState = loadFromLocalStorage();
      emitChange();
    }
  });
}

export const cartStore = {
  getSnapshot(): CartState {
    return memoryState;
  },

  getServerSnapshot(): CartState {
    return DEFAULT_STATE;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  addItem(item: Omit<CartVendorItem, "id">) {
    // Multi-produk per vendor: identitas baris = kombinasi vendorId + packageId.
    // Produk berbeda dari vendor yang sama menjadi baris terpisah; produk yang
    // sama (vendor + paket) di-upsert dengan quantity diakumulasi.
    const existingIndex = memoryState.items.findIndex(
      (i) => i.vendorId === item.vendorId && i.packageId === item.packageId
    );

    let updatedItems: CartVendorItem[];
    if (existingIndex >= 0) {
      const existing = memoryState.items[existingIndex];
      updatedItems = [...memoryState.items];
      updatedItems[existingIndex] = {
        ...existing,
        ...item,
        quantity: existing.quantity + item.quantity,
        id: existing.id,
      };
    } else {
      updatedItems = [
        ...memoryState.items,
        {
          ...item,
          id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        },
      ];
    }

    memoryState = {
      ...memoryState,
      items: updatedItems,
      lastUpdated: Date.now(),
    };
    saveToLocalStorage(memoryState);
    emitChange();
  },

  removeItem(itemId: string) {
    memoryState = {
      ...memoryState,
      items: memoryState.items.filter((i) => i.id !== itemId),
      lastUpdated: Date.now(),
    };
    saveToLocalStorage(memoryState);
    emitChange();
  },

  setEventDate(date: string) {
    memoryState = {
      ...memoryState,
      eventDate: date,
      lastUpdated: Date.now(),
    };
    saveToLocalStorage(memoryState);
    emitChange();
  },

  setEventLocation(loc: string) {
    memoryState = {
      ...memoryState,
      eventLocation: loc,
      lastUpdated: Date.now(),
    };
    saveToLocalStorage(memoryState);
    emitChange();
  },

  setCustomerInfo(name: string, whatsapp: string) {
    memoryState = {
      ...memoryState,
      customerName: name,
      customerWhatsApp: whatsapp,
      lastUpdated: Date.now(),
    };
    saveToLocalStorage(memoryState);
    emitChange();
  },

  setPaymentType(type: "dp_30" | "full_100") {
    memoryState = {
      ...memoryState,
      paymentType: type,
      lastUpdated: Date.now(),
    };
    saveToLocalStorage(memoryState);
    emitChange();
  },

  clearCart() {
    memoryState = {
      ...DEFAULT_STATE,
      lastUpdated: Date.now(),
    };
    saveToLocalStorage(memoryState);
    emitChange();
  },
};

/**
 * Custom React Hook untuk mengonsumsi cart store secara reaktif.
 *
 * Persentase finansial (DP & platform fee) dibaca dari config aktif bila
 * disuplai; default 30/10 agar pemanggil lama tetap benar (kompatibel-mundur).
 */
export function useCart(opts?: { dpPct?: number; platformFeePct?: number }) {
  const state = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot
  );

  const subtotal = state.items.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );

  const dpPct = opts?.dpPct ?? 30;
  const platformFeePct = opts?.platformFeePct ?? 10;
  const dpAmount = Math.round((subtotal * dpPct) / 100);
  const finalAmount = subtotal - dpAmount;
  const platformFee = Math.round((subtotal * platformFeePct) / 100);
  const vendorNetAmount = subtotal - platformFee;

  return {
    ...state,
    subtotal,
    dpPct,
    platformFeePct,
    dpAmount,
    finalAmount,
    platformFee,
    vendorNetAmount,
    addItem: cartStore.addItem,
    removeItem: cartStore.removeItem,
    setEventDate: cartStore.setEventDate,
    setEventLocation: cartStore.setEventLocation,
    setCustomerInfo: cartStore.setCustomerInfo,
    setPaymentType: cartStore.setPaymentType,
    clearCart: cartStore.clearCart,
  };
}
