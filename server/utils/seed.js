import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear old data
  await prisma.course.deleteMany();

  const courses = [
    {
      code: "COC2062",
      title: "DATA STRUCTURE AND ALGORITHM",
      type: "CORE",
      credits: 4,
      semester: 3,
      dept:"CS"
    },
    {
      code: "COC2070",
      title: "DIGITAL LOGIC AND SYSTEM DESIGN",
      type: "CORE",
      credits: 4,
      semester: 3,
      dept:"CS"
    },
    {
      code: "COC3100",
      title: "OPERATING SYSTEMS",
      type: "CORE",
      credits: 4,
      semester: 5,
      dept:"CS"
    },
    {
      code: "COC3080",
      title: "DATABASE MANAGEMENT SYSTEMS",
      type: "CORE",
      credits: 4,
      semester: 5,
      dept:"CS"
    },
    {
      code: "COC3090",
      title: "COMPUTER NETWORKS",
      type: "CORE",
      credits: 4,
      semester: 5,
      dept:"CS"
    },
    {
      code: "COC3092",
      title: "MICROPROCESSOR THEORY & APPLICATIONS",
      type: "CORE",
      credits: 3,
      semester: 5,
      dept:"CS"
    },
    {
      code: "COC4060",
      title: "COMPILER DESIGN",
      type: "CORE",
      credits: 4,
      semester: 7,
      dept:"CS"
    },
    {
      code: "COC4050",
      title: "COMPUTER GRAPHICS",
      type: "CORE",
      credits: 4,
      semester: 7,
      dept:"CS"
    },
    {
      code: "COC4070",
      title: "ARTIFICIAL INTELLIGENCE",
      type: "DE",
      credits: 4,
      semester: 7,
      dept:"CS"
    },
    {
      code: "COC4010",
      title: "INFORMATION SECURITY",
      type: "DE",
      credits: 4,
      semester: 7,
      dept:"CS"
    },
    {
      code: "CEA1120",
      title: "Strength of Materials",
      type: "CORE",
      credits: 4,
      semester: 7,
      dept:"CE"
    },
    {
      code: "COP3952",
      title: "MINOR PROJECT",
      type: "CORE",
      credits: 3,
      semester: 6,
      dept:"CS"
    },
    {
      code: "COC4950",
      title: "MAJOR PROJECT",
      type: "CORE",
      credits: 8,
      semester: 8,
      dept:"CS"
    },
    {
      code: "COC3030",
      title: "SOFTWARE ENGINEERING",
      type: "CORE",
      credits: 4,
      semester: 6,
      dept:"CS"
    },
    {
      code: "COO4460",
      title: "SELECTED TOPICS IN COMPUTER ENGINEERING-I",
      type: "OE",
      credits: 4,
      semester: 7,
      dept:"CS"
    },
  ];

  // Efficient bulk insert
  await prisma.course.createMany({
    data: courses,
    skipDuplicates: true, // ignores if course with same code already exists
  });

  console.log("✅ Courses seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
