/*
  Warnings:

  - You are about to drop the column `status` on the `Term` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Term" DROP COLUMN "status",
ADD COLUMN     "audio" TEXT;
