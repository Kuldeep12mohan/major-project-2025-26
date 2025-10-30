-- CreateTable
CREATE TABLE "RegistrationStatus" (
    "id" SERIAL NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "updatedBy" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistrationStatus_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RegistrationStatus" ADD CONSTRAINT "RegistrationStatus_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "AdminProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
