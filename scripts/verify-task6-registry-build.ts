import assert from "node:assert";

async function verifyRegistryAndCatalog() {
  console.log("Checking 64 templates catalog matrix...");
  const { TEMPLATES_CATALOG } = await import("../src/lib/templates/templatesCatalog");
  const { getThemeById } = await import("../src/lib/templates/registry");

  assert.strictEqual(TEMPLATES_CATALOG.length, 64, `Expected exactly 64 templates, got ${TEMPLATES_CATALOG.length}`);

  const archetypes = [
    "botanical",
    "javanese",
    "islamic",
    "minimalist",
    "rose-gold",
    "rustic",
    "celestial",
    "cute-illustrated",
  ];

  for (const arch of archetypes) {
    const count = TEMPLATES_CATALOG.filter((t) => t.archetypeId === arch).length;
    assert.strictEqual(count, 8, `Expected 8 templates for archetype ${arch}, got ${count}`);
  }

  // Verify sample theme lookups
  const sample1 = getThemeById("autumnelle");
  assert.ok(sample1, "autumnelle must be retrievable");
  assert.strictEqual(sample1.archetypeId, "botanical");

  const sample2 = getThemeById("javanese-royal");
  assert.ok(sample2, "javanese-royal must be retrievable");
  assert.strictEqual(sample2.archetypeId, "javanese");

  const sample3 = getThemeById("medina-gold");
  assert.ok(sample3, "medina-gold must be retrievable");
  assert.strictEqual(sample3.archetypeId, "islamic");

  const sample4 = getThemeById("cartoon-maps-kebumen");
  assert.ok(sample4, "cartoon-maps-kebumen must be retrievable");
  assert.strictEqual(sample4.archetypeId, "cute-illustrated");

  console.log("PASS: 64 Templates catalog matrix verified with 8 presets per archetype engine.");
}

verifyRegistryAndCatalog().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});
