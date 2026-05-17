import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedSimple() {
  console.log("📦 Creating sample courses and students...\n");

  // Clear existing data
  await prisma.registration.deleteMany({});
  await prisma.tempRegistration.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.teacherProfile.deleteMany({});
  await prisma.adminProfile.deleteMany({});
  await prisma.user.deleteMany({});

  // Create admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: "$2a$10$X7KqZ7H9fqZ7WxZ7WxZ7WuZ7WxZ7WxZ7WxZ7WxZ7WxZ7WxZ7WxZ7W", // Admin@123
      name: "System Admin",
      role: "ADMIN",
      adminProfile: {
        create: {
          adminId: "ADMIN001"
        }
      }
    }
  });
  console.log("✅ Created admin:", admin.email);

  // Create teacher
  const teacher = await prisma.user.create({
    data: {
      email: "teacher@example.com",
      password: "$2a$10$X7KqZ7H9fqZ7WxZ7WxZ7WuZ7WxZ7WxZ7WxZ7WxZ7WxZ7WxZ7WxZ7W", // Teacher@123
      name: "Dr. John Smith",
      role: "TEACHER",
      teacherProfile: {
        create: {
          employeeId: "EMP001",
          designation: "Professor",
          dept: "CO"
        }
      }
    }
  });
  console.log("✅ Created teacher:", teacher.email);

  // Create student
  const student = await prisma.user.create({
    data: {
      email: "student@example.com",
      password: "$2a$10$fYx3GZ9jH8Z9Z9Z9Z9Z9ZuZ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z", // Student@123
      name: "Alice Johnson",
      role: "STUDENT",
      studentProfile: {
        create: {
          enrollNo: "GF-12345",
          facultyNo: "22-CO-001",
          semester: 3,
          dept: "CO",
          teacherId: (await prisma.teacherProfile.findFirst()).id
        }
      }
    }
  });
  console.log("✅ Created student:", student.email);

  // Create sample courses
  const courses = [
    { code: "CS301", title: "Data Structures", type: "DC", credits: 4, semester: 3, dept: "CO" },
    { code: "CS302", title: "Database Systems", type: "DC", credits: 4, semester: 3, dept: "CO" },
    { code: "CS303", title: "Operating Systems", type: "DC", credits: 4, semester: 3, dept: "CO" },
    { code: "CS304", title: "Computer Networks", type: "DC", credits: 3, semester: 3, dept: "CO" },
    { code: "CS305", title: "Software Engineering", type: "DE", credits: 3, semester: 3, dept: "CO" },
    { code: "CS306", title: "Machine Learning", type: "DE", credits: 3, semester: 3, dept: "CO" },
    { code: "CS307", title: "Web Development", type: "OE", credits: 3, semester: 3, dept: "CO" },
    { code: "MA201", title: "Engineering Mathematics", type: "BS", credits: 4, semester: 3, dept: "CO" },
  ];

  for (const course of courses) {
    await prisma.course.create({ data: course });
  }
  console.log(`✅ Created ${courses.length} courses\n`);

  console.log("📊 Summary:");
  console.log(`- Admins: ${await prisma.adminProfile.count()}`);
  console.log(`- Teachers: ${await prisma.teacherProfile.count()}`);
  console.log(`- Students: ${await prisma.studentProfile.count()}`);
  console.log(`- Courses: ${await prisma.course.count()}`);

  console.log("\n🔐 Login Credentials:");
  console.log("Admin: admin@example.com / Admin@123");
  console.log("Teacher: teacher@example.com / Teacher@123");
  console.log("Student: student@example.com / Student@123");
}

seedSimple()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
