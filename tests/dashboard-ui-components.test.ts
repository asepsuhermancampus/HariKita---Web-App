import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const read = (p: string) => readFileSync(path.join(root, p), "utf-8");

test("DashButton exposes variants and min-h-11", () => {
  const src = read("src/components/dashboard/DashButton.tsx");
  assert.match(src, /variant/);
  assert.match(src, /min-h-11/);
  assert.match(src, /primary/);
  assert.match(src, /danger/);
});

test("DashBadge maps tone to design-system tokens", () => {
  const src = read("src/components/dashboard/DashBadge.tsx");
  assert.match(src, /success|ok/);
  assert.match(src, /warning|warn/);
  assert.match(src, /error/);
});

test("DashCard renders title/description/action slots", () => {
  const src = read("src/components/dashboard/DashCard.tsx");
  assert.match(src, /title/);
  assert.match(src, /description/);
  assert.match(src, /action/);
});

test("DashPageHeader/StatCard/Table exist with expected props", () => {
  assert.match(read("src/components/dashboard/DashPageHeader.tsx"), /title/);
  assert.match(read("src/components/dashboard/DashStatCard.tsx"), /label/);
  const t = read("src/components/dashboard/DashTable.tsx");
  assert.match(t, /columns/);
  assert.match(t, /renderRow/);
});
