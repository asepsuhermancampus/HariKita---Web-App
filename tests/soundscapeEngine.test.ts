import { test } from "node:test";
import assert from "node:assert/strict";
import { soundscape } from "../src/lib/sound/soundscapeEngine";

test("engine starts on the romantic-harp palette", () => {
  assert.equal(soundscape.getPaletteId(), "romantic-harp");
});

test("setPalette changes the active palette", () => {
  soundscape.setPalette("royal-gamelan");
  assert.equal(soundscape.getPaletteId(), "royal-gamelan");
  soundscape.setPalette("romantic-harp");
});

test("setPalette ignores unknown ids and keeps the previous palette", () => {
  soundscape.setPalette("modern-pop");
  soundscape.setPalette("nonsense" as never);
  assert.equal(soundscape.getPaletteId(), "modern-pop");
  soundscape.setPalette("romantic-harp");
});

test("SFX calls are safe no-ops without a browser AudioContext", () => {
  assert.doesNotThrow(() => {
    soundscape.playTick();
    soundscape.playChime();
    soundscape.playCoin();
    soundscape.playCoverOpen();
    soundscape.playConfettiPop();
    soundscape.playGamelanBell();
  });
});
