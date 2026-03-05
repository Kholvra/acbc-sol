/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `KycDocument` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[extractedNik]` on the table `KycDocument` will be added. If there are existing duplicate values, this will fail.
  - Made the column `extractedNik` on table `KycDocument` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "KycDocument_userId_idx";

-- AlterTable
ALTER TABLE "KycDocument" ALTER COLUMN "extractedNik" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "KycDocument_userId_key" ON "KycDocument"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "KycDocument_extractedNik_key" ON "KycDocument"("extractedNik");
