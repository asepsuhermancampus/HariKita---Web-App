-- AlterTable
ALTER TABLE "VendorProfile" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "VendorProfile_slug_key" ON "VendorProfile"("slug");


