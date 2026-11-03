-- DropIndex
DROP INDEX "ReadEvent_workId_createdAt_idx";

-- AlterTable
ALTER TABLE "ReadEvent" ADD COLUMN     "chapterIndex" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Work" ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "VisitorDay" (
    "day" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "userId" TEXT,
    "reading" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VisitorDay_pkey" PRIMARY KEY ("day","visitorId")
);

-- CreateIndex
CREATE INDEX "VisitorDay_visitorId_day_idx" ON "VisitorDay"("visitorId", "day");

-- CreateIndex
CREATE INDEX "ReadEvent_workId_chapterIndex_createdAt_idx" ON "ReadEvent"("workId", "chapterIndex", "createdAt");

-- Tales published before publishedAt existed: use their creation date.
UPDATE "Work" SET "publishedAt" = "createdAt" WHERE "status" = 'published' AND "publishedAt" IS NULL;
