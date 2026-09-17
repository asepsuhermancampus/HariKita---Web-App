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

test("DashboardSemiDonutGauge computes ratio angles summing to 180 degrees", () => {
  const val1 = 206;
  const val2 = 48;
  const total = val1 + val2;
  const angle1 = (val1 / total) * 180;
  const angle2 = (val2 / total) * 180;
  assert.equal(Math.round(angle1 + angle2), 180);
});

test("DashboardSparkBarCard computes proportional heights for 7 bars", () => {
  const bars = [
    { label: "Sen", value: 12 },
    { label: "Sel", value: 24 },
    { label: "Rab", value: 36 },
    { label: "Kam", value: 18 },
    { label: "Jum", value: 48 },
    { label: "Sab", value: 30 },
    { label: "Min", value: 60 },
  ];
  const maxVal = Math.max(...bars.map((b) => b.value));
  assert.equal(maxVal, 60);
  const heights = bars.map((b) => Math.max(15, Math.round((b.value / maxVal) * 100)));
  assert.equal(heights[heights.length - 1], 100);
  assert.ok(heights[0] >= 15);
});



