import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyAdmin } from "../middleware/middleware.js"

const prisma = new PrismaClient();
const router = express.Router();
router.post("/registration-toggle", verifyAdmin, async (req, res) => {
  try {
    const { isOpen, startDate, endDate } = req.body;

    if (typeof isOpen !== "boolean") {
      return res.status(400).json({ error: "isOpen must be a boolean" });
    }

    const updated = await prisma.registrationStatus.upsert({
      where: { id: 1 },
      update: {
        isOpen,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
      create: {
        id: 1,
        isOpen,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    res.status(200).json({
      message: `Registration has been ${isOpen ? "opened" : "closed"}.`,
      registration: updated,
    });
  } catch (err) {
    console.error("Error toggling registration:", err);
    res.status(500).json({ error: "Failed to toggle registration" });
  }
});

router.get("/registration-status", async (req, res) => {
  try {
    const status = await prisma.registrationStatus.findFirst({
      orderBy: { id: "desc" },
    });

    if (!status)
      return res.json({
        isOpen: false,
        message: "Registration not initialized yet.",
      });

    const now = new Date();
    const isCurrentlyOpen =
      status.isOpen &&
      status.startDate &&
      status.endDate &&
      now >= status.startDate &&
      now <= status.endDate;

    res.json({
      ...status,
      isOpen: isCurrentlyOpen,
      message: isCurrentlyOpen
        ? `Registration is open from ${status.startDate.toDateString()} to ${status.endDate.toDateString()}`
        : "Registration is currently closed.",
    });
  } catch (err) {
    console.error("Error fetching registration status:", err);
    res.status(500).json({ error: "Failed to fetch registration status" });
  }
});

router.get("/students", verifyAdmin, async (req, res) => {
  try {
    const students = await prisma.studentProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        teacher: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
      orderBy: { id: "asc" },
    });

    res.json({
      message: "All students fetched successfully",
      count: students.length,
      students,
    });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

router.get("/teachers", verifyAdmin, async (req, res) => {
  try {
    const teachers = await prisma.teacherProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        courses: {
          select: { id: true, code: true, title: true, semester: true },
        },
      },
      orderBy: { id: "asc" },
    });

    res.json({
      message: "All teachers fetched successfully",
      count: teachers.length,
      teachers,
    });
  } catch (err) {
    console.error("Error fetching teachers:", err);
    res.status(500).json({ error: "Failed to fetch teachers" });
  }
});


// POST /api/admin/map-student
router.post("/map-student", verifyAdmin, async (req, res) => {
  try {
    let { studentId, teacherId } = req.body;
    studentId = Number.parseInt(studentId)
    teacherId = Number.parseInt(teacherId)
    if (!studentId || !teacherId) {
      return res
        .status(400)
        .json({ error: "studentId and teacherId are required" });
    }

    // Verify both exist
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
    });
    const teacher = await prisma.teacherProfile.findUnique({
      where: { id: teacherId },
    });

    if (!student) return res.status(404).json({ error: "Student not found" });
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    // ✅ Update the student profile to assign the teacher
    const updatedStudent = await prisma.studentProfile.update({
      where: { id: studentId },
      data: { teacherId: teacher.id },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    res.json({
      message: "Student successfully mapped to teacher",
      mapping: {
        student: updatedStudent,
        teacher,
      },
    });
  } catch (err) {
    console.error("Error mapping student:", err);
    res.status(500).json({ error: "Failed to map student" });
  }
});

// 🔹 Get all student–teacher mappings
router.get("/mappings", verifyAdmin, async (req, res) => {
  try {
    const mappings = await prisma.studentProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        teacher: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { id: "asc" },
    });

    res.json({
      message: "All student–teacher mappings fetched successfully",
      count: mappings.length,
      mappings,
    });
  } catch (err) {
    console.error("Error fetching mappings:", err);
    res.status(500).json({ error: "Failed to fetch student–teacher mappings" });
  }
});


export default router;
