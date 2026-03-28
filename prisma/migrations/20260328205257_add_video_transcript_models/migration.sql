-- CreateTable
CREATE TABLE "videos" (
    "id" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "language" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcript_segments" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "startTime" DOUBLE PRECISION NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "originalText" TEXT NOT NULL,
    "translatedText" TEXT NOT NULL,
    "segmentIndex" INTEGER NOT NULL,

    CONSTRAINT "transcript_segments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "videos_youtubeId_key" ON "videos"("youtubeId");

-- CreateIndex
CREATE INDEX "transcript_segments_videoId_segmentIndex_idx" ON "transcript_segments"("videoId", "segmentIndex");

-- AddForeignKey
ALTER TABLE "transcript_segments" ADD CONSTRAINT "transcript_segments_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
