import { test } from "node:test";
import assert from "node:assert/strict";
import { categoryNameToId, buildVendorSlug } from "../src/lib/catalog-utils";

test("categoryNameToId maps known categories", () => {
  assert.equal(categoryNameToId("Pre-wedding"), "prewed");
  assert.equal(categoryNameToId("Makeup Artist (MUA)"), "mua");
  assert.equal(categoryNameToId("Katering & Food Stalls"), "katering");
  assert.equal(categoryNameToId("Cute Illustrated Maps"), "denah");
  assert.equal(categoryNameToId("Dokumentasi Foto-Video"), "foto");
});

test("categoryNameToId unknown -> fallback", () => {
  assert.equal(categoryNameToId("Ngelantur"), "prewed");
});

test("buildVendorSlug is url-safe and stable", () => {
  const s = buildVendorSlug("Menganti Cinematic & Studio", "abc123def456");
  assert.match(s, /^[a-z0-9-]+$/);
  assert.ok(s.includes("menganti"));
});

import { unitTypeDbToUi, buildProductSlug } from "../src/lib/catalog-utils";

test("unitTypeDbToUi maps DB unit types to UI", () => {
  assert.equal(unitTypeDbToUi("pax"), "pax");
  assert.equal(unitTypeDbToUi("pcs"), "piece");
  assert.equal(unitTypeDbToUi("baki"), "piece");
  assert.equal(unitTypeDbToUi("all_in"), "package");
  assert.equal(unitTypeDbToUi(undefined), "package");
});

test("buildProductSlug is url-safe", () => {
  assert.match(buildProductSlug("Paket Sewa Kebaya Beaded", "abc12345"), /^[a-z0-9-]+$/);
});
