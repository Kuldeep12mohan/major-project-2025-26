import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyStudent } from "../middleware/middleware.js";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/courses", verifyStudent, async (req, res) => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!student) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    const courses = await prisma.course.findMany({
      where: {
        active: true,
        OR: [{ dept: student.dept }, { type: "OE" }],
      },
      orderBy: { semester: "asc" },
    });

    res.json({ message: "Courses fetched successfully", courses });
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

router.get("/my-registrations", verifyStudent, async (req, res) => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!student) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    const registrations = await prisma.registration.findMany({
      where: { studentId: student.id },
      include: {
        course: {
          select: {
            title: true,
            code: true,
            credits: true,
            semester: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      message: "Fetched student's approved registrations",
      registrations,
    });
  } catch (err) {
    console.error("Error fetching registrations:", err);
    res.status(500).json({ error: "Failed to fetch student registrations" });
  }
});

router.post("/register", verifyStudent, async (req, res) => {
  try {
    let { courseIds, courseId, mode } = req.body;

    if (courseId && !courseIds) courseIds = [courseId];

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({ error: "Provide at least one valid courseId" });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!student) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    const regStatus = await prisma.registrationStatus.findFirst({
      orderBy: { id: "desc" },
    });

    const now = new Date();
    const isOpen =
      regStatus &&
      regStatus.isOpen &&
      regStatus.startDate &&
      regStatus.endDate &&
      now >= regStatus.startDate &&
      now <= regStatus.endDate;

    if (!isOpen) {
      return res.status(403).json({ error: "Registration window is not open" });
    }

    const existingTemp = await prisma.tempRegistration.findMany({
      where: { studentId: student.id, courseId: { in: courseIds } },
    });

    if (existingTemp.length > 0) {
      return res.status(400).json({
        error: "Some selected courses already have pending registrations",
      });
    }

    const newRegs = await prisma.tempRegistration.createMany({
      data: courseIds.map((id) => ({
        studentId: student.id,
        courseId: id,
        mode: mode || "A",
        status: "PENDING",
      })),
    });

    res.status(201).json({
      message: "Registration requests submitted successfully",
      count: newRegs.count,
    });
  } catch (err) {
    console.error("Error creating registration requests:", err);
    res.status(500).json({ error: "Failed to submit registrations" });
  }
});

router.get("/temp-registrations", verifyStudent, async (req, res) => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!student) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    const teacher = await prisma.teacherProfile.findUnique({
      where: { id: student.teacherId },
      include: { user: { select: { name: true, email: true } } },
    });

    const tempRegs = await prisma.tempRegistration.findMany({
      where: { studentId: student.id },
      include: {
        course: {
          select: {
            title: true,
            code: true,
            credits: true,
            semester: true,
            dept: true,
          },
        },
        verifier: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      message: "Fetched student's temporary registrations",
      tempRegistrations: tempRegs,
      verifier: teacher?.user || null,
    });
  } catch (err) {
    console.error("Error fetching temp registrations:", err);
    res.status(500).json({ error: "Failed to fetch temp registrations" });
  }
});

router.get("/:semester/:dept", async (req, res) => {
  try {
    const { semester, dept } = req.params;

    const courses = await prisma.course.findMany({
      where: {
        semester: Number(semester),
        dept,
      },
      orderBy: { title: "asc" },
    });

    if (!courses || courses.length === 0) {
      return res.status(404).json({
        message: `No courses found for semester ${semester} in ${dept}`,
      });
    }

    res.json({
      message: `Courses for semester ${semester} in ${dept}`,
      courses,
    });
  } catch (err) {
    console.error("Error fetching courses by dept/sem:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

export default router;
