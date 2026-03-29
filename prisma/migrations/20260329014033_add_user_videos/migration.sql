-- CreateTable
CREATE TABLE "user_videos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_videos_userId_idx" ON "user_videos"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_videos_userId_videoId_key" ON "user_videos"("userId", "videoId");

-- AddForeignKey
ALTER TABLE "user_videos" ADD CONSTRAINT "user_videos_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
