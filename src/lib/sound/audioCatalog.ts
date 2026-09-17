import { AUDIO_MANIFEST, type AudioManifestEntry } from "./audioManifest";

export type AudioLicense = "CC0-1.0" | "Public-Domain";
export type AudioMood = "romantic" | "royal" | "modern" | "nature" | "celebratory";

export interface AudioTrack {
  id: string;
  title: string;
  file: string;          // local path under /audio/backsound/
  mood: AudioMood;
  durationSec: number;
  license: AudioLicense;
  author: string;
  sourceUrl: string;
  retrievedAt: string;
  sha256: string;
}

export type SfxPaletteId =
  | "romantic-harp"
  | "royal-gamelan"
  | "modern-pop"
  | "gentle-nature";

export interface SfxPalette {
  id: SfxPaletteId;
  label: string;
  description: string;
  chord: { base: number; intervals: number[]; waveform: OscillatorType };
  tick: { freqA: number; freqB: number; decayMs: number; waveform: OscillatorType };
  chime: { freqs: number[]; decayMs: number; waveform: OscillatorType };
}

function toTrack(e: AudioManifestEntry): AudioTrack {
  return {
    id: e.id,
    title: e.title,
    file: `/audio/backsound/${e.filename}`,
    mood: e.mood,
    durationSec: e.durationSec,
    license: e.license,
    author: e.author,
    sourceUrl: e.sourceUrl,
    retrievedAt: e.retrievedAt,
    sha256: e.sha256,
  };
}

export const AUDIO_TRACKS: AudioTrack[] = AUDIO_MANIFEST.map(toTrack);

export const SFX_PALETTES: SfxPalette[] = [
  {
    id: "romantic-harp",
    label: "Romantic Harp",
    description: "Harpa lembut dan genta kristal; elegan untuk tema bunga & rose gold.",
    chord: { base: 523.25, intervals: [0, 4, 7, 11, 12], waveform: "sine" },
    tick: { freqA: 2400, freqB: 600, decayMs: 25, waveform: "sine" },
    chime: { freqs: [880, 1318.51, 1760], decayMs: 600, waveform: "sine" },
  },
  {
    id: "royal-gamelan",
    label: "Royal Gamelan",
    description: "Genta slendro dan resonansi perunggu; untuk tema adat Jawa & keraton.",
    chord: { base: 580, intervals: [0, 3, 7, 10, 12], waveform: "triangle" },
    tick: { freqA: 1800, freqB: 480, decayMs: 30, waveform: "triangle" },
    chime: { freqs: [580, 920, 1350], decayMs: 1200, waveform: "sine" },
  },
  {
    id: "modern-pop",
    label: "Modern Pop",
    description: "Nada cerah dan pop; untuk tema minimalis & cute illustrated.",
    chord: { base: 587.33, intervals: [0, 4, 7, 12], waveform: "triangle" },
    tick: { freqA: 3000, freqB: 900, decayMs: 18, waveform: "square" },
    chime: { freqs: [1046.5, 1318.5, 1567.98], decayMs: 450, waveform: "triangle" },
  },
  {
    id: "gentle-nature",
    label: "Gentle Nature",
    description: "Nada alamiah dan tenang; untuk tema islami, rustic & celestial.",
    chord: { base: 440, intervals: [0, 5, 7, 12], waveform: "sine" },
    tick: { freqA: 2100, freqB: 520, decayMs: 22, waveform: "sine" },
    chime: { freqs: [660, 990, 1320], decayMs: 800, waveform: "sine" },
  },
];

export function getTrack(id: string): AudioTrack | undefined {
  return AUDIO_TRACKS.find((t) => t.id === id);
}

export function getPalette(id: string): SfxPalette | undefined {
  return SFX_PALETTES.find((p) => p.id === id);
}

export function listTracks(mood?: AudioMood): AudioTrack[] {
  return mood ? AUDIO_TRACKS.filter((t) => t.mood === mood) : AUDIO_TRACKS;
}

export function listPalettes(): SfxPalette[] {
  return SFX_PALETTES;
}

/**
 * Guardrail lisensi. Melempar Error bila ada entri yang melanggar aturan
 * CC0/no-hotlink. Dipanggil di test dan di scripts/fetch-cc0-audio.mjs.
 */
export function validateCatalog(): void {
  const seen = new Set<string>();
  for (const t of AUDIO_TRACKS) {
    if (seen.has(t.id)) throw new Error(`Duplicate track id: ${t.id}`);
    seen.add(t.id);
    if (t.license !== "CC0-1.0" && t.license !== "Public-Domain") {
      throw new Error(`Track ${t.id} has non-CC0 license: ${t.license}`);
    }
    if (t.file.includes("http")) {
      throw new Error(`Track ${t.id} hotlinks a remote URL: ${t.file}`);
    }
    if (!t.file.startsWith("/audio/backsound/")) {
      throw new Error(`Track ${t.id} is not under /audio/backsound/: ${t.file}`);
    }
    if (!t.sourceUrl.startsWith("http")) {
      throw new Error(`Track ${t.id} is missing a sourceUrl`);
    }
    if (!/^[a-f0-9]{64}$/.test(t.sha256)) {
      throw new Error(`Track ${t.id} has an invalid sha256`);
    }
  }
  if (SFX_PALETTES.length !== 4) {
    throw new Error(`Expected 4 SFX palettes, found ${SFX_PALETTES.length}`);
  }
}
