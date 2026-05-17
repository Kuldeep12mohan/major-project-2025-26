-- Add unique constraint to Registration table
ALTER TABLE "Registration"
ADD CONSTRAINT "Registration_studentId_courseId_key"
UNIQUE ("studentId", "courseId");
