/*
  Warnings:

  - Made the column `lastReview` on table `Term` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nextReview` on table `Term` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Term" ALTER COLUMN "lastReview" SET NOT NULL,
ALTER COLUMN "lastReview" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "nextReview" SET NOT NULL,
ALTER COLUMN "nextReview" SET DEFAULT CURRENT_TIMESTAMP;
