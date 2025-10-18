/*
  Warnings:

  - You are about to drop the column `position` on the `AdminProfile` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Mode" AS ENUM ('A', 'B', 'C');

-- AlterTable
ALTER TABLE "AdminProfile" DROP COLUMN "position";

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "mode" "Mode" NOT NULL DEFAULT 'A';

-- AlterTable
ALTER TABLE "TempRegistration" ADD COLUMN     "mode" "Mode" NOT NULL DEFAULT 'A';
