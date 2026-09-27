import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createBlankStudioDocument } from '../src/lib/invitation-studio/sections';
import { StudioPreviewContent } from '../src/components/admin/invitation-studio/StudioPreview';
import { sandboxReply } from '../src/components/admin/invitation-studio/studio-fixtures';

test('sandbox composes all sixteen sections in authored order for each viewport', () => {
  const d = createBlankStudioDocument(); d.sections.forEach(s => s.enabled = true);
  [d.sectionOrder[1], d.sectionOrder[6]] = [d.sectionOrder[6], d.sectionOrder[1]];
  for (const width of [375, 768, 1024] as const) {
    const html = renderToStaticMarkup(React.createElement(StudioPreviewContent, { document: d, width }));
    const ids = [...html.matchAll(/data-studio-section="([^"]+)"/g)].map(m => m[1]);
    assert.deepEqual(ids, d.sectionOrder);
    assert.ok(html.includes('Pasangan Contoh'));
    assert.ok(html.includes(`data-preview-width="${width}"`));
    assert.ok(!html.includes('https://'));
  }
  d.sections.find(s => s.id === 'gallery')!.enabled = false;
  const html = renderToStaticMarkup(React.createElement(StudioPreviewContent, { document: d, width: 375 }));
  assert.ok(!html.includes('data-studio-section="gallery"'));
  assert.ok(html.includes('data-studio-section="cover"'));
  assert.ok(html.includes('data-studio-section="closing"'));
});
test('sandbox replies validate local input without any production identifiers', () => {
  assert.equal(sandboxReply('rsvp', '', 'hadir').success, false);
  const result = sandboxReply('rsvp', 'Tamu Contoh', 'hadir');
  assert.equal(result.success, true);
  assert.match(result.message, /simulasi/i);
  assert.equal(sandboxReply('guestbook', 'Tamu', '').success, false);
});
