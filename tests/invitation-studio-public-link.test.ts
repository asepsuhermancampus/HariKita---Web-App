import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestDb, type TestDb } from './helpers/test-db';
import type { PrismaClient } from '@prisma/client';

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
