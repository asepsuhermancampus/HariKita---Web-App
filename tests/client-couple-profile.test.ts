import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  mapCoupleProfileOwner,
  resolveCoupleDisplayName,
} from "../src/lib/client-couple-profile";
import { validateClientProfileInput } from "../src/lib/validations/client-profile";

const read = (file: string) =>
  readFileSync(path.join(process.cwd(), file), "utf8");

test("both Prisma schemas expose canonical couple profile fields", () => {
  for (const file of ["prisma/schema.prisma", "prisma/schema.sqlite.prisma"]) {
    const schema = read(file);
    assert.match(schema, /accountOwnerRole\s+String\?/);
    assert.match(schema, /groomName\s+String\?/);
    assert.match(schema, /brideName\s+String\?/);
    assert.match(schema, /coupleDisplayName\s+String\?/);
    assert.match(schema, /partnerName\s+String\?/);
  }
});

test("GROOM owner maps groom to User.name and bride to legacy partnerName", () => {
  assert.deepEqual(
    mapCoupleProfileOwner({
      accountOwnerRole: "GROOM",
      groomName: "Muhammad Rizky Pratama",
      brideName: "Siti Nur Aisyah",
    }),
    { ownerName: "Muhammad Rizky Pratama", partnerName: "Siti Nur Aisyah" }
  );
});

test("BRIDE owner maps bride to User.name and groom to legacy partnerName", () => {
  assert.deepEqual(
    mapCoupleProfileOwner({
      accountOwnerRole: "BRIDE",
      groomName: "Muhammad Rizky Pratama",
      brideName: "Siti Nur Aisyah",
    }),
    { ownerName: "Siti Nur Aisyah", partnerName: "Muhammad Rizky Pratama" }
  );
});

test("sidebar label prioritizes explicit display then canonical names then legacy", () => {
  assert.equal(
    resolveCoupleDisplayName({ coupleDisplayName: "Rizky & Aisyah" }),
    "Rizky & Aisyah"
  );
  assert.equal(
    resolveCoupleDisplayName({
      groomName: "Muhammad Rizky",
      brideName: "Siti Aisyah",
    }),
    "Muhammad & Siti"
  );
  assert.equal(
    resolveCoupleDisplayName({ userName: "Bima", partnerName: "Citra" }),
    "Bima & Citra"
  );
  assert.equal(resolveCoupleDisplayName({ userName: "Bima" }), "Bima");
});

const validProfile = {
  accountOwnerRole: "BRIDE",
  groomName: "Muhammad Rizky Pratama",
  brideName: "Siti Nur Aisyah",
  coupleDisplayName: "Rizky & Aisyah",
  email: "client@example.com",
  eventDate: "2027-06-15",
  district: "Kebumen",
};

test("couple profile validator accepts canonical identity", () => {
  const result = validateClientProfileInput(validProfile);
  assert.equal(result.success, true);
  assert.equal(result.data?.accountOwnerRole, "BRIDE");
});

test("couple profile validator rejects invalid role and long display name", () => {
  const result = validateClientProfileInput({
    ...validProfile,
    accountOwnerRole: "OTHER",
    coupleDisplayName: "x".repeat(41),
  });
  assert.equal(result.success, false);
  assert.ok(result.errors?.accountOwnerRole);
  assert.ok(result.errors?.coupleDisplayName);
});

for (const { field, value } of [
  { field: "groomName", value: "x" },
  { field: "groomName", value: "x".repeat(101) },
  { field: "brideName", value: "x" },
  { field: "brideName", value: "x".repeat(101) },
  { field: "coupleDisplayName", value: "x" },
] as const) {
  test(`couple profile validator rejects ${field} length ${value.length}`, () => {
    const result = validateClientProfileInput({
      ...validProfile,
      [field]: value,
    });

    assert.equal(result.success, false);
    assert.ok(result.errors?.[field]);
  });
}

test("couple profile validator accepts exact identity length boundaries", () => {
  for (const input of [
    {
      ...validProfile,
      groomName: "ab",
      brideName: "cd",
      coupleDisplayName: "ef",
    },
    {
      ...validProfile,
      groomName: "g".repeat(100),
      brideName: "b".repeat(100),
      coupleDisplayName: "d".repeat(40),
    },
  ]) {
    const result = validateClientProfileInput(input);

    assert.equal(result.success, true);
    assert.equal(result.data?.groomName, input.groomName);
    assert.equal(result.data?.brideName, input.brideName);
    assert.equal(result.data?.coupleDisplayName, input.coupleDisplayName);
  }
});

test("couple profile validator preserves non-identity validation rules", () => {
  const result = validateClientProfileInput({
    ...validProfile,
    email: "invalid-email",
    eventDate: "not-a-date",
    eventLocation: "x".repeat(201),
    notes: "x".repeat(1001),
  });

  assert.equal(result.success, false);
  assert.ok(result.errors?.email);
  assert.ok(result.errors?.eventDate);
  assert.ok(result.errors?.eventLocation);
  assert.ok(result.errors?.notes);
});
