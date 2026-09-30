import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createTestDb } from './helpers/test-db';
import {
  resolvePublicInvitation,
  shouldRenderStudio,
} from '../src/server/queries/public-invitation';
import { createBlankStudioDocument } from '../src/lib/invitation-studio/sections';

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

test('public invitation page branches to the studio renderer when a snapshot exists', () => {
  const page = readFileSync('src/app/undangan/[slug]/page.tsx', 'utf8');
  assert.match(page, /resolvePublicInvitation/);
  assert.match(page, /StudioInvitationPage/);
  assert.match(page, /studioSnapshot/);
});

test('branch predicate: unknown slug falls through to the theme path (no snapshot)', async () => {
  const ctx = await createTestDb();
  try {
    // resolvePublicInvitation returns null for an unknown slug...
    const resolved = await resolvePublicInvitation(`ghost-${Date.now()}`, { db: ctx.prisma });
    assert.equal(resolved, null);
    // ...and the page-level predicate must therefore NOT pick the studio renderer.
    assert.equal(shouldRenderStudio(resolved), false);
  } finally {
    await ctx.cleanup();
  }
});

test('branch predicate: invitation without a linked studio draft uses the theme path', async () => {
  const ctx = await createTestDb();
  try {
    const slug = `theme-${Date.now()}`;
    await ctx.prisma.digitalInvitation.create({
      data: { slug, themeId: 'autumnelle', title: 'T', brideName: 'A', groomName: 'B',
        eventDate: new Date('2026-11-20T09:00:00Z'), venueName: 'V', venueAddress: 'X' },
    });
    const resolved = await resolvePublicInvitation(slug, { db: ctx.prisma });
    assert.ok(resolved);
    assert.equal(resolved!.studioSnapshot, null);
    assert.equal(shouldRenderStudio(resolved), false);
  } finally {
    await ctx.cleanup();
  }
});

test('branch predicate: linked but un-published draft uses the theme path', async () => {
  const ctx = await createTestDb();
  try {
    const now = Date.now();
    const owner = await ctx.prisma.user.create({
      data: { name: 'Admin', phone: `0874${String(now).slice(-8)}`, role: 'ADMIN', adminRole: 'SUPER_ADMIN' },
    });
    const draft = await ctx.prisma.invitationStudioDraft.create({
      data: { ownerId: owner.id, name: `Unpublished ${now}`, status: 'DRAFT' },
    });
    const doc = createBlankStudioDocument();
    await ctx.prisma.invitationStudioVersion.create({
      data: { draftId: draft.id, authorId: owner.id, versionNumber: 1, schemaVersion: 1, documentJson: JSON.stringify(doc) },
    });
    const slug = `unpub-${now}`;
    await ctx.prisma.digitalInvitation.create({
      data: { slug, themeId: 'autumnelle', title: 'T', brideName: 'A', groomName: 'B',
        eventDate: new Date('2026-11-20T09:00:00Z'), venueName: 'V', venueAddress: 'X',
        studioDraftId: draft.id },
    });
    const resolved = await resolvePublicInvitation(slug, { db: ctx.prisma });
    assert.ok(resolved);
    assert.equal(resolved!.studioSnapshot, null);
    assert.equal(shouldRenderStudio(resolved), false);
  } finally {
    await ctx.cleanup();
  }
});

test('branch predicate: published snapshot selects the studio renderer', async () => {
  const ctx = await createTestDb();
  try {
    const now = Date.now();
    const owner = await ctx.prisma.user.create({
      data: { name: 'Admin', phone: `0873${String(now).slice(-8)}`, role: 'ADMIN', adminRole: 'SUPER_ADMIN' },
    });
    const draft = await ctx.prisma.invitationStudioDraft.create({
      data: { ownerId: owner.id, name: `Published ${now}`, status: 'PUBLISHED' },
    });
    const doc = createBlankStudioDocument();
    const version = await ctx.prisma.invitationStudioVersion.create({
      data: { draftId: draft.id, authorId: owner.id, versionNumber: 1, schemaVersion: 1, documentJson: JSON.stringify(doc) },
    });
    await ctx.prisma.invitationStudioPublish.create({
      data: { draftId: draft.id, sourceVersionId: version.id, publisherId: owner.id, schemaVersion: 1, snapshotJson: JSON.stringify(doc) },
    });
    const slug = `pub-${now}`;
    await ctx.prisma.digitalInvitation.create({
      data: { slug, themeId: 'autumnelle', title: 'T', brideName: 'A', groomName: 'B',
        eventDate: new Date('2026-11-20T09:00:00Z'), venueName: 'V', venueAddress: 'X',
        studioDraftId: draft.id },
    });
    const resolved = await resolvePublicInvitation(slug, { db: ctx.prisma });
    assert.ok(resolved);
    assert.ok(resolved!.studioSnapshot);
    assert.equal(shouldRenderStudio(resolved), true);
  } finally {
    await ctx.cleanup();
  }
});
