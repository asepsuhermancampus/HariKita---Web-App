import { test } from "node:test";
import assert from "node:assert/strict";
import type { UnitType, VendorProduct } from "../src/data/product-types";
import { generateCatalog } from "../src/data/catalog-generator";

test("VendorProduct type accepts a valid pax product", () => {
  const p: VendorProduct = {
    id: "prod_1",
    slug: "stall-bakso",
    name: "Stall Bakso Sapi",
    price: 35000,
    unitType: "pax",
    unitLabel: "per pax",
    minQuantity: 50,
    image: "https://example.com/a.jpg",
    desc: "desc",
    callTime: "09:00 WIB",
    features: ["a"],
    productTags: ["stall"],
  };
  const u: UnitType = p.unitType;
  assert.equal(u, "pax");
});

test("generateCatalog yields 220 vendors, 15 products each", () => {
  const catalog = generateCatalog();
  assert.equal(catalog.length, 220);
  for (const v of catalog) {
    assert.equal(v.products.length, 15, `vendor ${v.id} should have 15 products`);
  }
});

test("generateCatalog is deterministic across calls", () => {
  const a = generateCatalog();
  const b = generateCatalog();
  assert.deepEqual(a, b);
});

test("generateCatalog covers all 11 categories, 20 vendors each", () => {
  const catalog = generateCatalog();
  const byCat = new Map<string, number>();
  for (const v of catalog) byCat.set(v.categoryId, (byCat.get(v.categoryId) ?? 0) + 1);
  assert.equal(byCat.size, 11);
  for (const [cat, n] of byCat) assert.equal(n, 20, `category ${cat} should have 20 vendors`);
});
