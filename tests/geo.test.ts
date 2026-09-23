import { test } from "node:test";
import assert from "node:assert/strict";
import { haversineKm } from "../src/lib/geo/haversine";
import { lookupPostalCode } from "../src/lib/geo/postal-codes";

test("haversineKm: Kebumen Kota -> Gombong sekitar 10-35 km", () => {
  const a = { lat: -7.6683, lng: 109.6533 }; // Kebumen Kota
  const b = { lat: -7.6067, lng: 109.5133 }; // Gombong
  const d = haversineKm(a, b);
  assert.ok(d > 10 && d < 35, `unexpected ${d}`);
});

test("haversineKm: titik sama = 0", () => {
  assert.equal(haversineKm({ lat: -7.66, lng: 109.65 }, { lat: -7.66, lng: 109.65 }), 0);
});

test("lookupPostalCode: kontrak (null atau 5 digit)", () => {
  const code = lookupPostalCode("Kebumen", "Kebumen");
  assert.ok(code === null || /^\d{5}$/.test(code));
});

test("lookupPostalCode: desa tidak dikenal -> null", () => {
  assert.equal(lookupPostalCode("DesaTidakAda123", "Kebumen"), null);
});
