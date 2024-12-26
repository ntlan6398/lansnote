/*
  Warnings:

  - You are about to drop the `_LessonToTerm` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `accountId` to the `Term` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_LessonToTerm" DROP CONSTRAINT "_LessonToTerm_A_fkey";

-- DropForeignKey
ALTER TABLE "_LessonToTerm" DROP CONSTRAINT "_LessonToTerm_B_fkey";

-- AlterTable
ALTER TABLE "Term" ADD COLUMN     "accountId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_LessonToTerm";

-- AddForeignKey
ALTER TABLE "Term" ADD CONSTRAINT "Term_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
