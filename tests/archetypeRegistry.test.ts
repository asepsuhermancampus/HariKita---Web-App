import { test } from "node:test";
import assert from "node:assert/strict";
import { TEMPLATES_CATALOG, MASTER_ARCHETYPES } from "../src/lib/templates/registry";
import { ArchetypeId } from "../src/lib/templates/types";

// Jumlah template per archetype bersifat deklaratif terhadap katalog yang
// dikurasi. Rose Gold sengaja diperluas melebihi 8 (lihat commit ekspansi
// koleksi). Ubah angka di sini bila katalog diperluas secara resmi.
const EXPECTED_ARCHETYPE_COUNTS: Record<string, number> = {
  botanical: 8,
  javanese: 8,
  islamic: 8,
  minimalist: 8,
  "rose-gold": 15,
  rustic: 8,
  celestial: 8,
  "cute-illustrated": 8,
};

const EXPECTED_TOTAL_TEMPLATES = Object.values(EXPECTED_ARCHETYPE_COUNTS).reduce(
  (acc, n) => acc + n,
  0
);

test("TEMPLATES_CATALOG contains exactly the curated template count across archetypes", () => {
  assert.equal(TEMPLATES_CATALOG.length, EXPECTED_TOTAL_TEMPLATES);
  assert.equal(EXPECTED_TOTAL_TEMPLATES, 71);
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

test("All 8 core archetypes have their expected template counts", () => {
  const counts: Record<string, number> = {};
  for (const t of TEMPLATES_CATALOG) {
    counts[t.archetypeId] = (counts[t.archetypeId] || 0) + 1;
  }

  for (const [arch, expected] of Object.entries(EXPECTED_ARCHETYPE_COUNTS)) {
    assert.equal(counts[arch], expected, `Archetype ${arch} should have ${expected} templates, found ${counts[arch]}`);
  }

  // Tidak boleh ada template dengan archetype di luar 8 archetype inti.
  const coreArchetypes = Object.keys(EXPECTED_ARCHETYPE_COUNTS);
  for (const arch of Object.keys(counts)) {
    assert.ok(
      coreArchetypes.includes(arch),
      `Found template with unexpected archetype "${arch}"`
    );
  }
});

test("MASTER_ARCHETYPES defines 8 core archetypes with valid cover styles", () => {
  assert.equal(MASTER_ARCHETYPES.length, 8);
  const validStyles = ["wax-seal", "curtain", "envelope-minimal", "slide-up"];
  for (const a of MASTER_ARCHETYPES) {
    assert.ok(validStyles.includes(a.defaultCoverStyle), `Archetype ${a.id} has invalid coverStyle`);
  }
});
