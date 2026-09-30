-- AlterTable
ALTER TABLE "DigitalInvitation" ADD COLUMN     "studioDraftId" TEXT;
ALTER TABLE "DigitalInvitation" ADD COLUMN     "studioVersionId" TEXT;

-- CreateIndex
CREATE INDEX "DigitalInvitation_studioDraftId_idx" ON "DigitalInvitation"("studioDraftId");
