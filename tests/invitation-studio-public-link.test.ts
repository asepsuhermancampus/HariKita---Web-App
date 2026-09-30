import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createTestDb, type TestDb } from './helpers/test-db';
import type { PrismaClient } from '@prisma/client';
import { resolvePublicInvitation } from '../src/server/queries/public-invitation';
import { StudioInvitationPage } from '../src/components/invitation/studio-public/StudioInvitationPage';
import { createBlankStudioDocument } from '../src/lib/invitation-studio/sections';

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
