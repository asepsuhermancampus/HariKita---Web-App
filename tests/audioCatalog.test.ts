import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AUDIO_TRACKS,
  SFX_PALETTES,
  validateCatalog,
  getTrack,
  getPalette,
  listTracks,
} from "../src/lib/sound/audioCatalog";

test("validateCatalog does not throw on the shipped catalog", () => {
  assert.doesNotThrow(() => validateCatalog());
});

test("every track has a CC0 or Public-Domain license", () => {
  for (const t of AUDIO_TRACKS) {
    assert.ok(
      t.license === "CC0-1.0" || t.license === "Public-Domain",
      `track ${t.id} has non-CC0 license: ${t.license}`,
    );
  }
});

test("no track file hotlinks a remote URL", () => {
  for (const t of AUDIO_TRACKS) {
    assert.ok(
      !t.file.includes("http"),
      `track ${t.id} hotlinks a remote URL: ${t.file}`,
    );
    assert.ok(
      t.file.startsWith("/audio/backsound/"),
      `track ${t.id} is not under /audio/backsound/: ${t.file}`,
    );
  }
});

test("every track has full provenance metadata", () => {
  for (const t of AUDIO_TRACKS) {
    assert.ok(t.sourceUrl.startsWith("http"), `track ${t.id} needs sourceUrl`);
    assert.ok(t.author.length > 0, `track ${t.id} needs author`);
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(t.retrievedAt), `track ${t.id} needs ISO retrievedAt`);
    assert.ok(/^[a-f0-9]{64}$/.test(t.sha256), `track ${t.id} needs sha256`);
    assert.ok(t.durationSec > 0, `track ${t.id} needs durationSec`);
  }
});

test("getTrack and getPalette resolve known ids and return undefined otherwise", () => {
  assert.ok(getTrack(AUDIO_TRACKS[0].id));
  assert.equal(getTrack("does-not-exist"), undefined);
  assert.ok(getPalette("romantic-harp"));
  assert.equal(getPalette("nope" as never), undefined);
});

test("catalog covers all five moods", () => {
  for (const mood of ["romantic", "royal", "modern", "nature", "celebratory"] as const) {
    assert.ok(listTracks(mood).length > 0, `no track for mood ${mood}`);
  }
});

test("there are exactly four SFX palettes with the documented ids", () => {
  const ids = SFX_PALETTES.map((p) => p.id).sort();
  assert.deepEqual(ids, ["gentle-nature", "modern-pop", "romantic-harp", "royal-gamelan"]);
});
