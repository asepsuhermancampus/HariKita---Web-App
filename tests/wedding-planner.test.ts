import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateBudgetItemInput,
  validateTaskInput,
  validateProofInput,
  PLANNER_STAGES,
  BUDGET_CATEGORIES,
} from "../src/lib/validations/wedding-planner";
import {
  DEFAULT_TASKS,
  DEFAULT_KUA,
  DEFAULT_EMERGENCY,
  isWeddingPlannerSeedComplete,
  expectedWeddingPlannerSeedKeys,
} from "../src/server/services/wedding-planner-seed";
import {
  computeReadiness,
  resolveBudgetAmounts,
  selectPlannerEventDate,
  sumResolvedBudget,
} from "../src/server/queries/wedding-planner";

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

test("planner seed fast-path only accepts every keyed default", () => {
  const keys = expectedWeddingPlannerSeedKeys();
  assert.equal(
    isWeddingPlannerSeedComplete({
      tasks: keys.tasks,
      kua: keys.kua,
      emergency: keys.emergency,
    }),
    true
  );
  assert.equal(
    isWeddingPlannerSeedComplete({
      tasks: keys.tasks.slice(1),
      kua: keys.kua,
      emergency: keys.emergency,
    }),
    false
  );
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

test("money validators reject fractions, exponent notation, and PostgreSQL Int overflow", () => {
  for (const estimatedAmount of ["1.5", "1e3", "2147483648"]) {
    const result = validateBudgetItemInput({
      category: "Mahar",
      itemName: "Logam mulia",
      estimatedAmount,
      paidAmount: "0",
    });
    assert.equal(result.success, false);
    assert.ok(result.errors?.estimatedAmount);
  }
});

test("proof URL must belong to the authenticated user's upload directory", () => {
  assert.equal(
    validateProofInput(
      { fileUrl: "/uploads/ex-budget/user-a/proof-a.pdf" },
      "user-a"
    ).success,
    true
  );
  assert.equal(
    validateProofInput(
      { fileUrl: "/uploads/ex-budget/user-b/proof-a.pdf" },
      "user-a"
    ).success,
    false
  );
  assert.equal(validateProofInput({ fileUrl: "https://evil.example/a.pdf" }, "user-a").success, false);
});

test("computeReadiness clamps every percentage to 0..100", () => {
  const result = computeReadiness({
    timelineDone: 2,
    timelineTotal: 1,
    kuaDone: 3,
    kuaTotal: 1,
    budgetEstimated: 100,
    budgetPaid: 200,
  });
  assert.equal(result.timeline.pct, 100);
  assert.equal(result.kua.pct, 100);
  assert.equal(result.overallPct, 100);
});

test("AUTO budget resolves order item subtotal and proportional paid amount", () => {
  assert.deepEqual(
    resolveBudgetAmounts({
      linkMode: "AUTO",
      estimatedAmount: 0,
      paidAmount: 0,
      linkedOrderItem: {
        subtotal: 400_000,
        order: {
          totalAmount: 1_000_000,
          installments: [
            { amount: 300_000, status: "PAID" },
            { amount: 700_000, status: "PENDING" },
          ],
        },
      },
    }),
    { estimatedAmount: 400_000, paidAmount: 120_000, status: "DP" }
  );
});

test("AUTO budget subtracts paid refunds and excludes cancelled items", () => {
  const order = {
    totalAmount: 1_000_000,
    installments: [{ amount: 500_000, status: "PAID" }],
    refunds: [{ amount: 100_000, status: "PAID" }],
  };
  assert.deepEqual(
    resolveBudgetAmounts({
      linkMode: "AUTO",
      estimatedAmount: 0,
      paidAmount: 0,
      linkedOrderItem: { subtotal: 250_000, status: "ACCEPTED", order },
    }),
    { estimatedAmount: 250_000, paidAmount: 100_000, status: "DP" }
  );
  assert.deepEqual(
    resolveBudgetAmounts({
      linkMode: "AUTO",
      estimatedAmount: 0,
      paidAmount: 0,
      linkedOrderItem: { subtotal: 250_000, status: "CANCELLED", order },
    }),
    { estimatedAmount: 0, paidAmount: 0, status: "BELUM" }
  );
});

test("MANUAL budget preserves the user's explicit status", () => {
  assert.deepEqual(
    resolveBudgetAmounts({
      linkMode: "MANUAL",
      estimatedAmount: 500_000,
      paidAmount: 0,
      status: "SIAPKAN",
      linkedOrderItem: null,
    }),
    { estimatedAmount: 500_000, paidAmount: 0, status: "SIAPKAN" }
  );
});

test("persisted AUTO budget excludes terminal order states", () => {
  assert.deepEqual(
    resolveBudgetAmounts({
      linkMode: "AUTO",
      estimatedAmount: 0,
      paidAmount: 0,
      linkedOrderItem: {
        subtotal: 350_000,
        status: "ACCEPTED",
        order: {
          status: "REFUNDED",
          totalAmount: 350_000,
          installments: [{ amount: 350_000, status: "PAID" }],
          refunds: [{ amount: 350_000, status: "PAID" }],
        },
      },
    }),
    { estimatedAmount: 0, paidAmount: 0, status: "BELUM" }
  );
});

test("planner event date prefers profile then falls back to nearest order", () => {
  assert.equal(selectPlannerEventDate("2027-01-02", "2027-06-15"), "2027-01-02");
  assert.equal(selectPlannerEventDate(null, "2027-06-15"), "2027-06-15");
  assert.equal(selectPlannerEventDate(null, null), null);
});

test("planner ignores past profile event date when a future order exists", () => {
  assert.equal(
    selectPlannerEventDate("2020-01-01", "2027-06-15", "2026-09-25"),
    "2027-06-15"
  );
});

test("planner readiness sums persisted and automatic order budget amounts", () => {
  assert.deepEqual(
    sumResolvedBudget([
      { estimatedAmount: 500_000, paidAmount: 100_000 },
      { estimatedAmount: 350_000, paidAmount: 0 },
    ]),
    { estimated: 850_000, paid: 100_000 }
  );
});
