import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/:semester/:dept", async (req, res) => {
  try {
    const { semester, dept } = req.params;

    // Convert semester to number (if stored as Int in DB)
    const courses = await prisma.course.findMany({
      where: {
        semester: Number(semester),
        dept: dept,
      },
    });

    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: "No courses found for this semester and department" });
    }

    return res.json({
      message: `Courses for semester ${semester} in ${dept}`,
      courses,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch courses" });
  }
});

export default router;
