import { useState } from 'react'
import { useAuth } from './useAuth'
import type { TranscriptResponse } from '../types/video'

export function useTranscript() {
  const { session } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<TranscriptResponse | null>(null)

  async function fetchTranscript(youtubeUrl: string) {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ youtubeUrl }),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Failed to fetch transcript')
      }

      const result: TranscriptResponse = await res.json()
      setData(result)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { fetchTranscript, loading, error, data }
}
