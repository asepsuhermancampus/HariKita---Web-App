import { test } from "node:test";
import assert from "node:assert/strict";
import { validateVendorCompleteness } from "../src/server/actions/vendor-profile";

test("validateVendorCompleteness: kosong -> banyak error", () => {
  const errs = validateVendorCompleteness({ businessName: "", ktpPhotoUrl: null } as never);
  assert.ok(errs.length > 0);
});

test("validateVendorCompleteness: lengkap (BANK) -> kosong", () => {
  const errs = validateVendorCompleteness({
    businessName: "Studio X",
    category: "katering",
    ktpNumber: "3305012345670001",
    ktpPhotoUrl: "/x.jpg",
    businessPhotoUrl: "/y.jpg",
    revenueMethod: "BANK",
    bankName: "BCA",
    bankAccount: "123",
    bankHolder: "Budi",
    phone: "081200000000",
    address: "Jl. X",
    desa: "Kebumen",
    kecamatan: "Kebumen",
    latitude: -7.6,
    longitude: 109.6,
  } as never);
  assert.equal(errs.length, 0);
});

test("validateVendorCompleteness: EWALLET butuh provider", () => {
  const errs = validateVendorCompleteness({
    businessName: "Studio X",
    category: "katering",
    ktpNumber: "3305012345670001",
    ktpPhotoUrl: "/x.jpg",
    businessPhotoUrl: "/y.jpg",
    revenueMethod: "EWALLET",
    bankAccount: "08123",
    bankHolder: "Budi",
    phone: "081200000000",
    address: "Jl. X",
    desa: "Kebumen",
    kecamatan: "Kebumen",
    latitude: -7.6,
    longitude: 109.6,
  } as never);
  assert.ok(errs.some((e) => /e-wallet/i.test(e)));
});
