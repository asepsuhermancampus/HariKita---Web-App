# HariKita Invitation Audio — Backsound per Tema & SFX Palette + Builder Picker

**Date:** 2026-09-17
**Status:** Approved for implementation planning
**Branch:** `feat/modular-section-matrix-sfx`
**Author:** Brainstorming session (human + agent)

---

## 1. Problem Statement

HariKita ships **88 invitation templates** across 8 archetypes (71 presets in
`templatesCatalog.ts` + 22 legacy presets in `registry.ts`, minus 5 id overlaps;
`ALL_INVITATION_TEMPLATES` is the union). Audio today has three defects that make it
both legally risky and thematically wrong:

1. **Dead code — no per-theme sound.** `SectionMatrixConfig.sfxTheme`
   (`romantic-harp | royal-gamelan | modern-pop | gentle-nature`) is assigned to
   templates in `src/lib/templates/templatesCatalog.ts`, but is **never read**
   anywhere in the codebase. Every template produces identical sound.
2. **Licensing exposure.** The only real backsound is `defaultAudioTrack`, which
   **hotlinks** `https://cdn.pixabay.com/download/audio/...` — only **2 distinct
   tracks across every template** (81× `romantic-piano-112199.mp3`, 12× `warm-acoustic-109407.mp3`).
   There is no license record, no local copy, and no attribution. HariKita is a
   commercial product with published Terms/Privacy pages; hotlinking a third-party
   CDN with no license provenance is unacceptable.
3. **Audio effectively disabled at runtime.** Two separate hard-off switches:
   - `TemplateEngineResolver.tsx:36-38` — `useEffect(() => soundscape.setMuted(true), [])`
     permanently silences all SFX for every guest.
   - `TemplateEngineResolver.tsx:161` — `{false && (<RotatingVinylPlayer ... />)}`
     disables the backsound player entirely.

Additionally, the **custom invitation builder** (`/builder`) has no way for a client
to choose their own backsound or SFX palette.

### Goal

- Every template/theme has a **thematically fitting backsound** that is **provably
  free to use commercially** and **self-hosted** (no hotlinking, no runtime dependency
  on a third-party CDN).
- The existing procedural SFX engine is **honored per theme** (the `sfxTheme` dead
  code is wired up) and **re-enabled** for guests under a safe, default-muted policy.
- The **custom builder** lets clients pick both a backsound track and an SFX palette,
  with live preview.

### Non-Goals

- No client-supplied arbitrary audio URLs (e.g. Spotify/Instagram/Drive). Explicitly
  out of scope for this design.
- No per-section audio cues beyond the existing SFX event hooks.
- No waveform editing / trimming tools.

---

## 2. Licensing Strategy (the "no copyright / no fraud" requirement)

**Chosen source: CC0 / Public Domain only, self-hosted.**

| Rule | Enforcement |
|---|---|
| Only CC0-1.0 or Public Domain Mark tracks are allowed into the catalog | `scripts/fetch-cc0-audio.mjs` rejects any manifest entry whose `license` is not exactly `CC0-1.0` or `Public-Domain` |
| Every track has a recorded provenance | Manifest entry requires `sourceUrl`, `author`, `license`, `retrievedAt` |
| No hotlinking at runtime | Tracks are downloaded into `public/audio/backsound/` and referenced only by local path. Existing `cdn.pixabay.com` URLs are **removed** from all catalogs |
| Integrity of downloaded files | Script records and verifies `sha256`; mismatch → hard failure |
| Provenance is shipped with the app | `public/audio/LICENSES.md` is generated and committed; the app also exposes the same metadata in code |

**Why CC0 specifically:** CC0-1.0 is a public-domain dedication — no attribution
required, commercial use permitted, no derivative restrictions, no "share-alike"
trap. This is the strongest possible guarantee against copyright claims. Sources to
curate from (all offer CC0/PD audio): Free Music Archive (CC0 filter), Wikimedia
Commons (PD audio), and Pixabay Content License tracks **downloaded and archived
locally** — though the catalog's canonical preference is strict CC0.

> **Note on Pixabay:** Pixabay Content License does permit commercial use without
> attribution, but it is *not* CC0 and its terms can change. To keep a single,
> defensible rule, the catalog's `license` field only accepts CC0/PD. Any track
> sourced from Pixabay must be re-verified and re-labeled by the maintainer before
> inclusion.

---

## 3. Architecture

Four isolated units. Each has one purpose, a clear interface, and can be tested
without the others.

### Unit 1 — Audio Catalog (`src/lib/sound/audioCatalog.ts` + `public/audio/**`)

The single source of truth for what audio exists and its license.

```ts
export type AudioLicense = "CC0-1.0" | "Public-Domain";

export interface AudioTrack {
  id: string;              // stable slug, e.g. "gamelan-lantern-dusk"
  title: string;
  file: string;            // local path, e.g. "/audio/backsound/gamelan-lantern-dusk.mp3"
  mood: AudioMood;         // "romantic" | "royal" | "modern" | "nature" | "celebratory"
  durationSec: number;
  license: AudioLicense;   // ONLY CC0-1.0 | Public-Domain
  author: string;          // "Unknown (public domain dedication)" is acceptable
  sourceUrl: string;       // provenance link
  retrievedAt: string;     // ISO date
  sha256: string;          // integrity check
}

export interface SfxPalette {
  id: "romantic-harp" | "royal-gamelan" | "modern-pop" | "gentle-nature";
  label: string;
  description: string;
  // Parameters fed into the procedural synthesizer — NOT files.
  chord: { base: number; intervals: number[]; waveform: OscillatorType };
  tick:  { freqA: number; freqB: number; decayMs: number; waveform: OscillatorType };
  chime: { freqs: number[]; decayMs: number; waveform: OscillatorType };
}
```

**Interface contract:** `getTrack(id)`, `getPalette(id)`, `listTracks(mood?)`,
`listPalettes()`, `validateCatalog()` (throws if any track violates the license/field
rules). `validateCatalog()` is asserted in tests and at script time.

**Files:**
- `public/audio/backsound/*.mp3` — self-hosted, committed.
- `public/audio/LICENSES.md` — generated, committed.
- `scripts/fetch-cc0-audio.mjs` — reads the manifest, downloads, verifies sha256,
  writes `LICENSES.md`. Refuses non-CC0 entries. Idempotent.

### Unit 2 — Theme → Audio Mapping (`src/lib/sound/themeAudioMap.ts`)

Pure, deterministic mapping. No React, no browser APIs — trivially unit-testable.

```ts
export interface ThemeAudioPreset {
  defaultTrackId: string;
  sfxPaletteId: SfxPalette["id"];
}

// Total function: every (archetype, sfxTheme) pair resolves.
export function resolveThemeAudio(
  archetypeId: ArchetypeId,
  sfxTheme?: SectionMatrixConfig["sfxTheme"],
): ThemeAudioPreset;
```

Mapping intent (archetype → mood):

| Archetype | Backsound mood | SFX palette |
|---|---|---|
| `botanical` / `romantic-floral` / `animated-motion` | romantic | `romantic-harp` |
| `javanese` / `cultural-traditional` | royal (gamelan) | `royal-gamelan` |
| `islamic` / `syari-islamic` | nature / calm | `gentle-nature` |
| `minimalist` / `minimalist-typographic` | modern | `modern-pop` |
| `rose-gold` / `royal-luxury` | romantic (lush) | `romantic-harp` |
| `rustic` | nature | `gentle-nature` |
| `celestial` / `fullscreen-prewed` | modern (ambient) | `gentle-nature` |
| `cute-illustrated` / `special-family-event` | celebratory / modern | `modern-pop` |

The existing `sfxTheme` value in each template's `sectionConfig` takes precedence
over the archetype default, which is how the dead code gets wired up.

### Unit 3 — Runtime Controller (`src/lib/sound/useInvitationAudio.ts`)

A single hook that owns all playback. No component talks to `<audio>` or the
synthesizer directly.

```ts
export function useInvitationAudio(opts: {
  trackId: string;                 // resolved: explicit override ?? themeAudioMap
  paletteId: SfxPalette["id"];
  started: boolean;                // true once the guest opens the cover
}): {
  isPlaying: boolean;
  isSfxEnabled: boolean;
  togglePlayback: () => void;
  toggleSfx: () => void;
}
```

Behavior:
- Backsound audio element has `preload="auto"`; `.play()` is attempted when
  `started` flips true (guest presses "Buka Undangan"). Failure is caught silently
  (browser autoplay policy).
- **Backsound plays unmuted** at gain 0.4 when the cover opens (decision D4); the
  guest can pause it via `togglePlayback`.
- **Default gain 0.4**, independent of SFX gain so music never drowns the cues.
- **SFX default muted** (critical decision, §6). State persisted in
  `localStorage["hk_sfx_muted"]`, honoring the pre-existing key.
- The hook is the only caller of `soundscape.setPalette()` and
  `soundscape.setMuted()`.

`TemplateEngineResolver` changes:
- Delete the blanket `soundscape.setMuted(true)` effect (lines 36-38).
- Replace `{false && ...}` with the real player, driven by `useInvitationAudio`.
- Remove `RotatingVinylPlayer`'s dependency on being hidden, or repurpose it as the
  player surface.

### Unit 4 — Builder Picker (`src/components/builder/AudioPickerPanel.tsx`)

New 2-pane panel in the custom builder (`src/app/builder/page.tsx`), styled with
existing HariKita design tokens (gold/plum), matching the existing theme picker
block at lines 478-500.

- **Backsound picker:** grid of track cards (title, mood badge, license badge,
  duration) with inline preview play/pause. Selected card is highlighted.
- **SFX palette picker:** 4 cards; tapping previews the palette's `tick` + `chime`
  live via the synthesizer.
- Persist via a server action (same pattern as `availability-matrix`).

**Persistence — `DigitalInvitation` (Prisma).** Two nullable columns + migration:

```prisma
model DigitalInvitation {
  // ...existing...
  musicUrl          String?   // legacy / explicit override; still honored
  backsoundTrackId  String?   // NEW — catalog track id
  sfxPaletteId      String?   // NEW — SfxPalette.id
}
```

Resolution order at render time:
`musicUrl` (if set) → `backsoundTrackId` → `resolveThemeAudio(theme).defaultTrackId`.

`sfxPaletteId` → `resolveThemeAudio(theme).sfxPaletteId`.

This keeps the legacy `musicUrl` working (backwards compatible) while making the
catalog the default.

---

## 4. Data Flow

```
Builder (/builder)
  client picks theme ─┐
  client picks track ─┼─► saveInvitationAudioAction ─► DigitalInvitation
  client picks palette┘       (backsoundTrackId, sfxPaletteId)

Guest render (/undangan/[slug])
  DB row ─► resolve: musicUrl ?? backsoundTrackId ?? resolveThemeAudio(archetype)
  ─► useInvitationAudio(trackId, paletteId, started)
       ├─ backsound: local /audio/backsound/*.mp3, gain 0.4, starts on cover open
       └─ SFX: soundscape.setPalette(paletteId); respects hk_sfx_muted (default true)
```

---

## 5. Error Handling

| Failure | Behavior |
|---|---|
| Catalog track id not found | Fall back to `resolveThemeAudio(archetype).defaultTrackId`; log once in dev |
| Audio file missing / 404 | `<audio>` errors silently; SFX continues; no crash |
| Autoplay blocked | `play()` rejection caught; player shows paused state; guest taps to start |
| `sha256` mismatch in fetch script | Script exits non-zero; file not written; existing file untouched |
| Manifest entry with non-CC0 license | Script refuses; `validateCatalog()` throws in tests |
| No `sfxPaletteId` and no theme mapping | `soundscape` keeps its current (default) palette |
| `AudioContext` unavailable (SSR / old browser) | Synthesizer methods no-op; backsound still works |

---

## 6. Key Decisions

| # | Decision | Rationale |
|---|---|---|
| D1 | Backsound = self-hosted CC0 only | Zero license risk, no hotlinking, offline-capable |
| D2 | SFX stays procedural (no files) | Already built, zero licensing surface, zero payload |
| D3 | SFX **re-enabled** but **default muted**, honoring `hk_sfx_muted` | Safe etiquette; guest opts in; satisfies "sound effect selaras" without ambushing guests |
| D4 | Backsound starts **immediately on cover open** | Per user decision (2026-09-17) — most "alive" experience |
| D5 | Builder exposes **both** backsound and SFX palette pickers | Per user decision; satisfies "sound effect yang selaras" + free client choice |
| D6 | No client-supplied audio URLs | Scoped out; avoids re-introducing licensing risk |
| D7 | `musicUrl` remains as highest-priority override | Backwards compatibility with existing rows |
| D8 | Binary files fetched by maintainer via script | Agent cannot download binaries in this environment; keeps repo honest |

---

## 7. Testing Strategy

**Unit (no browser):**
- `themeAudioMap.test.ts` — assert `resolveThemeAudio` is total across **all
  templates in `ALL_INVITATION_TEMPLATES`** and all archetypes; assert explicit
  `sfxTheme` overrides archetype default.
- `audioCatalog.test.ts` — `validateCatalog()` passes; every track has non-empty
  `license ∈ {CC0-1.0, Public-Domain}`, `sourceUrl`, `sha256`; **no track `file`
  contains `http`** (guards against hotlink regression).
- Catalog completeness — every `defaultTrackId` produced by `themeAudioMap` exists
  in the catalog.

**Integration:**
- Builder persistence test — selecting a track/palette writes both columns; render
  resolution honors `musicUrl` > `backsoundTrackId` > theme default.

**Manual / e2e checklist:**
- Open a demo invitation → cover opens → backsound audible at 0.4.
- SFX muted by default; toggle in dock enables `tick`/`coin`/`confettiPop`.
- Javanese template plays royal-gamelan palette and a royal-mood track.
- Builder preview plays audio without the guest page mounted.
- All SFX/backsound works with `prefers-reduced-motion` set (audio is not motion —
  must still play).

---

## 8. Deliverables

1. `src/lib/sound/audioCatalog.ts` + `src/lib/sound/themeAudioMap.ts`
2. `src/lib/sound/useInvitationAudio.ts`
3. `src/lib/sound/soundscapeEngine.ts` — extended with `setPalette()` (parameterized)
4. `src/components/builder/AudioPickerPanel.tsx` + server action
5. `public/audio/backsound/*.mp3` + `public/audio/LICENSES.md`
6. `scripts/fetch-cc0-audio.mjs` + manifest
7. Prisma migration for `backsoundTrackId`, `sfxPaletteId`
8. Removal of all `cdn.pixabay.com` URLs from `templatesCatalog.ts` / `registry.ts`

## 9. Open Items for Implementation Planning

- Exact final track list (mood coverage: ≥1 romantic, ≥1 royal, ≥1 modern, ≥1
  nature, ≥1 celebratory — ideally 2 each for variety).
- Whether `RotatingVinylPlayer` is repurposed or replaced by the new controller UI.
- Placement of the audio section within the builder step flow.
