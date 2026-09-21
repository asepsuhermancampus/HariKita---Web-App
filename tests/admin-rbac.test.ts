import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resolveAdminRole,
  hasCapability,
  CAPABILITY_MATRIX,
  type AdminCapability,
} from "../src/server/auth/admin-guard";

test("resolveAdminRole: ADMIN with null adminRole -> SUPER_ADMIN (grandfathered)", () => {
  assert.equal(resolveAdminRole("ADMIN", null), "SUPER_ADMIN");
});

test("resolveAdminRole: ADMIN with known sub-role returns it", () => {
  assert.equal(resolveAdminRole("ADMIN", "OPS"), "OPS");
  assert.equal(resolveAdminRole("ADMIN", "FINANCE"), "FINANCE");
  assert.equal(resolveAdminRole("ADMIN", "SUPER_ADMIN"), "SUPER_ADMIN");
});

test("resolveAdminRole: ADMIN with unknown sub-role -> SUPER_ADMIN (fail-safe)", () => {
  assert.equal(resolveAdminRole("ADMIN", "WIZARD"), "SUPER_ADMIN");
});

test("resolveAdminRole: non-admin role -> null", () => {
  assert.equal(resolveAdminRole("CLIENT", "OPS"), null);
  assert.equal(resolveAdminRole("VENDOR", null), null);
  assert.equal(resolveAdminRole("BA", null), null);
});

test("hasCapability: FINANCE can MANAGE_FINANCE only", () => {
  assert.equal(hasCapability("FINANCE", "MANAGE_FINANCE"), true);
  assert.equal(hasCapability("FINANCE", "VIEW_ADMIN"), true);
  assert.equal(hasCapability("FINANCE", "VERIFY_VENDOR"), false);
  assert.equal(hasCapability("FINANCE", "MANAGE_DISPUTE"), false);
  assert.equal(hasCapability("FINANCE", "MANAGE_BA"), false);
});

test("hasCapability: OPS can verify + dispute, not finance/BA", () => {
  assert.equal(hasCapability("OPS", "VERIFY_VENDOR"), true);
  assert.equal(hasCapability("OPS", "MANAGE_DISPUTE"), true);
  assert.equal(hasCapability("OPS", "VIEW_ADMIN"), true);
  assert.equal(hasCapability("OPS", "MANAGE_FINANCE"), false);
  assert.equal(hasCapability("OPS", "MANAGE_BA"), false);
});

test("hasCapability: SUPER_ADMIN can everything", () => {
  for (const cap of Object.values(CAPABILITY_MATRIX)) {
    for (const c of cap) {
      assert.equal(hasCapability("SUPER_ADMIN", c), true);
    }
  }
});

test("CAPABILITY_MATRIX: SUPER_ADMIN has all capabilities", () => {
  const all: AdminCapability[] = [
    "VIEW_ADMIN", "VERIFY_VENDOR", "MANAGE_DISPUTE",
    "MANAGE_FINANCE", "MANAGE_BA", "MANAGE_ADMIN",
  ];
  for (const c of all) assert.ok(CAPABILITY_MATRIX.SUPER_ADMIN.includes(c));
});
