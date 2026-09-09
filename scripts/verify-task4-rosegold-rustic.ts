import assert from "node:assert";

async function verifyRoseGoldAndRustic() {
  console.log("Checking Rose Gold and Rustic engine exports...");
  const { RoseGoldEngine } = await import("../src/components/templates/engines/RoseGoldEngine");
  const { RusticEngine } = await import("../src/components/templates/engines/RusticEngine");

  assert.strictEqual(typeof RoseGoldEngine, "function", "RoseGoldEngine must be a React component");
  assert.strictEqual(typeof RusticEngine, "function", "RusticEngine must be a React component");

  console.log("PASS: Rose Gold and Rustic layout engines are properly exported.");
}

verifyRoseGoldAndRustic().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});
