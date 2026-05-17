# Excel Data Import Guide

Complete guide to importing Course_File.xlsx and St_file.xlsx into the database.

## Overview

### What Changed
1. **CourseType Enum**: Expanded from 4 to 9 types (BS, ESA, DC, PC, DE, OE, PSI, AU, HM)
2. **Dept Enum**: Updated to match Excel codes (CO, EE, EL, AI, ME, AE, CE, CH, PK, FT, AR, VL)
3. **Course Model**: Now supports many-to-many relationship with departments via `CourseDepartment` junction table
4. **New Fields**: Added `isTheory`, `isPractical`, `startYear`, `endYear` to Course

### Data Sources
- **Course_File.xlsx**: 4,122 course-department mappings → ~800-1000 unique courses
- **St_file.xlsx**: 496 students with faculty numbers and enrollment numbers

## Prerequisites

```bash
cd server

# Make sure xlsx package is installed
npm install xlsx

# Make sure bcryptjs is installed (for student passwords)
npm install bcryptjs
```

## Step-by-Step Import Process

### Option 1: Fresh Start (Recommended)

If you want a clean database matching Excel data:

```bash
cd server

# 1. Reset database (WARNING: Deletes all data)
npx prisma migrate reset --force

# This will:
# - Drop the database
# - Recreate it
# - Run all migrations
# - Apply new schema

# 2. Import courses from Excel
node seedFromExcel.js

# Expected output:
# ✅ Created: ~800-1000 courses
# 📊 Course-Department mappings created
# 📈 Shows shared courses (like "Applied Chemistry-I" offered to 11 depts)

# 3. Import students from Excel
node seedStudents.js

# Expected output:
# ✅ Created: 496 students
# 📊 Shows distribution by department
# Default password: Student@123
```

### Option 2: Migrate Existing Data

If you have existing data to preserve:

```bash
cd server

# 1. Create migration (interactive mode)
npx prisma migrate dev --name add_many_to_many_course_departments_and_expand_enums

# You'll be prompted to handle enum changes
# Old values will need manual mapping:
# - CourseType: CORE → DC
# - Dept: CS → CO, CHE → CH, PTK → PK, FTB → FT

# 2. Run data migration (if needed)
# Create custom script to move old Course.dept → CourseDepartment

# 3. Import courses (will update existing)
node seedFromExcel.js

# 4. Import students (skips duplicates)
node seedStudents.js
```

## Import Scripts Explained

### seedFromExcel.js

**What it does:**
- Reads Course_File.xlsx
- Groups 4,122 rows by course code (since same course appears for multiple departments)
- Creates ~800-1000 unique Course records
- Creates CourseDepartment mappings (many-to-many)
- Maps Excel categories (DE, BS, OE, etc.) to database CourseType enum
- Maps Excel Br_Code (COBEA, EEBEA, etc.) to database Dept enum

**Key mappings:**
```javascript
Excel Category → Database CourseType
DE  → DE (Departmental Elective)
BS  → BS (Basic Science)
OE  → OE (Open Elective)
ESA → ESA (Engineering Science)
DC  → DC (Departmental Core)
PC  → PC (Professional Core)
PSI → PSI (Professional Skill)
AU  → AU (Audit)
HM  → HM (Humanities)

Excel Br_Code → Database Dept
COBEA → CO (Computer Science)
EEBEA → EE (Electrical Engineering)
AEBEA → AE (Aerospace)
etc.
```

**Output:**
```
📦 Starting Excel import...
Found 4122 course-department mappings in Excel
Grouped into 987 unique courses

✅ Import Complete!
📊 Results:
   Created: 987 courses
   
📈 Database Statistics:
Total courses: 987
Courses by type:
  BS: 245
  DC: 189
  DE: 156
  ...
  
Course-Department mappings:
  CH: 457 courses
  EE: 434 courses
  ...
  
Most shared courses:
  AC101 - Applied Chemistry-I (11 depts)
  AM101 - Applied Mathematics-I (11 depts)
  ...
```

### seedStudents.js

**What it does:**
- Reads St_file.xlsx
- Extracts department from faculty number (24AEBEA121 → AE)
- Calculates current semester from admission year (24 → 2024 → semester 2-3)
- Creates User + StudentProfile for each student
- Generates email: enrollmentNo@student.university.edu
- Sets default password: Student@123 (hashed with bcrypt)

**Faculty Number Format:**
```
24AEBEA121
├─ 24:  Year (2024)
├─ AE:  Department Code
├─ BEA: Degree suffix
└─ 121: Roll number
```

**Output:**
```
👥 Starting student import...
Found 496 students in Excel

✅ Student Import Complete!
📊 Results:
   Created: 496 students
   
📈 Student Statistics:
Total students: 496

Students by department:
  ME: 94 students
  CE: 66 students
  EE: 58 students
  ...
  
Students by semester:
  Semester 2: 496 students (all from 2024 batch)
  
📝 Note: All students have default password: Student@123
```

## Verification Queries

After import, verify the data:

```sql
-- Check many-to-many mappings
SELECT c.code, c.title, COUNT(cd.dept) as dept_count
FROM "Course" c
JOIN "CourseDepartment" cd ON c.id = cd."courseId"
GROUP BY c.id
ORDER BY dept_count DESC
LIMIT 10;

-- Check course types distribution
SELECT type, COUNT(*) as count
FROM "Course"
GROUP BY type
ORDER BY count DESC;

-- Check departments
SELECT dept, COUNT(*) as count
FROM "CourseDepartment"
GROUP BY dept
ORDER BY count DESC;

-- Check student distribution
SELECT dept, COUNT(*) as count
FROM "StudentProfile"
GROUP BY dept
ORDER BY count DESC;

-- Sample shared course details
SELECT c.code, c.title, c.type, cd.dept, cd.semester
FROM "Course" c
JOIN "CourseDepartment" cd ON c.id = cd."courseId"
WHERE c.code = 'AC101'
ORDER BY cd.dept;
```

## Troubleshooting

### Issue: Migration fails with enum value errors
**Solution:** Use Option 1 (Fresh Start) or manually update existing records first

### Issue: "Unknown Br_Code" warnings
**Solution:** Check DEPT_MAP in seedFromExcel.js, add missing mappings

### Issue: Duplicate student errors
**Solution:** Script automatically skips duplicates. Check errors array in output.

### Issue: Students have wrong semester
**Solution:** Adjust calculateSemester() function based on your academic calendar

## Next Steps

After successful import:

1. **Create Admin Users**
   ```bash
   node utils/seed.js  # If you have admin seed script
   ```

2. **Create Teacher Users**
   - Manually via admin dashboard, or
   - Create seedTeachers.js similar to seedStudents.js

3. **Assign Teachers to Courses**
   - Via admin interface
   - Or create script to bulk assign

4. **Test Registration Flow**
   - Student creates TempRegistration
   - Teacher verifies
   - Admin approves

5. **Update Frontend**
   - Ensure frontend queries include CourseDepartment joins
   - Update course filtering by department

## API Query Updates Needed

Frontend queries need updates for the new structure:

```javascript
// OLD: Course has single dept field
const courses = await prisma.course.findMany({
  where: { dept: 'CO', semester: 3 }
});

// NEW: Course has many departments via CourseDepartment
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
    departments: true  // Include dept-semester mappings
  }
});
```

Update all route handlers in `server/routes/` accordingly.

## Summary

✅ **Database Schema**: Updated with many-to-many Course↔Dept, expanded enums
✅ **Course Import**: 4,122 mappings → ~1,000 courses with dept relationships  
✅ **Student Import**: 496 students with auto-calculated semesters
✅ **Ready**: Database ready for registration system testing

**Default Credentials:**
- All students: `enrollNo@student.university.edu` / `Student@123`
- Update passwords after first login
