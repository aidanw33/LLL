import type { VercelRequest, VercelResponse } from '@vercel/node'
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

  const { text } = req.body as { text?: string }
  if (!text) {
    return res.status(400).json({ error: 'text is required' })
  }

  try {
    const [translatedText] = await translateTexts([text])
    return res.status(200).json({ translatedText })
  } catch {
    return res.status(500).json({ error: 'Translation failed' })
  }
}
