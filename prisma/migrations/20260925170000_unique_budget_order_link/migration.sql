DROP INDEX IF EXISTS "WeddingBudgetItem_linkedOrderItemId_idx";
CREATE UNIQUE INDEX "WeddingBudgetItem_linkedOrderItemId_key"
ON "WeddingBudgetItem"("linkedOrderItemId");
