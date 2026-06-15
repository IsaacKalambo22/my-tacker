-- CreateEnum
CREATE TYPE "SubjectStatus" AS ENUM ('NotStarted', 'InProgress', 'Paused', 'Completed');

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "category" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "difficulty" TEXT,
ADD COLUMN     "status" "SubjectStatus" NOT NULL DEFAULT 'NotStarted';
