import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createTestDb, type TestDb } from './helpers/test-db';
import type { PrismaClient } from '@prisma/client';
import { resolvePublicInvitation } from '../src/server/queries/public-invitation';
import { StudioInvitationPage } from '../src/components/invitation/studio-public/StudioInvitationPage';
import { createBlankStudioDocument } from '../src/lib/invitation-studio/sections';
import { linkStudioDraftToInvitation } from '../src/server/actions/invitation-studio-core';
import { DomainError } from '../src/server/services/errors';

let ctx: TestDb;
let prisma: PrismaClient;

test('DigitalInvitation accepts nullable studio link columns', async () => {
  ctx = await createTestDb();
  prisma = ctx.prisma;
  try {
    const inv = await prisma.digitalInvitation.create({
      data: {
        slug: `link-${Date.now()}`,
        themeId: 'autumnelle',
        title: 'Test',
        brideName: 'A',
        groomName: 'B',
        eventDate: new Date('2026-11-20T09:00:00Z'),
        venueName: 'V',
        venueAddress: 'X',
        studioDraftId: 'draft-123',
      },
    });
    assert.equal(inv.studioDraftId, 'draft-123');
    assert.equal(inv.studioVersionId, null);
  } finally {
    await ctx.cleanup();
  }
});

test('resolvePublicInvitation returns null for unknown slug', async () => {
  const ctx2 = await createTestDb();
  try {
    const res = await resolvePublicInvitation('does-not-exist', { db: ctx2.prisma });
    assert.equal(res, null);
  } finally {
    await ctx2.cleanup();
  }
});

test('resolvePublicInvitation returns studioSnapshot null when no active publish', async () => {
  const ctx3 = await createTestDb();
  try {
    const slug = `plain-${Date.now()}`;
    await ctx3.prisma.digitalInvitation.create({
      data: { slug, themeId: 'autumnelle', title: 'T', brideName: 'A', groomName: 'B',
        eventDate: new Date('2026-11-20T09:00:00Z'), venueName: 'V', venueAddress: 'X',
        studioDraftId: 'draft-x' },
    });
    const res = await resolvePublicInvitation(slug, { db: ctx3.prisma });
    assert.ok(res);
    assert.equal(res!.studioSnapshot, null);
  } finally {
    await ctx3.cleanup();
  }
});

test('StudioInvitationPage renders the canvas background from the document', () => {
  const doc = createBlankStudioDocument();
  doc.sections[0].enabled = true;
  doc.background = { kind: 'gradient', from: '#FFFFFF', to: '#F3EDE6', angle: 135 };
  const html = renderToStaticMarkup(
    React.createElement(StudioInvitationPage, { document: doc, guestName: 'Tamu Uji' }),
  );
  assert.match(html, /linear-gradient\(135deg/);
  assert.match(html, /Tamu Uji/);
});

test('linkStudioDraftToInvitation sets studioDraftId on the matching slug', async () => {
  const ctx4 = await createTestDb();
  try {
    const slug = `linkable-${Date.now()}`;
    await ctx4.prisma.digitalInvitation.create({
      data: { slug, themeId: 'autumnelle', title: 'T', brideName: 'A', groomName: 'B',
        eventDate: new Date('2026-11-20T09:00:00Z'), venueName: 'V', venueAddress: 'X' },
    });
    // Pure helper takes a db; no session/audit needed for the domain rule.
    await linkStudioDraftToInvitation({ slug, draftId: 'draft-abc' }, { db: ctx4.prisma });
    const after = await ctx4.prisma.digitalInvitation.findUnique({ where: { slug } });
    assert.equal(after?.studioDraftId, 'draft-abc');
  } finally {
    await ctx4.cleanup();
  }
});

test('linked + published draft resolves to a validated studio snapshot', async () => {
  const ctx5 = await createTestDb();
  try {
    const now = Date.now();
    const owner = await ctx5.prisma.user.create({
      data: { name: 'Admin', phone: `0877${String(now).slice(-8)}`, role: 'ADMIN', adminRole: 'SUPER_ADMIN' },
    });
    const draft = await ctx5.prisma.invitationStudioDraft.create({
      data: { ownerId: owner.id, name: `Draft ${now}`, status: 'PUBLISHED' },
    });
    const doc = createBlankStudioDocument();
    doc.background = { kind: 'solid', color: '#4A2E35' };
    const version = await ctx5.prisma.invitationStudioVersion.create({
      data: { draftId: draft.id, authorId: owner.id, versionNumber: 1, schemaVersion: 1, documentJson: JSON.stringify(doc) },
    });
    await ctx5.prisma.invitationStudioPublish.create({
      data: { draftId: draft.id, sourceVersionId: version.id, publisherId: owner.id, schemaVersion: 1, snapshotJson: JSON.stringify(doc) },
    });

    const slug = `full-${now}`;
    await ctx5.prisma.digitalInvitation.create({
      data: { slug, themeId: 'autumnelle', title: 'T', brideName: 'A', groomName: 'B',
        eventDate: new Date('2026-11-20T09:00:00Z'), venueName: 'V', venueAddress: 'X' },
    });
    await linkStudioDraftToInvitation({ slug, draftId: draft.id }, { db: ctx5.prisma });

    const res = await resolvePublicInvitation(slug, { db: ctx5.prisma });
    assert.ok(res?.studioSnapshot);
    assert.deepEqual(res!.studioSnapshot!.background, { kind: 'solid', color: '#4A2E35' });
  } finally {
    await ctx5.cleanup();
  }
});

test('resolvePublicInvitation returns studioSnapshot null for an invalid snapshot (never throws)', async () => {
  const ctx6 = await createTestDb();
  try {
    const now = Date.now();
    const owner = await ctx6.prisma.user.create({
      data: { name: 'Admin', phone: `0876${String(now).slice(-8)}`, role: 'ADMIN', adminRole: 'SUPER_ADMIN' },
    });
    const draft = await ctx6.prisma.invitationStudioDraft.create({
      data: { ownerId: owner.id, name: `BadDraft ${now}`, status: 'PUBLISHED' },
    });
    const doc = createBlankStudioDocument();
    const version = await ctx6.prisma.invitationStudioVersion.create({
      data: { draftId: draft.id, authorId: owner.id, versionNumber: 1, schemaVersion: 1, documentJson: JSON.stringify(doc) },
    });
    // Valid active publish row, but snapshotJson is not a valid studio document.
    await ctx6.prisma.invitationStudioPublish.create({
      data: { draftId: draft.id, sourceVersionId: version.id, publisherId: owner.id, schemaVersion: 1,
        snapshotJson: '{"not":"a valid studio document"}' },
    });
    const slug = `bad-${now}`;
    await ctx6.prisma.digitalInvitation.create({
      data: { slug, themeId: 'autumnelle', title: 'T', brideName: 'A', groomName: 'B',
        eventDate: new Date('2026-11-20T09:00:00Z'), venueName: 'V', venueAddress: 'X' },
    });
    await linkStudioDraftToInvitation({ slug, draftId: draft.id }, { db: ctx6.prisma });

    const res = await resolvePublicInvitation(slug, { db: ctx6.prisma });
    assert.ok(res);
    assert.equal(res!.studioSnapshot, null);
  } finally {
    await ctx6.cleanup();
  }
});

test('resolvePublicInvitation returns studioSnapshot null when snapshotJson fails JSON.parse (never throws)', async () => {
  const ctx7 = await createTestDb();
  try {
    const now = Date.now();
    const owner = await ctx7.prisma.user.create({
      data: { name: 'Admin', phone: `0875${String(now).slice(-8)}`, role: 'ADMIN', adminRole: 'SUPER_ADMIN' },
    });
    const draft = await ctx7.prisma.invitationStudioDraft.create({
      data: { ownerId: owner.id, name: `BadJson ${now}`, status: 'PUBLISHED' },
    });
    const doc = createBlankStudioDocument();
    const version = await ctx7.prisma.invitationStudioVersion.create({
      data: { draftId: draft.id, authorId: owner.id, versionNumber: 1, schemaVersion: 1, documentJson: JSON.stringify(doc) },
    });
    await ctx7.prisma.invitationStudioPublish.create({
      data: { draftId: draft.id, sourceVersionId: version.id, publisherId: owner.id, schemaVersion: 1,
        snapshotJson: '{bad json' },
    });
    const slug = `badjson-${now}`;
    await ctx7.prisma.digitalInvitation.create({
      data: { slug, themeId: 'autumnelle', title: 'T', brideName: 'A', groomName: 'B',
        eventDate: new Date('2026-11-20T09:00:00Z'), venueName: 'V', venueAddress: 'X' },
    });
    await linkStudioDraftToInvitation({ slug, draftId: draft.id }, { db: ctx7.prisma });

    const res = await resolvePublicInvitation(slug, { db: ctx7.prisma });
    assert.ok(res);
    assert.equal(res!.studioSnapshot, null);
  } finally {
    await ctx7.cleanup();
  }
});

test('linkStudioDraftToInvitation rejects when the slug does not exist', async () => {
  const ctx8 = await createTestDb();
  try {
    await assert.rejects(
      linkStudioDraftToInvitation({ slug: `does-not-exist-${Date.now()}`, draftId: 'x' }, { db: ctx8.prisma }),
      (error: unknown) => {
        assert.ok(error instanceof DomainError, 'expected a DomainError');
        assert.equal((error as DomainError).code, 'STUDIO_NOT_FOUND');
        return true;
      },
    );
  } finally {
    await ctx8.cleanup();
  }
});

test('resolvePublicInvitation reuses a caller-supplied invitation instead of re-reading by slug', async () => {
  const ctx9 = await createTestDb();
  try {
    const now = Date.now();
    const owner = await ctx9.prisma.user.create({
      data: { name: 'Admin', phone: `0874${String(now).slice(-8)}`, role: 'ADMIN', adminRole: 'SUPER_ADMIN' },
    });
    const draft = await ctx9.prisma.invitationStudioDraft.create({
      data: { ownerId: owner.id, name: `Shared ${now}`, status: 'PUBLISHED' },
    });
    const doc = createBlankStudioDocument();
    doc.background = { kind: 'solid', color: '#4A2E35' };
    const version = await ctx9.prisma.invitationStudioVersion.create({
      data: { draftId: draft.id, authorId: owner.id, versionNumber: 1, schemaVersion: 1, documentJson: JSON.stringify(doc) },
    });
    await ctx9.prisma.invitationStudioPublish.create({
      data: { draftId: draft.id, sourceVersionId: version.id, publisherId: owner.id, schemaVersion: 1, snapshotJson: JSON.stringify(doc) },
    });
    const slug = `shared-${now}`;
    await ctx9.prisma.digitalInvitation.create({
      data: { slug, themeId: 'autumnelle', title: 'T', brideName: 'A', groomName: 'B',
        eventDate: new Date('2026-11-20T09:00:00Z'), venueName: 'V', venueAddress: 'X', studioDraftId: draft.id },
    });

    // Pass a slug that does NOT exist in the DB plus the real pre-fetched row.
    // If the resolver honoured the supplied invitation (no second read), it resolves;
    // if it re-read by slug, the lookup would miss and return null.
    const row = await ctx9.prisma.digitalInvitation.findUnique({ where: { slug } });
    const res = await resolvePublicInvitation(`nope-${now}`, { db: ctx9.prisma, invitation: row });
    assert.ok(res, 'resolver should use the supplied invitation');
    assert.ok(res!.studioSnapshot);
  } finally {
    await ctx9.cleanup();
  }
});

test('resolvePublicInvitation falls back to null for an oversized snapshot payload', async () => {
  const ctx10 = await createTestDb();
  try {
    const now = Date.now();
    const owner = await ctx10.prisma.user.create({
      data: { name: 'Admin', phone: `0873${String(now).slice(-8)}`, role: 'ADMIN', adminRole: 'SUPER_ADMIN' },
    });
    const draft = await ctx10.prisma.invitationStudioDraft.create({
      data: { ownerId: owner.id, name: `Huge ${now}`, status: 'PUBLISHED' },
    });
    const doc = createBlankStudioDocument();
    const version = await ctx10.prisma.invitationStudioVersion.create({
      data: { draftId: draft.id, authorId: owner.id, versionNumber: 1, schemaVersion: 1, documentJson: JSON.stringify(doc) },
    });
    // > STUDIO_LIMITS.bytes (512_000) — must be rejected BEFORE JSON.parse.
    await ctx10.prisma.invitationStudioPublish.create({
      data: { draftId: draft.id, sourceVersionId: version.id, publisherId: owner.id, schemaVersion: 1,
        snapshotJson: 'x'.repeat(512_001) },
    });
    const slug = `huge-${now}`;
    await ctx10.prisma.digitalInvitation.create({
      data: { slug, themeId: 'autumnelle', title: 'T', brideName: 'A', groomName: 'B',
        eventDate: new Date('2026-11-20T09:00:00Z'), venueName: 'V', venueAddress: 'X' },
    });
    await linkStudioDraftToInvitation({ slug, draftId: draft.id }, { db: ctx10.prisma });

    const res = await resolvePublicInvitation(slug, { db: ctx10.prisma });
    assert.ok(res);
    assert.equal(res!.studioSnapshot, null);
  } finally {
    await ctx10.cleanup();
  }
});
