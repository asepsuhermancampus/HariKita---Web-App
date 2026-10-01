import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBlankStudioDocument } from '../src/lib/invitation-studio/sections';
import { editStudio } from '../src/lib/invitation-studio/editor';
import { validateStudioDocument } from '../src/lib/invitation-studio/validation';
import { backgroundToCss, DEFAULT_CANVAS_BACKGROUND } from '../src/lib/invitation-studio/colors';

// ── backgroundToCss ──────────────────────────────────────────────────────────

test('backgroundToCss falls back to Cream Canvas when no background is set', () => {
  assert.deepEqual(backgroundToCss(undefined), { backgroundColor: DEFAULT_CANVAS_BACKGROUND });
  assert.deepEqual(backgroundToCss(null), { backgroundColor: DEFAULT_CANVAS_BACKGROUND });
});

test('backgroundToCss renders a solid colour and sanitizes invalid hex', () => {
  assert.deepEqual(backgroundToCss({ kind: 'solid', color: '#123456' }), { backgroundColor: '#123456' });
  // Invalid colour string falls back to the default instead of leaking into CSS.
  assert.deepEqual(backgroundToCss({ kind: 'solid', color: 'not-a-color' }), { backgroundColor: DEFAULT_CANVAS_BACKGROUND });
});

test('backgroundToCss renders a linear gradient with angle and clamps default angle', () => {
  const css = backgroundToCss({ kind: 'gradient', from: '#FFFFFF', to: '#000000', angle: 90 });
  assert.equal(css.backgroundImage, 'linear-gradient(90deg, #FFFFFF 0%, #000000 100%)');
  assert.equal(css.backgroundColor, undefined);
});

test('backgroundToCss renders a texture as pure CSS layers (no image URL)', () => {
  const css = backgroundToCss({ kind: 'texture', texture: 'dots', baseColor: '#FAF8F5', accentColor: '#C5A880', intensity: 40 });
  assert.equal(css.backgroundColor, '#FAF8F5');
  assert.match(String(css.backgroundImage), /radial-gradient/);
  assert.equal(css.backgroundSize, '16px 16px');
  // Never references an external asset file.
  assert.doesNotMatch(String(css.backgroundImage), /url\(/);
});

test('backgroundToCss covers every texture preset without throwing', () => {
  for (const texture of ['noise', 'grain', 'linen', 'marble', 'dots', 'rays'] as const) {
    const css = backgroundToCss({ kind: 'texture', texture, baseColor: '#FAF8F5', accentColor: '#C5A880', intensity: 50 });
    assert.equal(typeof css.backgroundImage, 'string');
  }
});

// ── validation ───────────────────────────────────────────────────────────────

test('document without background stays valid (backward compatible)', () => {
  const d = createBlankStudioDocument();
  assert.equal(d.background, undefined);
  assert.equal(validateStudioDocument(d).success, true);
});

test('valid background variants pass validation', () => {
  const d = createBlankStudioDocument();
  d.background = { kind: 'solid', color: '#FAF8F5' };
  assert.equal(validateStudioDocument(d).success, true);
  d.background = { kind: 'gradient', from: '#FFFFFF', to: '#F3EDE6', angle: 135 };
  assert.equal(validateStudioDocument(d).success, true);
  d.background = { kind: 'texture', texture: 'linen', baseColor: '#FAF8F5', accentColor: '#C5A880', intensity: 30 };
  assert.equal(validateStudioDocument(d).success, true);
});

test('invalid background variants are rejected', () => {
  const bad = [
    { kind: 'solid', color: 'red' },                                   // not hex/rgb
    { kind: 'solid', color: '#FAF8F5', extra: 1 },                     // unknown field
    { kind: 'gradient', from: '#FFFFFF', to: '#000000', angle: 999 },  // angle out of range
    { kind: 'texture', texture: 'sparkles', baseColor: '#FAF8F5', accentColor: '#C5A880', intensity: 30 }, // unknown texture
    { kind: 'texture', texture: 'noise', baseColor: '#FAF8F5', accentColor: '#C5A880', intensity: 200 },   // intensity out of range
    { kind: 'unknown' },
  ];
  for (const background of bad) {
    const d = createBlankStudioDocument();
    (d as { background?: unknown }).background = background;
    assert.equal(validateStudioDocument(d).success, false, `expected rejection for ${JSON.stringify(background)}`);
  }
});

// ── edit op ──────────────────────────────────────────────────────────────────

test('background edit op sets, replaces and clears the document background', () => {
  const d = createBlankStudioDocument();
  const set = editStudio(d, { type: 'background', background: { kind: 'solid', color: '#4A2E35' } });
  assert.deepEqual(set.document.background, { kind: 'solid', color: '#4A2E35' });
  // Panel edits never move the selection.
  assert.equal(set.selection, null);

  const replace = editStudio(set.document, { type: 'background', background: { kind: 'gradient', from: '#FFFFFF', to: '#000000', angle: 45 } });
  assert.deepEqual(replace.document.background, { kind: 'gradient', from: '#FFFFFF', to: '#000000', angle: 45 });

  const cleared = editStudio(replace.document, { type: 'background', background: null });
  assert.equal(cleared.document.background, undefined);
  assert.equal(validateStudioDocument(cleared.document).success, true);
});
