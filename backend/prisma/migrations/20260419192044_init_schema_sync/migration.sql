/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('GENERAL', 'MEDICATION', 'EXAM');

-- CreateEnum
CREATE TYPE "ReminderFrequencyUnit" AS ENUM ('HOURS', 'DAYS', 'WEEKS');

-- CreateEnum
CREATE TYPE "ReminderLogStatus" AS ENUM ('PENDING', 'COMPLETED', 'SKIPPED');

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'America/Santiago';

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "updatedByUserId" TEXT,
    "type" "ReminderType" NOT NULL,
    "name" TEXT NOT NULL,
    "timeOfDay" TEXT NOT NULL,
    "dosageAmount" TEXT,
    "frequencyEvery" INTEGER NOT NULL,
    "frequencyUnit" "ReminderFrequencyUnit" NOT NULL,
    "startsOn" TIMESTAMP(3) NOT NULL,
    "untilOn" TIMESTAMP(3),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminder_logs" (
    "id" TEXT NOT NULL,
    "reminderId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "status" "ReminderLogStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "skipReason" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminder_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reminders_patientId_isActive_idx" ON "reminders"("patientId", "isActive");

-- CreateIndex
CREATE INDEX "reminders_patientId_type_idx" ON "reminders"("patientId", "type");

-- CreateIndex
CREATE INDEX "reminders_patientId_startsOn_untilOn_idx" ON "reminders"("patientId", "startsOn", "untilOn");

-- CreateIndex
CREATE INDEX "reminder_logs_patientId_scheduledFor_idx" ON "reminder_logs"("patientId", "scheduledFor" DESC);

-- CreateIndex
CREATE INDEX "reminder_logs_reminderId_scheduledFor_idx" ON "reminder_logs"("reminderId", "scheduledFor" DESC);

-- CreateIndex
CREATE INDEX "reminder_logs_status_scheduledFor_idx" ON "reminder_logs"("status", "scheduledFor");

-- CreateIndex
CREATE UNIQUE INDEX "reminder_logs_reminderId_scheduledFor_key" ON "reminder_logs"("reminderId", "scheduledFor");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_logs" ADD CONSTRAINT "reminder_logs_reminderId_fkey" FOREIGN KEY ("reminderId") REFERENCES "reminders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_logs" ADD CONSTRAINT "reminder_logs_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_logs" ADD CONSTRAINT "reminder_logs_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
