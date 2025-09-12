import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

router.post("/signup/student", async (req, res) => {
  try {
    const { email, password, name, enrollNo, facultyNo, semester, dept } =
      req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: "STUDENT" },
    });

    await prisma.studentProfile.create({
      data: { userId: user.id, enrollNo, facultyNo, semester, dept },
    });
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(201).json({
      message: "Student registered",
      token,
      user: { id: user.id, email, role: "STUDENT" },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Student signup failed", details: err.message });
  }
});

router.post("/signup/teacher", async (req, res) => {
  try {
    const { email, password, name, employeeId, designation, dept } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: "TEACHER" },
    });

    await prisma.teacherProfile.create({
      data: { userId: user.id, employeeId, designation, dept },
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(201).json({
      message: "Teacher registered",
      token,
      user: { id: user.id, email, role: "TEACHER" },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Teacher signup failed", details: err.message });
  }
});

router.post("/signup/admin", async (req, res) => {
  try {
    const { email, password, name, adminId, position } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: "ADMIN" },
    });

    await prisma.adminProfile.create({
      data: { userId: user.id, adminId, position },
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(201).json({
      message: "Admin registered",
      token,
      user: { id: user.id, email, role: "ADMIN" },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Admin signup failed", details: err.message });
  }
});
router.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing token" });
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        studentProfile: true,
        teacherProfile: true,
        adminProfile: true,
      },
    });
    return res.json({ user });
  } catch (err) {
    return res
      .status(401)
      .json({ error: "Invalid token", details: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Login failed", details: err.message });
  }
});


export default router;
