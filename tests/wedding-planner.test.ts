import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateBudgetItemInput,
  validateTaskInput,
  validateProofInput,
  PLANNER_STAGES,
  BUDGET_CATEGORIES,
} from "../src/lib/validations/wedding-planner";

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
