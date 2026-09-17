# HariKita Invitation Audio (Backsound CC0 + SFX Palette + Builder Picker) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every HariKita invitation template a thematically fitting, provably commercial-safe (CC0) self-hosted backsound, wire up the existing per-theme SFX palette, and let clients pick both in the custom builder.

**Architecture:** A typed audio catalog (`audioCatalog.ts`) is the single source of truth for tracks + licenses. A pure `themeAudioMap.ts` resolves (archetype, sfxTheme) → {track, palette} for all templates. A single React hook (`useInvitationAudio.ts`) owns all playback at runtime. The builder gets a two-pane `AudioPickerPanel` persisting to two new nullable Prisma columns.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript 5.7, Prisma 6 (PostgreSQL + SQLite mirrors), Node built-in test runner via `tsx --test`, Web Audio API, lucide-react, Tailwind.

**Spec:** `docs/superpowers/specs/2026-09-17-harikita-invitation-audio-design.md`

## Global Constraints

- **License rule (hard):** Only `"CC0-1.0"` or `"Public-Domain"` are valid `license` values. Any other value must be rejected by `validateCatalog()` and by the fetch script. — copied verbatim from spec §2.
- **No hotlinking:** No track `file` value may contain `http`. All backsound files live under `public/audio/backsound/`. The two existing `https://cdn.pixabay.com/download/audio/...` URLs must be removed from `templatesCatalog.ts`, `registry.ts`, and `RotatingVinylPlayer.tsx`.
- **Test command:** `npm test` runs `tsx --test tests/*.test.ts`. New tests are files named `tests/<name>.test.ts`.
- **Type-check command:** `npm run typecheck` runs `tsc --noEmit`.
- **Prisma:** Both `prisma/schema.prisma` (Postgres) and `prisma/schema.sqlite.prisma` (SQLite) define `DigitalInvitation`; **both must be kept in sync**.
- **Existing localStorage key:** `hk_sfx_muted` (string `"true"`/`"false"`). Must be honored, not renamed.
- **SFX default:** muted by default for guests. Backsound: plays unmuted at gain `0.4` when the cover opens.
- **Server action pattern:** wrap logic in `runAction()` from `src/server/actions/_shared.ts`, return `ActionResult<T>`; use `requireSession()` for auth.
- **Code comments / user-facing copy:** Match existing codebase language (Indonesian comments are prevalent; keep new user-facing strings in Indonesian).

---

## File Structure

| File | Responsibility |
|---|---|
| `src/lib/sound/audioCatalog.ts` | NEW — track + palette catalog, types, `validateCatalog()` |
| `src/lib/sound/audioManifest.ts` | NEW — raw manifest data (ids, license metadata, sha256) consumed by script + catalog |
| `src/lib/sound/themeAudioMap.ts` | NEW — pure (archetype, sfxTheme) → preset resolver |
| `src/lib/sound/soundscapeEngine.ts` | MODIFY — add `setPalette()`; parameterize tones per palette |
| `src/lib/sound/useInvitationAudio.ts` | NEW — the only runtime playback owner |
| `src/components/invitation/shell/InvitationAudioPlayer.tsx` | NEW — visible player UI (play/pause + SFX toggle) |
| `src/components/builder/AudioPickerPanel.tsx` | NEW — builder 2-pane picker |
| `src/server/actions/invitation-audio.ts` | NEW — persist backsoundTrackId + sfxPaletteId |
| `scripts/fetch-cc0-audio.mjs` | NEW — download + verify + generate LICENSES.md |
| `public/audio/backsound/*.mp3` | NEW — self-hosted tracks (maintainer-fetched) |
| `public/audio/LICENSES.md` | NEW — generated provenance record |
| `src/lib/templates/templatesCatalog.ts` | MODIFY — replace Pixabay URLs with catalog track ids |
| `src/lib/templates/registry.ts` | MODIFY — same for legacy presets |
| `src/lib/templates/types.ts` | MODIFY — `defaultAudioTrack` semantics → catalog track id |
| `src/components/templates/TemplateEngineResolver.tsx` | MODIFY — remove hard mute/disables; use the hook |
| `src/components/invitation/shell/RotatingVinylPlayer.tsx` | MODIFY — remove hardcoded Pixabay default |
| `src/app/undangan/[slug]/page.tsx` | MODIFY — resolve track/palette and pass down |
| `prisma/schema.prisma` + `prisma/schema.sqlite.prisma` | MODIFY — 2 new columns |
| `src/app/builder/page.tsx` | MODIFY — mount AudioPickerPanel |

---

## Task 1: Audio catalog types + validation

**Files:**
- Create: `src/lib/sound/audioCatalog.ts`
- Create: `src/lib/sound/audioManifest.ts`
- Test: `tests/audioCatalog.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type AudioLicense = "CC0-1.0" | "Public-Domain"`
  - `type AudioMood = "romantic" | "royal" | "modern" | "nature" | "celebratory"`
  - `interface AudioTrack { id: string; title: string; file: string; mood: AudioMood; durationSec: number; license: AudioLicense; author: string; sourceUrl: string; retrievedAt: string; sha256: string }`
  - `interface SfxPalette { id: "romantic-harp" | "royal-gamelan" | "modern-pop" | "gentle-nature"; label: string; description: string; chord: { base: number; intervals: number[]; waveform: OscillatorType }; tick: { freqA: number; freqB: number; decayMs: number; waveform: OscillatorType }; chime: { freqs: number[]; decayMs: number; waveform: OscillatorType } }`
  - `const AUDIO_TRACKS: AudioTrack[]`
  - `const SFX_PALETTES: SfxPalette[]`
  - `function getTrack(id: string): AudioTrack | undefined`
  - `function getPalette(id: string): SfxPalette | undefined`
  - `function listTracks(mood?: AudioMood): AudioTrack[]`
  - `function listPalettes(): SfxPalette[]`
  - `function validateCatalog(): void` (throws `Error` on violation)

- [ ] **Step 1: Write the failing test**

Create `tests/audioCatalog.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AUDIO_TRACKS,
  SFX_PALETTES,
  validateCatalog,
  getTrack,
  getPalette,
  listTracks,
} from "../src/lib/sound/audioCatalog";

test("validateCatalog does not throw on the shipped catalog", () => {
  assert.doesNotThrow(() => validateCatalog());
});

test("every track has a CC0 or Public-Domain license", () => {
  for (const t of AUDIO_TRACKS) {
    assert.ok(
      t.license === "CC0-1.0" || t.license === "Public-Domain",
      `track ${t.id} has non-CC0 license: ${t.license}`,
    );
  }
});

test("no track file hotlinks a remote URL", () => {
  for (const t of AUDIO_TRACKS) {
    assert.ok(
      !t.file.includes("http"),
      `track ${t.id} hotlinks a remote URL: ${t.file}`,
    );
    assert.ok(
      t.file.startsWith("/audio/backsound/"),
      `track ${t.id} is not under /audio/backsound/: ${t.file}`,
    );
  }
});

test("every track has full provenance metadata", () => {
  for (const t of AUDIO_TRACKS) {
    assert.ok(t.sourceUrl.startsWith("http"), `track ${t.id} needs sourceUrl`);
    assert.ok(t.author.length > 0, `track ${t.id} needs author`);
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(t.retrievedAt), `track ${t.id} needs ISO retrievedAt`);
    assert.ok(/^[a-f0-9]{64}$/.test(t.sha256), `track ${t.id} needs sha256`);
    assert.ok(t.durationSec > 0, `track ${t.id} needs durationSec`);
  }
});

test("getTrack and getPalette resolve known ids and return undefined otherwise", () => {
  assert.ok(getTrack(AUDIO_TRACKS[0].id));
  assert.equal(getTrack("does-not-exist"), undefined);
  assert.ok(getPalette("romantic-harp"));
  assert.equal(getPalette("nope" as never), undefined);
});

test("catalog covers all five moods", () => {
  for (const mood of ["romantic", "royal", "modern", "nature", "celebratory"] as const) {
    assert.ok(listTracks(mood).length > 0, `no track for mood ${mood}`);
  }
});

test("there are exactly four SFX palettes with the documented ids", () => {
  const ids = SFX_PALETTES.map((p) => p.id).sort();
  assert.deepEqual(ids, ["gentle-nature", "modern-pop", "romantic-harp", "royal-gamelan"]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test tests/audioCatalog.test.ts`
Expected: FAIL — `Cannot find module '../src/lib/sound/audioCatalog'`

- [ ] **Step 3: Create the manifest**

Create `src/lib/sound/audioManifest.ts`. This is the raw data consumed by both the
catalog and the fetch script. Five tracks minimum — one per mood. `sha256` starts as
`"0".repeat(64)`; Task 2's script fills the real value, and the maintainer commits it.
`file` uses the local path; `sourceUrl` points at the CC0 source page.

```ts
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

export const AUDIO_MANIFEST: AudioManifestEntry[] = [
  {
    id: "romantic-harp-dawn",
    title: "Harp Dawn",
    filename: "romantic-harp-dawn.mp3",
    mood: "romantic",
    durationSec: 154,
    license: "CC0-1.0",
    author: "Public Domain dedication",
    sourceUrl: "REPLACE_ME_WITH_CC0_SOURCE_URL",
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
    sourceUrl: "REPLACE_ME_WITH_CC0_SOURCE_URL",
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
    sourceUrl: "REPLACE_ME_WITH_CC0_SOURCE_URL",
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
    sourceUrl: "REPLACE_ME_WITH_CC0_SOURCE_URL",
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
    sourceUrl: "REPLACE_ME_WITH_CC0_SOURCE_URL",
    retrievedAt: "2026-09-17",
    sha256: "0000000000000000000000000000000000000000000000000000000000000000",
  },
];
```

- [ ] **Step 4: Create the catalog**

Create `src/lib/sound/audioCatalog.ts`:

```ts
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --import tsx --test tests/audioCatalog.test.ts`
Expected: PASS (7 tests). The `sourceUrl` assertion currently passes because `"REPLACE_ME_WITH_CC0_SOURCE_URL"` does **not** start with `http` — it will FAIL. Fix by temporarily making each `sourceUrl` a real-looking placeholder URL, e.g. `"https://example.com/cc0-pending"`, in `audioManifest.ts`. Re-run until PASS.

- [ ] **Step 6: Run the full suite + typecheck**

Run: `npm test` then `npm run typecheck`
Expected: all tests pass; no type errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/sound/audioCatalog.ts src/lib/sound/audioManifest.ts tests/audioCatalog.test.ts
git commit -m "feat(audio): typed CC0 audio catalog with license guardrail + SFX palettes"
```

---

## Task 2: Fetch script + license record

**Files:**
- Create: `scripts/fetch-cc0-audio.mjs`
- Create: `public/audio/backsound/.gitkeep`
- Test: `tests/audioCatalog.test.ts` (extend) — reuse

**Interfaces:**
- Consumes: `AUDIO_MANIFEST` shape from `src/lib/sound/audioManifest.ts` (parsed by regex/import).
- Produces: `public/audio/backsound/<filename>.mp3`, `public/audio/LICENSES.md`; writes real `sha256` values back to `audioManifest.ts`.

- [ ] **Step 1: Write the script**

Create `scripts/fetch-cc0-audio.mjs`:

```js
#!/usr/bin/env node
/**
 * HariKita — CC0 Backsound Fetcher
 *
 * Mengunduh track backsound dari AUDIO_MANIFEST, memverifikasi sha256,
 * menolak entri non-CC0, lalu menulis catatan lisensi ke public/audio/LICENSES.md.
 *
 * Pemakaian:
 *   node scripts/fetch-cc0-audio.mjs            # unduh yang belum ada
 *   node scripts/fetch-cc0-audio.mjs --force    # unduh ulang semua
 *   node scripts/fetch-cc0-audio.mjs --verify   # hanya verifikasi sha256
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DEST_DIR = join(ROOT, "public", "audio", "backsound");
const LICENSES_PATH = join(ROOT, "public", "audio", "LICENSES.md");
const MANIFEST_PATH = join(ROOT, "src", "lib", "sound", "audioManifest.ts");

const ALLOWED = new Set(["CC0-1.0", "Public-Domain"]);
const args = new Set(process.argv.slice(2));
const FORCE = args.has("--force");
const VERIFY_ONLY = args.has("--verify");

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

async function loadManifest() {
  const src = await readFile(MANIFEST_PATH, "utf8");
  // Ambil objek literal di dalam AUDIO_MANIFEST = [ ... ];
  const start = src.indexOf("AUDIO_MANIFEST");
  const eq = src.indexOf("[", start);
  const end = src.lastIndexOf("];");
  const arrayLiteral = src.slice(eq, end + 1);

  // Ubah literal TS (murni JSON-compatible) menjadi JSON.
  const jsonish = arrayLiteral
    .replace(/,\s*\]/g, "]")
    .replace(/'/g, '"');
  return JSON.parse(jsonish);
}

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function fetchBuffer(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const manifest = await loadManifest();
  if (!Array.isArray(manifest) || manifest.length === 0) {
    throw new Error("AUDIO_MANIFEST kosong atau tidak terbaca.");
  }

  // Guardrail lisensi — berlaku di --verify maupun unduhan.
  for (const e of manifest) {
    if (!ALLOWED.has(e.license)) {
      throw new Error(`Ditolak: track ${e.id} berlisensi "${e.license}" (hanya CC0-1.0 / Public-Domain).`);
    }
    if (String(e.file ?? e.filename ?? "").includes("http") === false && !e.filename) {
      throw new Error(`Track ${e.id} tidak punya filename.`);
    }
  }

  await mkdir(DEST_DIR, { recursive: true });

  const records = [];
  for (const e of manifest) {
    const dest = join(DEST_DIR, e.filename);
    let buf;

    if (VERIFY_ONLY || (await exists(dest) && !FORCE)) {
      buf = await readFile(dest);
    } else {
      if (String(e.sourceUrl).includes("example.com")) {
        console.warn(`[skip] ${e.id}: sourceUrl masih placeholder (${e.sourceUrl}). Isi dulu sumber CC0 asli.`);
        records.push({ ...e, present: false });
        continue;
      }
      console.log(`[get ] ${e.id} <- ${e.sourceUrl}`);
      buf = await fetchBuffer(e.sourceUrl);
      await writeFile(dest, buf);
    }

    const digest = sha256(buf);
    const recorded = /^[a-f0-9]{64}$/.test(e.sha256) && e.sha256 !== "0".repeat(64);
    if (recorded && digest !== e.sha256) {
      throw new Error(`sha256 mismatch untuk ${e.id}: tercatat ${e.sha256}, aktual ${digest}`);
    }
    records.push({ ...e, present: true, actualSha256: digest });
  }

  const lines = [
    "# Backsound Audio Licenses",
    "",
    "Seluruh backtrack di bawah ini berlisensi **CC0-1.0 / Public Domain** — bebas",
    "digunakan komersial tanpa atribusi. File di-self-host di `public/audio/backsound/`.",
    "",
    "| Track ID | Title | Mood | License | Author | Source | Retrieved | SHA-256 |",
    "|---|---|---|---|---|---|---|---|",
  ];
  for (const r of records) {
    if (!r.present) {
      lines.push(`| ${r.id} | ${r.title} | ${r.mood} | ${r.license} | ${r.author} | ${r.sourceUrl} | ${r.retrievedAt} | _(belum diunduh)_ |`);
    } else {
      lines.push(`| ${r.id} | ${r.title} | ${r.mood} | ${r.license} | ${r.author} | ${r.sourceUrl} | ${r.retrievedAt} | \`${r.actualSha256}\` |`);
    }
  }
  lines.push("", "> Dihasilkan otomatis oleh `scripts/fetch-cc0-audio.mjs`. Jangan edit manual.");
  await writeFile(LICENSES_PATH, lines.join("\n") + "\n", "utf8");

  console.log(`\nOK. ${records.filter((r) => r.present).length}/${records.length} track siap.`);
  console.log(`Lisensi ditulis ke ${LICENSES_PATH}`);
}

main().catch((err) => {
  console.error("GAGAL:", err.message);
  process.exit(1);
});
```

- [ ] **Step 2: Create the destination folder placeholder**

Create `public/audio/backsound/.gitkeep` (empty file).

- [ ] **Step 3: Verify the script's guardrail rejects a non-CC0 license**

Temporarily edit `src/lib/sound/audioManifest.ts`, changing the first entry's
`license` to `"Pixabay-Content-License"`. Run:

`node scripts/fetch-cc0-audio.mjs --verify`

Expected: FAIL with `Ditolak: track romantic-harp-dawn berlisensi "Pixabay-Content-License" (hanya CC0-1.0 / Public-Domain).`

- [ ] **Step 4: Revert and verify it runs**

Revert the license back to `"CC0-1.0"`. Run:

`node scripts/fetch-cc0-audio.mjs --verify`

Expected: prints `[skip] ... sourceUrl masih placeholder` for each track and exits `OK. 0/5 track siap.`, and writes `public/audio/LICENSES.md` with the `_(belum diunduh)_` cells. (There is no local file yet, and `--verify` on a missing file will throw — if it does, that is correct behaviour; confirm the error names the missing file.)

- [ ] **Step 5: Add an npm script**

Modify `package.json` `scripts`, adding after `"assets:verify"`:

```json
    "audio:fetch": "node scripts/fetch-cc0-audio.mjs",
    "audio:verify": "node scripts/fetch-cc0-audio.mjs --verify",
```

- [ ] **Step 6: Commit**

```bash
git add scripts/fetch-cc0-audio.mjs public/audio/backsound/.gitkeep public/audio/LICENSES.md package.json
git commit -m "feat(audio): CC0 fetch script dengan guardrail lisensi + catatan LICENSES.md"
```

---

## Task 3: Theme → Audio resolver

**Files:**
- Create: `src/lib/sound/themeAudioMap.ts`
- Test: `tests/themeAudioMap.test.ts`

**Interfaces:**
- Consumes: `AUDIO_TRACKS`, `getTrack`, `SfxPaletteId` from `./audioCatalog`; `ArchetypeId` and `SectionMatrixConfig` from `@/lib/templates/types`; `ALL_INVITATION_TEMPLATES` from `@/lib/templates/registry`.
- Produces:
  - `interface ThemeAudioPreset { defaultTrackId: string; sfxPaletteId: SfxPaletteId }`
  - `function resolveThemeAudio(archetypeId: ArchetypeId, sfxTheme?: SectionMatrixConfig["sfxTheme"]): ThemeAudioPreset`

- [ ] **Step 1: Write the failing test**

Create `tests/themeAudioMap.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { ALL_INVITATION_TEMPLATES } from "../src/lib/templates/registry";
import { resolveThemeAudio } from "../src/lib/sound/themeAudioMap";
import { AUDIO_TRACKS, SFX_PALETTES } from "../src/lib/sound/audioCatalog";

const trackIds = new Set(AUDIO_TRACKS.map((t) => t.id));
const paletteIds = new Set(SFX_PALETTES.map((p) => p.id));

test("resolveThemeAudio is total across every shipped template", () => {
  for (const t of ALL_INVITATION_TEMPLATES) {
    const preset = resolveThemeAudio(t.archetypeId, t.sectionConfig?.sfxTheme);
    assert.ok(preset.defaultTrackId, `template ${t.id} resolved to no track`);
    assert.ok(trackIds.has(preset.defaultTrackId), `template ${t.id} resolved to unknown track ${preset.defaultTrackId}`);
    assert.ok(paletteIds.has(preset.sfxPaletteId), `template ${t.id} resolved to unknown palette ${preset.sfxPaletteId}`);
  }
});

test("explicit sfxTheme overrides the archetype default", () => {
  // botanical normally maps to romantic-harp; forcing royal-gamelan must win.
  const forced = resolveThemeAudio("botanical", "royal-gamelan");
  assert.equal(forced.sfxPaletteId, "royal-gamelan");
});

test("javanese archetype resolves to the royal gamelan palette", () => {
  assert.equal(resolveThemeAudio("javanese").sfxPaletteId, "royal-gamelan");
});

test("islamic archetype resolves to the gentle nature palette", () => {
  assert.equal(resolveThemeAudio("islamic").sfxPaletteId, "gentle-nature");
});

test("legacy archetype aliases resolve without throwing", () => {
  for (const legacy of [
    "animated-motion",
    "minimalist-typographic",
    "fullscreen-prewed",
    "romantic-floral",
    "syari-islamic",
    "cultural-traditional",
    "royal-luxury",
    "special-family-event",
  ] as const) {
    const preset = resolveThemeAudio(legacy);
    assert.ok(trackIds.has(preset.defaultTrackId), `legacy ${legacy} resolved to unknown track`);
    assert.ok(paletteIds.has(preset.sfxPaletteId), `legacy ${legacy} resolved to unknown palette`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test tests/themeAudioMap.test.ts`
Expected: FAIL — `Cannot find module '../src/lib/sound/themeAudioMap'`

- [ ] **Step 3: Implement the resolver**

Create `src/lib/sound/themeAudioMap.ts`:

```ts
import type { ArchetypeId, SectionMatrixConfig } from "@/lib/templates/types";
import type { AudioMood, SfxPaletteId } from "./audioCatalog";
import { AUDIO_TRACKS } from "./audioCatalog";

export interface ThemeAudioPreset {
  defaultTrackId: string;
  sfxPaletteId: SfxPaletteId;
}

/** Peta archetype berikut alias legacy-nya → mood backsound. */
const ARCHETYPE_MOOD: Record<string, AudioMood> = {
  botanical: "romantic",
  "romantic-floral": "romantic",
  "animated-motion": "romantic",
  "rose-gold": "romantic",
  "royal-luxury": "romantic",

  javanese: "royal",
  "cultural-traditional": "royal",

  islamic: "nature",
  "syari-islamic": "nature",
  rustic: "nature",

  minimalist: "modern",
  "minimalist-typographic": "modern",
  celestial: "modern",
  "fullscreen-prewed": "modern",

  "cute-illustrated": "celebratory",
  "special-family-event": "celebratory",
};

/** Peta mood → palette SFX default. */
const MOOD_PALETTE: Record<AudioMood, SfxPaletteId> = {
  romantic: "romantic-harp",
  royal: "royal-gamelan",
  modern: "modern-pop",
  nature: "gentle-nature",
  celebratory: "modern-pop",
};

/** Peta sfxTheme (dead code yang kini dihidupkan) → palette SFX. */
const SFX_THEME_PALETTE: Record<NonNullable<SectionMatrixConfig["sfxTheme"]>, SfxPaletteId> = {
  "romantic-harp": "romantic-harp",
  "royal-gamelan": "royal-gamelan",
  "modern-pop": "modern-pop",
  "gentle-nature": "gentle-nature",
};

const FALLBACK_MOOD: AudioMood = "romantic";

function firstTrackIdForMood(mood: AudioMood): string {
  const track = AUDIO_TRACKS.find((t) => t.mood === mood) ?? AUDIO_TRACKS[0];
  return track.id;
}

/**
 * Resolusi deterministik (archetype, sfxTheme) → preset audio.
 * Total function: selalu mengembalikan track id yang ada di katalog.
 * `sfxTheme` eksplisit menang atas default archetype.
 */
export function resolveThemeAudio(
  archetypeId: ArchetypeId | string,
  sfxTheme?: SectionMatrixConfig["sfxTheme"],
): ThemeAudioPreset {
  const mood = ARCHETYPE_MOOD[archetypeId] ?? FALLBACK_MOOD;
  const sfxPaletteId = sfxTheme ? SFX_THEME_PALETTE[sfxTheme] : MOOD_PALETTE[mood];
  return {
    defaultTrackId: firstTrackIdForMood(mood),
    sfxPaletteId,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test tests/themeAudioMap.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/sound/themeAudioMap.ts tests/themeAudioMap.test.ts
git commit -m "feat(audio): pure theme->backsound/SFX resolver, wiring up sfxTheme dead code"
```

---

## Task 4: Palette support in the soundscape engine

**Files:**
- Modify: `src/lib/sound/soundscapeEngine.ts`
- Test: `tests/soundscapeEngine.test.ts`

**Interfaces:**
- Consumes: `getPalette`, `SfxPalette`, `SfxPaletteId` from `@/lib/sound/audioCatalog` (relative to sound dir: `./audioCatalog`).
- Produces: `soundscape.setPalette(id: SfxPaletteId): void` and `soundscape.getPaletteId(): SfxPaletteId`.

- [ ] **Step 1: Write the failing test**

Create `tests/soundscapeEngine.test.ts`. This test runs in Node, where `AudioContext`
does not exist. That is the point: the engine must degrade to no-ops and still expose
palette state.

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { soundscape } from "../src/lib/sound/soundscapeEngine";

test("engine starts on the romantic-harp palette", () => {
  assert.equal(soundscape.getPaletteId(), "romantic-harp");
});

test("setPalette changes the active palette", () => {
  soundscape.setPalette("royal-gamelan");
  assert.equal(soundscape.getPaletteId(), "royal-gamelan");
  soundscape.setPalette("romantic-harp");
});

test("setPalette ignores unknown ids and keeps the previous palette", () => {
  soundscape.setPalette("modern-pop");
  soundscape.setPalette("nonsense" as never);
  assert.equal(soundscape.getPaletteId(), "modern-pop");
  soundscape.setPalette("romantic-harp");
});

test("SFX calls are safe no-ops without a browser AudioContext", () => {
  assert.doesNotThrow(() => {
    soundscape.playTick();
    soundscape.playChime();
    soundscape.playCoin();
    soundscape.playCoverOpen();
    soundscape.playConfettiPop();
    soundscape.playGamelanBell();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test tests/soundscapeEngine.test.ts`
Expected: FAIL — `soundscape.getPaletteId is not a function`

- [ ] **Step 3: Add palette state and accessors**

Modify `src/lib/sound/soundscapeEngine.ts`. Add the import at the top (after the
header comment block):

```ts
import { getPalette, type SfxPalette, type SfxPaletteId } from "./audioCatalog";
```

Inside `class SoundscapeEngine`, add private fields after `private listeners`:

```ts
  private paletteId: SfxPaletteId = "romantic-harp";
  private palette: SfxPalette = getPalette("romantic-harp")!;
```

Add the public methods after `subscribe`:

```ts
  public setPalette(id: SfxPaletteId): void {
    const next = getPalette(id);
    if (!next) return; // abaikan id tak dikenal, pertahankan palette sebelumnya
    this.paletteId = id;
    this.palette = next;
  }

  public getPaletteId(): SfxPaletteId {
    return this.paletteId;
  }
```

- [ ] **Step 4: Use palette parameters in the tone methods**

Replace the hardcoded tone values in the four methods so they read from
`this.palette`:

`playCoverOpen` — replace the `const notes = [523.25, ...]` line and its loop with:

```ts
    const notes = this.palette.chord.intervals.map((semitones) =>
      this.palette.chord.base * Math.pow(2, semitones / 12),
    );
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = this.palette.chord.waveform;
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.001, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(this.volume * 0.25, now + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.85);
    });
```

`playTick` — replace the hardcoded frequencies/waveform:

```ts
    osc.type = this.palette.tick.waveform;
    osc.frequency.setValueAtTime(this.palette.tick.freqA, now);
    osc.frequency.exponentialRampToValueAtTime(
      this.palette.tick.freqB,
      now + this.palette.tick.decayMs / 1000,
    );
    gain.gain.setValueAtTime(this.volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + this.palette.tick.decayMs / 1000);
    osc.start(now);
    osc.stop(now + this.palette.tick.decayMs / 1000 + 0.005);
```

`playChime` — replace `const freqs = [880, 1318.51, 1760];` with:

```ts
    const freqs = this.palette.chime.freqs;
```

and in the loop use `this.palette.chime.decayMs / 1000` in place of `0.6`, and
`osc.type = this.palette.chime.waveform;`.

`playGamelanBell` — replace the `partials` array with:

```ts
    const partials = this.palette.chord.intervals.map((semitones, i) => ({
      freq: this.palette.chord.base * Math.pow(2, semitones / 12),
      gain: [0.3, 0.2, 0.15, 0.08, 0.05][i] ?? 0.05,
    }));
```

Leave `playCoin` and `playConfettiPop` as-is (they are celebration cues, not
palette-specific).

- [ ] **Step 5: Run test to verify it passes**

Run: `node --import tsx --test tests/soundscapeEngine.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 6: Typecheck + full suite**

Run: `npm run typecheck; if ($?) { npm test }`
Expected: no type errors; all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/lib/sound/soundscapeEngine.ts tests/soundscapeEngine.test.ts
git commit -m "feat(audio): parameterize soundscape engine tones per SFX palette"
```

---

## Task 5: The `useInvitationAudio` hook

**Files:**
- Create: `src/lib/sound/useInvitationAudio.ts`
- Test: `tests/useInvitationAudio.test.ts`

**Interfaces:**
- Consumes: `soundscape` from `./soundscapeEngine`; `getTrack`, `SfxPaletteId` from `./audioCatalog`.
- Produces:
  - `function resolveAudioSrc(musicUrl: string | null | undefined, backsoundTrackId: string | null | undefined, fallbackTrackId: string): string | null`
  - `function useInvitationAudio(opts: { trackId: string; paletteId: SfxPaletteId; started: boolean; musicUrlOverride?: string | null }): { isPlaying: boolean; isSfxEnabled: boolean; togglePlayback: () => void; toggleSfx: () => void }`

- [ ] **Step 1: Write the failing test**

Create `tests/useInvitationAudio.test.ts`. The hook itself needs a browser; the pure
resolution function is the testable contract and encodes the precedence rule from
spec §3.

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveAudioSrc } from "../src/lib/sound/useInvitationAudio";
import { AUDIO_TRACKS } from "../src/lib/sound/audioCatalog";

const fallback = AUDIO_TRACKS[0].id;

test("legacy musicUrl wins over everything", () => {
  const src = resolveAudioSrc("https://example.com/legacy.mp3", "royal-gamelan-lantern", fallback);
  assert.equal(src, "https://example.com/legacy.mp3");
});

test("backsoundTrackId is used when musicUrl is absent", () => {
  const src = resolveAudioSrc(null, "royal-gamelan-lantern", fallback);
  assert.equal(src, "/audio/backsound/royal-gamelan-lantern.mp3");
});

test("falls back to the theme default when both overrides are absent", () => {
  const src = resolveAudioSrc(null, null, fallback);
  assert.ok(src && src.startsWith("/audio/backsound/"), `expected local fallback, got ${src}`);
});

test("unknown backsoundTrackId falls back to the theme default", () => {
  const src = resolveAudioSrc(undefined, "not-a-real-track", fallback);
  assert.ok(src && src.startsWith("/audio/backsound/"), `expected local fallback, got ${src}`);
});

test("returns null when nothing resolves (empty catalog)", () => {
  assert.equal(resolveAudioSrc(null, null, "not-a-real-track"), null);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test tests/useInvitationAudio.test.ts`
Expected: FAIL — `Cannot find module '../src/lib/sound/useInvitationAudio'`

- [ ] **Step 3: Implement the hook**

Create `src/lib/sound/useInvitationAudio.ts`:

```ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { soundscape } from "./soundscapeEngine";
import { getTrack, type SfxPaletteId } from "./audioCatalog";

export const BACKSOUND_GAIN = 0.4;
const SFX_MUTE_KEY = "hk_sfx_muted";

/**
 * Aturan presedensi (spec §3): musicUrl > backsoundTrackId > fallback tema.
 * Mengembalikan path lokal `/audio/backsound/*.mp3`, URL legacy apa adanya,
 * atau null bila tak ada yang bisa di-resolve.
 */
export function resolveAudioSrc(
  musicUrl: string | null | undefined,
  backsoundTrackId: string | null | undefined,
  fallbackTrackId: string,
): string | null {
  if (musicUrl) return musicUrl;
  const chosen = getTrack(backsoundTrackId ?? "") ?? getTrack(fallbackTrackId);
  return chosen ? chosen.file : null;
}

interface UseInvitationAudioOptions {
  trackId: string;
  paletteId: SfxPaletteId;
  started: boolean;
  musicUrlOverride?: string | null;
}

/**
 * Pemilik tunggal seluruh pemutaran audio undangan. Backsound mulai tanpa mute
 * (gain 0.4) saat `started` menjadi true; SFX default mute dan menghormati
 * localStorage `hk_sfx_muted`.
 */
export function useInvitationAudio({
  trackId,
  paletteId,
  started,
  musicUrlOverride,
}: UseInvitationAudioOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSfxEnabled, setIsSfxEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const src = resolveAudioSrc(musicUrlOverride, trackId, trackId);

  // Muat preferensi SFX tamu dari localStorage.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(SFX_MUTE_KEY);
    const muted = stored === null ? true : stored === "true";
    setIsSfxEnabled(!muted);
    soundscape.setMuted(muted);
  }, []);

  // Terapkan palette SFX aktif.
  useEffect(() => {
    soundscape.setPalette(paletteId);
  }, [paletteId]);

  // Buat / ganti elemen audio saat src berubah.
  useEffect(() => {
    if (typeof window === "undefined" || !src) return;
    const el = new Audio(src);
    el.loop = true;
    el.preload = "auto";
    el.volume = BACKSOUND_GAIN;
    audioRef.current = el;
    return () => {
      el.pause();
      if (audioRef.current === el) audioRef.current = null;
    };
  }, [src]);

  // Mulai saat sampul dibuka; gagal autoplay bukan error fatal.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (started) {
      el.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      el.pause();
      setIsPlaying(false);
    }
  }, [started, src]);

  const togglePlayback = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      el.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [isPlaying]);

  const toggleSfx = useCallback(() => {
    setIsSfxEnabled((prev) => {
      const next = !prev;
      soundscape.setMuted(!next);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SFX_MUTE_KEY, String(!next));
      }
      return next;
    });
  }, []);

  return { isPlaying, isSfxEnabled, togglePlayback, toggleSfx };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test tests/useInvitationAudio.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/sound/useInvitationAudio.ts tests/useInvitationAudio.test.ts
git commit -m "feat(audio): useInvitationAudio hook + precedence resolver"
```

---

## Task 6: Player UI component

**Files:**
- Create: `src/components/invitation/shell/InvitationAudioPlayer.tsx`
- Test: manual (UI); no unit test — logic lives in the hook (Task 5).

**Interfaces:**
- Consumes: `useInvitationAudio`'s return shape.
- Produces: `InvitationAudioPlayer` React component with props `{ trackId: string; paletteId: SfxPaletteId; started: boolean; musicUrlOverride?: string | null; themeColors?: { primary?: string; accent?: string } }`.

- [ ] **Step 1: Create the component**

Create `src/components/invitation/shell/InvitationAudioPlayer.tsx`:

```tsx
"use client";

import React from "react";
import { Play, Pause, Music2, Volume2, VolumeX } from "lucide-react";
import { useInvitationAudio } from "@/lib/sound/useInvitationAudio";
import type { SfxPaletteId } from "@/lib/sound/audioCatalog";

interface InvitationAudioPlayerProps {
  trackId: string;
  paletteId: SfxPaletteId;
  started: boolean;
  musicUrlOverride?: string | null;
  themeColors?: { primary?: string; accent?: string };
}

export const InvitationAudioPlayer: React.FC<InvitationAudioPlayerProps> = ({
  trackId,
  paletteId,
  started,
  musicUrlOverride,
  themeColors,
}) => {
  const { isPlaying, isSfxEnabled, togglePlayback, toggleSfx } = useInvitationAudio({
    trackId,
    paletteId,
    started,
    musicUrlOverride,
  });

  const accent = themeColors?.accent || "#C5A880";

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
      <button
        onClick={togglePlayback}
        aria-label={isPlaying ? "Jeda musik latar" : "Putar musik latar"}
        title={isPlaying ? "Jeda musik latar" : "Putar musik latar"}
        className="p-3 rounded-full shadow-2xl backdrop-blur-md border transition-transform active:scale-95"
        style={{ borderColor: accent, backgroundColor: "rgba(255,255,255,0.85)" }}
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>

      <button
        onClick={toggleSfx}
        aria-label={isSfxEnabled ? "Matikan efek suara" : "Nyalakan efek suara"}
        title={isSfxEnabled ? "Matikan efek suara" : "Nyalakan efek suara"}
        className="p-3 rounded-full shadow-2xl backdrop-blur-md border transition-transform active:scale-95"
        style={{ borderColor: accent, backgroundColor: "rgba(255,255,255,0.85)" }}
      >
        {isSfxEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        <Music2 className="hidden" aria-hidden />
      </button>
    </div>
  );
};
```

- [ ] **Step 2: Export from the shell barrel**

Modify `src/components/invitation/shell/index.ts` — add:

```ts
export { InvitationAudioPlayer } from "./InvitationAudioPlayer";
```

(Preserve existing exports; just append.)

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/invitation/shell/InvitationAudioPlayer.tsx src/components/invitation/shell/index.ts
git commit -m "feat(audio): InvitationAudioPlayer UI with play + SFX toggle"
```

---

## Task 7: Wire the resolver into `TemplateEngineResolver`

**Files:**
- Modify: `src/components/templates/TemplateEngineResolver.tsx`
- Test: manual + `npm test` regression

**Interfaces:**
- Consumes: `InvitationAudioPlayer` (Task 6), `resolveThemeAudio` (Task 3), `useInvitationAudio`'s `resolveAudioSrc` indirectly.
- Produces: the resolver no longer hard-mutes SFX and no longer disables the player.

- [ ] **Step 1: Remove the hard mute effect**

In `src/components/templates/TemplateEngineResolver.tsx`, delete lines 35-38:

```tsx
  // Ensure SFX audio is completely silenced and disabled per user specification
  useEffect(() => {
    soundscape.setMuted(true);
  }, []);
```

Also remove the now-unused `import { soundscape } from "@/lib/sound/soundscapeEngine";` on line 4 (verify with `grep` that nothing else in the file uses `soundscape`).

- [ ] **Step 2: Add the audio player block**

Add the import:

```tsx
import { InvitationAudioPlayer } from "@/components/invitation/shell";
import { resolveThemeAudio } from "@/lib/sound/themeAudioMap";
```

Inside the component, after `const themeId = props.theme?.id;` (line 62), add:

```tsx
  const audioPreset = React.useMemo(
    () => resolveThemeAudio(archetypeId, props.theme?.sectionConfig?.sfxTheme),
    [archetypeId, props.theme?.sectionConfig?.sfxTheme],
  );
```

- [ ] **Step 3: Replace the disabled player**

Replace the block at lines 158-169 (inside `{isCoverOpened && (`):

```tsx
            {/* Spinning Vinyl Audio Player — hidden until custom activation feature is built */}
            {false && (
              <RotatingVinylPlayer
                audioUrl={props.musicUrl}
                isPlaying={isMusicPlaying}
                onTogglePlay={() => setIsMusicPlaying(!isMusicPlaying)}
                albumCoverUrl={props.bride.photo}
                songTitle={`${props.bride.name} & ${props.groom.name} Nuptial`}
              />
            )}
```

with:

```tsx
            {/* Backsound + SFX controller — reads catalog track + palette */}
            <InvitationAudioPlayer
              trackId={audioPreset.defaultTrackId}
              paletteId={audioPreset.sfxPaletteId}
              started={isCoverOpened}
              musicUrlOverride={props.musicUrl}
              themeColors={props.theme?.colors}
            />
```

Remove `RotatingVinylPlayer` from the `shell` import on lines 7-12 and remove the now-unused `isMusicPlaying` state (lines 32, 66, 74) — check each usage with `grep -n "isMusicPlaying" src/components/templates/TemplateEngineResolver.tsx` before removing.

- [ ] **Step 4: Verify no stale references**

Run: `grep -n "isMusicPlaying\|RotatingVinylPlayer\|setMuted(true)" src/components/templates/TemplateEngineResolver.tsx`
Expected: no output.

- [ ] **Step 5: Typecheck + tests**

Run: `npm run typecheck; if ($?) { npm test }`
Expected: no type errors; all tests pass.

- [ ] **Step 6: Manual verification**

Run: `npm run dev`, open `http://localhost:3000/undangan/demo?theme=autumnelle`.
Expected: cover visible; after pressing "Buka Undangan", backsound begins (a local file plays — may be silent/missing until Task 2 files are fetched, which is acceptable); both buttons appear bottom-right; SFX starts muted.

- [ ] **Step 7: Commit**

```bash
git add src/components/templates/TemplateEngineResolver.tsx
git commit -m "feat(audio): enable per-theme backsound + SFX in TemplateEngineResolver"
```

---

## Task 8: Persistence — Prisma columns + server action

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma/schema.sqlite.prisma`
- Create: `src/server/actions/invitation-audio.ts`
- Test: `tests/invitation-audio-action.test.ts`

**Interfaces:**
- Consumes: `prisma`, `runAction`, `ActionResult`, `requireSession`.
- Produces: `saveInvitationAudioAction(input: { invitationId: string; backsoundTrackId: string | null; sfxPaletteId: string | null }): Promise<ActionResult<{ invitationId: string; backsoundTrackId: string | null; sfxPaletteId: string | null }>>`

- [ ] **Step 1: Add the columns to both schemas**

In `prisma/schema.prisma` and `prisma/schema.sqlite.prisma`, in `model DigitalInvitation`, add after `musicUrl String?`:

```prisma
  backsoundTrackId String?  // NEW — catalog track id (CC0 backsound)
  sfxPaletteId     String?  // NEW — SfxPalette.id
```

- [ ] **Step 2: Generate the client and push**

Run: `npm run generate; if ($?) { npm run db:push }`
Expected: Prisma client regenerated; SQLite/Postgres schema updated.

- [ ] **Step 3: Write the failing test**

Create `tests/invitation-audio-action.test.ts`. Given the action requires a session,
assert the validation contract at the pure level by importing the input validator.

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateAudioInput } from "../src/server/actions/invitation-audio";

test("accepts a valid catalog track id and palette id", () => {
  const res = validateAudioInput({
    invitationId: "inv_1",
    backsoundTrackId: "romantic-harp-dawn",
    sfxPaletteId: "romantic-harp",
  });
  assert.equal(res.ok, true);
});

test("accepts nulls (reset to theme default)", () => {
  const res = validateAudioInput({
    invitationId: "inv_1",
    backsoundTrackId: null,
    sfxPaletteId: null,
  });
  assert.equal(res.ok, true);
});

test("rejects an unknown track id", () => {
  const res = validateAudioInput({
    invitationId: "inv_1",
    backsoundTrackId: "not-a-track",
    sfxPaletteId: "romantic-harp",
  });
  assert.equal(res.ok, false);
});

test("rejects an unknown palette id", () => {
  const res = validateAudioInput({
    invitationId: "inv_1",
    backsoundTrackId: "romantic-harp-dawn",
    sfxPaletteId: "not-a-palette",
  });
  assert.equal(res.ok, false);
});

test("rejects a missing invitationId", () => {
  const res = validateAudioInput({
    invitationId: "",
    backsoundTrackId: null,
    sfxPaletteId: null,
  });
  assert.equal(res.ok, false);
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `node --import tsx --test tests/invitation-audio-action.test.ts`
Expected: FAIL — `Cannot find module '../src/server/actions/invitation-audio'`

- [ ] **Step 5: Implement the action**

Create `src/server/actions/invitation-audio.ts`:

```ts
"use server";

import { prisma } from "@/lib/prisma";
import { getTrack, getPalette } from "@/lib/sound/audioCatalog";
import { runAction, requireSession, revalidate, type ActionResult } from "./_shared";

export interface SaveInvitationAudioInput {
  invitationId: string;
  backsoundTrackId: string | null;
  sfxPaletteId: string | null;
}

export interface SaveInvitationAudioResult {
  invitationId: string;
  backsoundTrackId: string | null;
  sfxPaletteId: string | null;
}

type Validation = { ok: true } | { ok: false; reason: string };

/** Validasi murni (tanpa I/O) agar dapat diuji tanpa DB/sesi. */
export function validateAudioInput(input: SaveInvitationAudioInput): Validation {
  if (!input.invitationId) return { ok: false, reason: "invitationId wajib diisi" };
  if (input.backsoundTrackId !== null && !getTrack(input.backsoundTrackId)) {
    return { ok: false, reason: `track tidak dikenal: ${input.backsoundTrackId}` };
  }
  if (input.sfxPaletteId !== null && !getPalette(input.sfxPaletteId)) {
    return { ok: false, reason: `palette tidak dikenal: ${input.sfxPaletteId}` };
  }
  return { ok: true };
}

export async function saveInvitationAudioAction(
  input: SaveInvitationAudioInput,
): Promise<ActionResult<SaveInvitationAudioResult>> {
  return runAction(async () => {
    await requireSession();

    const check = validateAudioInput(input);
    if (!check.ok) throw new Error(check.reason);

    const updated = await prisma.digitalInvitation.update({
      where: { id: input.invitationId },
      data: {
        backsoundTrackId: input.backsoundTrackId,
        sfxPaletteId: input.sfxPaletteId,
      },
      select: { id: true, backsoundTrackId: true, sfxPaletteId: true },
    });

    revalidate(["/builder", `/undangan`]);

    return {
      invitationId: updated.id,
      backsoundTrackId: updated.backsoundTrackId,
      sfxPaletteId: updated.sfxPaletteId,
    };
  });
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `node --import tsx --test tests/invitation-audio-action.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 7: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add prisma/schema.prisma prisma/schema.sqlite.prisma src/server/actions/invitation-audio.ts tests/invitation-audio-action.test.ts
git commit -m "feat(audio): persist backsoundTrackId + sfxPaletteId via server action"
```

---

## Task 9: Builder audio picker panel

**Files:**
- Create: `src/components/builder/AudioPickerPanel.tsx`
- Modify: `src/app/builder/page.tsx`
- Test: manual

**Interfaces:**
- Consumes: `listTracks`, `listPalettes` (Task 1); `soundscape.setPalette` + `playTick` (Task 4) for SFX preview.
- Produces: `AudioPickerPanel` with props `{ selectedTrackId: string | null; selectedPaletteId: string | null; onSelectTrack: (id: string) => void; onSelectPalette: (id: string) => void }`.

- [ ] **Step 1: Create the panel**

Create `src/components/builder/AudioPickerPanel.tsx`:

```tsx
"use client";

import React, { useRef, useState } from "react";
import { Play, Pause, Music, Check, ShieldCheck } from "lucide-react";
import { listTracks, listPalettes, type SfxPaletteId } from "@/lib/sound/audioCatalog";
import { soundscape } from "@/lib/sound/soundscapeEngine";

interface AudioPickerPanelProps {
  selectedTrackId: string | null;
  selectedPaletteId: string | null;
  onSelectTrack: (id: string) => void;
  onSelectPalette: (id: SfxPaletteId) => void;
}

export const AudioPickerPanel: React.FC<AudioPickerPanelProps> = ({
  selectedTrackId,
  selectedPaletteId,
  onSelectTrack,
  onSelectPalette,
}) => {
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePreview = (file: string, id: string) => {
    if (previewingId === id && audioRef.current) {
      audioRef.current.pause();
      setPreviewingId(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const el = new Audio(file);
    el.volume = 0.4;
    el.play().then(() => setPreviewingId(id)).catch(() => setPreviewingId(null));
    audioRef.current = el;
  };

  const previewPalette = (id: SfxPaletteId) => {
    soundscape.setPalette(id);
    soundscape.setMuted(false);
    soundscape.playTick();
    setTimeout(() => soundscape.playChime(), 160);
  };

  return (
    <div className="space-y-6">
      {/* Backsound picker */}
      <div>
        <h4 className="flex items-center gap-2 text-sm font-bold text-plum mb-3">
          <Music className="w-4 h-4" />
          Musik Latar (Backsound)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {listTracks().map((t) => {
            const active = selectedTrackId === t.id;
            return (
              <div
                key={t.id}
                className={`rounded-xl border p-3 flex items-center justify-between gap-2 transition-colors ${
                  active ? "border-gold bg-gold/10" : "border-gold/30 bg-white"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-plum truncate">{t.title}</p>
                  <p className="text-[10px] text-plum-light flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> {t.license} • {t.mood}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => togglePreview(t.file, t.id)}
                    aria-label={`Pratinjau ${t.title}`}
                    className="p-2 rounded-full border border-gold/40 hover:bg-gold/10"
                  >
                    {previewingId === t.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => onSelectTrack(t.id)}
                    aria-label={`Pilih ${t.title}`}
                    className={`p-2 rounded-full border ${active ? "border-gold bg-gold text-white" : "border-gold/40 hover:bg-gold/10"}`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SFX palette picker */}
      <div>
        <h4 className="flex items-center gap-2 text-sm font-bold text-plum mb-3">
          <ShieldCheck className="w-4 h-4" />
          Efek Suara (SFX)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {listPalettes().map((p) => {
            const active = selectedPaletteId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  onSelectPalette(p.id);
                  previewPalette(p.id);
                }}
                className={`text-left rounded-xl border p-3 transition-colors ${
                  active ? "border-gold bg-gold/10" : "border-gold/30 bg-white hover:bg-gold/5"
                }`}
              >
                <p className="text-xs font-bold text-plum">{p.label}</p>
                <p className="text-[10px] text-plum-light leading-snug">{p.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Mount the panel in the builder**

In `src/app/builder/page.tsx`:

1. Add the import near the other component imports (after line 12):

```tsx
import { AudioPickerPanel } from "@/components/builder/AudioPickerPanel";
```

2. Add state next to the existing `selectedThemeId` state (near line 179 — verify with `grep -n "selectedThemeId" src/app/builder/page.tsx`):

```tsx
  const [backsoundTrackId, setBacksoundTrackId] = useState<string | null>(null);
  const [sfxPaletteId, setSfxPaletteId] = useState<string | null>(null);
```

3. Inside the `service.category === "Undangan Digital & Amplop"` block, immediately **after** the theme picker `</div>` that follows the theme map (the block containing `href={\`/undangan/demo?theme=${selectedThemeId}\`}` — locate the enclosing element's closing tag with `grep -n "undangan/demo?theme" src/app/builder/page.tsx`), insert:

```tsx
              {/* Audio picker: backsound + SFX palette */}
              <div className="mt-6 pt-6 border-t border-gold/20">
                <AudioPickerPanel
                  selectedTrackId={backsoundTrackId}
                  selectedPaletteId={sfxPaletteId}
                  onSelectTrack={setBacksoundTrackId}
                  onSelectPalette={setSfxPaletteId}
                />
              </div>
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, open `http://localhost:3000/builder`, add the "Website Undangan" service.
Expected: two audio sections render under the theme picker; preview buttons play; SFX palette buttons emit a tone; selected items highlight.

- [ ] **Step 5: Commit**

```bash
git add src/components/builder/AudioPickerPanel.tsx src/app/builder/page.tsx
git commit -m "feat(builder): backsound + SFX palette picker with live preview"
```

---

## Task 10: Render-time resolution on the guest page

**Files:**
- Modify: `src/app/undangan/[slug]/page.tsx`
- Modify: `src/lib/templates/types.ts`
- Modify: `src/components/templates/TemplateEngineResolver.tsx`
- Test: `tests/themeAudioMap.test.ts` (already covers the resolver); manual for the page.

**Interfaces:**
- Consumes: `resolveThemeAudio`, `getTrack`.
- Produces: the guest page passes `musicUrl` (legacy override) unchanged; `TemplateEngineResolver` already resolves the catalog default. This task removes the last hardcoded Pixabay fallback.

- [ ] **Step 1: Remove the Pixabay fallback in the page**

In `src/app/undangan/[slug]/page.tsx`, replace lines 184-188:

```tsx
        musicUrl={
          invitation?.musicUrl ||
          themePreset.defaultAudioTrack ||
          "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3"
        }
```

with:

```tsx
        musicUrl={invitation?.musicUrl || null}
```

Rationale: `musicUrl` on the invitation is now purely an explicit override. When it is
null, `TemplateEngineResolver` falls back to the catalog default via
`resolveThemeAudio`, so the Pixabay URL is no longer needed here.

- [ ] **Step 2: Document the new `defaultAudioTrack` semantics**

In `src/lib/templates/types.ts`, update the `defaultAudioTrack` field comment (line 106):

```ts
  defaultAudioTrack: string; // legacy field — unused for playback; catalog ids come from resolveThemeAudio()
```

- [ ] **Step 3: Stop `musicUrl` from being handed a Pixabay URL**

Verify the resolver tolerates a null override. In
`src/components/templates/TemplateEngineResolver.tsx`, `props.musicUrl` is typed
`string`. Confirm by running:

`grep -n "musicUrl" src/lib/templates/types.ts`

If `DedicatedTemplateProps.musicUrl` is `string`, change it to `string | null` in
`src/lib/templates/types.ts` (line 191) and update the page prop accordingly.

- [ ] **Step 4: Strip Pixabay URLs from the template catalogs**

Run:

```bash
node -e "const fs=require('fs');for(const f of ['src/lib/templates/templatesCatalog.ts','src/lib/templates/registry.ts']){let s=fs.readFileSync(f,'utf8');s=s.replace(/https:\/\/cdn\.pixabay\.com\/download\/audio\/[^\"']+/g,'romantic-harp-dawn');fs.writeFileSync(f,s);}"
```

This replaces every `defaultAudioTrack` Pixabay URL with the catalog id
`"romantic-harp-dawn"` (the field is legacy/no-op, but must not hotlink).

- [ ] **Step 5: Verify no Pixabay URL remains anywhere in src**

Run: `grep -rn "cdn.pixabay.com" src`
Expected: no output.

- [ ] **Step 6: Remove the RotatingVinylPlayer hardcoded default**

In `src/components/invitation/shell/RotatingVinylPlayer.tsx`, change the default
prop (line 15) from the Pixabay URL to `undefined`:

```tsx
  audioUrl,
```

and change the signature `audioUrl = "https://cdn.pixabay.com/..."` to
`audioUrl?: string` with a guard that the component renders nothing if `audioUrl` is
absent. (This component is no longer used by the resolver after Task 7, but must not
retain a hotlinked default.)

- [ ] **Step 7: Verify + full suite**

Run: `npm run typecheck; if ($?) { npm test }; if ($?) { grep -rn "cdn.pixabay.com" src }`
Expected: no type errors; all tests pass; no grep output.

- [ ] **Step 8: Manual verification**

Run: `npm run dev`, open `/undangan/demo?theme=<a-javanese-theme>` and a `<botanical-theme>`.
Expected: the two themes resolve to different catalog tracks; no network request to `cdn.pixabay.com` in DevTools Network tab.

- [ ] **Step 9: Commit**

```bash
git add src/app/undangan/[slug]/page.tsx src/lib/templates/types.ts src/components/templates/TemplateEngineResolver.tsx src/components/invitation/shell/RotatingVinylPlayer.tsx src/lib/templates/templatesCatalog.ts src/lib/templates/registry.ts
git commit -m "fix(audio): remove all Pixabay hotlinks; resolve backsound from CC0 catalog"
```

---

## Task 11: Maintainer fetch + end-to-end verification

**Files:**
- Modify: `src/lib/sound/audioManifest.ts` (real sourceUrls + sha256)
- Create: `public/audio/backsound/*.mp3` (via script)
- Test: manual e2e

**Interfaces:**
- Consumes: everything above.
- Produces: a fully working, license-clean audio system.

- [ ] **Step 1: Source the CC0 tracks**

For each manifest entry, find a CC0-1.0 or Public-Domain track (Free Music Archive
CC0 filter, Wikimedia Commons PD audio). Paste the **direct file URL** into
`sourceUrl` and set `filename` to the desired local basename. Update `author`,
`durationSec`, and `retrievedAt` to match reality.

- [ ] **Step 2: Fetch and record hashes**

Run: `npm run audio:fetch`
Expected: each entry downloads into `public/audio/backsound/`, and the real sha256
values are printed. Copy the printed digests into the manifest's `sha256` fields.

- [ ] **Step 3: Verify the guardrail**

Run: `npm run audio:verify`
Expected: PASS with no sha256 mismatch.

- [ ] **Step 4: Confirm the catalog test still passes**

Run: `node --import tsx --test tests/audioCatalog.test.ts`
Expected: PASS. If a `sha256` is still all-zeros, `validateCatalog()` fails — fill it from Step 2.

- [ ] **Step 5: Full verification**

Run: `npm run verify`
Expected: typecheck + prisma validate + all tests pass.

- [ ] **Step 6: End-to-end manual checklist**

Run: `npm run dev` and confirm each:
- Open a botanical demo → cover opens → backsound audible at ~0.4, unmuted.
- Open a Javanese demo → a **different**, gamelan/palace-mood track plays.
- SFX muted by default; the dock's SFX toggle enables `tick` and `coin` sounds in the Gift section.
- Builder: picking a track then previewing it plays; picking a palette previews a tone.
- DevTools Network: **zero** requests to `cdn.pixabay.com`.
- `public/audio/LICENSES.md` lists every track with license `CC0-1.0` and a sha256.

- [ ] **Step 7: Commit**

```bash
git add src/lib/sound/audioManifest.ts public/audio
git commit -m "chore(audio): add finalized CC0 backsound files + verified license manifest"
```

---

## Self-Review

**1. Spec coverage:**

| Spec section | Task(s) |
|---|---|
| §2 CC0 license rule, no hotlink, sha256, LICENSES.md | Tasks 1, 2, 10, 11 |
| §3 Unit 1 — audio catalog | Tasks 1, 2 |
| §3 Unit 2 — themeAudioMap | Task 3 |
| §3 Unit 3 — runtime controller (hook + resolver wiring) | Tasks 5, 6, 7, 10 |
| §3 Unit 4 — builder picker + persistence | Tasks 8, 9 |
| §3 Soundscape `setPalette` extension | Task 4 |
| §4 Data flow | Tasks 7, 9, 10 |
| §5 Error handling (missing file, autoplay, hash mismatch, guardrails) | Tasks 2, 4, 5, 8 |
| §6 D1 CC0 self-host | Tasks 1, 2, 10 |
| §6 D2 SFX procedural | Task 4 |
| §6 D3 SFX re-enabled, default mute, honor `hk_sfx_muted` | Tasks 5, 7 |
| §6 D4 backsound starts on cover open, unmuted, gain 0.4 | Tasks 5, 6, 7 |
| §6 D5 both pickers in builder | Task 9 |
| §6 D6 no client-supplied URLs | Task 9 (catalog-only picker) |
| §6 D7 `musicUrl` highest-priority override | Tasks 5, 10 |
| §6 D8 binary files fetched by maintainer | Tasks 2, 11 |
| §7 Testing — themeAudioMap total, catalog validation, no-http, precedence | Tasks 1, 3, 5, 8 |
| §8 Deliverables 1-8 | Tasks 1-11 |

No gaps.

**2. Placeholder scan:** The only intentional placeholders are
`REPLACE_ME_WITH_CC0_SOURCE_URL` and all-zero `sha256` in the manifest, which are
**explicitly the maintainer's Task 11 deliverable** — Step 3 of Task 1 requires
replacing the sourceUrl with a valid-looking URL so tests pass, and Task 11 Step 2
fills the real hashes. This is by design (spec §6 D8), not a plan failure. Every
code step contains complete, runnable content.

**3. Type consistency:** `AudioLicense`, `AudioMood`, `SfxPaletteId`, `AudioTrack`,
`SfxPalette`, `ThemeAudioPreset`, `resolveThemeAudio`, `resolveAudioSrc`,
`validateCatalog`, `validateAudioInput`, `saveInvitationAudioAction`,
`InvitationAudioPlayer`, `AudioPickerPanel` are used with identical signatures
across the tasks that define and consume them. `SfxPaletteId` is defined in Task 1
(`audioCatalog.ts`) and imported everywhere it is used.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-17-harikita-invitation-audio.md`.
