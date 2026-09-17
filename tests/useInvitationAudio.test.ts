import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveAudioSrc } from "../src/lib/sound/useInvitationAudio";
import { AUDIO_TRACKS } from "../src/lib/sound/audioCatalog";

const fallback = AUDIO_TRACKS[0].id;

test("legacy musicUrl wins over everything", () => {
  const src = resolveAudioSrc("https://example.com/legacy.mp3", "royal-gamelan-lantern", fallback);
  assert.equal(src, "https://example.com/legacy.mp3");
});

test("backsoundTrackId is used when musicUrl is absent", () => {
  const src = resolveAudioSrc(null, "royal-gamelan-lantern", fallback);
  assert.equal(src, "/audio/backsound/royal-gamelan-lantern.mp3");
});

test("falls back to the theme default when both overrides are absent", () => {
  const src = resolveAudioSrc(null, null, fallback);
  assert.ok(src && src.startsWith("/audio/backsound/"), `expected local fallback, got ${src}`);
});

test("unknown backsoundTrackId falls back to the theme default", () => {
  const src = resolveAudioSrc(undefined, "not-a-real-track", fallback);
  assert.ok(src && src.startsWith("/audio/backsound/"), `expected local fallback, got ${src}`);
});

test("returns null when nothing resolves (empty catalog)", () => {
  assert.equal(resolveAudioSrc(null, null, "not-a-real-track"), null);
});
