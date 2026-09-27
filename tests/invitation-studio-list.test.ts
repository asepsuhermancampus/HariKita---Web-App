import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StudioDraftList } from '../src/components/admin/invitation-studio/StudioDraftList';

test('studio list provides create and confirmed CRUD controls with saved timestamps', () => {
  const html = renderToStaticMarkup(createElement(StudioDraftList, { drafts: [{ id: 'draft', name: 'Contoh', status: 'DRAFT', versionNumber: 1, updatedAt: '2026-09-27T00:00:00.000Z' }] }));
  for (const label of ['Buat draft', 'Ganti nama', 'Duplikat', 'Arsipkan', 'Hapus', 'Terakhir disimpan']) assert.ok(html.includes(label), label);
  assert.ok(html.includes('/admin/undangan-studio/draft'));
  assert.ok(!html.includes('disabled=""'));
});
