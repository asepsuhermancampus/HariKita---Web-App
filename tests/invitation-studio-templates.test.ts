import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SECTION_TEMPLATES,
  getTemplatesForSection,
  getTemplateCountBySection,
  searchTemplates,
  getTemplateById,
} from '../src/lib/invitation-studio/section-templates';
import { SECTION_SNIPPETS } from '../src/lib/invitation-studio/section-snippets';
import { createBlankStudioDocument } from '../src/lib/invitation-studio/sections';
import { editStudio } from '../src/lib/invitation-studio/editor';
import type { StudioNode, StudioSectionId } from '../src/lib/invitation-studio/types';

const ALL_SECTION_IDS: StudioSectionId[] = [
  'cover', 'hero', 'couple', 'events', 'countdown', 'story', 'gallery', 'map',
  'rsvp', 'guestbook', 'gifts', 'rundown', 'dress-code', 'entourage', 'quote-prayer', 'closing',
];

// Terapkan node persis seperti SectionTemplatePanel: satu edit 'add' per node.
function apply(section: StudioSectionId, nodes: Omit<StudioNode, 'id'>[]) {
  let d = createBlankStudioDocument();
  for (const n of nodes) {
    d = editStudio(d, { type: 'add', section, node: { ...n, id: crypto.randomUUID() } as StudioNode }).document;
  }
  return d;
}

test('setiap template section lolos validasi dokumen saat diterapkan', () => {
  for (const t of SECTION_TEMPLATES) {
    assert.doesNotThrow(() => apply(t.sectionId, t.nodes), `template ${t.id} ditolak validator`);
  }
});

test('id template unik', () => {
  const ids = SECTION_TEMPLATES.map(t => t.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('section cover menyediakan minimal 10 layout penuh', () => {
  assert.ok(getTemplatesForSection('cover').length >= 10);
});

test('setiap section punya minimal 3 template', () => {
  const counts = getTemplateCountBySection();
  for (const id of ALL_SECTION_IDS) {
    assert.ok((counts[id] ?? 0) >= 3, `section ${id} hanya punya ${counts[id] ?? 0} template`);
  }
});

test('setiap template punya minimal 1 node (tidak kosong)', () => {
  for (const t of SECTION_TEMPLATES) {
    assert.ok(t.nodes.length > 0, `template ${t.id} tidak punya node`);
  }
});

test('searchTemplates menemukan template berdasarkan nama & deskripsi', () => {
  assert.ok(searchTemplates('islami').length > 0);
  assert.ok(searchTemplates('polaroid').length > 0);
  assert.equal(searchTemplates('').length, SECTION_TEMPLATES.length);
  assert.equal(searchTemplates('zzz-tidak-ada').length, 0);
});

test('getTemplateById mengembalikan template yang benar', () => {
  assert.ok(getTemplateById('cover-romantic'));
  assert.equal(getTemplateById('tidak-ada'), undefined);
});

test('setiap snippet lolos validasi dokumen saat diterapkan ke cover', () => {
  for (const s of SECTION_SNIPPETS) {
    assert.doesNotThrow(() => apply('cover', [s.node]), `snippet ${s.id} ditolak validator`);
  }
});

test('id snippet unik', () => {
  const ids = SECTION_SNIPPETS.map(s => s.id);
  assert.equal(new Set(ids).size, ids.length);
});
