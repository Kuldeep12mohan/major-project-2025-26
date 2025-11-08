/*
  Warnings:

  - Changed the type of `dept` on the `Course` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `dept` on the `StudentProfile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `dept` on the `TeacherProfile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Dept" AS ENUM ('CS', 'ECE', 'AI', 'EE', 'ME', 'AE', 'CE', 'CHE', 'PTK', 'FTB');

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "dept",
ADD COLUMN     "dept" "Dept" NOT NULL;

-- AlterTable
ALTER TABLE "StudentProfile" DROP COLUMN "dept",
ADD COLUMN     "dept" "Dept" NOT NULL;

-- AlterTable
ALTER TABLE "TeacherProfile" DROP COLUMN "dept",
ADD COLUMN     "dept" "Dept" NOT NULL;
