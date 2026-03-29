-- CreateTable
CREATE TABLE "translation_logs" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "usedGoogleApi" BOOLEAN NOT NULL,
    "characterCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "translation_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "translation_logs" ADD CONSTRAINT "translation_logs_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
