import { test } from "node:test";
import assert from "node:assert/strict";
import {
  VENDOR_CATEGORIES,
  getVendorCategory,
  getVendorsByCategory,
} from "../src/lib/vendor-categories";
import { MULTI_VENDOR_CATALOG } from "../src/data/multi-vendor-catalog";

test("VENDOR_CATEGORIES has exactly 11 entries with unique ids", () => {
  assert.equal(VENDOR_CATEGORIES.length, 11);
  const ids = new Set(VENDOR_CATEGORIES.map((c) => c.id));
  assert.equal(ids.size, 11);
});

test("every category id is used by at least one catalog vendor", () => {
  for (const cat of VENDOR_CATEGORIES) {
    const vendors = getVendorsByCategory(cat.id);
    assert.ok(
      vendors.length >= 1,
      `category ${cat.id} should have at least one vendor`
    );
  }
});

test("getVendorsByCategory filters the catalog by categoryId", () => {
  const prewed = getVendorsByCategory("prewed");
  assert.ok(prewed.length >= 1);
  assert.ok(prewed.every((v) => v.categoryId === "prewed"));
  // sanity: count matches full catalog filter
  const expected = MULTI_VENDOR_CATALOG.filter((v) => v.categoryId === "prewed");
  assert.equal(prewed.length, expected.length);
});

test("getVendorCategory returns entry for known id and undefined otherwise", () => {
  assert.equal(getVendorCategory("mua")?.id, "mua");
  assert.equal(getVendorCategory("tidak-ada"), undefined);
});
