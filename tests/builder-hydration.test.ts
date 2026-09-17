import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mergeSelections,
  selectionsFromCartItems,
  CATEGORY_TO_SERVICE,
} from "../src/lib/builder-selection";

test("mergeSelections keeps base keys and lets extra win on collision", () => {
  const base = { "prewed-1": { count: 1 }, "mua-1": { count: 2 } };
  const extra = { "mua-1": { count: 5 }, "dekor-1": {} };
  const merged = mergeSelections(base, extra);
  assert.deepEqual(Object.keys(merged).sort(), ["dekor-1", "mua-1", "prewed-1"]);
  assert.equal(merged["mua-1"].count, 5);
  assert.equal(merged["prewed-1"].count, 1);
});

test("mergeSelections does not mutate inputs", () => {
  const base = { "prewed-1": {} };
  const extra = { "mua-1": {} };
  mergeSelections(base, extra);
  assert.deepEqual(Object.keys(base), ["prewed-1"]);
});

test("CATEGORY_TO_SERVICE covers all 11 categories", () => {
  assert.equal(Object.keys(CATEGORY_TO_SERVICE).length, 11);
});

test("selectionsFromCartItems maps cart items to service ids", () => {
  const items = [
    { categoryId: "prewed", vendorId: "v_prewed_02" },
    { categoryId: "katering", vendorId: "v_katering_01" },
  ];
  const sel = selectionsFromCartItems(items);
  assert.deepEqual(Object.keys(sel).sort(), ["katering-1", "prewed-1"]);
});

test("selectionsFromCartItems falls back to vendorId when category unknown", () => {
  const items = [{ categoryId: "unknown", vendorId: "v_mua_01" }];
  const sel = selectionsFromCartItems(items);
  assert.deepEqual(Object.keys(sel), ["mua-1"]);
});

test("selectionsFromCartItems ignores unmapped items", () => {
  const sel = selectionsFromCartItems([{ categoryId: "x", vendorId: "y" }]);
  assert.equal(Object.keys(sel).length, 0);
});
