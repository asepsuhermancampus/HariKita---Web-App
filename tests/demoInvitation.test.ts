import { test } from "node:test";
import assert from "node:assert/strict";
import { getThemeById, ALL_INVITATION_TEMPLATES, TEMPLATES_CATALOG } from "../src/lib/templates/registry";

test("getThemeById returns a valid preset for all items in ALL_INVITATION_TEMPLATES", () => {
  for (const t of ALL_INVITATION_TEMPLATES) {
    const theme = getThemeById(t.id);
    assert.ok(theme, `Theme should exist for ${t.id}`);
    assert.ok(theme.archetypeId, `Theme ${t.id} must have an archetypeId`);
    assert.ok(theme.colors.primary, `Theme ${t.id} must have colors.primary`);
    assert.ok(theme.colors.accent, `Theme ${t.id} must have colors.accent`);
  }
});

test("getThemeById returns safe fallback preset for unknown or demo theme IDs", () => {
  const fallback = getThemeById("unknown-theme-xyz");
  assert.ok(fallback, "Fallback theme must not be null or undefined");
  assert.ok(fallback.archetypeId, "Fallback theme must have archetypeId");

  const demoFallback = getThemeById("demo");
  assert.ok(demoFallback, "Demo fallback theme must not be null or undefined");
});

test("ALL_INVITATION_TEMPLATES contains all TEMPLATES_CATALOG items", () => {
  for (const t of TEMPLATES_CATALOG) {
    const found = ALL_INVITATION_TEMPLATES.some((item) => item.id === t.id);
    assert.ok(found, `Template ${t.id} must be included in ALL_INVITATION_TEMPLATES`);
  }
});

test("All templates in ALL_INVITATION_TEMPLATES can be resolved as demo preset", () => {
  for (const t of ALL_INVITATION_TEMPLATES) {
    const isTemplateId = ALL_INVITATION_TEMPLATES.some((item) => item.id === t.id);
    assert.equal(isTemplateId, true);
    const themePreset = getThemeById(t.id);
    assert.ok(themePreset.title, `Template ${t.id} must have a title`);
    assert.ok(themePreset.archetypeId, `Template ${t.id} must have an archetypeId`);
  }
});

