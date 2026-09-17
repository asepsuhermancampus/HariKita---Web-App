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
