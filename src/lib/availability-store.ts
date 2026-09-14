/**
 * HariKita - Multi-Vendor Availability & Blackout Dates Store
 * Mengelola kalender sibuk vendor, sinkronisasi dua arah dengan /vendor/kalender,
 * dan deteksi bentrok jadwal serentak (Multi-Vendor Availability Matrix) di /builder.
 */

export interface BlackoutEntry {
  vendorId: string;
  vendorName: string;
  date: string; // YYYY-MM-DD
  reason: string;
}

export interface AvailabilityState {
  entries: BlackoutEntry[];
}

const STORAGE_KEY = "hk_vendor_availability_v1";

const INITIAL_BLACKOUTS: BlackoutEntry[] = [
  {
    vendorId: "v_busana_01",
    vendorName: "Griya Busana Rarasati",
    date: "2026-10-18",
    reason: "Sudah Dipesan Acara Akad (HKB-2026-001)",
  },
  {
    vendorId: "v_busana_01",
    vendorName: "Griya Busana Rarasati",
    date: "2026-11-14",
    reason: "Sudah Dipesan Offline",
  },
  {
    vendorId: "v_busana_01",
    vendorName: "Griya Busana Rarasati",
    date: "2026-11-15",
    reason: "Sudah Dipesan Offline",
  },
  {
    vendorId: "v_busana_01",
    vendorName: "Griya Busana Rarasati",
    date: "2026-12-05",
    reason: "Libur Kru / Istirahat",
  },
  {
    vendorId: "v_prewed_01",
    vendorName: "Menganti Cinematic & Studio",
    date: "2026-10-10",
    reason: "Sesi Prewedding Sunset Menganti",
  },
  {
    vendorId: "v_prewed_01",
    vendorName: "Menganti Cinematic & Studio",
    date: "2026-10-17",
    reason: "Sesi Prewedding Bukit Hud",
  },
  {
    vendorId: "v_mua_01",
    vendorName: "Alula MUA & Hijab Styling",
    date: "2026-10-18",
    reason: "Rias Pengantin Adat Jawa (Pagi)",
  },
  {
    vendorId: "v_mua_01",
    vendorName: "Alula MUA & Hijab Styling",
    date: "2026-11-01",
    reason: "Pesanan Offline Kebumen",
  },
  {
    vendorId: "v_katering_01",
    vendorName: "Dapur Rasa Boga Kebumen",
    date: "2026-10-18",
    reason: "Prasmanan 500 Pax Setda Kebumen",
  },
  {
    vendorId: "v_katering_01",
    vendorName: "Dapur Rasa Boga Kebumen",
    date: "2026-10-25",
    reason: "Pesanan Katering Resepsi Gombong",
  },
  {
    vendorId: "v_dekor_01",
    vendorName: "Asmara Flora & Pelaminan",
    date: "2026-11-08",
    reason: "Dekorasi Pelaminan Mexolie Kebumen",
  },
  {
    vendorId: "v_foto_01",
    vendorName: "Pradana Cinema & Story",
    date: "2026-10-18",
    reason: "Liputan Akad & Resepsi",
  },
];

const SERVER_AVAILABILITY_SNAPSHOT: AvailabilityState = Object.freeze({ entries: INITIAL_BLACKOUTS }) as unknown as AvailabilityState;

let state: AvailabilityState = SERVER_AVAILABILITY_SNAPSHOT;
let isInitialized = false;
const listeners = new Set<() => void>();

function initStore() {
  if (isInitialized || typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.entries)) {
        state = { entries: parsed.entries };
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch (err) {
    console.error("Failed to load availability from localStorage:", err);
  }
  isInitialized = true;
}

function persistState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to persist availability state:", err);
  }
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export const availabilityStore = {
  subscribe(listener: () => void) {
    initStore();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot(): AvailabilityState {
    initStore();
    return state;
  },

  getServerSnapshot(): AvailabilityState {
    return SERVER_AVAILABILITY_SNAPSHOT;
  },

  getVendorBlackouts(vendorIdentifier: string): BlackoutEntry[] {
    initStore();
    const query = vendorIdentifier.toLowerCase();
    return state.entries.filter(
      (e) =>
        e.vendorId.toLowerCase() === query ||
        e.vendorName.toLowerCase().includes(query) ||
        query.includes(e.vendorName.toLowerCase())
    );
  },

  addBlackout(entry: Omit<BlackoutEntry, "vendorId"> & { vendorId?: string }) {
    initStore();
    const vendorId = entry.vendorId || `vendor_${entry.vendorName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    const exists = state.entries.some(
      (e) =>
        (e.vendorId === vendorId || e.vendorName.toLowerCase() === entry.vendorName.toLowerCase()) &&
        e.date === entry.date
    );

    if (!exists) {
      state = {
        ...state,
        entries: [
          ...state.entries,
          {
            vendorId,
            vendorName: entry.vendorName,
            date: entry.date,
            reason: entry.reason || "Jadwal Terisi",
          },
        ],
      };
      persistState();
      notifyListeners();
    }
  },

  removeBlackout(vendorIdentifier: string, date: string) {
    initStore();
    const query = vendorIdentifier.toLowerCase();
    state = {
      ...state,
      entries: state.entries.filter((e) => {
        const matchesVendor =
          e.vendorId.toLowerCase() === query ||
          e.vendorName.toLowerCase().includes(query) ||
          query.includes(e.vendorName.toLowerCase());
        return !(matchesVendor && e.date === date);
      }),
    };
    persistState();
    notifyListeners();
  },

  checkMatrix(
    date: string,
    vendorNames: string[]
  ): {
    isAllAvailable: boolean;
    conflicts: { vendorName: string; reason: string }[];
    availableCount: number;
    totalChecked: number;
  } {
    initStore();
    if (!date || vendorNames.length === 0) {
      return { isAllAvailable: true, conflicts: [], availableCount: 0, totalChecked: 0 };
    }

    const conflicts: { vendorName: string; reason: string }[] = [];

    vendorNames.forEach((vendorName) => {
      const match = state.entries.find(
        (e) =>
          e.date === date &&
          (e.vendorName.toLowerCase().includes(vendorName.toLowerCase()) ||
            vendorName.toLowerCase().includes(e.vendorName.toLowerCase()))
      );
      if (match) {
        conflicts.push({
          vendorName,
          reason: match.reason,
        });
      }
    });

    const totalChecked = vendorNames.length;
    const availableCount = totalChecked - conflicts.length;

    return {
      isAllAvailable: conflicts.length === 0,
      conflicts,
      availableCount,
      totalChecked,
    };
  },
};

// React Hook
import { useSyncExternalStore } from "react";

export function useAvailability() {
  return useSyncExternalStore(
    availabilityStore.subscribe,
    availabilityStore.getSnapshot,
    availabilityStore.getServerSnapshot
  );
}
