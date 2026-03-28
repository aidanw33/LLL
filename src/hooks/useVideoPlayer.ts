import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { YouTubePlayerHandle } from '../components/video/YouTubeEmbed'
import type { TranscriptSegment } from '../types/video'

export function useVideoPlayer(segments: TranscriptSegment[]) {
  const playerRef = useRef<YouTubePlayerHandle>(null)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (!playerRef.current) return
      if (playerRef.current.getPlayerState() === YT.PlayerState.PLAYING) {
        setCurrentTime(playerRef.current.getCurrentTime())
      }
    }, 200)

    return () => clearInterval(interval)
  }, [])

  const activeSegmentIndex = useMemo(() => {
    if (segments.length === 0) return -1

    // Binary search for the active segment
    let low = 0
    let high = segments.length - 1
    let result = -1

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      if (segments[mid].startTime <= currentTime) {
        result = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }

    // Verify the segment hasn't ended
    if (
      result >= 0 &&
      currentTime > segments[result].startTime + segments[result].duration
    ) {
      return -1
    }

    return result
  }, [currentTime, segments])

  const seekTo = useCallback((time: number) => {
    playerRef.current?.seekTo(time)
    setCurrentTime(time)
  }, [])

  return { playerRef, currentTime, activeSegmentIndex, seekTo }
}
