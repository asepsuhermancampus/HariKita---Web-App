import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  mapCoupleProfileOwner,
  resolveCoupleDisplayName,
} from "../src/lib/client-couple-profile";
import { validateClientProfileInput } from "../src/lib/validations/client-profile";
import { createUpdateClientProfileAction } from "../src/server/actions/client-profile-core";

const read = (file: string) =>
  readFileSync(path.join(process.cwd(), file), "utf8");

test("profile form renders one canonical two-person section", () => {
  const source = read("src/app/client/profil/ClientProfileForm.tsx");
  assert.match(source, /Identitas Kedua Mempelai/);
  assert.match(source, /Mempelai Pria/);
  assert.match(source, /Mempelai Wanita/);
  assert.match(source, /name="accountOwnerRole"/);
  assert.match(source, /name="groomName"/);
  assert.match(source, /name="brideName"/);
  assert.match(source, /name="coupleDisplayName"/);
  assert.match(source, /md:grid-cols-2/);
});

test("legacy banner keeps account name left until owner role exists", () => {
  const source = read("src/app/client/profil/page.tsx");
  assert.match(source, /if \(!profile\.accountOwnerRole\)/);
  assert.match(source, /leftName = profile\.name/);
  assert.match(source, /rightName = profile\.partnerName \|\| "Pasangan"/);
});

test("owner role migration runs only on the first role selection", () => {
  const source = read("src/app/client/profil/ClientProfileForm.tsx");
  assert.match(source, /if \(current\.accountOwnerRole\)/);
  assert.match(source, /return \{ \.\.\.current, accountOwnerRole: role \}/);
});

test("successful save reads every returned form field and coordinates back into state", () => {
  const source = read("src/app/client/profil/ClientProfileForm.tsx");
  for (const field of [
    "accountOwnerRole", "groomName", "brideName", "coupleDisplayName",
    "email", "eventDate", "eventLocation", "district", "themePreference",
    "notes", "rt", "rw", "dusun", "desa", "kecamatan", "postalCode",
  ]) {
    assert.match(source, new RegExp(`${field}: result\\.data\\?\\.${field}`));
  }
  assert.match(source, /setCoords\(/);
  assert.match(source, /result\.data\.latitude/);
  assert.match(source, /result\.data\.longitude/);
});

test("identity UI preserves mobile order, error semantics, and overflow safety", () => {
  const form = read("src/app/client/profil/ClientProfileForm.tsx");
  const page = read("src/app/client/profil/page.tsx");
  assert.ok(form.indexOf('name="groomName"') < form.indexOf('name="brideName"'));
  assert.match(form, /grid grid-cols-1 gap-4 md:grid-cols-2/);
  assert.match(form, /role="group"[^>]*aria-invalid=/);
  assert.match(form, /aria-describedby=\{fieldErrors\.accountOwnerRole \? "cpf-owner-role-error"/);
  assert.match(form, /id="cpf-owner-role-error" role="alert"/);
  assert.match(page, /flex flex-wrap[^"\n]*min-w-0/);
  assert.match(page, /min-w-0 break-words/);
  assert.match(page, /shrink-0/);
});

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

const actionState = {
  transactionOperations: [] as unknown[],
  userUpdates: [] as unknown[],
  profileUpserts: [] as unknown[],
  findUniqueCalls: [] as unknown[],
  revalidatedPaths: [] as unknown[][],
};

const profileReadback = {
  id: "session-client-id",
  name: "Siti Nur Aisyah",
  phone: "081234567890",
  email: "client@example.com",
  partnerName: "Muhammad Rizky Pratama",
  accountOwnerRole: "BRIDE" as const,
  groomName: "Muhammad Rizky Pratama",
  brideName: "Siti Nur Aisyah",
  coupleDisplayName: "Rizky & Aisyah",
  eventDate: "2027-06-15",
  eventLocation: "Gedung Setda Kebumen",
  district: "Kebumen",
  themePreference: "Jawa Modern Minimalis",
  notes: "Akad pagi",
  rt: "01",
  rw: "02",
  dusun: "Krajan",
  desa: "Kutosari",
  kecamatan: "Kebumen",
  kabupaten: "Kebumen",
  postalCode: "54317",
  latitude: -7.668,
  longitude: 109.652,
};

const createAction = (role: string) =>
  createUpdateClientProfileAction({
    getSession: async () => ({ userId: "session-client-id", role }),
    userUpdate: (input) => {
      actionState.userUpdates.push(input);
      return { kind: "user.update", input };
    },
    clientProfileUpsert: (input) => {
      actionState.profileUpserts.push(input);
      return { kind: "clientProfile.upsert", input };
    },
    transaction: async (operations) => {
      actionState.transactionOperations = operations;
    },
    getClientProfile: async () => {
      actionState.findUniqueCalls.push({ userId: "session-client-id" });
      return profileReadback;
    },
    revalidatePath: (...args) => {
      actionState.revalidatedPaths.push(args);
    },
  });

const profileForm = (accountOwnerRole: "GROOM" | "BRIDE") => {
  const formData = new FormData();
  for (const [key, value] of Object.entries({
    accountOwnerRole,
    groomName: "Muhammad Rizky Pratama",
    brideName: "Siti Nur Aisyah",
    coupleDisplayName: "Rizky & Aisyah",
    email: "client@example.com",
    eventDate: "2027-06-15",
    eventLocation: "Gedung Setda Kebumen",
    district: "Kebumen",
    themePreference: "Jawa Modern Minimalis",
    notes: "Akad pagi",
    rt: "01",
    rw: "02",
    dusun: "Krajan",
    desa: "Kutosari",
    kecamatan: "Kebumen",
    kabupaten: "Kebumen",
    postalCode: "54317",
    latitude: "-7.668",
    longitude: "109.652",
  })) {
    formData.set(key, value);
  }
  return formData;
};

const resetActionState = () => {
  actionState.transactionOperations = [];
  actionState.userUpdates = [];
  actionState.profileUpserts = [];
  actionState.findUniqueCalls = [];
  actionState.revalidatedPaths = [];
};

for (const [accountOwnerRole, ownerName, partnerName] of [
  ["GROOM", "Muhammad Rizky Pratama", "Siti Nur Aisyah"],
  ["BRIDE", "Siti Nur Aisyah", "Muhammad Rizky Pratama"],
] as const) {
  test(`client profile action atomically persists ${accountOwnerRole} ownership and returns fresh data`, async () => {
    resetActionState();
    const updateClientProfileAction = createAction("CLIENT");

    const result = await updateClientProfileAction(
      profileForm(accountOwnerRole)
    );

    assert.equal(result.success, true);
    assert.equal(result.data?.coupleDisplayName, "Rizky & Aisyah");
    assert.deepEqual(actionState.transactionOperations, [
      { kind: "user.update", input: actionState.userUpdates[0] },
      { kind: "clientProfile.upsert", input: actionState.profileUpserts[0] },
    ]);
    assert.deepEqual(actionState.userUpdates[0], {
      where: { id: "session-client-id" },
      data: { name: ownerName, email: "client@example.com" },
    });
    const expectedProfile = {
      accountOwnerRole,
      groomName: "Muhammad Rizky Pratama",
      brideName: "Siti Nur Aisyah",
      coupleDisplayName: "Rizky & Aisyah",
      partnerName,
      eventDate: new Date("2027-06-15"),
      eventLocation: "Gedung Setda Kebumen",
      district: "Kebumen",
      themePreference: "Jawa Modern Minimalis",
      notes: "Akad pagi",
      rt: "01",
      rw: "02",
      dusun: "Krajan",
      desa: "Kutosari",
      kecamatan: "Kebumen",
      kabupaten: "Kebumen",
      postalCode: "54317",
      latitude: -7.668,
      longitude: 109.652,
    };
    assert.deepEqual(actionState.profileUpserts[0], {
      where: { userId: "session-client-id" },
      create: { userId: "session-client-id", ...expectedProfile },
      update: expectedProfile,
    });
    assert.deepEqual(actionState.findUniqueCalls, [
      { userId: "session-client-id" },
    ]);
    assert.deepEqual(actionState.revalidatedPaths, [
      ["/client", "layout"],
      ["/client"],
      ["/client/profil"],
    ]);
  });
}

test("client profile action rejects non-CLIENT sessions before persistence", async () => {
  resetActionState();
  const updateClientProfileAction = createAction("VENDOR");

  const result = await updateClientProfileAction(profileForm("GROOM"));

  assert.equal(result.success, false);
  assert.equal(result.error, "Sesi klien tidak valid. Silakan masuk kembali.");
  assert.deepEqual(actionState.transactionOperations, []);
  assert.deepEqual(actionState.userUpdates, []);
  assert.deepEqual(actionState.profileUpserts, []);
  assert.deepEqual(actionState.findUniqueCalls, []);
  assert.deepEqual(actionState.revalidatedPaths, []);
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
