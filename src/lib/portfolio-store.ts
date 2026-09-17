/**
 * HariKita - Vendor Portfolio Feed & Post Creator Store
 * Menyimpan galeri hasil karya foto/video vendor dengan perlindungan Anti-Leakage
 * (menyensor nomor HP, rekening luar, atau link bypass sebelum disimpan ke feed).
 */

import { detectOffPlatformContact } from "@/lib/content-guard";

export interface PortfolioPost {
  id: string;
  vendorId: string;
  vendorSlug: string;
  vendorName: string;
  title: string;
  locationTag: string; // e.g. "Pantai Menganti, Ayah"
  categoryTag: string; // e.g. "Outdoor Pre-wedding", "Akad Adat Jawa"
  styleTags: string[]; // e.g. ["Sunset", "Karst", "Cinematic"]
  caption: string;
  imageUrl: string;
  likes: number;
  createdAt: string;
}

export interface PortfolioState {
  posts: PortfolioPost[];
}

const STORAGE_KEY = "hk_vendor_portfolio_v1";

const INITIAL_POSTS: PortfolioPost[] = [
  {
    id: "post_menganti_01",
    vendorId: "v_prewed_01",
    vendorSlug: "menganti-cinematic",
    vendorName: "Menganti Cinematic & Studio",
    title: "Sesi Golden Hour Sunset Tebing Pantai Menganti",
    locationTag: "Pantai Menganti, Ayah, Kebumen",
    categoryTag: "Outdoor Pre-wedding",
    styleTags: ["Sunset", "Cinematic", "Landscape"],
    caption: "Momen magis pencahayaan alami di bukit karst Menganti. Sudut tebing samudra Kebumen memberikan gradasi langit keemasan yang sempurna.",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    likes: 54,
    createdAt: "2026-09-10",
  },
  {
    id: "post_rarasati_01",
    vendorId: "v_busana_01",
    vendorSlug: "griya-busana-rarasati",
    vendorName: "Griya Busana Rarasati",
    title: "Kebaya Bludru Hitam Sulam Emas Adat Jawa",
    locationTag: "Studio Rarasati, Kebumen Kota",
    categoryTag: "Busana Pengantin & Fitting",
    styleTags: ["Adat Jawa", "Bludru", "Klasik"],
    caption: "Koleksi busana pengantin bludru hitam premium dengan sentuhan payet emas khas keraton, dirancang anggun dan nyaman untuk resepsi seharian.",
    imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
    likes: 82,
    createdAt: "2026-09-11",
  },
  {
    id: "post_alula_01",
    vendorId: "v_mua_01",
    vendorSlug: "alula-mua",
    vendorName: "Alula MUA & Hijab Styling",
    title: "Rias Soft Glam Flawless dengan Hijab Modern",
    locationTag: "Hotel Mexolie, Kebumen Kota",
    categoryTag: "Makeup Artist (MUA)",
    styleTags: ["Soft Glam", "Flawless", "Hijab Styling"],
    caption: "Pulasan rias natural berseri yang menonjolkan keanggunan alami mempelai tanpa terasa tebal. Bertahan prima dari akad hingga resepsi malam.",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    likes: 47,
    createdAt: "2026-09-12",
  },
  {
    id: "post_pradana_01",
    vendorId: "v_foto_01",
    vendorSlug: "pradana-cinema",
    vendorName: "Pradana Cinema & Story",
    title: "Liputan Akad Nikah Sakral Pendopo Kebumen",
    locationTag: "Pendopo Ronggowarsito, Kebumen Kota",
    categoryTag: "Dokumentasi Hari H",
    styleTags: ["Sacred", "Candid", "Drone Aerial"],
    caption: "Detik-detik ijab kabul khidmat dalam sorotan lensa sinematik. Setiap butir rasa haru keluarga terekam abadi dalam resolusi 4K.",
    imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
    likes: 69,
    createdAt: "2026-09-13",
  },
];

const SERVER_PORTFOLIO_SNAPSHOT: PortfolioState = Object.freeze({ posts: INITIAL_POSTS }) as unknown as PortfolioState;

let state: PortfolioState = SERVER_PORTFOLIO_SNAPSHOT;
let isInitialized = false;
const listeners = new Set<() => void>();

function initStore() {
  if (isInitialized || typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.posts)) {
        state = { posts: parsed.posts };
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch (err) {
    console.error("Failed to load portfolio store from localStorage:", err);
  }
  isInitialized = true;
}

function persistState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to persist portfolio store to localStorage:", err);
  }
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export const portfolioStore = {
  subscribe(listener: () => void) {
    initStore();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot(): PortfolioState {
    initStore();
    return state;
  },

  getServerSnapshot(): PortfolioState {
    return SERVER_PORTFOLIO_SNAPSHOT;
  },

  getPostsByVendor(vendorSlugOrName?: string): PortfolioPost[] {
    initStore();
    if (!vendorSlugOrName) return state.posts;
    const q = vendorSlugOrName.toLowerCase();
    return state.posts.filter(
      (p) =>
        p.vendorSlug.toLowerCase() === q ||
        p.vendorName.toLowerCase().includes(q) ||
        q.includes(p.vendorSlug.toLowerCase())
    );
  },

  addPost(
    postData: Omit<PortfolioPost, "id" | "likes" | "createdAt">
  ): { success: boolean; error?: string; post?: PortfolioPost } {
    initStore();

    // STRICT ANTI-LEAKAGE SENSOR CHECK
    const guardCheck = detectOffPlatformContact(postData.caption + " " + postData.title);
    if (guardCheck.isViolation) {
      return {
        success: false,
        error: `Konten ditolak: ${guardCheck.reason}. Dilarang mencantumkan kontak langsung demi keamanan rekening bersama.`,
      };
    }

    const newPost: PortfolioPost = {
      ...postData,
      id: `post_${Date.now()}`,
      likes: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    state = {
      posts: [newPost, ...state.posts],
    };
    persistState();
    notifyListeners();

    return { success: true, post: newPost };
  },

  deletePost(id: string) {
    initStore();
    state = {
      posts: state.posts.filter((p) => p.id !== id),
    };
    persistState();
    notifyListeners();
  },

  likePost(id: string) {
    initStore();
    state = {
      posts: state.posts.map((p) =>
        p.id === id ? { ...p, likes: p.likes + 1 } : p
      ),
    };
    persistState();
    notifyListeners();
  },
};

// React Hook
import { useSyncExternalStore } from "react";

export function usePortfolio(vendorSlugOrName?: string) {
  const storeState = useSyncExternalStore(
    portfolioStore.subscribe,
    portfolioStore.getSnapshot,
    portfolioStore.getServerSnapshot
  );

  if (!vendorSlugOrName) return storeState.posts;

  const q = vendorSlugOrName.toLowerCase();
  return storeState.posts.filter(
    (p) =>
      p.vendorSlug.toLowerCase() === q ||
      p.vendorName.toLowerCase().includes(q) ||
      q.includes(p.vendorSlug.toLowerCase())
  );
}
