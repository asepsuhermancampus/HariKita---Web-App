import assert from "node:assert";

async function verifyCelestialAndCute() {
  console.log("Checking Celestial and Cute Illustrated engine exports...");
  const engines = await import("../src/components/templates/engines/index");

  assert.strictEqual(typeof engines.BotanicalEngine, "function", "BotanicalEngine must be in index");
  assert.strictEqual(typeof engines.JavaneseEngine, "function", "JavaneseEngine must be in index");
  assert.strictEqual(typeof engines.IslamicEngine, "function", "IslamicEngine must be in index");
  assert.strictEqual(typeof engines.MinimalistEngine, "function", "MinimalistEngine must be in index");
  assert.strictEqual(typeof engines.RoseGoldEngine, "function", "RoseGoldEngine must be in index");
  assert.strictEqual(typeof engines.RusticEngine, "function", "RusticEngine must be in index");
  assert.strictEqual(typeof engines.CelestialEngine, "function", "CelestialEngine must be in index");
  assert.strictEqual(typeof engines.CuteIllustratedEngine, "function", "CuteIllustratedEngine must be in index");

  console.log("PASS: All 8 archetype layout engines are exported in index.ts.");
}

verifyCelestialAndCute().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});
