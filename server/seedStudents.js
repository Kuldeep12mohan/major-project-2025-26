import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Extract department from Faculty Number (e.g., 24AEBEA121 → AE)
function extractDept(facultyNo) {
  if (!facultyNo || facultyNo.length < 4) return null;
  return facultyNo.substring(2, 4); // Characters at position 2-3
}

// Calculate semester from year prefix (e.g., 24 → year 2024 → semester based on current date)
function calculateSemester(yearPrefix) {
  const year = parseInt(`20${yearPrefix}`); // 24 → 2024
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  const yearsElapsed = currentYear - year;

  // If in second half of year (July onwards), add 1 semester
  const semesterOffset = currentMonth >= 7 ? 1 : 0;

  return (yearsElapsed * 2) + semesterOffset + 1; // Start from semester 1
}

// Generate default password (can be changed later)
function generateDefaultPassword() {
  return 'Student@123'; // All students get this default password
}

async function seedStudents() {
  console.log('👥 Starting student import...\n');

  // Read Excel file
  const wb = XLSX.readFile('./data/St_file.xlsx');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws);

  console.log(`Found ${data.length} students in Excel\n`);

  let created = 0;
  let skipped = 0;
  const errors = [];

  for (const row of data) {
    try {
      const facultyNo = row.F_No;
      const enrollNo = row.En_No;
      const name = row.Name;

      if (!facultyNo || !enrollNo || !name) {
        skipped++;
        continue;
      }

      // Extract dept and semester
      const dept = extractDept(facultyNo);
      const yearPrefix = facultyNo.substring(0, 2);
      const semester = calculateSemester(yearPrefix);

      if (!dept) {
        console.warn(`⚠️  Invalid faculty number: ${facultyNo}`);
        skipped++;
        continue;
      }

      // Check if student already exists
      const existingStudent = await prisma.studentProfile.findFirst({
        where: {
          OR: [
            { enrollNo: enrollNo },
            { facultyNo: facultyNo }
          ]
        }
      });

      if (existingStudent) {
        skipped++;
        continue;
      }

      // Generate email from enrollment number
      const email = `${enrollNo.toLowerCase()}@student.university.edu`;

      // Hash default password
      const hashedPassword = await bcrypt.hash(generateDefaultPassword(), 10);

      // Create user and student profile in transaction
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: email,
            password: hashedPassword,
            name: name,
            role: 'STUDENT'
          }
        });

        await tx.studentProfile.create({
          data: {
            userId: user.id,
            enrollNo: enrollNo,
            facultyNo: facultyNo,
            semester: semester,
            dept: dept
          }
        });
      });

      created++;

      if (created % 50 === 0) {
        console.log(`Progress: ${created}/${data.length} students processed...`);
      }

    } catch (err) {
      errors.push({
        facultyNo: row.F_No,
        enrollNo: row.En_No,
        error: err.message
      });
      skipped++;
    }
  }

  console.log('\n✅ Student Import Complete!\n');
  console.log(`📊 Results:`);
  console.log(`   Created: ${created} students`);
  console.log(`   Skipped: ${skipped} students`);

  if (errors.length > 0) {
    console.log(`\n❌ Errors (${errors.length}):`);
    errors.slice(0, 10).forEach(e => {
      console.log(`   ${e.facultyNo} (${e.enrollNo}): ${e.error}`);
    });
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more errors`);
    }
  }

  // Print statistics
  console.log('\n📈 Student Statistics:\n');

  const totalStudents = await prisma.studentProfile.count();
  console.log(`Total students: ${totalStudents}`);

  const studentsByDept = await prisma.studentProfile.groupBy({
    by: ['dept'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  });

  console.log('\nStudents by department:');
  studentsByDept.forEach(row => {
    console.log(`  ${row.dept}: ${row._count.id} students`);
  });

  const studentsBySemester = await prisma.studentProfile.groupBy({
    by: ['semester'],
    _count: { id: true },
    orderBy: { semester: 'asc' }
  });

  console.log('\nStudents by semester:');
  studentsBySemester.forEach(row => {
    console.log(`  Semester ${row.semester}: ${row._count.id} students`);
  });

  console.log('\n📝 Note: All students have default password: Student@123');
  console.log('   Students should change their password after first login.\n');
}

seedStudents()
  .catch((e) => {
    console.error('\n❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
