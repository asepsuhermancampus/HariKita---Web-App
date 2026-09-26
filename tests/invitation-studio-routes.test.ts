import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = 'src/';

test('invitation studio routes and shell are SuperAdmin guarded and expose editor controls', () => {
  const index = readFileSync(`${root}app/admin/undangan-studio/page.tsx`, 'utf8');
  const editor = readFileSync(`${root}app/admin/undangan-studio/[draftId]/page.tsx`, 'utf8');
  const shell = readFileSync(`${root}components/admin/invitation-studio/StudioShell.tsx`, 'utf8');
  assert.match(index, /SUPER_ADMIN/);
  assert.match(editor, /SUPER_ADMIN/);
  for (const control of ['Simpan', 'Undo', 'Redo', 'Preview']) assert.match(shell, new RegExp(control));
  assert.match(shell, /overflow-x-hidden/);
});
