import express from "express";
import PDFDocument from "pdfkit";
import { PrismaClient } from "@prisma/client";
import { verifyStudent } from "../middleware/middleware.js";

const router = express.Router();
const prisma = new PrismaClient();

// Get current academic session
const getCurrentSession = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12

  // If Jan-June: use previous year (e.g., 2025-26)
  // If July-Dec: use current year (e.g., 2026-27)
  const startYear = month >= 7 ? year : year - 1;
  const endYear = startYear + 1;

  return `${startYear}-${endYear.toString().slice(-2)}`;
};

const getSemesterName = (semester) => {
  return semester % 2 === 0 ? "EVEN" : "ODD";
};

router.get("/generate/:studentId", verifyStudent, async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);

    // Verify the logged-in student is requesting their own card
    const loggedInStudent = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!loggedInStudent || loggedInStudent.id !== studentId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    // Fetch student with approved registrations
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        registrations: {
          include: {
            course: true,
          },
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (student.registrations.length === 0) {
      return res.status(400).json({ error: "No approved registrations found" });
    }

    // Create PDF document
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=registration-card-${student.facultyNo}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Header - Title
    doc.fontSize(16)
      .fillColor("#DC2626")
      .font("Helvetica-Bold")
      .text("COURSE REGISTRATION CARD", { align: "center" });

    doc.moveDown(0.3);

    // Institution Name
    doc.fontSize(14)
      .fillColor("#1E40AF")
      .font("Helvetica-Bold")
      .text("Z. H. College of Engineering and Technology, AMU Aligarh", {
        align: "center",
      });

    doc.moveDown(0.3);

    // Session and Semester with light blue background
    const sessionY = doc.y;
    doc.rect(50, sessionY, 495, 25).fillAndStroke("#DBEAFE", "#60A5FA");

    doc.fillColor("#000000")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(
        `Session: ${getCurrentSession()}; Semester: ${getSemesterName(student.semester)}`,
        50,
        sessionY + 7,
        { align: "center", width: 495 }
      );

    doc.moveDown(1.5);

    // Student Details Section
    const detailsStartY = doc.y;

    // Left side - Student info
    doc.fontSize(10).font("Helvetica-Bold");

    doc.text(`Class: B.Tech/B.Arch`, 50, detailsStartY);
    doc.fontSize(9).font("Helvetica");
    doc.text(
      `Level/Section/Group/S.No.: 04/${student.dept}4/XXX/--`,
      300,
      detailsStartY
    );

    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").text(`Name of Student: ${student.user.name.toUpperCase()}`, 50);

    doc.moveDown(0.5);
    doc.text(`Faculty No.: ${student.facultyNo}`, 50);

    doc.moveDown(0.5);
    doc.text(`Enroll. No.: ${student.enrollNo}`, 50);
    doc.text(`Mobile No.: `, 300, doc.y - 12);

    doc.moveDown(0.5);
    doc.text(`Course: B.Tech.`, 50);

    // Right side - Photo placeholder
    doc.rect(445, detailsStartY, 100, 120).stroke();
    doc.fontSize(9)
      .font("Helvetica")
      .text("Attested Photo", 450, detailsStartY + 50, { width: 90, align: "center" });

    doc.moveDown(2);

    // Course Table
    const tableTop = doc.y + 10;
    const tableHeaders = [
      { text: "S.No.", width: 40, x: 50 },
      { text: "Catg.", width: 45, x: 90 },
      { text: "Crs.No.", width: 70, x: 135 },
      { text: "Course Title", width: 220, x: 205 },
      { text: "Mode", width: 45, x: 425 },
      { text: "Credits", width: 50, x: 470 },
    ];

    // Table header background
    doc.rect(50, tableTop, 495, 20).fillAndStroke("#F3F4F6", "#000000");

    // Table headers
    doc.fillColor("#000000").fontSize(9).font("Helvetica-Bold");
    tableHeaders.forEach((header) => {
      doc.text(header.text, header.x, tableTop + 5, {
        width: header.width,
        align: "center",
      });
    });

    let yPosition = tableTop + 25;
    let totalCredits = 0;

    // Table rows
    doc.font("Helvetica").fontSize(9);
    student.registrations.forEach((reg, index) => {
      totalCredits += reg.course.credits;

      // Draw row borders
      doc.rect(50, yPosition - 5, 495, 20).stroke();

      // S.No.
      doc.text((index + 1).toString(), 50, yPosition, {
        width: 40,
        align: "center",
      });

      // Category
      doc.text(reg.course.type, 90, yPosition, { width: 45, align: "center" });

      // Course Number
      doc.text(reg.course.code, 135, yPosition, { width: 70, align: "center" });

      // Course Title
      doc.text(reg.course.title, 205, yPosition, {
        width: 220,
        align: "left",
      });

      // Mode
      doc.text(reg.mode, 425, yPosition, { width: 45, align: "center" });

      // Credits
      doc.text(reg.course.credits.toString(), 470, yPosition, {
        width: 50,
        align: "center",
      });

      yPosition += 20;
    });

    // Total Credits Row
    doc.rect(50, yPosition - 5, 495, 20).fillAndStroke("#FEF3C7", "#000000");
    doc.font("Helvetica-Bold")
      .text("Total Credits:", 380, yPosition, { width: 85, align: "right" });
    doc.text(totalCredits.toString(), 470, yPosition, {
      width: 50,
      align: "center",
    });

    yPosition += 30;

    // Disclaimer box
    doc.rect(50, yPosition, 400, 70).stroke();
    doc.fontSize(7)
      .font("Helvetica")
      .text(
        "This registration card is invalid until it is signed by undersigned/authority. Registration card is subject to change if any invalid course registration is observed. Registration card may get updated after declaration of result. [" +
          new Date().toISOString().slice(0, 10).replace(/-/g, "") +
          "]",
        55,
        yPosition + 5,
        { width: 390, align: "justify", lineGap: 2 }
      );

    // Student Signature box
    doc.rect(450, yPosition, 95, 70).stroke();
    doc.fontSize(8)
      .font("Helvetica")
      .text("Student Signature", 455, yPosition + 30, {
        width: 85,
        align: "center",
      });

    yPosition += 80;

    // Department note
    doc.fontSize(7)
      .font("Helvetica-Oblique")
      .text("Department/centre must report discrepancy, if any.", 50, yPosition);

    yPosition += 30;

    // Signature section
    doc.fontSize(9).font("Helvetica-Bold");
    doc.text("Name & Signature of Departmental Coordinator", 50, yPosition, {
      width: 250,
      align: "center",
    });
    doc.text("Seal and Signature of the Chairperson", 300, yPosition, {
      width: 245,
      align: "center",
    });

    yPosition += 12;
    doc.fontSize(7)
      .font("Helvetica-Oblique")
      .text("(An ink signature is required)", 50, yPosition, {
        width: 250,
        align: "center",
      });
    doc.text("(An ink signature is required)", 300, yPosition, {
      width: 245,
      align: "center",
    });

    yPosition += 30;

    // Footer - Yellow bar with ***
    doc.rect(50, yPosition, 495, 15).fillAndStroke("#FEF08A", "#000000");
    doc.fillColor("#000000")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("***", 50, yPosition + 2, { width: 495, align: "center" });

    // Finalize PDF
    doc.end();
  } catch (err) {
    console.error("Error generating registration card:", err);
    res.status(500).json({ error: "Failed to generate registration card" });
  }
});

export default router;
