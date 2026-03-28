export type Video = {
  id: string
  youtubeId: string
  title: string
  language: string | null
  createdAt: string
}

export type TranscriptSegment = {
  id: string
  videoId: string
  startTime: number
  duration: number
  originalText: string
  translatedText: string
  segmentIndex: number
}

export type TranscriptResponse = {
  video: Video
  segments: TranscriptSegment[]
}
