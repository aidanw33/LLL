import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './lib/prisma.js'
import { parseYouTubeId, fetchTranscript, fetchVideoTitle } from './lib/youtube.js'
import { translateTexts, detectLanguage } from './lib/translate.js'
import { verifyAuth } from './lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const userId = await verifyAuth(req)
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { youtubeUrl } = req.body as { youtubeUrl?: string }
  if (!youtubeUrl) {
    return res.status(400).json({ error: 'youtubeUrl is required' })
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
    return res.status(200).json({ video: existing, segments: existing.segments })
  }

  // Fetch transcript
  let rawSegments
  try {
    rawSegments = await fetchTranscript(youtubeId)
  } catch {
    return res.status(404).json({ error: 'No captions available for this video' })
  }

  if (rawSegments.length === 0) {
    return res.status(404).json({ error: 'No captions available for this video' })
  }

  // Detect language from first few segments
  const sampleText = rawSegments.slice(0, 5).map((s) => s.text).join(' ')
  const language = await detectLanguage(sampleText)

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
      language,
      segments: {
        create: rawSegments.map((seg, i) => ({
          startTime: seg.offset,
          duration: seg.duration,
          originalText: seg.text,
          translatedText: translatedTexts[i],
          segmentIndex: i,
        })),
      },
    },
    include: { segments: { orderBy: { segmentIndex: 'asc' } } },
  })

  return res.status(200).json({ video, segments: video.segments })
}
