import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Authorization token missing" });

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

    if (!user) return res.status(404).json({ error: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const verifyAdmin = async (req, res, next) => {
  await verifyToken(req, res, async () => {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied — Admins only" });
    }
    next();
  });
};

export const verifyTeacher = async (req, res, next) => {
  await verifyToken(req, res, async () => {
    if (req.user.role !== "TEACHER") {
      return res.status(403).json({ error: "Access denied — Teachers only" });
    }
    next();
  });
};

export const verifyStudent = async (req, res, next) => {
  await verifyToken(req, res, async () => {
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ error: "Access denied — Students only" });
    }
    next();
  });
};
