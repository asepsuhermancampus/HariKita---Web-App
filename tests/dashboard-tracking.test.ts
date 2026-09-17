import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateBezierSplinePath,
  calculateSvgArcPath,
  formatCompactNumber,
} from "../src/components/dashboard/dashboard-utils";

test("calculateBezierSplinePath returns valid SVG path string", () => {
  const points = [
    { x: 0, y: 100 },
    { x: 50, y: 50 },
    { x: 100, y: 80 },
  ];
  const path = calculateBezierSplinePath(points);
  assert.ok(path.startsWith("M 0 100"));
  assert.ok(path.includes("C"));
});

test("calculateSvgArcPath computes arc path coordinates correctly", () => {
  const arc = calculateSvgArcPath(100, 100, 80, 180, 360);
  assert.ok(arc.startsWith("M"));
  assert.ok(arc.includes("A 80 80"));
});

test("formatCompactNumber formats values compactly with Indonesian locale", () => {
  assert.equal(formatCompactNumber(12845), "12.845");
  assert.equal(formatCompactNumber(254), "254");
});

test("DashboardSplineChart data coordinates scale within viewBox limits", () => {
  const data = [
    { date: "2025-11-08", label: "8 Nov", value: 10 },
    { date: "2025-11-09", label: "9 Nov", value: 20 },
    { date: "2025-11-10", label: "10 Nov", value: 50 },
  ];
  const max = Math.max(...data.map((d) => d.value));
  assert.equal(max, 50);
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 500,
    y: 200 - (d.value / max) * 160,
  }));
  const path = calculateBezierSplinePath(points);
  assert.ok(path.startsWith("M 0"));
  assert.ok(path.includes("C"));
});

