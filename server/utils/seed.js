import { PrismaClient, Dept, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.tempRegistration.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.user.deleteMany();

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
