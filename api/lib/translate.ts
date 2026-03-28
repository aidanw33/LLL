const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2'
const BATCH_SIZE = 100

export async function translateTexts(
  texts: string[],
  targetLang: string = 'en',
): Promise<string[]> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY
  if (!apiKey) throw new Error('GOOGLE_TRANSLATE_API_KEY is not set')

  const results: string[] = []

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    const res = await fetch(`${GOOGLE_TRANSLATE_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: batch,
        target: targetLang,
        format: 'text',
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Google Translate API error: ${err}`)
    }

    const data = await res.json()
    const translations = data.data.translations as {
      translatedText: string
      detectedSourceLanguage?: string
    }[]

    results.push(...translations.map((t) => t.translatedText))
  }

  return results
}

export async function detectLanguage(text: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY
  if (!apiKey) return null

  const res = await fetch(
    `https://translation.googleapis.com/language/translate/v2/detect?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text }),
    },
  )

  if (!res.ok) return null

  const data = await res.json()
  return data.data.detections?.[0]?.[0]?.language ?? null
}
