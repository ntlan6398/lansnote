/*
  Warnings:

  - You are about to alter the column `onTrack` on the `Lesson` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `order` on the `Term` table. All the data in the column will be lost.
  - Added the required column `comments` to the `Lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `Lesson` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_subjectId_fkey";

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "comments" JSONB NOT NULL,
ADD COLUMN     "content" TEXT NOT NULL,
ALTER COLUMN "onTrack" SET DEFAULT 0,
ALTER COLUMN "onTrack" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Term" DROP COLUMN "order",
ADD COLUMN     "eFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
ADD COLUMN     "interval" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "repetition" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
