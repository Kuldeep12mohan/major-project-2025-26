import express from "express";
import { PrismaClient, RegStatus } from "@prisma/client";
import { verifyStudent } from "../middleware/middleware.js";

const prisma = new PrismaClient();
const router = express.Router();

// --- Create a temp registration for a single course ---
router.post("/register", verifyStudent, async (req, res) => {
  try {
    const { courseId, mode } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: "Provide a courseId" });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!student) return res.status(404).json({ error: "Student not found" });

    // ✅ Check if student has a verifier assigned
    if (!student.teacherId) {
      return res.status(403).json({ error: "No verifier assigned yet. Contact admin." });
    }

    const teacherId = student.teacherId;

    // ✅ Check registration window
    const regStatus = await prisma.registrationStatus.findFirst({
      orderBy: { id: "desc" },
    });
    const now = new Date();
    const isOpen =
      regStatus?.isOpen &&
      regStatus.startDate &&
      regStatus.endDate &&
      now >= regStatus.startDate &&
      now <= regStatus.endDate;

    if (!isOpen) return res.status(403).json({ error: "Registration is closed" });

    // ✅ Check if a temp registration for this course already exists
    let temp = await prisma.tempRegistration.findFirst({
      where: { studentId: student.id, courseId },
    });

    if (temp) {
      // Already exists
      return res.status(400).json({ error: "You have already registered this course" });
    }

    // Create new temp registration
    temp = await prisma.tempRegistration.create({
      data: {
        studentId: student.id,
        courseId,
        mode: mode || "A",
        status: RegStatus.PENDING,
        verifierId: teacherId,
      },
      include: { course: true, student: { include: { user: true } } },
    });

    res.status(201).json({ message: "Temp registration saved", temp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit registration" });
  }
});

// --- Get student's temp registrations ---
router.get("/temp-registrations", verifyStudent, async (req, res) => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!student) return res.status(404).json({ error: "Student not found" });

    const tempRegs = await prisma.tempRegistration.findMany({
      where: { studentId: student.id },
      include: {
        course: true,
        verifier: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ message: "Temp registrations fetched", tempRegs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch temp registrations" });
  }
});

// --- Get all verified/approved registrations for the student ---
router.get("/registration", verifyStudent, async (req, res) => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!student) return res.status(404).json({ error: "Student not found" });

    // Fetch temp registrations that have been verified (APPROVED or REJECTED)
    const verifiedRegs = await prisma.tempRegistration.findMany({
      where: {
        studentId: student.id,
        status: RegStatus.APPROVED, // or include rejected if needed: { in: [RegStatus.APPROVED, RegStatus.REJECTED] }
      },
      include: {
        course: true,
        verifier: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ message: "Verified registrations fetched", registrations: verifiedRegs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch verified registrations" });
  }
});


// --- Fetch courses by semester and department ---

router.get("/:semester/:dept", async (req, res) => {
  try {
    const { semester, dept } = req.params;

    const courses = await prisma.course.findMany({
      where: { semester: Number(semester), dept },
      orderBy: { title: "asc" },
    });

    if (!courses || courses.length === 0) {
      return res.status(404).json({
        message: `No courses found for semester ${semester} in ${dept}`,
      });
    }

    res.json({ message: `Courses for semester ${semester} in ${dept}`, courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

export default router;
