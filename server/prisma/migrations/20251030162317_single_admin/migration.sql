/*
  Warnings:

  - You are about to drop the column `updatedBy` on the `RegistrationStatus` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."RegistrationStatus" DROP CONSTRAINT "RegistrationStatus_updatedBy_fkey";

-- AlterTable
ALTER TABLE "RegistrationStatus" DROP COLUMN "updatedBy";
