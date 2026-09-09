import { test } from "node:test";
import assert from "node:assert/strict";
import { TEMPLATES_CATALOG, MASTER_ARCHETYPES } from "../src/lib/templates/registry";
import { ArchetypeId } from "../src/lib/templates/types";

test("TEMPLATES_CATALOG contains exactly 64 curated templates across archetypes", () => {
  assert.equal(TEMPLATES_CATALOG.length, 64);
});

test("Each template in TEMPLATES_CATALOG satisfies the TemplateThemePreset contract", () => {
  const recognizedArchetypes: ArchetypeId[] = [
    "botanical",
    "javanese",
    "islamic",
    "minimalist",
    "rose-gold",
    "rustic",
    "celestial",
    "cute-illustrated",
    "animated-motion",
    "minimalist-typographic",
    "fullscreen-prewed",
    "romantic-floral",
    "syari-islamic",
    "cultural-traditional",
    "royal-luxury",
    "special-family-event",
  ];

  for (const t of TEMPLATES_CATALOG) {
    assert.ok(t.id, "template must have an id");
    assert.ok(t.title, `template ${t.id} must have a title`);
    assert.ok(t.archetypeId, `template ${t.id} must have archetypeId`);
    assert.ok(recognizedArchetypes.includes(t.archetypeId), `template ${t.id} has unknown archetype ${t.archetypeId}`);
    assert.ok(t.colors.accent && t.colors.accent.startsWith("#"), `template ${t.id} must have hex colors.accent`);
    assert.ok(t.colors.primary && t.colors.primary.startsWith("#"), `template ${t.id} must have hex colors.primary`);
    assert.ok(t.defaultAudioTrack, `template ${t.id} must have defaultAudioTrack`);
  }
});

test("All 8 core archetypes have exactly 8 templates each", () => {
  const counts: Record<string, number> = {};
  for (const t of TEMPLATES_CATALOG) {
    counts[t.archetypeId] = (counts[t.archetypeId] || 0) + 1;
  }

  const expectedArchetypes = [
    "botanical",
    "javanese",
    "islamic",
    "minimalist",
    "rose-gold",
    "rustic",
    "celestial",
    "cute-illustrated",
  ];

  for (const arch of expectedArchetypes) {
    assert.equal(counts[arch], 8, `Archetype ${arch} should have 8 templates, found ${counts[arch]}`);
  }
});

test("MASTER_ARCHETYPES defines 8 core archetypes with valid cover styles", () => {
  assert.equal(MASTER_ARCHETYPES.length, 8);
  const validStyles = ["wax-seal", "curtain", "envelope-minimal", "slide-up"];
  for (const a of MASTER_ARCHETYPES) {
    assert.ok(validStyles.includes(a.defaultCoverStyle), `Archetype ${a.id} has invalid coverStyle`);
  }
});
