import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

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
