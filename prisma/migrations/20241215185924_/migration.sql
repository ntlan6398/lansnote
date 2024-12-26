/*
  Warnings:

  - You are about to drop the `Board` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Column` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Item` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Board" DROP CONSTRAINT "Board_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Column" DROP CONSTRAINT "Column_boardId_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_boardId_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_columnId_fkey";

-- DropTable
DROP TABLE "Board";

-- DropTable
DROP TABLE "Column";

-- DropTable
DROP TABLE "Item";

-- CreateTable
CREATE TABLE "List" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "List_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "List" ADD CONSTRAINT "List_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
