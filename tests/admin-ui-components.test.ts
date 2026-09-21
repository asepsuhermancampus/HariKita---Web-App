import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const read = (p: string) => readFileSync(path.join(root, p), "utf-8");

test("AdminButton exposes variants and min-h-11", () => {
  const src = read("src/components/admin/AdminButton.tsx");
  assert.match(src, /variant/);
  assert.match(src, /min-h-11/);
  assert.match(src, /primary/);
  assert.match(src, /danger/);
});

test("AdminBadge maps tone to design-system tokens", () => {
  const src = read("src/components/admin/AdminBadge.tsx");
  assert.match(src, /success|ok/);
  assert.match(src, /warning|warn/);
  assert.match(src, /error/);
});

test("AdminCard renders title/description/action slots", () => {
  const src = read("src/components/admin/AdminCard.tsx");
  assert.match(src, /title/);
  assert.match(src, /description/);
  assert.match(src, /action/);
});

test("AdminPageHeader/StatCard/Table exist with expected props", () => {
  assert.match(read("src/components/admin/AdminPageHeader.tsx"), /title/);
  assert.match(read("src/components/admin/AdminStatCard.tsx"), /label/);
  const t = read("src/components/admin/AdminTable.tsx");
  assert.match(t, /columns/);
  assert.match(t, /renderRow/);
});
