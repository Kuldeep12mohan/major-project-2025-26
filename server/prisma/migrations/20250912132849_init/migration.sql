/*
  Warnings:

  - Added the required column `credits` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Course" ADD COLUMN     "credits" INTEGER NOT NULL;
