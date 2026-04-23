import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middleware/middleware.js";

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const EMAIL_FROM = process.env.EMAIL_FROM || "no-reply@courseportal.local";

const accessCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 24 * 60 * 60 * 1000,
};

const SMTP_PLACEHOLDER_HOSTS = ["smtp.example.com"];
const SMTP_PLACEHOLDER_USERS = ["your_smtp_username"];
const SMTP_PLACEHOLDER_PASS = ["your_smtp_password"];

const normalizeSmtpPasswords = (pass) => {
  const trimmed = pass?.trim();
  if (!trimmed) return [];

  const candidates = new Set();
  candidates.add(trimmed);

  const noSpaces = trimmed.replace(/\s+/g, "");
  if (noSpaces !== trimmed) candidates.add(noSpaces);

  if (!/\s/.test(trimmed) && noSpaces.length === 16) {
    const spaced = noSpaces.match(/.{1,4}/g)?.join(" ") || noSpaces;
    candidates.add(spaced);
  }

  return [...candidates];
};

const isSmtpConfigured = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !process.env.SMTP_PORT || !user || !pass) return false;
  if (SMTP_PLACEHOLDER_HOSTS.includes(host)) return false;
  if (SMTP_PLACEHOLDER_USERS.includes(user)) return false;
  if (SMTP_PLACEHOLDER_PASS.includes(pass)) return false;
  return true;
};

const createMailTransport = async () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (isSmtpConfigured()) {
    const passwordVariants = normalizeSmtpPasswords(pass);
    let lastError = null;

    for (const password of passwordVariants) {
      const transport = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass: password },
      });

      try {
        await transport.verify();
        return {
          transport,
          usingEthereal: false,
          smtpPasswordUsed: password,
          smtpVerified: true,
        };
      } catch (err) {
        lastError = err;
        console.warn(
          `⚠️ SMTP verification failed for password variant (${password.length} chars):`,
          err.message
        );
      }
    }

    console.warn(
      "⚠️ All SMTP password variants failed, falling back to Ethereal:",
      lastError?.message
    );
  }

  const testAccount = await nodemailer.createTestAccount();
  return {
    transport: nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    }),
    usingEthereal: true,
  };
};

router.post("/signup/student", async (req, res) => {
  try {
    const { email, password, name, enrollNo, facultyNo, semester, dept } = req.body;

    if (!email || !password || !enrollNo || !facultyNo || !semester || !dept) {
      return res.status(400).json({ error: "All fields are required" });
    }

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

    const studentProfile = await prisma.studentProfile.create({
      data: { userId: user.id, enrollNo, facultyNo, semester, dept },
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("accessToken", token, accessCookieOptions);

    const { password: _, ...safeUser } = user;

    return res.status(201).json({
      message: "Student registered successfully",
      user: { ...safeUser, studentProfile },
    });
  } catch (err) {
    console.error("❌ Signup error:", err);
    return res.status(500).json({ error: "Student signup failed" });
  }
});

router.post("/signup/teacher", async (req, res) => {
  try {
    const { email, password, name, employeeId, designation, dept } = req.body;

    if (!email || !password || !employeeId || !designation || !dept) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

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

    res.cookie("accessToken", token, accessCookieOptions);

    const { password: _, ...safeUser } = user;

    return res.status(201).json({
      message: "Teacher registered successfully",
      user: { ...safeUser, teacherProfile },
    });
  } catch (err) {
    console.error("❌ Teacher signup error:", err);
    return res.status(500).json({ error: "Teacher signup failed" });
  }
});

router.post("/login/admin", async (req, res) => {
  try {
    const { email, password, adminId } = req.body;

    if (!email || !password || !adminId)
      return res.status(400).json({ error: "Email, password & Admin ID required" });

    const admin = await prisma.user.findFirst({
      where: { email, role: "ADMIN", adminProfile: { adminId } },
      include: { adminProfile: true },
    });

    if (!admin) return res.status(400).json({ error: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: admin.id, role: admin.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("accessToken", token, accessCookieOptions);

    const { password: _, ...safeAdmin } = admin;

    return res.json({
      message: "Admin login successful",
      user: safeAdmin,
    });
  } catch (err) {
    console.error("❌ Admin login error:", err);
    return res.status(500).json({ error: "Admin login failed" });
  }
});

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

    res.cookie("accessToken", token, accessCookieOptions);

    const { password: _, ...safeUser } = user;

    return res.json({
      message: "Login successful",
      user: safeUser,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Please provide your email address." });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.json({
        message:
          "If that email exists, a password reset link has been sent.",
      });
    }

    const { transport, usingEthereal } = await createMailTransport();

    const resetToken = jwt.sign(
      { userId: user.id, role: user.role, action: "RESET_PASSWORD" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const resetLink = `${CLIENT_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: EMAIL_FROM,
      to: email,
      subject: "Course Portal Password Reset",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Password reset request</h2>
          <p>You requested a password reset for your Course Portal account. Click the button below to reset your password.</p>
          <p>
            <a href="${resetLink}" style="display:inline-block;padding:12px 20px;background:#f59e0b;color:#fff;border-radius:8px;text-decoration:none;">
              Reset password
            </a>
          </p>
          <p>If the button does not work, copy and paste this link into your browser:</p>
          <p><a href="${resetLink}" style="color:#1d4ed8;">${resetLink}</a></p>
          <p>This link is valid for one hour.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transport.sendMail(mailOptions);
    if (usingEthereal) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`Ethereal preview URL: ${previewUrl}`);
      return res.json({
        message:
          "SMTP delivery failed or was not configured. A test email preview has been generated.",
        previewUrl,
        usingEthereal: true,
      });
    }

    return res.json({
      message: "Password reset link sent to your email address.",
    });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    return res.status(500).json({ error: "Failed to process password reset request" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token and new password are required." });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (verifyError) {
      return res.status(400).json({ error: "Invalid or expired reset token." });
    }

    if (payload.action !== "RESET_PASSWORD") {
      return res.status(400).json({ error: "Invalid reset token." });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return res.status(400).json({ error: "Invalid reset token." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res.json({ message: "Password reset successfully", role: user.role });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    return res.status(500).json({ error: "Failed to reset password" });
  }
});

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
router.get("/me", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        teacherProfile: true,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      message: "User fetched successfully",
      user,
    });
  } catch (err) {
    console.error("Error fetching /me:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("accessToken");
  return res.json({ message: "Logged out successfully" });
});

export default router;
