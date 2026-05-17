import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";

const prisma = new PrismaClient();

const CATEGORY_MAP = {
  'DE': 'DE', 'BS': 'BS', 'OE': 'OE', 'ESA': 'ESA',
  'DC': 'DC', 'PC': 'PC', 'PSI': 'PSI', 'AU': 'AU', 'HM': 'HM'
};

const DEPT_MAP = {
  'AEBEA': 'AE', 'AIBEA': 'AI', 'ARBEA': 'AR', 'CEBEA': 'CE',
  'CHBEA': 'CH', 'COBEA': 'CO', 'EEBEA': 'EE', 'ELBEA': 'EL',
  'FTBEA': 'FT', 'MEBEA': 'ME', 'PKBEA': 'PK'
};

async function seedFromExcel() {
  console.log('📦 Starting FAST Excel import...\n');

  const wb = XLSX.readFile('./data/Course_File.xlsx');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws);

  console.log(`Found ${data.length} course-department mappings\n`);

  // Group by course code
  const courseMap = new Map();
  let skipped = 0;

  data.forEach(row => {
    const code = (row.CrsN || '').trim();
    if (!code) return;

    const dept = DEPT_MAP[row.Br_Code];
    if (!dept) {
      skipped++;
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

    courseMap.get(code).departments.push({
      dept: dept,
      semester: row.Sem
    });
  });

  console.log(`Grouped into ${courseMap.size} unique courses`);
  console.log(`Skipped ${skipped} invalid entries\n`);

  // Prepare all course data for batch insert
  const coursesToCreate = [];
  const courseCodeToIndex = new Map();
  let index = 0;

  for (const [code, courseData] of courseMap.entries()) {
    coursesToCreate.push({
      code: code,
      title: courseData.title,
      type: courseData.type,
      credits: courseData.credits,
      isTheory: courseData.isTheory,
      isPractical: courseData.isPractical,
      startYear: courseData.startYear,
      endYear: courseData.endYear,
      active: true
    });
    courseCodeToIndex.set(code, index);
    index++;
  }

  console.log('🗑️  Clearing existing courses...');

  // Clear existing courses
  await prisma.course.deleteMany({});

  console.log('✅ Cleared\n');
  console.log('📥 Batch inserting courses...');

  // Note: Current schema has Course.dept as single value (not many-to-many)
  // We'll create separate course records for each dept-semester combination
  const allCourses = [];

  for (const [code, courseData] of courseMap.entries()) {
    for (const deptMapping of courseData.departments) {
      allCourses.push({
        code: `${code}-${deptMapping.dept}-${deptMapping.semester}`, // Make unique per dept-semester
        title: courseData.title,
        type: courseData.type,
        credits: courseData.credits,
        semester: deptMapping.semester,
        dept: deptMapping.dept,
        active: true
      });
    }
  }

  // Batch insert
  const chunkSize = 1000;
  for (let i = 0; i < allCourses.length; i += chunkSize) {
    const chunk = allCourses.slice(i, i + chunkSize);
    await prisma.course.createMany({
      data: chunk,
      skipDuplicates: true
    });
    console.log(`✅ Inserted ${Math.min(i + chunkSize, allCourses.length)}/${allCourses.length} courses`);
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

  const coursesByDept = await prisma.course.groupBy({
    by: ['dept'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  });

  console.log('\nCourses by department:');
  coursesByDept.forEach(row => {
    console.log(`  ${row.dept}: ${row._count.id} courses`);
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
