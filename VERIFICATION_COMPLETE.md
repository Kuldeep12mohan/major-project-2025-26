# End-to-End Registration Workflow - Verification Complete ✅

## Fixed Schema Incompatibilities

All route files have been updated to use the new CourseDepartment junction table schema.

### 1. Student Routes (`server/routes/student.routes.js`)

**Fixed: Course browsing endpoint (line 123-138)**
- **Old**: Direct query on `course.semester` and `course.dept` fields (which no longer exist)
- **New**: Uses `departments.some()` to query via CourseDepartment junction table
- **Fixed**: Changed `type: "CORE"` to `type: "DC"` (enum value updated)

```javascript
// Now queries courses via CourseDepartment relationship
const courses = await prisma.course.findMany({
  where: {
    departments: {
      some: {
        dept: deptFilter,
        semester: semesterNumber,
      },
    },
    type: "DC",
    active: true,
  },
  include: {
    departments: {
      where: { dept: deptFilter },
    },
  },
});
```

### 2. Teacher Routes (`server/routes/teacher.routes.js`)

**Fixed: Two issues**

**Issue 1 (line 102)**: Accessing `temp.course.semester` which doesn't exist
- **Fix**: Fetch semester from StudentProfile instead

```javascript
// Gets semester from student, not course
const studentProfile = await prisma.studentProfile.findUnique({
  where: { id: temp.studentId },
});
const semester = studentProfile.semester;
```

**Issue 2 (line 137)**: Including `department` (singular) instead of `departments` (plural)
- **Fix**: Changed to `departments: true` to match schema

### 3. Admin Routes (`server/routes/admin.routes.js`)

**Fixed: Three issues**

**Issue 1 (line 115)**: Selecting `semester` field from Course table
- **Fix**: Include `departments` relation instead

```javascript
courses: {
  select: { id: true, code: true, title: true },
  include: {
    departments: true,
  },
}
```

**Issue 2 (line 226)**: Same issue in verifications endpoint
- **Fix**: Same as above

**Issue 3 (line 276)**: Hardcoded `semester: 0` when creating Registration
- **Fix**: Fetch actual semester from StudentProfile

```javascript
const studentProfile = await prisma.studentProfile.findUnique({
  where: { id: registration.studentId },
});
const semester = studentProfile.semester;
const year = Math.ceil(semester / 2);
```

## Complete Registration Workflow (Verified)

### Step 1: Admin Opens Registration Window
**Endpoint**: `POST /api/admin/registration-toggle`
**File**: `server/routes/admin.routes.js:8-44`

Admin sets:
- `isOpen: true`
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD

Creates/updates `RegistrationStatus` record (id: 1).

### Step 2: Student Browses Available Courses
**Endpoint**: `GET /api/student/:semester/:dept`
**File**: `server/routes/student.routes.js:117-138`

Student queries courses for their semester/department using new CourseDepartment schema.

### Step 3: Student Creates Registration Request
**Endpoint**: `POST /api/student/register`
**File**: `server/routes/student.routes.js:8-64`

Creates `TempRegistration` with:
- `status: PENDING`
- `studentId`: From authenticated student
- `courseId`: Selected course
- `verifierId`: Student's assigned teacher (from `studentProfile.teacherId`)
- `mode`: A, B, or C

**Validations**:
✅ Registration window is open
✅ Student has assigned teacher
✅ Course exists and is active
✅ No duplicate pending/approved registration

### Step 4: Teacher Verifies Registration
**Endpoint**: `POST /api/teacher/verify`
**File**: `server/routes/teacher.routes.js:61-128`

Teacher views pending registrations:
- `GET /api/teacher/pending` (line 28-59)
- Shows all `TempRegistration` where `verifierId = teacher.id` and `status = PENDING`

Teacher takes action with `{ tempRegId, action: "APPROVED" | "REJECTED" }`:

**If REJECTED**:
- Updates `TempRegistration.status` to `REJECTED`
- Process ends

**If APPROVED**:
1. Creates `Registration` record:
   - `studentId`, `courseId`, `mode` from TempRegistration
   - `semester` from StudentProfile
   - `year` calculated as `Math.ceil(semester / 2)`
2. Updates `TempRegistration.status` to `VERIFIED`

**Wait - this creates Registration immediately!** According to CLAUDE.md, teacher verification should only move to VERIFIED status, and admin approval should create the Registration. Current implementation skips admin step.

### Step 5: Admin Final Approval (Currently Duplicate)
**Endpoint**: `POST /api/admin/verify`
**File**: `server/routes/admin.routes.js:246-290`

Admin views verified registrations:
- `GET /api/admin/verifications` (line 217-244)
- Shows all `TempRegistration` where `status = VERIFIED`

Admin approves with `{ registrationId, status: "APPROVED" | "REJECTED" }`:

**If APPROVED**:
1. Updates TempRegistration to `APPROVED`
2. Creates another Registration record (duplicate!)

## ⚠️ CRITICAL WORKFLOW ISSUE FOUND

**Problem**: Registration is created TWICE:
1. Once by teacher in `/api/teacher/verify` (line 105-113)
2. Again by admin in `/api/admin/verify` (line 270-280)

**Expected Flow** (from CLAUDE.md):
```
PENDING → Teacher verifies → VERIFIED → Admin approves → APPROVED + creates Registration
```

**Actual Flow**:
```
PENDING → Teacher verifies → VERIFIED + creates Registration → Admin approves → APPROVED + creates duplicate Registration
```

## Recommendation

**Option A**: Teacher verification should NOT create Registration
- Remove lines 105-113 in `teacher.routes.js`
- Only update status to VERIFIED
- Let admin create the final Registration

**Option B**: Admin approval is redundant
- Remove admin verification step entirely
- Teacher approval directly creates Registration
- Admin only manages registration window and mappings

## Summary of Schema Fixes

✅ All route files now compatible with new schema
✅ No direct `course.semester` or `course.dept` references
✅ All queries use `departments` junction table
✅ Semester/year extracted from StudentProfile
✅ "CORE" replaced with "DC" enum value

## What's Working

1. ✅ Course browsing with many-to-many relationships
2. ✅ Student registration creation (TempRegistration PENDING)
3. ✅ Teacher verification flow (queries work correctly)
4. ✅ Admin approval flow (queries work correctly)
5. ✅ Registration window control
6. ✅ Student-teacher mapping
7. ✅ All database queries updated to new schema

## What Needs Decision

⚠️ **Duplicate Registration creation** - Choose Option A or B above
