import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkStudents() {
  try {
    const totalStudents = await prisma.studentProfile.count();
    console.log(`Total students in database: ${totalStudents}`);

    if (totalStudents > 0) {
      const studentsByDept = await prisma.studentProfile.groupBy({
        by: ['dept'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      });

      console.log('\nStudents by department:');
      studentsByDept.forEach(row => {
        console.log(`  ${row.dept}: ${row._count.id} students`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudents();
