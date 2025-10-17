/*
  Warnings:

  - The primary key for the `AdminProfile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `AdminProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Course` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Course` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Registration` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Registration` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `StudentProfile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `StudentProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `TeacherProfile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `TeacherProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `TempRegistration` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `TempRegistration` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `verifierId` column on the `TempRegistration` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `adminId` column on the `TempRegistration` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `_TeacherCourses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `userId` on the `AdminProfile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `studentId` on the `Registration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `courseId` on the `Registration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `StudentProfile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `TeacherProfile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `studentId` on the `TempRegistration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `courseId` on the `TempRegistration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `A` on the `_TeacherCourses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `B` on the `_TeacherCourses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."AdminProfile" DROP CONSTRAINT "AdminProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Registration" DROP CONSTRAINT "Registration_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Registration" DROP CONSTRAINT "Registration_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StudentProfile" DROP CONSTRAINT "StudentProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeacherProfile" DROP CONSTRAINT "TeacherProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TempRegistration" DROP CONSTRAINT "TempRegistration_adminId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TempRegistration" DROP CONSTRAINT "TempRegistration_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TempRegistration" DROP CONSTRAINT "TempRegistration_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TempRegistration" DROP CONSTRAINT "TempRegistration_verifierId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_TeacherCourses" DROP CONSTRAINT "_TeacherCourses_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_TeacherCourses" DROP CONSTRAINT "_TeacherCourses_B_fkey";

-- AlterTable
ALTER TABLE "public"."AdminProfile" DROP CONSTRAINT "AdminProfile_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "AdminProfile_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Course" DROP CONSTRAINT "Course_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Course_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Registration" DROP CONSTRAINT "Registration_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "studentId",
ADD COLUMN     "studentId" INTEGER NOT NULL,
DROP COLUMN "courseId",
ADD COLUMN     "courseId" INTEGER NOT NULL,
ADD CONSTRAINT "Registration_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."StudentProfile" DROP CONSTRAINT "StudentProfile_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."TeacherProfile" DROP CONSTRAINT "TeacherProfile_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "TeacherProfile_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."TempRegistration" DROP CONSTRAINT "TempRegistration_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "studentId",
ADD COLUMN     "studentId" INTEGER NOT NULL,
DROP COLUMN "courseId",
ADD COLUMN     "courseId" INTEGER NOT NULL,
DROP COLUMN "verifierId",
ADD COLUMN     "verifierId" INTEGER,
DROP COLUMN "adminId",
ADD COLUMN     "adminId" INTEGER,
ADD CONSTRAINT "TempRegistration_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."_TeacherCourses" DROP CONSTRAINT "_TeacherCourses_AB_pkey",
DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL,
DROP COLUMN "B",
ADD COLUMN     "B" INTEGER NOT NULL,
ADD CONSTRAINT "_TeacherCourses_AB_pkey" PRIMARY KEY ("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "AdminProfile_userId_key" ON "public"."AdminProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "public"."StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_userId_key" ON "public"."TeacherProfile"("userId");

-- CreateIndex
CREATE INDEX "_TeacherCourses_B_index" ON "public"."_TeacherCourses"("B");

-- AddForeignKey
ALTER TABLE "public"."StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherProfile" ADD CONSTRAINT "TeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminProfile" ADD CONSTRAINT "AdminProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TempRegistration" ADD CONSTRAINT "TempRegistration_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TempRegistration" ADD CONSTRAINT "TempRegistration_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TempRegistration" ADD CONSTRAINT "TempRegistration_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "public"."TeacherProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TempRegistration" ADD CONSTRAINT "TempRegistration_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."AdminProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Registration" ADD CONSTRAINT "Registration_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Registration" ADD CONSTRAINT "Registration_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TeacherCourses" ADD CONSTRAINT "_TeacherCourses_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TeacherCourses" ADD CONSTRAINT "_TeacherCourses_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
