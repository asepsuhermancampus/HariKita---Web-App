import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createBlankStudioDocument, normalizeSectionOrder } from '../src/lib/invitation-studio/sections';
import { validateStudioDocument } from '../src/lib/invitation-studio/validation';
import { studioActionDependencies } from '../src/server/actions/invitation-studio-core';

const node = () => ({ id: 'title', kind: 'text', layer: 'content', visible: true, locked: false,
  transform: { x: 0, y: 0, width: 50, height: 20, rotation: 0, flipX: false, flipY: false },
  appearance: { opacity: 100, overflow: 'contained' }, animation: { preset: 'none', delayMs: 0, durationMs: 0 },
  accessibility: { label: 'Title' }, config: { text: 'Hello' } });

for (const [name, corrupt] of Object.entries<Record<string, (d: any) => void>[string]>({
  'duplicate IDs within a section': d => d.sections[0].nodes.push(node(), node()),
  'duplicate IDs across sections': d => { d.sections[0].nodes.push(node()); d.sections[1].nodes.push(node()); },
  'reversed mandatory boundaries': d => d.sectionOrder.reverse(),
  'missing optional sections': d => d.sections.splice(1, 14),
  'section type mismatch': d => d.sections[0].sectionType = 'hero',
  'invalid enabled flag': d => d.sections[1].enabled = 'yes',
  'invalid section overflow': d => d.sections[0].overflowPolicy = 'anything',
  'invalid desktop transform': d => d.sections[0].nodes.push({ ...node(), desktopTransform: { x: 99999 } }),
  'missing flip flag': d => { const n: any = node(); delete n.transform.flipX; d.sections[0].nodes.push(n); },
  'invalid visibility': d => d.sections[0].nodes.push({ ...node(), visible: 'yes' }),
  'missing animation numbers': d => d.sections[0].nodes.push({ ...node(), animation: { preset: 'float' } }),
  'nonfinite animation': d => d.sections[0].nodes.push({ ...node(), animation: { preset: 'float', durationMs: Infinity, delayMs: 0 } }),
  'missing opacity': d => d.sections[0].nodes.push({ ...node(), appearance: { overflow: 'visible' } }),
  'unknown component': d => d.sections[0].nodes.push({ ...node(), kind: 'component', config: { component: 'arbitrary' } }),
  'external URL in component': d => d.sections[0].nodes.push({ ...node(), kind: 'component', config: { component: 'rsvp', src: 'https://evil.test/a.svg' } }),
  'arbitrary HTML in text config': d => d.sections[0].nodes.push({ ...node(), config: { text: 'Hi', html: '<script />' } }),
  'asset kind mismatch': d => d.sections[0].nodes.push({ ...node(), kind: 'svg', config: { src: '/logo_cameo.png' } }),
  'overlong name': d => d.metadata.name = 'x'.repeat(101),
  'unknown root field': d => d.html = '<script />',
  'null section': d => d.sections[0] = null,
})) {
  test(`studio validator rejects ${name}`, () => {
    const d = createBlankStudioDocument(); corrupt(d);
    assert.equal(validateStudioDocument(d).success, false);
  });
}

test('normalization preserves authored order and supplies missing sections exactly once', () => {
  const order = normalizeSectionOrder(['closing', 'gallery', 'hero', 'gallery', 'cover', 'unknown']);
  assert.deepEqual(order.slice(0, 3), ['cover', 'gallery', 'hero']);
  assert.equal(order.at(-1), 'closing');
  assert.equal(new Set(order).size, 16);
  const d = createBlankStudioDocument(); d.sectionOrder = order;
  assert.equal(validateStudioDocument(d).success, true);
});

test('all core mutations deny OPS before database access', async () => {
  const actions = studioActionDependencies({ actor: async () => ({ userId: 'ops', name: 'Ops', subRole: 'OPS' }),
    db: new Proxy({} as any, { get() { throw new Error('unauthorized DB access'); } }), audit: async () => {} });
  for (const action of Object.values(actions)) {
    const result: any = await action({ slug: 'other', draftId: 'other', name: 'Test', expectedVersion: 1, expectedStatus: 'DRAFT', confirmation: 'Test', document: createBlankStudioDocument() });
    assert.equal(result.success, false);
    assert.equal(result.errorCode, 'UNAUTHORIZED_ADMIN_CAPABILITY');
  }
});

test('Next SWC accepts the actual server action entrypoint', async () => {
  const { transform } = await import('next/dist/build/swc');
  const result = await transform(readFileSync('src/server/actions/invitation-studio.ts', 'utf8'), {
    filename: 'invitation-studio.ts', jsc: { parser: { syntax: 'typescript' }, target: 'es2022' },
    serverActions: { isReactServerLayer: true, isDevelopment: true, useCacheEnabled: false, cacheKinds: [], hashSalt: 'studio-test' },
  } as any);
  assert.ok(result.code);
});
