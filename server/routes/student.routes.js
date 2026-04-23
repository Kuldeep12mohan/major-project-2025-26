import express from "express";
import { PrismaClient, RegStatus } from "@prisma/client";
import { verifyStudent } from "../middleware/middleware.js";

const prisma = new PrismaClient();
const router = express.Router();

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
    if (!student.teacherId) {
      return res.status(403).json({ error: "No verifier assigned yet. Contact admin." });
    }

    const teacherId = student.teacherId;

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

    let temp = await prisma.tempRegistration.findFirst({
      where: { studentId: student.id, courseId },
    });

    if (temp) {
      return res.status(400).json({ error: "You have already registered this course" });
    }

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

router.get("/registration", verifyStudent, async (req, res) => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!student) return res.status(404).json({ error: "Student not found" });

    const verifiedRegs = await prisma.tempRegistration.findMany({
      where: {
        studentId: student.id,
        status: RegStatus.APPROVED,
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

router.get("/:semester/:dept", async (req, res) => {
  try {
    const { semester, dept } = req.params;
    const semesterNumber = Number(semester);
    const deptFilter = String(dept || "").trim().toUpperCase();

    const courses = await prisma.course.findMany({
      where: { semester: semesterNumber, dept: deptFilter, type: "CORE" },
      orderBy: { title: "asc" },
    });

    res.json({
      message: courses.length
        ? `Core courses for semester ${semesterNumber} in ${deptFilter}`
        : `No core courses found for semester ${semesterNumber} in ${deptFilter}`,
      courses,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

router.put("/profile", verifyStudent, async (req, res) => {
  try {
    const { name, semester, dept } = req.body;

    if (!name || !semester || !dept) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!student) return res.status(404).json({ error: "Student not found" });

    await prisma.user.update({
      where: { id: req.user.id },
      data: { name },
    });
    const updatedProfile = await prisma.studentProfile.update({
      where: { id: student.id },
      data: {
        semester: Number(semester),
        dept,
      },
      include: { user: true },
    });

    res.json({ message: "Profile updated successfully", profile: updatedProfile });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
