import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateLightboxNavigation } from "../src/lib/invitation/lightbox";

test("calculateLightboxNavigation handles next index and wraps around", () => {
  assert.equal(calculateLightboxNavigation(0, 4, "next"), 1);
  assert.equal(calculateLightboxNavigation(2, 4, "next"), 3);
  assert.equal(calculateLightboxNavigation(3, 4, "next"), 0); // Wraps around
});

test("calculateLightboxNavigation handles prev index and wraps around", () => {
  assert.equal(calculateLightboxNavigation(3, 4, "prev"), 2);
  assert.equal(calculateLightboxNavigation(1, 4, "prev"), 0);
  assert.equal(calculateLightboxNavigation(0, 4, "prev"), 3); // Wraps around
});

test("calculateLightboxNavigation handles single photo gracefully", () => {
  assert.equal(calculateLightboxNavigation(0, 1, "next"), 0);
  assert.equal(calculateLightboxNavigation(0, 1, "prev"), 0);
});
