import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function applySchema() {
  console.log('🔧 Applying schema changes...\n');

  try {
    // Step 1: Update CourseType enum (one at a time)
    console.log('1. Updating CourseType enum...');
    const courseTypes = ['BS', 'ESA', 'DC', 'PC', 'PSI', 'AU'];
    for (const type of courseTypes) {
      try {
        await prisma.$executeRawUnsafe(`ALTER TYPE "CourseType" ADD VALUE IF NOT EXISTS '${type}'`);
      } catch (e) {
        // Ignore if already exists
      }
    }

    console.log('2. Updating Dept enum...');
    const depts = ['CO', 'EL', 'CH', 'PK', 'FT', 'AR', 'VL'];
    for (const dept of depts) {
      try {
        await prisma.$executeRawUnsafe(`ALTER TYPE "Dept" ADD VALUE IF NOT EXISTS '${dept}'`);
      } catch (e) {
        // Ignore if already exists
      }
    }

    // Step 2: Add new columns to Course (one at a time)
    console.log('3. Adding new columns to Course table...');
    try {
      await prisma.$executeRaw`ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "isTheory" BOOLEAN DEFAULT true`;
    } catch (e) {}
    try {
      await prisma.$executeRaw`ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "isPractical" BOOLEAN DEFAULT false`;
    } catch (e) {}
    try {
      await prisma.$executeRaw`ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "startYear" INTEGER`;
    } catch (e) {}
    try {
      await prisma.$executeRaw`ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "endYear" INTEGER`;
    } catch (e) {}

    // Step 3: Create CourseDepartment table
    console.log('4. Creating CourseDepartment table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "CourseDepartment" (
        "id" SERIAL PRIMARY KEY,
        "courseId" INTEGER NOT NULL,
        "dept" "Dept" NOT NULL,
        "semester" INTEGER NOT NULL,
        CONSTRAINT "CourseDepartment_courseId_fkey"
          FOREIGN KEY ("courseId")
          REFERENCES "Course"("id")
          ON DELETE CASCADE,
        CONSTRAINT "CourseDepartment_courseId_dept_key"
          UNIQUE ("courseId", "dept")
      );
    `;

    console.log('5. Creating indexes...');
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "CourseDepartment_dept_idx" ON "CourseDepartment"("dept");
      CREATE INDEX IF NOT EXISTS "CourseDepartment_semester_idx" ON "CourseDepartment"("semester");
    `;

    console.log('\n✅ Schema applied successfully!\n');

  } catch (error) {
    console.error('❌ Error applying schema:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

applySchema();
