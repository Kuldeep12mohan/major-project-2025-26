import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ error: "Not authenticated. Token missing." });
    }
    const decoded = jwt.verify(token, JWT_SECRET);

    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return res.status(400).json({ error: "Invalid token payload (userId missing)" });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    console.error("Auth Error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const verifyAdmin = async (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied — Admins only" });
    }
    next();
  });
};

export const verifyTeacher = async (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== "TEACHER") {
      return res.status(403).json({ error: "Access denied — Teachers only" });
    }
    next();
  });
};


export const verifyStudent = async (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ error: "Access denied — Students only" });
    }
    next();
  });
};
