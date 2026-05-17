# Database Schema Changes Summary

## Overview

Comprehensive database schema update to support Excel data import (Course_File.xlsx and St_file.xlsx) with many-to-many course-department relationships.

## Changes Made

### 1. CourseType Enum - Expanded from 4 to 9 types

**Before:**
```prisma
enum CourseType {
  OE    // Open Elective
  DE    // Departmental Elective  
  CORE  // Core courses
  HM    // Humanities
}
```

**After:**
```prisma
enum CourseType {
  BS    // Basic Science
  ESA   // Engineering Science & Applications
  DC    // Departmental Core (replaces CORE)
  PC    // Professional Core
  DE    // Departmental Elective
  OE    // Open Elective
  PSI   // Professional Skill/Internship
  AU    // Audit
  HM    // Humanities & Management
}
```

**Mapping:**
- `CORE` → `DC` (Departmental Core)
- All others are new categories from Excel

### 2. Dept Enum - Updated to match Excel codes

**Before:**
```prisma
enum Dept {
  CS   // Computer Science
  ECE  // Electronics & Communication
  AI   // Artificial Intelligence
  EE   // Electrical Engineering
  ME   // Mechanical Engineering
  AE   // Aerospace Engineering
  CE   // Civil Engineering
  CHE  // Chemical Engineering
  PTK  // Petroleum Engineering
  FTB  // Food Technology & Biotech
}
```

**After:**
```prisma
enum Dept {
  CO    // Computer Science (was CS)
  EE    // Electrical Engineering
  ECE   // Electronics & Communication (kept for legacy)
  EL    // Electronics Engineering (new)
  AI    // Artificial Intelligence
  ME    // Mechanical Engineering
  AE    // Aerospace Engineering
  CE    // Civil Engineering
  CH    // Chemical Engineering (was CHE)
  PK    // Petroleum Engineering (was PTK)
  FT    // Food Technology & Biotech (was FTB)
  AR    // Architecture (new)
  VL    // VLSI (new)
}
```

**Mapping:**
- `CS` → `CO`
- `CHE` → `CH`
- `PTK` → `PK`
- `FTB` → `FT`
- Added: `EL`, `AR`, `VL`
- Kept: `ECE` (for backward compatibility)

### 3. Course Model - Many-to-Many with Departments

**Before:**
```prisma
model Course {
  code              String             @unique
  title             String
  type              CourseType         @default(CORE)
  semester          Int                // Single semester
  active            Boolean            @default(true)
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
  credits           Int
  id                Int                @id @default(autoincrement())
  dept              Dept               // ❌ Single department
  registrations     Registration[]
  tempRegistrations TempRegistration[]
  teachers          TeacherProfile[]   @relation("TeacherCourses")
}
```

**After:**
```prisma
model Course {
  code              String               @unique
  title             String
  type              CourseType           @default(DC)  // Changed default
  active            Boolean              @default(true)
  createdAt         DateTime             @default(now())
  updatedAt         DateTime             @updatedAt
  credits           Int
  isTheory          Boolean              @default(true)   // ✅ New
  isPractical       Boolean              @default(false)  // ✅ New
  startYear         Int?                 // ✅ New (from Excel St_Yr)
  endYear           Int?                 // ✅ New (from Excel Fn_Yr)
  id                Int                  @id @default(autoincrement())
  departments       CourseDepartment[]   // ✅ Many departments
  registrations     Registration[]
  tempRegistrations TempRegistration[]
  teachers          TeacherProfile[]     @relation("TeacherCourses")
}
```

**Key Changes:**
- ❌ Removed `dept` (single Dept field)
- ❌ Removed `semester` (moved to CourseDepartment)
- ✅ Added `departments` (many-to-many via CourseDepartment)
- ✅ Added `isTheory` / `isPractical` (from Excel T/P column)
- ✅ Added `startYear` / `endYear` (from Excel St_Yr / Fn_Yr)

### 4. New Model: CourseDepartment (Junction Table)

**New:**
```prisma
model CourseDepartment {
  id        Int      @id @default(autoincrement())
  courseId  Int
  dept      Dept
  semester  Int      // Semester can vary by department
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([courseId, dept])
  @@index([dept])
  @@index([semester])
}
```

**Purpose:**
- Handles many-to-many Course ↔ Department relationship
- Same course (e.g., "Applied Chemistry-I") can be offered to multiple departments
- Each department may offer the course in different semesters

**Example Data:**
```
Course: AC101 - Applied Chemistry-I
├─ CourseDepartment { dept: CO, semester: 1 }
├─ CourseDepartment { dept: EE, semester: 1 }
├─ CourseDepartment { dept: ME, semester: 1 }
├─ ... (11 departments total)
```

## Excel Data Analysis

### Course_File.xlsx Structure

| Column | Description | Maps To |
|--------|-------------|---------|
| Categ | Course category (DE, BS, OE, etc.) | Course.type |
| CrsN | Course number/code | Course.code |
| Br_Code | Department code (COBEA, EEBEA) | CourseDepartment.dept |
| Sem | Semester | CourseDepartment.semester |
| Title | Course title | Course.title |
| Credits | Credit hours | Course.credits |
| T/P | Theory or Practical | Course.isTheory / isPractical |
| St_Yr | Start year | Course.startYear |
| Fn_Yr | End year | Course.endYear |

**Key Finding:**
- 4,122 rows in Excel
- ~800-1,000 unique courses
- Same course appears multiple times (once per department)
- Example: "AC101" appears 11 times (offered to all 11 departments)

### St_file.xlsx Structure

| Column | Description | Maps To |
|--------|-------------|---------|
| F_No | Faculty Number (24AEBEA121) | StudentProfile.facultyNo |
| En_No | Enrollment Number (GQ0382) | StudentProfile.enrollNo |
| Name | Student name | User.name |
| Class | Class section | (Not stored) |
| Hall | Hostel hall | (Not stored) |

**Faculty Number Format:**
```
24AEBEA121
├─ 24:  Admission year (2024)
├─ AE:  Department code
├─ BEA: Degree suffix
└─ 121: Roll number
```

## API Query Changes Required

### Old Query Pattern:
```javascript
// Get courses for a department and semester
const courses = await prisma.course.findMany({
  where: {
    dept: 'CO',
    semester: 3
  }
});
```

### New Query Pattern:
```javascript
// Get courses for a department and semester
const courses = await prisma.course.findMany({
  where: {
    departments: {
      some: {
        dept: 'CO',
        semester: 3
      }
    }
  },
  include: {
    departments: {
      where: { dept: 'CO' }  // Filter joined departments
    }
  }
});
```

### Route Updates Needed:

**Files to update:**
- `server/routes/student.routes.js` - Course browsing/registration
- `server/routes/teacher.routes.js` - Course management
- `server/routes/admin.routes.js` - Course CRUD operations

**Common patterns:**
```javascript
// Get all courses for a department
include: {
  departments: {
    where: { dept: studentDept }
  }
}

// Check if student's dept matches course
const courseDepts = course.departments.map(cd => cd.dept);
const canRegister = courseDepts.includes(student.dept);

// Get courses by semester and dept
where: {
  departments: {
    some: {
      dept: dept,
      semester: semester
    }
  }
}
```

## Migration Path

### Recommended: Fresh Start
```bash
cd server
npx prisma migrate reset --force
node seedFromExcel.js
node seedStudents.js
```

**Advantages:**
- Clean database matching Excel
- No data migration complexity
- Guaranteed consistency

**Disadvantages:**
- Loses existing data
- Need to recreate admin/teacher users

### Alternative: Incremental Migration
```bash
cd server
npx prisma migrate dev --name add_many_to_many_course_departments_and_expand_enums
# Manual data migration script
node seedFromExcel.js  # Updates existing
node seedStudents.js   # Skips duplicates
```

## Files Created

1. **server/prisma/schema.prisma** - Updated schema
2. **server/seedFromExcel.js** - Course import script
3. **server/seedStudents.js** - Student import script
4. **server/EXCEL_IMPORT_GUIDE.md** - Detailed import instructions
5. **MIGRATION_PLAN.md** - Migration strategy document
6. **SCHEMA_CHANGES_SUMMARY.md** - This file

## Verification Checklist

After migration and import:

- [ ] All 4,122 course-dept mappings imported
- [ ] ~800-1,000 unique courses created
- [ ] 496 students created with correct departments
- [ ] Shared courses have multiple CourseDepartment entries
- [ ] CourseType distribution matches Excel categories
- [ ] Department codes match Excel Br_Code values
- [ ] Student semesters calculated correctly from F_No
- [ ] All students have default password (Student@123)

## Next Steps

1. **Run Migration & Import** (see EXCEL_IMPORT_GUIDE.md)
2. **Update API Routes** (use new query patterns)
3. **Test Frontend** (course browsing, registration)
4. **Create Admin/Teacher Users** (manual or script)
5. **Update CLAUDE.md** (reflect new schema in docs)

## Support

For questions or issues:
- See EXCEL_IMPORT_GUIDE.md for detailed instructions
- See MIGRATION_PLAN.md for migration strategies
- Check Prisma schema comments for field descriptions
