-- CreateEnum
CREATE TYPE "SlotSource" AS ENUM ('MANUAL', 'TEMPLATE');

-- AlterTable
ALTER TABLE "TimeSlot" ADD COLUMN     "source" "SlotSource" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "templateId" TEXT;
