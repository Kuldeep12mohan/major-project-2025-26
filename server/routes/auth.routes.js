import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

router.post("/signup/student", async (req, res) => {
  try {
    console.log("first")
    const { email, password, name, enrollNo, facultyNo, semester, dept } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });


    const existingEnroll = await prisma.studentProfile.findUnique({ where: { enrollNo } });
    if (existingEnroll) return res.status(400).json({ error: "Enrollment No already registered" });

    const existingFaculty = await prisma.studentProfile.findUnique({ where: { facultyNo } });
    if (existingFaculty) return res.status(400).json({ error: "Faculty No already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: "STUDENT" },
    });

    await prisma.studentProfile.create({
      data: { userId: user.id, enrollNo, facultyNo, semester, dept },
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
    console.log("signup")

    return res.status(201).json({
      message: "Student registered",
      token,
      user: { id: user.id, email: user.email, role: "STUDENT", name: user.name,semester:user?.StudentProfile?.semester },
    });
  } catch (err) {
    return res.status(500).json({ error: "Student signup failed" });
  }
});

// ---------------------- TEACHER SIGNUP ----------------------
router.post("/signup/teacher", async (req, res) => {
  try {
    const { email, password, name, employeeId, designation, dept } = req.body;

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Check if employee ID already exists
    const existingEmployee = await prisma.teacherProfile.findUnique({
      where: { employeeId },
    });
    if (existingEmployee) {
      return res.status(400).json({ error: "Employee ID already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with TEACHER role
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "TEACHER",
      },
    });

    // Create teacher profile
    const teacherProfile = await prisma.teacherProfile.create({
      data: {
        userId: user.id,
        employeeId,
        designation,
        dept,
      },
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      message: "Teacher registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        teacherProfile, // include teacher details
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Teacher signup failed" });
  }
});

router.post("/signup/admin", async (req, res) => {
  try {
    const { email, password, name, adminId, position } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    const existingAdmin = await prisma.adminProfile.findUnique({ where: { adminId } });
    if (existingAdmin) return res.status(400).json({ error: "Admin ID already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: "ADMIN" },
    });

    await prisma.adminProfile.create({ data: { userId: user.id, adminId, position } });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    return res.status(201).json({
      message: "Admin registered",
      token,
      user: { id: user.id, email: user.email, role: "ADMIN", name: user.name },
    });
  } catch (err) {
    return res.status(500).json({ error: "Admin signup failed" });
  }
});

router.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.userId) },
      include: {
        studentProfile: true,
        teacherProfile: true,
        adminProfile: true,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const { password, ...safeUser } = user;
    return res.json({ message: "Profile fetched", user: safeUser });
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        teacherProfile: true,
        adminProfile: true,
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: _, ...safeUser } = user;

    let extraData = {};
    if (user.studentProfile) {
      extraData.semester = user.studentProfile.semester;
    }

    return res.json({
      message: "Login successful",
      token,
      user: safeUser,
      ...extraData,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Login failed" });
  }
});


export default router;
