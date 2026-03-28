export function parseYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export type RawSegment = {
  text: string
  offset: number
  duration: number
}

export async function fetchTranscript(youtubeId: string): Promise<RawSegment[]> {
  const mod = await import('youtube-transcript')
  const segments = await mod.YoutubeTranscript.fetchTranscript(youtubeId)
  return segments.map((s: { text: string; offset: number; duration: number }) => ({
    text: s.text,
    offset: s.offset / 1000,
    duration: s.duration / 1000,
  }))
}

export async function fetchVideoTitle(youtubeId: string): Promise<string> {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`
  const res = await fetch(url)
  if (!res.ok) return 'Untitled Video'
  const data = await res.json()
  return data.title ?? 'Untitled Video'
}
