-- CreateTable
CREATE TABLE "WeddingTask" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stage" INTEGER NOT NULL DEFAULT 0,
    "taskText" TEXT NOT NULL,
    "pic" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'Sedang',
    "note" TEXT,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "doneAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "seedKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WeddingTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KuaRequirement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "docName" TEXT NOT NULL,
    "party" TEXT,
    "docFormat" TEXT,
    "institution" TEXT,
    "note" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "doneAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "seedKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "KuaRequirement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WeddingBudgetItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "pic" TEXT,
    "estimatedAmount" INTEGER NOT NULL DEFAULT 0,
    "paidAmount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'BELUM',
    "note" TEXT,
    "isExternal" BOOLEAN NOT NULL DEFAULT true,
    "linkMode" TEXT NOT NULL DEFAULT 'MANUAL',
    "linkedOrderItemId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WeddingBudgetItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BudgetPaymentProof" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "budgetItemId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "amount" INTEGER,
    "paidAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BudgetPaymentProof_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WeddingEmergencyItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemText" TEXT NOT NULL,
    "isPacked" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "seedKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WeddingEmergencyItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WeddingTask_userId_stage_sortOrder_idx" ON "WeddingTask"("userId", "stage", "sortOrder");
CREATE UNIQUE INDEX "WeddingTask_userId_seedKey_key" ON "WeddingTask"("userId", "seedKey");
CREATE INDEX "KuaRequirement_userId_category_sortOrder_idx" ON "KuaRequirement"("userId", "category", "sortOrder");
CREATE UNIQUE INDEX "KuaRequirement_userId_seedKey_key" ON "KuaRequirement"("userId", "seedKey");
CREATE INDEX "WeddingBudgetItem_userId_sortOrder_idx" ON "WeddingBudgetItem"("userId", "sortOrder");
CREATE INDEX "WeddingBudgetItem_linkedOrderItemId_idx" ON "WeddingBudgetItem"("linkedOrderItemId");
CREATE INDEX "BudgetPaymentProof_budgetItemId_createdAt_idx" ON "BudgetPaymentProof"("budgetItemId", "createdAt");
CREATE INDEX "WeddingEmergencyItem_userId_sortOrder_idx" ON "WeddingEmergencyItem"("userId", "sortOrder");
CREATE UNIQUE INDEX "WeddingEmergencyItem_userId_seedKey_key" ON "WeddingEmergencyItem"("userId", "seedKey");

ALTER TABLE "WeddingTask" ADD CONSTRAINT "WeddingTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KuaRequirement" ADD CONSTRAINT "KuaRequirement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WeddingBudgetItem" ADD CONSTRAINT "WeddingBudgetItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WeddingBudgetItem" ADD CONSTRAINT "WeddingBudgetItem_linkedOrderItemId_fkey" FOREIGN KEY ("linkedOrderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BudgetPaymentProof" ADD CONSTRAINT "BudgetPaymentProof_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BudgetPaymentProof" ADD CONSTRAINT "BudgetPaymentProof_budgetItemId_fkey" FOREIGN KEY ("budgetItemId") REFERENCES "WeddingBudgetItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WeddingEmergencyItem" ADD CONSTRAINT "WeddingEmergencyItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
