import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createStudioNode } from '../src/lib/invitation-studio/editor';
import { gestureTransform } from '../src/lib/invitation-studio/geometry';
import { resolveStudioMotion } from '../src/components/admin/invitation-studio/studio-motion-presets';
import { StudioSceneRenderer } from '../src/components/admin/invitation-studio/StudioSceneRenderer';
import { createBlankStudioDocument } from '../src/lib/invitation-studio/sections';
import { validateStudioDocument } from '../src/lib/invitation-studio/validation';

test('canvas gestures normalize pixels and clamp dimensions without changing mobile fallback', () => {
  const t = createStudioNode('text', 'one').transform;
  assert.equal(gestureTransform(t, 'drag', 75, 60, 375, 600).x, 30);
  assert.equal(gestureTransform(t, 'drag', 75, 60, 375, 600).y, 20);
  assert.equal(gestureTransform(t, 'resize', -1000, 1000, 375, 600).width, 0.1);
  assert.equal(gestureTransform(t, 'resize', -1000, 1000, 375, 600).height, 100);
  assert.equal(t.x, 10);
  assert.throws(() => gestureTransform(t, 'drag', 1, 1, 0, 600));
});
test('scene clips page horizontally but permits isolated section overflow and protects component hit areas', () => {
  const d = createBlankStudioDocument(); d.sections[0].overflowPolicy = 'visible';
  const decoration = createStudioNode('text', 'decor'); decoration.layer = 'front-decoration';
  d.sections[0].nodes.push(decoration, createStudioNode('component', 'rsvp', 'rsvp'));
  const html = renderToStaticMarkup(React.createElement(StudioSceneRenderer, { document: d, device: 'mobile' }));
  assert.match(html, /overflow-x:clip/);
  assert.match(html, /isolation:isolate/);
  assert.match(html, /overflow:visible/);
  assert.match(html, /pointer-events:none/);
  assert.match(html, /pointer-events:auto/);
  assert.match(html, /min-height:44px/);
});
test('motion presets support bounded options and reduced motion is static', () => {
  for (const preset of ['entrance', 'float', 'sway', 'pulse', 'drift', 'reveal', 'exit'] as const) {
    const animation = { preset, delayMs: 100, durationMs: 500, intensity: 10, direction: 'left' as const, repeat: 2, trigger: 'visible' as const };
    assert.ok(resolveStudioMotion(animation, false).animate);
    const reduced = resolveStudioMotion(animation, true);
    assert.equal(reduced.initial, false);
    assert.deepEqual(reduced.animate, { opacity: 1 });
  }
  const d = createBlankStudioDocument(); const n = createStudioNode('text', 'one'); d.sections[0].nodes.push(n);
  Object.assign(n.animation, { intensity: 21 }); assert.equal(validateStudioDocument(d).success, false);
  Object.assign(n.animation, { intensity: 10, repeat: -1 }); assert.equal(validateStudioDocument(d).success, false);
  Object.assign(n.animation, { repeat: 2, trigger: 'visible', direction: 'left' }); assert.equal(validateStudioDocument(d).success, true);
});
