-- AlterTable patient_guardians: invitation fields
ALTER TABLE "patient_guardians"
  ADD COLUMN "invitationToken" TEXT,
  ADD COLUMN "invitationExpiresAt" TIMESTAMP(3),
  ADD COLUMN "invitedAt" TIMESTAMP(3),
  ADD COLUMN "acceptedAt" TIMESTAMP(3),
  ADD COLUMN "rejectedAt" TIMESTAMP(3),
  ADD COLUMN "revokedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "patient_guardians_invitationToken_key" ON "patient_guardians"("invitationToken");
CREATE INDEX "patient_guardians_patientId_isActive_idx" ON "patient_guardians"("patientId", "isActive");

-- CreateEnum
CREATE TYPE "MedicalHistorySource" AS ENUM ('APPOINTMENT', 'MANUAL');
CREATE TYPE "MedicalHistoryType" AS ENUM ('DIAGNOSIS', 'CONCLUSION', 'FOLLOW_UP', 'PATIENT_NOTE', 'EXAM', 'PRESCRIPTION', 'OTHER');

-- CreateTable medical_history_entries
CREATE TABLE "medical_history_entries" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "source" "MedicalHistorySource" NOT NULL,
    "type" "MedicalHistoryType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "appointmentId" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "updatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "medical_history_entries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "medical_history_entries_patientId_occurredAt_idx" ON "medical_history_entries"("patientId", "occurredAt" DESC);
CREATE INDEX "medical_history_entries_patientId_source_idx" ON "medical_history_entries"("patientId", "source");
CREATE INDEX "medical_history_entries_patientId_type_idx" ON "medical_history_entries"("patientId", "type");
CREATE INDEX "medical_history_entries_appointmentId_idx" ON "medical_history_entries"("appointmentId");

-- CreateTable medical_history_attachments
CREATE TABLE "medical_history_attachments" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileMimeType" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "s3Bucket" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "uploadedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "medical_history_attachments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "medical_history_attachments_s3Key_key" ON "medical_history_attachments"("s3Key");
CREATE INDEX "medical_history_attachments_entryId_idx" ON "medical_history_attachments"("entryId");

-- Foreign keys
ALTER TABLE "medical_history_entries"
  ADD CONSTRAINT "medical_history_entries_patientId_fkey"
  FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "medical_history_entries"
  ADD CONSTRAINT "medical_history_entries_appointmentId_fkey"
  FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "medical_history_entries"
  ADD CONSTRAINT "medical_history_entries_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

ALTER TABLE "medical_history_entries"
  ADD CONSTRAINT "medical_history_entries_updatedByUserId_fkey"
  FOREIGN KEY ("updatedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "medical_history_attachments"
  ADD CONSTRAINT "medical_history_attachments_entryId_fkey"
  FOREIGN KEY ("entryId") REFERENCES "medical_history_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "medical_history_attachments"
  ADD CONSTRAINT "medical_history_attachments_uploadedByUserId_fkey"
  FOREIGN KEY ("uploadedByUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
