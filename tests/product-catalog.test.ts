import { test } from "node:test";
import assert from "node:assert/strict";
import type { UnitType, VendorProduct } from "../src/data/product-types";

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
