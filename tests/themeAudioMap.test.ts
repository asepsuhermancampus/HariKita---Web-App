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
