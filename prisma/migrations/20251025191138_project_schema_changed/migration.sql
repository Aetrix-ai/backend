/*
  Warnings:

  - You are about to drop the column `demoImage` on the `Projects` table. All the data in the column will be lost.
  - You are about to drop the column `demoVideo` on the `Projects` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Projects" DROP COLUMN "demoImage",
DROP COLUMN "demoVideo",
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "videos" TEXT[];
