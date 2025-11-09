import express from "express";
import { PrismaClient, RegStatus } from "@prisma/client";
import { verifyToken } from "../middleware/middleware.js";
import { verifyTeacher } from "../middleware/middleware.js";

const prisma = new PrismaClient();
const router = express.Router();
router.get("/me", verifyToken, verifyTeacher, async (req, res) => {
  try {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        students: true,
        courses: true,
      },
    });

    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    res.json({ message: "Teacher profile fetched", teacher });
  } catch (err) {
    console.error("Error fetching teacher profile:", err);
    res.status(500).json({ error: "Failed to fetch teacher profile" });
  }
});

router.get("/pending", verifyToken, verifyTeacher, async (req, res) => {
  try {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    const pending = await prisma.tempRegistration.findMany({
      where: {
        verifierId: teacher.id,
        status: RegStatus.PENDING,
      },
      include: {
        student: {
          include: { user: true },
        },
        course: true,
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({
      message: "Pending student registrations fetched",
      count: pending.length,
      pending,
    });
  } catch (err) {
    console.error("Error fetching pending:", err);
    res.status(500).json({ error: "Failed to fetch pending registrations" });
  }
});

router.post("/verify", verifyToken, verifyTeacher, async (req, res) => {
  try {
    const { tempRegId, action } = req.body;

    if (!tempRegId || !["APPROVED", "REJECTED"].includes(action)) {
      return res
        .status(400)
        .json({ error: "tempRegId and valid action required" });
    }

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    const temp = await prisma.tempRegistration.findUnique({
      where: { id: tempRegId },
      include: {
        student: true,
        course: true,
      },
    });

    if (!temp) return res.status(404).json({ error: "Temp registration not found" });

    if (temp.verifierId !== teacher.id) {
      return res.status(403).json({ error: "Not authorized to verify this request" });
    }

    if (action === "REJECTED") {
      const rejected = await prisma.tempRegistration.update({
        where: { id: tempRegId },
        data: { status: RegStatus.REJECTED },
      });

      return res.json({
        message: "Registration rejected successfully",
        result: rejected,
      });
    }
    const semester = temp.course.semester;
    const year = Math.ceil(semester / 2);

    const registration = await prisma.registration.create({
      data: {
        studentId: temp.studentId,
        courseId: temp.courseId,
        mode: temp.mode,
        semester,
        year,
      },
    });

    await prisma.tempRegistration.update({
      where: { id: tempRegId },
      data: { status: RegStatus.VERIFIED },
    });

    res.json({
      message: "Student registration approved & finalized",
      registration,
    });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ error: "Failed to verify registration" });
  }
});

export default router;
