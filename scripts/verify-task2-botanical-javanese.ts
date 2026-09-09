import assert from "node:assert";

async function verifyBotanicalAndJavanese() {
  console.log("Checking Botanical and Javanese engine exports...");
  const { BotanicalEngine } = await import("../src/components/templates/engines/BotanicalEngine");
  const { JavaneseEngine } = await import("../src/components/templates/engines/JavaneseEngine");

  assert.strictEqual(typeof BotanicalEngine, "function", "BotanicalEngine must be a React component");
  assert.strictEqual(typeof JavaneseEngine, "function", "JavaneseEngine must be a React component");

  console.log("PASS: Botanical and Javanese layout engines are properly exported.");
}

verifyBotanicalAndJavanese().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});
