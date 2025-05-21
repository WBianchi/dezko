/*
  Warnings:

  - You are about to drop the column `type` on the `SpaceCommission` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `SpaceCommission` table. All the data in the column will be lost.
  - Added the required column `commissionValue` to the `SpaceCommission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SpaceCommission" DROP COLUMN "type",
DROP COLUMN "value",
ADD COLUMN     "commissionType" TEXT NOT NULL DEFAULT 'percentage',
ADD COLUMN     "commissionValue" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "ConfigSplit" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "commissionType" TEXT NOT NULL DEFAULT 'percentage',
    "commissionValue" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "enablePlanCommission" BOOLEAN NOT NULL DEFAULT false,
    "openPixEnabled" BOOLEAN NOT NULL DEFAULT true,
    "openPixWalletId" TEXT,
    "stripeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "stripeAccountId" TEXT,
    "stripeCommissionRate" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfigSplit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanCommission" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "commissionType" TEXT NOT NULL DEFAULT 'percentage',
    "commissionValue" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanCommission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfigSplit_type_key" ON "ConfigSplit"("type");

-- CreateIndex
CREATE UNIQUE INDEX "PlanCommission_planId_key" ON "PlanCommission"("planId");

-- AddForeignKey
ALTER TABLE "PlanCommission" ADD CONSTRAINT "PlanCommission_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plano"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
