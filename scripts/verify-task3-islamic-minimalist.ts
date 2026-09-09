import assert from "node:assert";

async function verifyIslamicAndMinimalist() {
  console.log("Checking Islamic and Minimalist engine exports...");
  const { IslamicEngine } = await import("../src/components/templates/engines/IslamicEngine");
  const { MinimalistEngine } = await import("../src/components/templates/engines/MinimalistEngine");

  assert.strictEqual(typeof IslamicEngine, "function", "IslamicEngine must be a React component");
  assert.strictEqual(typeof MinimalistEngine, "function", "MinimalistEngine must be a React component");

  console.log("PASS: Islamic and Minimalist layout engines are properly exported.");
}

verifyIslamicAndMinimalist().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});
