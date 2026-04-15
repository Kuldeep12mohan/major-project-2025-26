import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function seed() {
    const jsonPath = path.join(__dirname, "courses_data.json");

    if (!fs.existsSync(jsonPath)) {
        console.error("❌ courses_data.json not found! Run extractCourses.py first.");
        process.exit(1);
    }

    const courses = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    console.log(`📦 Loading ${courses.length} courses from courses_data.json...\n`);

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors = [];

    // Valid enum values from Prisma schema
    const validDepts = ["CS", "ECE", "AI", "EE", "ME", "AE", "CE", "CHE", "PTK", "FTB"];
    const validTypes = ["OE", "DE", "CORE", "HM"];

    for (const course of courses) {
        try {
            // Validate dept
            if (!validDepts.includes(course.dept)) {
                skipped++;
                continue;
            }

            // Validate type
            if (!validTypes.includes(course.type)) {
                course.type = "CORE";
            }

            // Ensure credits is an integer
            const credits = Math.round(Number(course.credits) || 3);

            const result = await prisma.course.upsert({
                where: { code: course.code },
                update: {
                    title: course.title,
                    type: course.type,
                    credits: credits,
                    semester: course.semester,
                    dept: course.dept,
                    active: true,
                },
                create: {
                    code: course.code,
                    title: course.title,
                    type: course.type,
                    credits: credits,
                    semester: course.semester,
                    dept: course.dept,
                    active: true,
                },
            });

            if (result.createdAt.getTime() === result.updatedAt.getTime()) {
                created++;
            } else {
                updated++;
            }
        } catch (err) {
            errors.push({ code: course.code, error: err.message });
        }
    }

    console.log(`✅ Created: ${created}`);
    console.log(`🔄 Updated: ${updated}`);
    console.log(`⏭️  Skipped: ${skipped}`);

    if (errors.length > 0) {
        console.log(`\n❌ Errors (${errors.length}):`);
        errors.forEach((e) => console.log(`   ${e.code}: ${e.error}`));
    }

    // Print summary by department and semester
    const summary = await prisma.course.groupBy({
        by: ["dept", "semester"],
        _count: { id: true },
        orderBy: [{ dept: "asc" }, { semester: "asc" }],
    });

    console.log("\n📊 Database Summary:");
    let currentDept = "";
    for (const row of summary) {
        if (row.dept !== currentDept) {
            currentDept = row.dept;
            console.log(`\n  ${currentDept}:`);
        }
        console.log(`    Semester ${row.semester}: ${row._count.id} courses`);
    }

    const total = await prisma.course.count();
    console.log(`\n📚 Total courses in database: ${total}`);
}

seed()
    .catch((e) => {
        console.error("Fatal error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
