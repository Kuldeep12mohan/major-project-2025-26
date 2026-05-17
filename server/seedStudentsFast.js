import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function extractDept(facultyNo) {
  if (!facultyNo || facultyNo.length < 4) return null;
  return facultyNo.substring(2, 4);
}

function calculateSemester(yearPrefix) {
  const year = parseInt(`20${yearPrefix}`);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const yearsElapsed = currentYear - year;
  const semesterOffset = currentMonth >= 7 ? 1 : 0;
  return (yearsElapsed * 2) + semesterOffset + 1;
}

async function seedStudents() {
  console.log('👥 Starting FAST student import...\n');

  const wb = XLSX.readFile('./data/St_file.xlsx');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws);

  console.log(`Found ${data.length} students in Excel\n`);

  // Pre-hash the default password once (not per student!)
  console.log('🔐 Hashing default password...');
  const defaultPassword = await bcrypt.hash('Student@123', 10);
  console.log('✅ Password hashed\n');

  // Check existing students in bulk
  console.log('🔍 Checking for existing students...');
  const existingEnrollNos = new Set(
    (await prisma.studentProfile.findMany({
      select: { enrollNo: true }
    })).map(s => s.enrollNo)
  );

  const existingFacultyNos = new Set(
    (await prisma.studentProfile.findMany({
      select: { facultyNo: true }
    })).map(s => s.facultyNo)
  );

  console.log(`Found ${existingEnrollNos.size} existing students\n`);

  // Prepare data for batch insert
  const usersToCreate = [];
  const studentsToCreate = [];
  let skipped = 0;

  for (const row of data) {
    const facultyNo = row.F_No;
    const enrollNo = row.En_No;
    const name = row.Name;

    if (!facultyNo || !enrollNo || !name) {
      skipped++;
      continue;
    }

    // Skip if already exists
    if (existingEnrollNos.has(enrollNo) || existingFacultyNos.has(facultyNo)) {
      skipped++;
      continue;
    }

    const dept = extractDept(facultyNo);
    const yearPrefix = facultyNo.substring(0, 2);
    const semester = calculateSemester(yearPrefix);

    if (!dept) {
      console.warn(`⚠️  Invalid faculty number: ${facultyNo}`);
      skipped++;
      continue;
    }

    const email = `${enrollNo.toLowerCase()}@student.university.edu`;

    usersToCreate.push({
      email: email,
      password: defaultPassword, // Use pre-hashed password
      name: name,
      role: 'STUDENT'
    });

    // Store student data with enrollNo as temp key
    studentsToCreate.push({
      enrollNo: enrollNo,
      facultyNo: facultyNo,
      semester: semester,
      dept: dept
    });
  }

  console.log(`Prepared ${usersToCreate.length} new students`);
  console.log(`Skipped ${skipped} students\n`);

  if (usersToCreate.length === 0) {
    console.log('No new students to import.');
    return;
  }

  console.log('📥 Batch creating users...');

  // Create all users in one transaction
  const createdUsers = [];
  const BATCH_SIZE = 100;

  for (let i = 0; i < usersToCreate.length; i += BATCH_SIZE) {
    const chunk = usersToCreate.slice(i, i + BATCH_SIZE);

    // Create users in transaction
    const users = await prisma.$transaction(
      chunk.map(userData =>
        prisma.user.create({
          data: userData,
          select: { id: true, email: true }
        })
      )
    );

    createdUsers.push(...users);
    console.log(`  Progress: ${createdUsers.length}/${usersToCreate.length} users...`);
  }

  console.log(`✅ Created ${createdUsers.length} users\n`);

  // Map email to userId
  const emailToUserId = new Map();
  createdUsers.forEach(u => emailToUserId.set(u.email, u.id));

  // Prepare student profiles with userIds
  const studentProfilesToCreate = [];

  for (let i = 0; i < studentsToCreate.length; i++) {
    const student = studentsToCreate[i];
    const user = usersToCreate[i];
    const userId = emailToUserId.get(user.email);

    if (!userId) {
      console.warn(`⚠️  No userId found for ${user.email}`);
      continue;
    }

    studentProfilesToCreate.push({
      userId: userId,
      enrollNo: student.enrollNo,
      facultyNo: student.facultyNo,
      semester: student.semester,
      dept: student.dept
    });
  }

  console.log('📥 Batch creating student profiles...');

  // Create student profiles in batches
  let created = 0;

  for (let i = 0; i < studentProfilesToCreate.length; i += BATCH_SIZE) {
    const chunk = studentProfilesToCreate.slice(i, i + BATCH_SIZE);

    await prisma.$transaction(
      chunk.map(profile =>
        prisma.studentProfile.create({ data: profile })
      )
    );

    created += chunk.length;
    console.log(`  Progress: ${created}/${studentProfilesToCreate.length} profiles...`);
  }

  console.log(`✅ Created ${created} student profiles\n`);

  // Print statistics
  console.log('📈 Student Statistics:\n');

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
}

seedStudents()
  .catch((e) => {
    console.error('\n❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
