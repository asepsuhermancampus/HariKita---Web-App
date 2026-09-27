import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBlankStudioDocument } from '../src/lib/invitation-studio/sections';
import { createStudioNode, editStudio, resolveTransform, selectedStudioNode } from '../src/lib/invitation-studio/editor';
import { validateStudioDocument } from '../src/lib/invitation-studio/validation';

test('section edits preserve mandatory boundaries and authored order', () => {
  let d = createBlankStudioDocument();
  d = editStudio(d, { type: 'section-enabled', section: 'cover', enabled: false }).document;
  assert.equal(d.sections[0].enabled, true);
  d = editStudio(d, { type: 'section-move', section: 'gallery', offset: -1 }).document;
  assert.equal(d.sectionOrder[5], 'gallery');
  d = editStudio(d, { type: 'section-move', section: 'hero', offset: -1 }).document;
  assert.deepEqual(d.sectionOrder.slice(0, 2), ['cover', 'hero']);
});

test('layer selection survives duplication and clears after delete or section switch', () => {
  const d = createBlankStudioDocument();
  const added = editStudio(d, { type: 'add', section: 'cover', node: createStudioNode('text', 'one') });
  assert.equal(added.selection, 'one');
  const copy = editStudio(added.document, { type: 'duplicate', section: 'cover', id: 'one', newId: 'two' });
  assert.equal(copy.selection, 'two');
  assert.equal(copy.document.sections[0].nodes.length, 2);
  assert.equal(selectedStudioNode(copy.document, 'hero', 'two'), undefined);
  const deleted = editStudio(copy.document, { type: 'delete', section: 'cover', id: 'two' });
  assert.equal(deleted.selection, null);
  assert.equal(deleted.document.sections[0].nodes.length, 1);
  assert.equal(d.sections[0].nodes.length, 0);
});

test('locked nodes reject transforms and desktop inheritance reset', () => {
  let d = createBlankStudioDocument();
  d.sections[0].nodes.push(createStudioNode('text', 'one'));
  d = editStudio(d, { type: 'transform', section: 'cover', id: 'one', device: 'desktop', patch: { x: 70 } }).document;
  const n = d.sections[0].nodes[0];
  assert.equal(n.transform.x, 10);
  assert.equal(resolveTransform(n, 'desktop').x, 70);
  d = editStudio(d, { type: 'node', section: 'cover', id: 'one', patch: { locked: true, visible: false } }).document;
  d = editStudio(d, { type: 'transform', section: 'cover', id: 'one', device: 'mobile', patch: { x: 20 } }).document;
  d = editStudio(d, { type: 'inherit', section: 'cover', id: 'one' }).document;
  assert.equal(d.sections[0].nodes[0].transform.x, 10);
  assert.equal(d.sections[0].nodes[0].desktopTransform?.x, 70);
  assert.equal(d.sections[0].nodes[0].visible, false);
  d = editStudio(d, { type: 'node', section: 'cover', id: 'one', patch: { locked: false } }).document;
  d = editStudio(d, { type: 'inherit', section: 'cover', id: 'one' }).document;
  assert.equal(resolveTransform(d.sections[0].nodes[0], 'desktop').x, 10);
});

test('numeric edits clamp bounded transforms; invalid configurations never enter document', () => {
  let d = createBlankStudioDocument();
  d.sections[0].nodes.push(createStudioNode('text', 'one'), createStudioNode('text', 'two'));
  d = editStudio(d, { type: 'transform', section: 'cover', id: 'one', device: 'mobile', patch: { width: -1, x: 999, rotation: 800 } }).document;
  assert.equal(d.sections[0].nodes[0].transform.width, 0.1);
  assert.equal(d.sections[0].nodes[0].transform.x, 100);
  assert.equal(d.sections[0].nodes[0].transform.rotation, 360);
  d = editStudio(d, { type: 'node-move', section: 'cover', id: 'two', offset: -1 }).document;
  assert.deepEqual(d.sections[0].nodes.map(n => n.id), ['two', 'one']);
  assert.throws(() => editStudio(d, { type: 'node', section: 'cover', id: 'one', patch: { appearance: { opacity: 101, overflow: 'visible' } } }));
  assert.equal(validateStudioDocument(d).success, true);
});
