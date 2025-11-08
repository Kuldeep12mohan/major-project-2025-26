import { PrismaClient, Dept, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.tempRegistration.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.adminProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.course.deleteMany();

  const courses = [
    {
      code: "COC2062",
      title: "DATA STRUCTURE AND ALGORITHM",
      type: "CORE",
      credits: 4,
      semester: 3,
      dept: "CS",
    },
    {
      code: "COC2070",
      title: "DIGITAL LOGIC AND SYSTEM DESIGN",
      type: "CORE",
      credits: 4,
      semester: 3,
      dept: "CS",
    },
    {
      code: "COC3100",
      title: "OPERATING SYSTEMS",
      type: "CORE",
      credits: 4,
      semester: 5,
      dept: "CS",
    },
    {
      code: "COC3080",
      title: "DATABASE MANAGEMENT SYSTEMS",
      type: "CORE",
      credits: 4,
      semester: 5,
      dept: "CS",
    },
    {
      code: "COC3090",
      title: "COMPUTER NETWORKS",
      type: "CORE",
      credits: 4,
      semester: 5,
      dept: "CS",
    },
    {
      code: "COC3092",
      title: "MICROPROCESSOR THEORY & APPLICATIONS",
      type: "CORE",
      credits: 3,
      semester: 5,
      dept: "CS",
    },
    {
      code: "COC4060",
      title: "COMPILER DESIGN",
      type: "CORE",
      credits: 4,
      semester: 7,
      dept: "CS",
    },
    {
      code: "COC4050",
      title: "COMPUTER GRAPHICS",
      type: "CORE",
      credits: 4,
      semester: 7,
      dept: "CS",
    },
    {
      code: "COC4070",
      title: "ARTIFICIAL INTELLIGENCE",
      type: "DE",
      credits: 4,
      semester: 7,
      dept: "CS",
    },
    {
      code: "COC4010",
      title: "INFORMATION SECURITY",
      type: "DE",
      credits: 4,
      semester: 7,
      dept: "CS",
    },
    {
      code: "CEA1120",
      title: "Strength of Materials",
      type: "CORE",
      credits: 4,
      semester: 7,
      dept: "CE",
    },
    {
      code: "COP3952",
      title: "MINOR PROJECT",
      type: "CORE",
      credits: 3,
      semester: 6,
      dept: "CS",
    },
    {
      code: "COC4950",
      title: "MAJOR PROJECT",
      type: "CORE",
      credits: 8,
      semester: 8,
      dept: "CS",
    },
    {
      code: "COC3030",
      title: "SOFTWARE ENGINEERING",
      type: "CORE",
      credits: 4,
      semester: 6,
      dept: "CS",
    },
    {
      code: "COO4460",
      title: "SELECTED TOPICS IN COMPUTER ENGINEERING-I",
      type: "OE",
      credits: 4,
      semester: 7,
      dept: "CS",
    },
  ];

  await prisma.course.createMany({
    data: courses,
    skipDuplicates: true,
  });

  console.log("✅ Courses seeded!");



  const teacherDepartments = [
    "CS", "ECE", "AI", "EE", "ME", "AE", "CE", "CHE","FTB"
  ];

  const teacherData = [];

  for (let i = 1; i <= 8; i++) {
    teacherData.push({
      email: `teacher${i}@univ.edu`,
      password: "password123",
      name: `Teacher ${i}`,
      role: Role.TEACHER,
      profile: {
        employeeId: `EMP${1000 + i}`,
        designation: "Assistant Professor",
        dept: teacherDepartments[i % teacherDepartments.length],
      },
    });
  }

  for (const t of teacherData) {
    const user = await prisma.user.create({
      data: {
        email: t.email,
        password: t.password,
        name: t.name,
        role: t.role,
      },
    });

    await prisma.teacherProfile.create({
      data: {
        userId: user.id,
        employeeId: t.profile.employeeId,
        designation: t.profile.designation,
        dept: t.profile.dept,
      },
    });
  }

  console.log("✅ Teachers seeded!");


  const deptValues = Object.values(Dept);
  const students = [];

  for (let i = 1; i <= 20; i++) {
    const dept = deptValues[i % deptValues.length];
    const semester = (i % 8) + 1;

    students.push({
      email: `student${i}@univ.edu`,
      name: `Student ${i}`,
      password: "password123",
      role: Role.STUDENT,
      profile: {
        enrollNo: `ENR${1000 + i}`,
        facultyNo: `FAC${2000 + i}`,
        semester,
        dept,
      },
    });
  }

  for (const s of students) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        password: s.password,
        name: s.name,
        role: s.role,
      },
    });

    await prisma.studentProfile.create({
      data: {
        userId: user.id,
        enrollNo: s.profile.enrollNo,
        facultyNo: s.profile.facultyNo,
        semester: s.profile.semester,
        dept: s.profile.dept,
      },
    });
  }

  console.log("✅ Students seeded!");

  console.log("✅✅ SEEDING COMPLETE ✅✅");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
