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
    const existingIndex = memoryState.items.findIndex(
      (i) => i.categoryId === item.categoryId
    );

    let updatedItems: CartVendorItem[];
    if (existingIndex >= 0) {
      // Ganti layanan di kategori yang sama (1 kategori = 1 vendor terpilih dalam 1 paket)
      updatedItems = [...memoryState.items];
      updatedItems[existingIndex] = {
        ...item,
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
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
 * Custom React Hook untuk mengonsumsi cart store secara reaktif
 */
export function useCart() {
  const state = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot
  );

  const subtotal = state.items.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );

  const dpAmount = Math.round(subtotal * 0.3);
  const finalAmount = subtotal - dpAmount; // Strictly 70% without float drift
  const platformFee = Math.round(subtotal * 0.1); // 10% platform commission
  const vendorNetAmount = subtotal - platformFee;

  return {
    ...state,
    subtotal,
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
