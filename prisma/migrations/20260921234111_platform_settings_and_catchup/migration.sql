-- AlterTable
ALTER TABLE "DigitalInvitation" ADD COLUMN     "backsoundTrackId" TEXT,
ADD COLUMN     "sfxPaletteId" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "snapshotDpPct" INTEGER,
ADD COLUMN     "snapshotPlatformFeePct" INTEGER,
ADD COLUMN     "snapshotSettlementPct" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adminRole" TEXT;

-- AlterTable
ALTER TABLE "VendorProfile" ADD COLUMN     "recruitedById" TEXT;

-- CreateTable
CREATE TABLE "BrandAmbassador" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT NOT NULL DEFAULT 'Kebumen',
    "district" TEXT,
    "commissionPct" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "walletBalance" INTEGER NOT NULL DEFAULT 0,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "bankHolder" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandAmbassador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmbassadorCommission" (
    "id" TEXT NOT NULL,
    "ambassadorId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "baseAmount" INTEGER NOT NULL,
    "commissionPct" DOUBLE PRECISION NOT NULL,
    "commissionAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREDITED',
    "ledgerJournalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AmbassadorCommission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmbassadorWithdrawal" (
    "id" TEXT NOT NULL,
    "ambassadorId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "bankName" TEXT,
    "bankAccount" TEXT,
    "bankHolder" TEXT,
    "processedAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AmbassadorWithdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "purpose" TEXT NOT NULL DEFAULT 'REGISTER',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lockedUntil" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PinChangeLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PinChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "capability" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformSetting" (
    "id" TEXT NOT NULL,
    "dpPct" INTEGER NOT NULL DEFAULT 30,
    "settlementPct" INTEGER NOT NULL DEFAULT 70,
    "platformFeePct" INTEGER NOT NULL DEFAULT 10,
    "defaultBaCommissionPct" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedById" TEXT,
    "updatedByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformFeeComponent" (
    "id" TEXT NOT NULL,
    "settingId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "pct" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformFeeComponent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BrandAmbassador_userId_key" ON "BrandAmbassador"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BrandAmbassador_referralCode_key" ON "BrandAmbassador"("referralCode");

-- CreateIndex
CREATE INDEX "AmbassadorCommission_ambassadorId_createdAt_idx" ON "AmbassadorCommission"("ambassadorId", "createdAt");

-- CreateIndex
CREATE INDEX "AmbassadorCommission_vendorId_idx" ON "AmbassadorCommission"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "AmbassadorCommission_orderItemId_key" ON "AmbassadorCommission"("orderItemId");

-- CreateIndex
CREATE INDEX "AmbassadorWithdrawal_ambassadorId_status_idx" ON "AmbassadorWithdrawal"("ambassadorId", "status");

-- CreateIndex
CREATE INDEX "OtpCode_email_purpose_status_idx" ON "OtpCode"("email", "purpose", "status");

-- CreateIndex
CREATE INDEX "OtpCode_email_createdAt_idx" ON "OtpCode"("email", "createdAt");

-- CreateIndex
CREATE INDEX "PinChangeLog_userId_changedAt_idx" ON "PinChangeLog"("userId", "changedAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_actorId_createdAt_idx" ON "AdminAuditLog"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_targetType_targetId_idx" ON "AdminAuditLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_action_createdAt_idx" ON "AdminAuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "PlatformFeeComponent_settingId_sortOrder_idx" ON "PlatformFeeComponent"("settingId", "sortOrder");

-- AddForeignKey
ALTER TABLE "VendorProfile" ADD CONSTRAINT "VendorProfile_recruitedById_fkey" FOREIGN KEY ("recruitedById") REFERENCES "BrandAmbassador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandAmbassador" ADD CONSTRAINT "BrandAmbassador_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmbassadorCommission" ADD CONSTRAINT "AmbassadorCommission_ambassadorId_fkey" FOREIGN KEY ("ambassadorId") REFERENCES "BrandAmbassador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmbassadorCommission" ADD CONSTRAINT "AmbassadorCommission_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmbassadorCommission" ADD CONSTRAINT "AmbassadorCommission_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmbassadorCommission" ADD CONSTRAINT "AmbassadorCommission_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmbassadorWithdrawal" ADD CONSTRAINT "AmbassadorWithdrawal_ambassadorId_fkey" FOREIGN KEY ("ambassadorId") REFERENCES "BrandAmbassador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PinChangeLog" ADD CONSTRAINT "PinChangeLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformFeeComponent" ADD CONSTRAINT "PlatformFeeComponent_settingId_fkey" FOREIGN KEY ("settingId") REFERENCES "PlatformSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

