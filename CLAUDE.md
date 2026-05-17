# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Course Registration Portal - A full-stack web application for university course registration with role-based access control (Student, Teacher, Admin). Built with React + Vite frontend and Express + Prisma backend using PostgreSQL.

## Architecture

### Tech Stack
- **Frontend**: React 19, Vite, TailwindCSS 4, React Router DOM, Axios
- **Backend**: Express 5, Prisma ORM, PostgreSQL
- **Auth**: JWT tokens stored in HTTP-only cookies
- **Email**: Nodemailer for password reset functionality

### Project Structure

```
major-project-2025-26/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/          # Role-based pages (admin/, student/, teacher/)
│   │   ├── utils/          # Frontend utilities
│   │   └── App.jsx         # Main routing component
│   └── package.json
│
├── server/                 # Express backend
│   ├── routes/             # API routes by role (auth, admin, student, teacher)
│   ├── middleware/         # JWT auth middleware (verifyToken, verifyAdmin, verifyTeacher, verifyStudent)
│   ├── prisma/             # Database schema and migrations
│   │   └── schema.prisma   # Prisma schema defining all models
│   ├── utils/              # Backend utilities and seed scripts
│   ├── extractCourses.py   # Python script to extract courses from PDFs
│   ├── seedCourses.js      # Seeds database from courses_data.json
│   ├── courses_data.json   # Course catalog data
│   └── index.js            # Express server entry point
```

### Database Architecture (Prisma Schema)

**Core Models:**
- **User**: Base user model with role (STUDENT, TEACHER, ADMIN)
- **StudentProfile**: Links to User, contains enrollNo, facultyNo, semester, dept, optional teacherId
- **TeacherProfile**: Links to User, contains employeeId, designation, dept, teaches courses
- **AdminProfile**: Links to User, contains adminId

**Course Registration Flow:**
- **Course**: Course catalog with code, title, type, credits, isTheory/isPractical
  - Many-to-many with departments via **CourseDepartment** junction table
  - Same course can be offered to multiple departments (e.g., "Applied Chemistry-I" → 11 depts)
- **CourseDepartment**: Maps courses to departments with semester info
  - Unique constraint on [courseId, dept]
  - Allows same course in different semesters per department
- **TempRegistration**: Pending registrations with status (PENDING → VERIFIED → APPROVED/REJECTED)
  - Students create temp registrations
  - Teachers verify (set verifierId, status to VERIFIED)
  - Admins approve (set adminId, status to APPROVED)
- **Registration**: Final approved course registrations
- **RegistrationStatus**: Global flag controlling when registration is open (isOpen, startDate, endDate)

**Key Enums:**
- `Role`: ADMIN, TEACHER, STUDENT
- `CourseType`: BS (Basic Science), ESA (Engineering Science), DC (Dept Core), PC (Professional Core), DE (Dept Elective), OE (Open Elective), PSI (Professional Skill), AU (Audit), HM (Humanities)
- `RegStatus`: PENDING, VERIFIED, APPROVED, REJECTED
- `Mode`: A, B, C (course sections)
- `Dept`: CO (Computer), EE (Electrical), ECE (Electronics & Comm), EL (Electronics), AI, ME (Mechanical), AE (Aerospace), CE (Civil), CH (Chemical), PK (Petroleum), FT (Food Tech), AR (Architecture), VL (VLSI)

### API Structure

Routes are organized by role:
- `/api/auth/*` - Authentication (login, signup, password reset)
- `/api/admin/*` - Admin operations (protected by verifyAdmin)
- `/api/student/*` - Student operations (protected by verifyStudent)
- `/api/teacher/*` - Teacher operations (protected by verifyTeacher)

### Authentication Flow

1. JWT tokens stored in HTTP-only cookies named `accessToken`
2. Middleware chain: `verifyToken` → role-specific middleware
3. `req.user` contains full user object with profile relations after auth
4. Password reset via email tokens using Nodemailer + Gmail SMTP

## Development Commands

### Database Setup

```bash
# Navigate to server directory
cd server

# Setup .env file first (copy from .env.example)
# Required: DATABASE_URL, JWT_SECRET, CLIENT_URL, SMTP_* vars

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Import data from Excel files (Course_File.xlsx + St_file.xlsx)
node seedFromExcel.js    # Imports ~1000 courses with dept mappings
node seedStudents.js      # Imports 496 students (default password: Student@123)
```

### Running Development Servers

**Backend:**
```bash
cd server
npm run dev        # Starts nodemon on port 5000 (or PORT env var)
```

**Frontend:**
```bash
cd client
npm install
npm run dev        # Starts Vite dev server (default port 5173)
```

### Production Build

**Frontend:**
```bash
cd client
npm run build      # Builds to client/dist/
npm run preview    # Preview production build
```

**Backend:**
```bash
cd server
npm start          # Production mode with node (no auto-reload)
```

### Database Management

```bash
cd server

# Open Prisma Studio (database GUI)
npx prisma studio

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View current schema state
npx prisma db pull
```

## Key Implementation Notes

### Course Data Pipeline

1. Excel files in `server/data/`: Course_File.xlsx (4,122 rows) and St_file.xlsx (496 rows)
2. Run `node seedFromExcel.js` to import courses with many-to-many dept relationships
3. Run `node seedStudents.js` to import student data with auto-calculated semesters
4. See `server/EXCEL_IMPORT_GUIDE.md` for detailed instructions

### Registration Workflow

1. **Admin**: Controls global registration window via RegistrationStatus
2. **Student**: Creates TempRegistration (status: PENDING)
3. **Teacher**: Verifies student registrations (status: VERIFIED)
4. **Admin**: Approves verified registrations → creates Registration record

### Frontend Routing

- Role-based dashboards: `/admin`, `/student`, `/teacher`
- Auth pages: Student and Teacher have separate auth pages; Admin has dedicated login
- Protected routes check user role in App.jsx

### Middleware Usage

Always use role-specific middleware on protected routes:
```javascript
router.get("/protected", verifyStudent, handler);  // Student only
router.post("/verify", verifyTeacher, handler);     // Teacher only
router.put("/approve", verifyAdmin, handler);       // Admin only
```

### CORS Configuration

Server accepts credentials with `origin: true` for development. Update for production with specific CLIENT_URL.

## Common Development Tasks

**Query courses for a department:**
```javascript
// Use CourseDepartment join for many-to-many relationship
const courses = await prisma.course.findMany({
  where: {
    departments: {
      some: { dept: 'CO', semester: 3 }
    }
  },
  include: {
    departments: { where: { dept: 'CO' } }
  }
});
```

**Add new API endpoint:**
1. Add route handler to appropriate file in `server/routes/`
2. Use role-specific middleware for protection
3. Access user info via `req.user` (populated by verifyToken)
4. For course queries, always use `departments` relation (not direct dept field)

**Add new database model:**
1. Update `server/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive_name`
3. Prisma Client auto-updates after migration

**Add new frontend page:**
1. Create component in `client/src/pages/[role]/`
2. Add route in `client/src/App.jsx`
3. Use axios with `withCredentials: true` for authenticated requests

**Update course/student data:**
1. Update Excel files in `server/data/`
2. Re-run `node seedFromExcel.js` (updates existing courses)
3. Re-run `node seedStudents.js` (skips duplicate students)

## Environment Variables

**server/.env (see .env.example):**
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT signing
- `CLIENT_URL`: Frontend URL for CORS
- `SMTP_*`: Gmail SMTP config for password reset emails
- `EMAIL_FROM`: Email sender address

**client:** No env vars required; API URL should be configured in utils if not using relative paths
