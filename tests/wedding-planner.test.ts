import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateBudgetItemInput,
  validateTaskInput,
  validateProofInput,
  PLANNER_STAGES,
  BUDGET_CATEGORIES,
} from "../src/lib/validations/wedding-planner";
import { DEFAULT_TASKS, DEFAULT_KUA, DEFAULT_EMERGENCY } from "../src/server/services/wedding-planner-seed";
import { computeReadiness } from "../src/server/queries/wedding-planner";

test("validateBudgetItemInput accepts a valid item and coerces amounts to Int", () => {
  const res = validateBudgetItemInput({
    category: "Mahar",
    itemName: "Logam Mulia 10g",
    estimatedAmount: "12000000",
    paidAmount: "5000000",
    isExternal: true,
  });
  assert.equal(res.success, true);
  assert.equal(res.data?.estimatedAmount, 12000000);
  assert.equal(res.data?.paidAmount, 5000000);
  assert.equal(res.data?.isExternal, true);
  assert.equal(res.data?.linkMode, "MANUAL");
});

test("validateBudgetItemInput rejects empty itemName and negative amounts", () => {
  const res = validateBudgetItemInput({
    category: "Mahar",
    itemName: "  ",
    estimatedAmount: "-5",
    paidAmount: "0",
  });
  assert.equal(res.success, false);
  assert.ok(res.errors?.itemName);
  assert.ok(res.errors?.estimatedAmount);
});

test("validateTaskInput requires taskText and clamps stage 0..7", () => {
  assert.equal(validateTaskInput({ taskText: "Cek cincin", stage: "3" }).success, true);
  const bad = validateTaskInput({ taskText: "", stage: "99" });
  assert.equal(bad.success, false);
  assert.ok(bad.errors?.taskText);
  assert.ok(bad.errors?.stage);
});

test("validateProofInput requires a fileUrl", () => {
  assert.equal(validateProofInput({ fileUrl: "/uploads/ex-budget/u/x.pdf" }).success, true);
  assert.equal(validateProofInput({ fileUrl: "" }).success, false);
});

test("PLANNER_STAGES has 7 stages and BUDGET_CATEGORIES is non-empty", () => {
  assert.equal(PLANNER_STAGES.length, 7);
  assert.ok(BUDGET_CATEGORIES.length > 0);
});

test("default seed arrays have expected sizes and shapes", () => {
  assert.equal(DEFAULT_TASKS.length, 22);
  assert.equal(DEFAULT_KUA.length, 32); // 26 wajib + 6 opsional
  assert.equal(DEFAULT_EMERGENCY.length, 13);
  assert.ok(DEFAULT_TASKS.every((t) => t.stage >= 1 && t.stage <= 7));
  assert.equal(DEFAULT_KUA.filter((k) => k.isRequired).length, 26);
});

test("computeReadiness returns 0 overall when nothing done", () => {
  const r = computeReadiness({
    timelineDone: 0, timelineTotal: 22,
    kuaDone: 0, kuaTotal: 26,
    budgetEstimated: 0, budgetPaid: 0,
  });
  assert.equal(r.overallPct, 0);
  assert.equal(r.timeline.pct, 0);
});

test("computeReadiness averages the three module percentages", () => {
  const r = computeReadiness({
    timelineDone: 11, timelineTotal: 22,   // 50
    kuaDone: 13, kuaTotal: 26,             // 50
    budgetEstimated: 1000000, budgetPaid: 500000, // 50
  });
  assert.equal(r.timeline.pct, 50);
  assert.equal(r.kua.pct, 50);
  assert.equal(r.budget.pctRealized, 50);
  assert.equal(r.overallPct, 50);
});

test("computeReadiness handles divide-by-zero safely", () => {
  const r = computeReadiness({
    timelineDone: 0, timelineTotal: 0,
    kuaDone: 0, kuaTotal: 0,
    budgetEstimated: 0, budgetPaid: 0,
  });
  assert.equal(r.overallPct, 0);
  assert.equal(r.budget.pctRealized, 0);
});
