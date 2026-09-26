import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  STUDIO_SECTIONS,
  canReorderSection,
  createBlankStudioDocument,
  normalizeSectionOrder,
} from '../src/lib/invitation-studio/sections';

test('registers the canonical sixteen sections with fixed cover and closing', () => {
  assert.equal(STUDIO_SECTIONS.length, 16);
  assert.equal(STUDIO_SECTIONS[0].id, 'cover');
  assert.equal(STUDIO_SECTIONS.at(-1)?.id, 'closing');
  assert.equal(STUDIO_SECTIONS[0].mandatory, true);
  assert.equal(STUDIO_SECTIONS.at(-1)?.mandatory, true);
  assert.equal(canReorderSection('cover'), false);
  assert.equal(canReorderSection('closing'), false);
  assert.equal(canReorderSection('gallery'), true);
});

test('blank documents use mobile base with optional desktop overrides', () => {
  const document = createBlankStudioDocument();
  assert.equal(document.schemaVersion, 1);
  assert.deepEqual(document.sectionOrder, STUDIO_SECTIONS.map((section) => section.id));
  assert.equal(document.sections.length, 16);
  assert.equal(document.sections[0].enabled, true);
  assert.equal(document.sections[1].enabled, false);
  assert.equal(document.sections[0].layout.mobile, 'base');
  assert.equal(document.sections[0].layout.desktop, undefined);
});

test('normalizes section order while preserving fixed boundaries', () => {
  const order = normalizeSectionOrder(['gallery', 'cover', 'closing', 'hero', 'gallery', 'unknown']);
  assert.deepEqual(order, ['cover', 'hero', 'gallery', 'closing']);
});

test('document contract represents transforms, layers, nodes, animation, and lifecycle values', () => {
  const document = createBlankStudioDocument();
  const node = {
    id: 'title', kind: 'text', layer: 'content', visible: true, locked: false,
    transform: { x: 10, y: 20, width: 80, height: 12, rotation: 0, flipX: false, flipY: false },
    animation: { preset: 'reveal', delayMs: 0, durationMs: 500 },
    appearance: { opacity: 100, overflow: 'visible' },
    accessibility: { label: 'Judul' }, config: { text: 'Hari Bahagia' },
  } as const;
  document.sections[0].nodes.push(node);
  assert.equal(node.transform.x, 10);
  assert.equal(node.layer, 'content');
  const status: import('../src/lib/invitation-studio/types').StudioStatus = 'draft';
  assert.equal(status, 'draft');
});
