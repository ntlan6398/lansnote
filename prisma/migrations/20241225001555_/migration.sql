/*
  Warnings:

  - You are about to drop the column `eFactor` on the `Term` table. All the data in the column will be lost.
  - Added the required column `listId` to the `Term` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Term" DROP COLUMN "eFactor",
ADD COLUMN     "efactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
ADD COLUMN     "listId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Term" ADD CONSTRAINT "Term_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
