import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as navigation from '../src/components/dashboard/nav-config';
import { createBlankStudioDocument } from '../src/lib/invitation-studio/sections';

test('studio navigation excludes non-SuperAdmin roles', () => {
  const nav = (navigation as any).getAdminNav;
  assert.equal(typeof nav, 'function');
  for (const role of [null, 'OPS', 'FINANCE']) assert.equal(nav(role).flatMap((g: any) => g.items).some((i: any) => i.href === '/admin/undangan-studio'), false);
  assert.equal(nav('SUPER_ADMIN').flatMap((g: any) => g.items).some((i: any) => i.href === '/admin/undangan-studio'), true);
});

test('save-before-review uses acknowledged token; failed save never submits review', async () => {
  const { saveAndSubmitStudioReview } = await import('../src/lib/invitation-studio/client-workflow');
  const doc = createBlankStudioDocument();
  const base = { id: 'draft', name: 'Test', status: 'DRAFT' as const, versionNumber: 1, document: doc, updatedAt: '2026-09-27T00:00:00Z' };
  let submitted = 0;
  const failed = await saveAndSubmitStudioReview(base, doc, async () => ({ success: false as const, errorCode: 'STUDIO_CONFLICT' as const, message: 'Conflict' }), async () => { submitted++; throw new Error('must not run'); });
  assert.equal(failed.success, false); assert.equal(submitted, 0);
  const result = await saveAndSubmitStudioReview(base, doc,
    async () => ({ success: true as const, data: { ...base, versionNumber: 2 } }),
    async token => { assert.equal(token.expectedVersion, 2); assert.equal(token.expectedStatus, 'DRAFT'); return { success: true as const, data: { ...base, versionNumber: 2, status: 'IN_REVIEW' as const } }; });
  assert.equal(result.success, true);
});

test('review failure retains the saved version for the next retry', async () => {
  const { saveAndSubmitStudioReview } = await import('../src/lib/invitation-studio/client-workflow');
  const document = createBlankStudioDocument();
  const base = { id: 'draft', name: document.metadata.name, status: 'DRAFT' as const, versionNumber: 1, document, updatedAt: '' };
  let acknowledged = base;
  const result = await saveAndSubmitStudioReview(base, document,
    async () => ({ success: true, data: { ...base, versionNumber: 2 } }),
    async () => ({ success: false, errorCode: 'STUDIO_CONFLICT', message: 'Conflict' }),
    state => { acknowledged = state as typeof base; });
  assert.equal(result.success, false);
  assert.equal(acknowledged.versionNumber, 2);
});
