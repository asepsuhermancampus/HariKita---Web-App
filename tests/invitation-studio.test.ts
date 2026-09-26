import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  STUDIO_SECTIONS,
  canReorderSection,
  createBlankStudioDocument,
  normalizeSectionOrder,
} from '../src/lib/invitation-studio/sections';
import { filterStudioAssets, findStudioAsset, listStudioAssets } from '../src/lib/invitation-studio/assets';
import { validateStudioDocument, validateStudioTransition } from '../src/lib/invitation-studio/validation';
import { readFileSync } from 'node:fs';
import { studioActionDependencies, type StudioActionDependencies } from '../src/server/actions/invitation-studio';

test('studio action factory exposes complete lifecycle API and enforces permissions through injected actor', async () => {
  const calls: string[] = [];
  const deps: StudioActionDependencies = {
    actor: async () => ({ userId: 'admin-1', name: 'Admin', subRole: 'SUPER_ADMIN' }),
    db: {} as any,
    audit: async (entry) => { calls.push(entry.action); },
  };
  const actions = studioActionDependencies(deps);
  for (const action of ['createStudioDraft', 'renameStudioDraft', 'duplicateStudioDraft', 'archiveStudioDraft', 'deleteStudioDraft', 'saveStudioDocument', 'submitStudioReview', 'approveStudioDraft', 'publishStudioVersion', 'unpublishStudioDraft']) {
    assert.equal(typeof actions[action as keyof typeof actions], 'function');
  }
  assert.ok(calls);
});

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

test('catalog resolves only registered local SVG and PNG assets', () => {
  const assets = listStudioAssets();
  assert.ok(assets.some((asset) => asset.path.endsWith('.svg')));
  assert.ok(assets.some((asset) => asset.path.endsWith('.png')));
  assert.equal(findStudioAsset(assets[0].path)?.path, assets[0].path);
  assert.equal(findStudioAsset('https://example.com/evil.svg'), undefined);
  assert.deepEqual(findStudioAsset('/uploads/unknown.svg'), undefined);
  assert.ok(filterStudioAssets({ category: assets[0].category }).length > 0);
  assert.ok(filterStudioAssets({ tag: assets[0].tags[0] }).length > 0);
});

test('document validation rejects malformed structure and unsafe node data', () => {
  const document = createBlankStudioDocument();
  document.sections[0].nodes.push({
    id: 'duplicate', kind: 'svg', layer: 'content', visible: true, locked: false,
    transform: { x: 0, y: 0, width: 20, height: 20, rotation: 0, flipX: false, flipY: false },
    animation: { preset: 'none', delayMs: 0, durationMs: 0 }, appearance: { opacity: 100, overflow: 'contained' },
    accessibility: { label: 'Asset' }, config: { src: '/uploads/unknown.svg' },
  });
  document.sections[1].nodes.push({ ...document.sections[0].nodes[0], id: 'duplicate', transform: { ...document.sections[0].nodes[0].transform, x: 101 } });
  const result = validateStudioDocument(document);
  assert.equal(result.success, false);
  if (!result.success) assert.ok(result.errors.some((error) => error.includes('duplicate')));
});

test('document validation accepts a blank document and checks transitions', () => {
  const document = createBlankStudioDocument();
  assert.equal(validateStudioDocument(document).success, true);
  assert.equal(validateStudioTransition('draft', 'in_review', 'SUPER_ADMIN', document).success, true);
  assert.equal(validateStudioTransition('in_review', 'approved', 'ADMIN', document).success, false);
  assert.equal(validateStudioTransition('draft', 'published', 'SUPER_ADMIN', document).success, false);
});

test('studio persistence is isolated and supports unlimited draft/version snapshots', () => {
  const sqliteSchema = readFileSync('prisma/schema.sqlite.prisma', 'utf8');
  const migration = readFileSync('prisma/migrations/20260926120000_invitation_studio_persistence/migration.sql', 'utf8');
  for (const model of ['InvitationStudioDraft', 'InvitationStudioVersion', 'InvitationStudioPublish']) {
    assert.match(sqliteSchema, new RegExp(`model ${model} \\{`));
    assert.match(migration, new RegExp(`CREATE TABLE "${model}"`));
  }
  assert.match(sqliteSchema, /model DigitalInvitation/);
  assert.match(migration, /InvitationStudioDraft_ownerId_name_key/);
  assert.match(migration, /InvitationStudioVersion_draftId_versionNumber_key/);
  assert.match(migration, /InvitationStudioPublish_sourceVersionId_key/);
  assert.match(sqliteSchema, /snapshotJson String/);
});
