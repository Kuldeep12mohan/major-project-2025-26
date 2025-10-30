import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middleware/middleware.js";

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

/**
 * 🔹 Student Signup
 */
router.post("/signup/student", async (req, res) => {
  try {
    const { email, password, name, enrollNo, facultyNo, semester, dept } = req.body;

    if (!email || !password || !enrollNo || !facultyNo || !semester || !dept) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: "Email already registered" });

    const existingEnroll = await prisma.studentProfile.findUnique({ where: { enrollNo } });
    if (existingEnroll)
      return res.status(400).json({ error: "Enrollment No already registered" });

    const existingFaculty = await prisma.studentProfile.findUnique({ where: { facultyNo } });
    if (existingFaculty)
      return res.status(400).json({ error: "Faculty No already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: "STUDENT" },
    });

    const studentProfile = await prisma.studentProfile.create({
      data: { userId: user.id, enrollNo, facultyNo, semester, dept },
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(201).json({
      message: "Student registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        studentProfile,
      },
    });
  } catch (err) {
    console.error("❌ Signup error:", err);
    return res.status(500).json({ error: "Student signup failed" });
  }
});

/**
 * 🔹 Teacher Signup
 */
router.post("/signup/teacher", async (req, res) => {
  try {
    const { email, password, name, employeeId, designation, dept } = req.body;

    if (!email || !password || !employeeId || !designation || !dept) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: "Email already registered" });

    const existingEmployee = await prisma.teacherProfile.findUnique({
      where: { employeeId },
    });
    if (existingEmployee)
      return res.status(400).json({ error: "Employee ID already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: "TEACHER" },
    });

    const teacherProfile = await prisma.teacherProfile.create({
      data: { userId: user.id, employeeId, designation, dept },
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(201).json({
      message: "Teacher registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        teacherProfile,
      },
    });
  } catch (err) {
    console.error("❌ Teacher signup error:", err);
    return res.status(500).json({ error: "Teacher signup failed" });
  }
});

/**
 * 🔹 Admin Login
 */
router.post("/login/admin", async (req, res) => {
  try {
    const { email, password, adminId } = req.body;

    if (!email || !password || !adminId)
      return res
        .status(400)
        .json({ error: "Email, password, and Admin ID are required" });

    const admin = await prisma.user.findFirst({
      where: { email, role: "ADMIN", adminProfile: { adminId } },
      include: { adminProfile: true },
    });

    if (!admin) return res.status(400).json({ error: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid)
      return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: admin.id, role: admin.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    const { password: _, ...safeAdmin } = admin;
    return res.json({
      message: "Admin login successful",
      token,
      user: safeAdmin,
    });
  } catch (err) {
    console.error("❌ Admin login error:", err);
    return res.status(500).json({ error: "Admin login failed" });
  }
});

/**
 * 🔹 Generic Login (for Student/Teacher)
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        teacherProfile: true,
        adminProfile: true,
      },
    });

    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    const { password: _, ...safeUser } = user;

    return res.json({
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

/**
 * 🔹 Fetch Authenticated Profile
 */
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const { user } = req;
    const { password, ...safeUser } = user;

    return res.json({
      message: "Profile fetched successfully",
      user: safeUser,
    });
  } catch (err) {
    console.error("❌ Profile fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
});

export default router;
