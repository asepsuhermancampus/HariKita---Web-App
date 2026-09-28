import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createStudioNode, editStudio } from '../src/lib/invitation-studio/editor';
import { gestureTransform } from '../src/lib/invitation-studio/geometry';
import { resolveStudioMotion, resolveCompositeStudioMotion } from '../src/components/admin/invitation-studio/studio-motion-presets';
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

test('composite motion allows entrance, continuous sway/float, and exit simultaneously', () => {
  const compositeAnim = {
    preset: 'sway' as const,
    delayMs: 0,
    durationMs: 3000,
    entrance: { enabled: true, durationMs: 2000, delayMs: 100, direction: 'up' as const, intensity: 5 },
    loop: { preset: 'sway' as const, durationMs: 4000, intensity: 8, repeat: 0 },
    exit: { enabled: true, durationMs: 1500, delayMs: 0, direction: 'down' as const, intensity: 0 },
  };

  const { outer, inner } = resolveCompositeStudioMotion(compositeAnim, false);
  // Outer handles entrance transition (opacity 0 -> 1)
  assert.deepEqual(outer.initial, { opacity: 0, y: -5 });
  assert.deepEqual(outer.animate, { opacity: 1, y: 0 });
  assert.equal((outer.transition as any)?.duration, 2);

  // Inner handles continuous looping sway
  assert.ok(inner.animate);
  assert.deepEqual((inner.animate as any).rotate, [-4, 4, -4]);

  // Reduced motion returns static for both
  const reduced = resolveCompositeStudioMotion(compositeAnim, true);
  assert.deepEqual(reduced.outer.animate, { opacity: 1 });
  assert.deepEqual(reduced.inner.animate, { opacity: 1 });

  // Document validation allows valid composite fields and rejects out-of-bound fields
  const d = createBlankStudioDocument();
  const node = createStudioNode('text', 'composite-node');
  node.animation = compositeAnim;
  d.sections[0].nodes.push(node);
  assert.equal(validateStudioDocument(d).success, true);

  // Invalid entrance intensity > 20
  node.animation = {
    ...compositeAnim,
    entrance: { ...compositeAnim.entrance, intensity: 25 },
  };
  assert.equal(validateStudioDocument(d).success, false);
});

test('batch actions duplicate-many, copy-to-section, and delete-many work reliably', () => {
  const d = createBlankStudioDocument();
  const n1 = createStudioNode('text', 'node-1', 'cover');
  const n2 = createStudioNode('text', 'node-2', 'cover');
  d.sections[0].nodes.push(n1, n2);

  // 1. duplicate-many in same section
  const resDup = editStudio(d, {
    type: 'duplicate-many',
    section: 'cover',
    ids: ['node-1', 'node-2'],
    newIds: ['node-1-copy', 'node-2-copy'],
  });
  const coverNodes = resDup.document.sections[0].nodes;
  assert.equal(coverNodes.length, 4);
  assert.equal(coverNodes[2].id, 'node-1-copy');
  assert.equal(coverNodes[3].id, 'node-2-copy');

  // 2. copy-to-section to another section (e.g. events)
  const resCopy = editStudio(resDup.document, {
    type: 'copy-to-section',
    fromSection: 'cover',
    toSection: 'events',
    ids: ['node-1', 'node-2'],
    newIds: ['event-node-1', 'event-node-2'],
  });
  const eventSec = resCopy.document.sections.find(s => s.id === 'events')!;
  assert.ok(eventSec.nodes.some(n => n.id === 'event-node-1'));
  assert.ok(eventSec.nodes.some(n => n.id === 'event-node-2'));

  // 3. delete-many in cover
  const resDel = editStudio(resCopy.document, {
    type: 'delete-many',
    section: 'cover',
    ids: ['node-1-copy', 'node-2-copy'],
  });
  assert.equal(resDel.document.sections[0].nodes.length, 2);
});

test('group actions group-nodes, duplicate-group, and ungroup-nodes work reliably', () => {
  const d = createBlankStudioDocument();
  const n1 = createStudioNode('text', 'node-1', 'cover');
  const n2 = createStudioNode('text', 'node-2', 'cover');
  d.sections[0].nodes.push(n1, n2);

  // 1. Group nodes
  const resGroup = editStudio(d, {
    type: 'group-nodes',
    section: 'cover',
    ids: ['node-1', 'node-2'],
    groupId: 'group-ornamen',
    groupName: 'Ornamen Sudut',
  });
  const nodes = resGroup.document.sections[0].nodes;
  assert.equal(nodes[0].groupId, 'group-ornamen');
  assert.equal(nodes[0].groupName, 'Ornamen Sudut');
  assert.equal(nodes[1].groupId, 'group-ornamen');

  // 2. Duplicate group
  const resDupGroup = editStudio(resGroup.document, {
    type: 'duplicate-group',
    section: 'cover',
    groupId: 'group-ornamen',
    newGroupId: 'group-ornamen-copy',
    newGroupIdsMap: { 'node-1': 'node-1-cloned', 'node-2': 'node-2-cloned' },
  });
  assert.equal(resDupGroup.document.sections[0].nodes.length, 4);
  const clonedGroupNodes = resDupGroup.document.sections[0].nodes.filter(n => n.groupId === 'group-ornamen-copy');
  assert.equal(clonedGroupNodes.length, 2);

  // 3. Ungroup nodes
  const resUngroup = editStudio(resDupGroup.document, {
    type: 'ungroup-nodes',
    section: 'cover',
    groupId: 'group-ornamen',
  });
  const originalUngrouped = resUngroup.document.sections[0].nodes.filter(n => n.id === 'node-1' || n.id === 'node-2');
  assert.equal(originalUngrouped[0].groupId, undefined);
  assert.equal(originalUngrouped[1].groupId, undefined);

  // 4. transform-many shifts all group nodes together
  const resTransformMany = editStudio(resDupGroup.document, {
    type: 'transform-many',
    section: 'cover',
    device: 'mobile',
    patches: {
      'node-1-cloned': { x: 25, y: 35 },
      'node-2-cloned': { x: 30, y: 40 },
    },
  });
  const moved1 = resTransformMany.document.sections[0].nodes.find(n => n.id === 'node-1-cloned')!;
  const moved2 = resTransformMany.document.sections[0].nodes.find(n => n.id === 'node-2-cloned')!;
  assert.equal(moved1.transform.x, 25);
  assert.equal(moved1.transform.y, 35);
  assert.equal(moved2.transform.x, 30);
  assert.equal(moved2.transform.y, 40);
});
