CREATE TABLE "InvitationStudioDraft" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "ownerId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "archivedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "InvitationStudioDraft_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "InvitationStudioVersion" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "draftId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "versionNumber" INTEGER NOT NULL,
  "schemaVersion" INTEGER NOT NULL,
  "documentJson" TEXT NOT NULL,
  "changeSummary" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InvitationStudioVersion_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "InvitationStudioDraft" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "InvitationStudioVersion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE "InvitationStudioPublish" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "draftId" TEXT NOT NULL,
  "sourceVersionId" TEXT NOT NULL,
  "publisherId" TEXT NOT NULL,
  "schemaVersion" INTEGER NOT NULL,
  "snapshotJson" TEXT NOT NULL,
  "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "unpublishedAt" DATETIME,
  CONSTRAINT "InvitationStudioPublish_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "InvitationStudioDraft" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "InvitationStudioPublish_sourceVersionId_fkey" FOREIGN KEY ("sourceVersionId") REFERENCES "InvitationStudioVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "InvitationStudioPublish_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "InvitationStudioDraft_ownerId_name_key" ON "InvitationStudioDraft"("ownerId", "name");
CREATE INDEX "InvitationStudioDraft_ownerId_status_updatedAt_idx" ON "InvitationStudioDraft"("ownerId", "status", "updatedAt");
CREATE UNIQUE INDEX "InvitationStudioVersion_draftId_versionNumber_key" ON "InvitationStudioVersion"("draftId", "versionNumber");
CREATE INDEX "InvitationStudioVersion_draftId_createdAt_idx" ON "InvitationStudioVersion"("draftId", "createdAt");
CREATE UNIQUE INDEX "InvitationStudioPublish_sourceVersionId_key" ON "InvitationStudioPublish"("sourceVersionId");
CREATE INDEX "InvitationStudioPublish_draftId_publishedAt_idx" ON "InvitationStudioPublish"("draftId", "publishedAt");
