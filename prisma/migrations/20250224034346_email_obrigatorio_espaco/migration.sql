/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Espaco` will be added. If there are existing duplicate values, this will fail.
  - Made the column `email` on table `Espaco` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Espaco" ALTER COLUMN "email" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Espaco_email_key" ON "Espaco"("email");
