# Database Migration Plan

## Summary
Migrating from single-department courses to many-to-many relationship, expanding CourseType and Dept enums to match Excel data.

## Breaking Changes

### CourseType Enum
- **Removed**: `CORE`
- **Added**: `BS`, `ESA`, `DC`, `PC`, `PSI`, `AU`
- **Kept**: `DE`, `OE`, `HM`
- **Default changed**: `CORE` → `DC`

### Dept Enum
- **Removed**: `CS`, `CHE`, `PTK`, `FTB`
- **Added**: `CO`, `EL`, `CH`, `PK`, `FT`, `AR`, `VL`
- **Kept**: `ECE` (legacy), `AI`, `EE`, `ME`, `AE`, `CE`

### Schema Changes
- **Course** model:
  - Removed `dept` (Dept) field
  - Removed `semester` (Int) field
  - Added `isTheory` (Boolean)
  - Added `isPractical` (Boolean)
  - Added `startYear` (Int?)
  - Added `endYear` (Int?)
  - Added `departments` relation to `CourseDepartment[]`

- **New Model**: `CourseDepartment`
  - Junction table for many-to-many Course↔Dept
  - Fields: `id`, `courseId`, `dept`, `semester`
  - Unique constraint on `[courseId, dept]`

## Migration Steps

### Step 1: Data Mapping (Before Migration)
If you have existing courses, you need to map them:
```sql
-- Map old CourseType values
CORE → DC (Departmental Core)

-- Map old Dept values
CS → CO
CHE → CH
PTK → PK
FTB → FT
```

### Step 2: Run Migration
```bash
cd server
npx prisma migrate dev --name add_many_to_many_course_departments_and_expand_enums
```

### Step 3: Data Migration Script
After schema migration, run this to migrate existing courses to new structure:

```javascript
// migrateCourseData.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  // Get all existing courses (if any)
  const courses = await prisma.course.findMany();
  
  console.log(`Migrating ${courses.length} courses...`);
  
  for (const course of courses) {
    // Create CourseDepartment entry for each course's old dept
    await prisma.courseDepartment.create({
      data: {
        courseId: course.id,
        dept: mapOldDept(course.dept), // Map old dept codes
        semester: course.semester
      }
    });
  }
  
  console.log('Migration complete!');
}

function mapOldDept(oldDept) {
  const mapping = {
    'CS': 'CO',
    'CHE': 'CH',
    'PTK': 'PK',
    'FTB': 'FT'
  };
  return mapping[oldDept] || oldDept;
}

migrate().catch(console.error).finally(() => prisma.$disconnect());
```

### Step 4: Import Excel Data
Use the new seed script to import all course data:
```bash
cd server
node seedFromExcel.js
```

## Recommended: Fresh Start

Since you're importing from Excel anyway, **recommend dropping and recreating the database**:

```bash
cd server

# Drop and recreate
npx prisma migrate reset --force

# Run Excel import
node seedFromExcel.js
node seedStudents.js
```

This avoids complex data migrations and ensures clean data matching Excel files.

## Verification Queries

After migration:
```sql
-- Check courses with multiple departments
SELECT c.code, c.title, COUNT(cd.dept) as dept_count
FROM "Course" c
JOIN "CourseDepartment" cd ON c.id = cd."courseId"
GROUP BY c.id
ORDER BY dept_count DESC
LIMIT 10;

-- Check department distribution
SELECT cd.dept, COUNT(*) as course_count
FROM "CourseDepartment" cd
GROUP BY cd.dept
ORDER BY course_count DESC;
```
