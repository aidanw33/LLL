import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './lib/prisma.js'
import { parseYouTubeId, fetchTranscript, fetchVideoTitle } from './lib/youtube.js'
import { translateTexts } from './lib/translate.js'
import { verifyAuth } from './lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const userId = await verifyAuth(req)
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { youtubeUrl, lang } = req.body as { youtubeUrl?: string; lang?: string }
  if (!youtubeUrl) {
    return res.status(400).json({ error: 'youtubeUrl is required' })
  }
  if (!lang) {
    return res.status(400).json({ error: 'lang is required' })
  }

  const youtubeId = parseYouTubeId(youtubeUrl)
  if (!youtubeId) {
    return res.status(400).json({ error: 'Invalid YouTube URL' })
  }

  // Check cache
  const existing = await prisma.video.findUnique({
    where: { youtubeId },
    include: { segments: { orderBy: { segmentIndex: 'asc' } } },
  })

  if (existing) {
    await prisma.userVideo.upsert({
      where: { userId_videoId: { userId, videoId: existing.id } },
      create: { userId, videoId: existing.id },
      update: {},
    })
    return res.status(200).json({ video: existing, segments: existing.segments })
  }

  // Fetch transcript
  let rawSegments
  try {
    rawSegments = await fetchTranscript(youtubeId, lang)
  } catch (err) {
    console.error('fetchTranscript failed:', err)
    return res.status(404).json({ error: 'No captions available for this video' })
  }

  if (rawSegments.length === 0) {
    return res.status(404).json({ error: 'No captions available for this video' })
  }

  // Translate all segments
  const originalTexts = rawSegments.map((s) => s.text)
  let translatedTexts: string[]
  try {
    translatedTexts = await translateTexts(originalTexts)
  } catch {
    return res.status(500).json({ error: 'Translation failed' })
  }

  // Fetch video title
  const title = await fetchVideoTitle(youtubeId)

  // Store in database
  const video = await prisma.video.create({
    data: {
      youtubeId,
      title,
      language: lang,
      segments: {
        create: rawSegments.map((seg, i) => ({
          startTime: seg.offset,
          duration: seg.duration,
          originalText: seg.text,
          translatedText: translatedTexts[i],
          segmentIndex: i,
        })),
      },
      users: {
        create: { userId },
      },
    },
    include: { segments: { orderBy: { segmentIndex: 'asc' } } },
  })

  return res.status(200).json({ video, segments: video.segments })
}
