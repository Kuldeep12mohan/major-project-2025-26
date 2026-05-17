import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupDuplicates() {
  try {
    console.log("Fetching all registrations...");

    const registrations = await prisma.registration.findMany({
      orderBy: [
        { studentId: 'asc' },
        { courseId: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    console.log(`Total registrations: ${registrations.length}`);

    const seen = new Set();
    const duplicates = [];

    for (const reg of registrations) {
      const key = `${reg.studentId}-${reg.courseId}`;

      if (seen.has(key)) {
        // This is a duplicate
        duplicates.push(reg.id);
        console.log(`Duplicate found: Student ${reg.studentId}, Course ${reg.courseId}, ID ${reg.id}`);
      } else {
        seen.add(key);
      }
    }

    console.log(`\nFound ${duplicates.length} duplicate registrations`);

    if (duplicates.length > 0) {
      console.log(`Deleting duplicate registrations...`);

      const deleted = await prisma.registration.deleteMany({
        where: {
          id: { in: duplicates }
        }
      });

      console.log(`✅ Deleted ${deleted.count} duplicate registrations`);
    } else {
      console.log("✅ No duplicates found!");
    }

    const remaining = await prisma.registration.count();
    console.log(`\nRemaining registrations: ${remaining}`);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicates();
