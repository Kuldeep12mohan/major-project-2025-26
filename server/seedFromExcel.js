import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";

const prisma = new PrismaClient();

// Category mapping from Excel to Database
const CATEGORY_MAP = {
  'DE': 'DE',   // Departmental Elective
  'BS': 'BS',   // Basic Science
  'OE': 'OE',   // Open Elective
  'ESA': 'ESA', // Engineering Science & Applications
  'DC': 'DC',   // Departmental Core
  'PC': 'PC',   // Professional Core
  'PSI': 'PSI', // Professional Skill/Internship
  'AU': 'AU',   // Audit
  'HM': 'HM'    // Humanities & Management
};

// Department mapping from Excel Br_Code to Database
const DEPT_MAP = {
  'AEBEA': 'AE',
  'AIBEA': 'AI',
  'ARBEA': 'AR',
  'CEBEA': 'CE',
  'CHBEA': 'CH',
  'COBEA': 'CO',
  'EEBEA': 'EE',
  'ELBEA': 'EL',
  'FTBEA': 'FT',
  'MEBEA': 'ME',
  'PKBEA': 'PK'
};

async function seedFromExcel() {
  console.log('📦 Starting Excel import...\n');

  // Read Excel file
  const wb = XLSX.readFile('./data/Course_File.xlsx');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws);

  console.log(`Found ${data.length} course-department mappings in Excel\n`);

  // Group by course code to handle many-to-many relationship
  const courseMap = new Map();

  data.forEach(row => {
    const code = (row.CrsN || '').trim();
    if (!code) return;

    const dept = DEPT_MAP[row.Br_Code];
    if (!dept) {
      console.warn(`⚠️  Unknown Br_Code: ${row.Br_Code}`);
      return;
    }

    if (!courseMap.has(code)) {
      courseMap.set(code, {
        code: code,
        title: row.Title,
        type: CATEGORY_MAP[row.Categ] || 'DC',
        credits: Math.round(Number(row.Credits) || 3),
        isTheory: row['T/P'] === 'T',
        isPractical: row['T/P'] === 'P',
        startYear: row.St_Yr,
        endYear: row.Fn_Yr,
        departments: []
      });
    }

    // Add department-semester mapping
    courseMap.get(code).departments.push({
      dept: dept,
      semester: row.Sem
    });
  });

  console.log(`Grouped into ${courseMap.size} unique courses\n`);

  // Import courses with their departments
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors = [];

  for (const [code, courseData] of courseMap.entries()) {
    try {
      // Upsert course
      const course = await prisma.course.upsert({
        where: { code: code },
        update: {
          title: courseData.title,
          type: courseData.type,
          credits: courseData.credits,
          isTheory: courseData.isTheory,
          isPractical: courseData.isPractical,
          startYear: courseData.startYear,
          endYear: courseData.endYear,
          active: true
        },
        create: {
          code: code,
          title: courseData.title,
          type: courseData.type,
          credits: courseData.credits,
          isTheory: courseData.isTheory,
          isPractical: courseData.isPractical,
          startYear: courseData.startYear,
          endYear: courseData.endYear,
          active: true
        }
      });

      const isNewCourse = course.createdAt.getTime() === course.updatedAt.getTime();
      if (isNewCourse) created++;
      else updated++;

      // Delete existing department mappings for this course
      await prisma.courseDepartment.deleteMany({
        where: { courseId: course.id }
      });

      // Create new department mappings
      for (const deptMapping of courseData.departments) {
        await prisma.courseDepartment.create({
          data: {
            courseId: course.id,
            dept: deptMapping.dept,
            semester: deptMapping.semester
          }
        });
      }

      if (created % 100 === 0 || updated % 100 === 0) {
        console.log(`Progress: ${created + updated}/${courseMap.size} courses processed...`);
      }

    } catch (err) {
      errors.push({ code: code, error: err.message });
      skipped++;
    }
  }

  console.log('\n✅ Import Complete!\n');
  console.log(`📊 Results:`);
  console.log(`   Created: ${created} courses`);
  console.log(`   Updated: ${updated} courses`);
  console.log(`   Skipped: ${skipped} courses`);

  if (errors.length > 0) {
    console.log(`\n❌ Errors (${errors.length}):`);
    errors.slice(0, 10).forEach(e => console.log(`   ${e.code}: ${e.error}`));
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more errors`);
    }
  }

  // Print statistics
  console.log('\n📈 Database Statistics:\n');

  const totalCourses = await prisma.course.count();
  console.log(`Total courses: ${totalCourses}`);

  const coursesByType = await prisma.course.groupBy({
    by: ['type'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  });

  console.log('\nCourses by type:');
  coursesByType.forEach(row => {
    console.log(`  ${row.type}: ${row._count.id}`);
  });

  const deptMappings = await prisma.courseDepartment.groupBy({
    by: ['dept'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  });

  console.log('\nCourse-Department mappings:');
  deptMappings.forEach(row => {
    console.log(`  ${row.dept}: ${row._count.id} courses`);
  });

  // Show shared courses
  const sharedCourses = await prisma.$queryRaw`
    SELECT c.code, c.title, COUNT(cd.dept) as dept_count
    FROM "Course" c
    JOIN "CourseDepartment" cd ON c.id = cd."courseId"
    GROUP BY c.id
    HAVING COUNT(cd.dept) > 5
    ORDER BY dept_count DESC
    LIMIT 5
  `;

  console.log('\nMost shared courses (offered to multiple departments):');
  sharedCourses.forEach(row => {
    console.log(`  ${row.code} - ${row.title} (${row.dept_count} depts)`);
  });
}

seedFromExcel()
  .catch((e) => {
    console.error('\n❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
