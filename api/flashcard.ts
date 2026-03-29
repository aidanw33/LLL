import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './lib/prisma.js'
import { translateTexts } from './lib/translate.js'
import { verifyAuth } from './lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await verifyAuth(req)
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    const videoId = req.query.videoId as string | undefined
    const language = req.query.language as string | undefined
    const comfortLevel = req.query.comfortLevel
      ? parseInt(req.query.comfortLevel as string, 10)
      : undefined

    const flashcards = await prisma.flashcard.findMany({
      where: {
        userId,
        ...(videoId && { videoId }),
        ...(comfortLevel && { comfortLevel }),
        ...(language && { video: { language } }),
      },
      include: { video: { select: { title: true, language: true, youtubeId: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json({ flashcards })
  }

  if (req.method === 'POST') {
    const { videoId, originalText, translatedText, comfortLevel } = req.body as {
      videoId?: string
      originalText?: string
      translatedText?: string
      comfortLevel?: number
    }

    if (!videoId || !originalText || !comfortLevel) {
      return res.status(400).json({ error: 'videoId, originalText, and comfortLevel are required' })
    }

    if (comfortLevel < 1 || comfortLevel > 4) {
      return res.status(400).json({ error: 'comfortLevel must be between 1 and 4' })
    }

    let finalTranslation = translatedText
    if (!finalTranslation) {
      try {
        const [translated] = await translateTexts([originalText])
        finalTranslation = translated
      } catch {
        return res.status(500).json({ error: 'Translation failed' })
      }
    }

    const flashcard = await prisma.flashcard.create({
      data: {
        userId,
        videoId,
        originalText,
        translatedText: finalTranslation,
        comfortLevel,
      },
    })

    return res.status(200).json({ flashcard })
  }

  if (req.method === 'PATCH') {
    const { id, translatedText, comfortLevel } = req.body as {
      id?: string
      translatedText?: string
      comfortLevel?: number
    }

    if (!id) {
      return res.status(400).json({ error: 'id is required' })
    }

    if (comfortLevel !== undefined && (comfortLevel < 1 || comfortLevel > 4)) {
      return res.status(400).json({ error: 'comfortLevel must be between 1 and 4' })
    }

    const existing = await prisma.flashcard.findFirst({ where: { id, userId } })
    if (!existing) {
      return res.status(404).json({ error: 'Flashcard not found' })
    }

    const flashcard = await prisma.flashcard.update({
      where: { id },
      data: {
        ...(translatedText !== undefined && { translatedText }),
        ...(comfortLevel !== undefined && { comfortLevel, lastReviewedAt: new Date() }),
      },
    })

    return res.status(200).json({ flashcard })
  }

  if (req.method === 'DELETE') {
    const id = req.query.id as string
    if (!id) {
      return res.status(400).json({ error: 'id is required' })
    }

    const existing = await prisma.flashcard.findFirst({ where: { id, userId } })
    if (!existing) {
      return res.status(404).json({ error: 'Flashcard not found' })
    }

    await prisma.flashcard.delete({ where: { id } })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
