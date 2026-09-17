import type { AudioLicense, AudioMood } from "./audioCatalog";

export interface AudioManifestEntry {
  id: string;
  title: string;
  filename: string;      // basename only, e.g. "romantic-harp-dawn.mp3"
  mood: AudioMood;
  durationSec: number;
  license: AudioLicense;
  author: string;
  sourceUrl: string;
  retrievedAt: string;   // YYYY-MM-DD
  sha256: string;        // 64 hex chars; verified by scripts/fetch-cc0-audio.mjs
}

// Catatan: sourceUrl masih berupa placeholder (example.com) dan sha256 masih
// nol- semua. Nilai aslinya diisi oleh scripts/fetch-cc0-audio.mjs saat
// maintainer menyetujui sumber CC0 final (Task 11).
export const AUDIO_MANIFEST: AudioManifestEntry[] = [
  {
    id: "romantic-harp-dawn",
    title: "Harp Dawn",
    filename: "romantic-harp-dawn.mp3",
    mood: "romantic",
    durationSec: 154,
    license: "CC0-1.0",
    author: "Public Domain dedication",
    sourceUrl: "https://example.com/cc0-pending",
    retrievedAt: "2026-09-17",
    sha256: "0000000000000000000000000000000000000000000000000000000000000000",
  },
  {
    id: "royal-gamelan-lantern",
    title: "Gamelan Lantern",
    filename: "royal-gamelan-lantern.mp3",
    mood: "royal",
    durationSec: 172,
    license: "CC0-1.0",
    author: "Public Domain dedication",
    sourceUrl: "https://example.com/cc0-pending",
    retrievedAt: "2026-09-17",
    sha256: "0000000000000000000000000000000000000000000000000000000000000000",
  },
  {
    id: "modern-ambient-drift",
    title: "Ambient Drift",
    filename: "modern-ambient-drift.mp3",
    mood: "modern",
    durationSec: 168,
    license: "CC0-1.0",
    author: "Public Domain dedication",
    sourceUrl: "https://example.com/cc0-pending",
    retrievedAt: "2026-09-17",
    sha256: "0000000000000000000000000000000000000000000000000000000000000000",
  },
  {
    id: "nature-morning-walk",
    title: "Morning Walk",
    filename: "nature-morning-walk.mp3",
    mood: "nature",
    durationSec: 160,
    license: "CC0-1.0",
    author: "Public Domain dedication",
    sourceUrl: "https://example.com/cc0-pending",
    retrievedAt: "2026-09-17",
    sha256: "0000000000000000000000000000000000000000000000000000000000000000",
  },
  {
    id: "celebratory-golden-steps",
    title: "Golden Steps",
    filename: "celebratory-golden-steps.mp3",
    mood: "celebratory",
    durationSec: 149,
    license: "CC0-1.0",
    author: "Public Domain dedication",
    sourceUrl: "https://example.com/cc0-pending",
    retrievedAt: "2026-09-17",
    sha256: "0000000000000000000000000000000000000000000000000000000000000000",
  },
];
