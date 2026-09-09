import assert from "node:assert";

async function verifyShellComponents() {
  console.log("Checking Universal Luxury Shell component exports...");
  const shell = await import("../src/components/invitation/shell/index");
  
  assert.ok(shell.InvitationDesktopLayout, "InvitationDesktopLayout must be exported");
  assert.ok(shell.EnvelopeCoverGate, "EnvelopeCoverGate must be exported");
  assert.ok(shell.InvitationBottomDock, "InvitationBottomDock must be exported");
  assert.ok(shell.RotatingVinylPlayer, "RotatingVinylPlayer must be exported");
  assert.ok(shell.AutoScrollButton, "AutoScrollButton must be exported");
  assert.ok(shell.ETicketBoardingPass, "ETicketBoardingPass must be exported");

  console.log("PASS: All 6 Universal Luxury Shell components are properly exported.");
}

verifyShellComponents().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});
