import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getStudents() {
  try {
    const students = await prisma.studentProfile.findMany({
      take: 10,
      include: {
        user: { select: { email: true, name: true } }
      }
    });

    console.log("\n=== STUDENT CREDENTIALS ===\n");
    console.log("Default Password: Student@123\n");

    students.forEach((s, i) => {
      console.log(`${i + 1}. Email: ${s.user.email}`);
      console.log(`   Name: ${s.user.name}`);
      console.log(`   Faculty No: ${s.facultyNo}`);
      console.log(`   Department: ${s.dept} | Semester: ${s.semester}`);
      console.log();
    });

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

getStudents();
