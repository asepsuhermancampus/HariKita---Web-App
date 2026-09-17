import { test } from "node:test";
import assert from "node:assert/strict";
import { validateAudioInput } from "../src/server/actions/invitation-audio";

test("accepts a valid catalog track id and palette id", () => {
  const res = validateAudioInput({
    invitationId: "inv_1",
    backsoundTrackId: "romantic-harp-dawn",
    sfxPaletteId: "romantic-harp",
  });
  assert.equal(res.ok, true);
});

test("accepts nulls (reset to theme default)", () => {
  const res = validateAudioInput({
    invitationId: "inv_1",
    backsoundTrackId: null,
    sfxPaletteId: null,
  });
  assert.equal(res.ok, true);
});

test("rejects an unknown track id", () => {
  const res = validateAudioInput({
    invitationId: "inv_1",
    backsoundTrackId: "not-a-track",
    sfxPaletteId: "romantic-harp",
  });
  assert.equal(res.ok, false);
});

test("rejects an unknown palette id", () => {
  const res = validateAudioInput({
    invitationId: "inv_1",
    backsoundTrackId: "romantic-harp-dawn",
    sfxPaletteId: "not-a-palette",
  });
  assert.equal(res.ok, false);
});

test("rejects a missing invitationId", () => {
  const res = validateAudioInput({
    invitationId: "",
    backsoundTrackId: null,
    sfxPaletteId: null,
  });
  assert.equal(res.ok, false);
});
