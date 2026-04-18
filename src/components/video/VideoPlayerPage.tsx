import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useVideoPlayer } from '../../hooks/useVideoPlayer'
import { YouTubeEmbed } from './YouTubeEmbed'
import { TranscriptPanel } from './TranscriptPanel'
import { FlashcardPanel } from './FlashcardPanel'
import { BackHeader } from '../layout/BackHeader'
import { LoadingScreen } from '../LoadingScreen'
import { supabase } from '../../lib/supabase'
import { Lou } from '../brand/Lou'
import type { TranscriptSegment, Video } from '../../types/video'

export function VideoPlayerPage() {
  const { videoId } = useParams<{ videoId: string }>()
  const navigate = useNavigate()
  const [video, setVideo] = useState<Video | null>(null)
  const [segments, setSegments] = useState<TranscriptSegment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedWords, setSelectedWords] = useState<string | null>(null)

  useEffect(() => {
    if (!videoId) return

    async function loadVideo() {
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single()

      if (videoError || !videoData) {
        setError('Video not found')
        setLoading(false)
        return
      }

      const { data: segmentData } = await supabase
        .from('transcript_segments')
        .select('*')
        .eq('videoId', videoId)
        .order('segmentIndex', { ascending: true })

      setVideo(videoData)
      setSegments(segmentData ?? [])
      setLoading(false)
    }

    loadVideo()
  }, [videoId])

  const { playerRef, activeSegmentIndex, seekTo } = useVideoPlayer(segments)

  const onPlayerReady = useCallback(() => {}, [])

  const handleWordsSelected = useCallback((words: string | null) => {
    setSelectedWords(words)
  }, [])

  const handleFlashcardSaved = useCallback(() => {
    setSelectedWords(null)
  }, [])

  if (loading) return <LoadingScreen />

  if (error || !video) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <Lou pose="skeptic" size={140} className="text-[var(--color-signal-red)]" />
        <h2 className="text-4xl leading-[1.1] mt-5 tracking-tight">
          {error ?? 'Video not found'}
        </h2>
        <p className="text-[var(--color-paper-400)] text-sm mt-4 font-[Figtree]">
          "Lou checked. Twice."
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 rounded-sm bg-[var(--color-acid-500)] text-[var(--color-obsidian-900)] px-5 py-2.5 text-sm font-semibold hover:bg-[var(--color-acid-400)]"
        >
          ← Back to library
        </button>
      </div>
    )
  }

  return (
    <div>
      <BackHeader title={video.title} />

      <div className="px-10 py-8 w-full grid grid-cols-[minmax(0,1fr)_360px] gap-8">
        <div className="min-w-0">
          <YouTubeEmbed
            ref={playerRef}
            youtubeId={video.youtubeId}
            onReady={onPlayerReady}
          />

          <div className="mt-2">
            <TranscriptPanel
              segments={segments}
              activeIndex={activeSegmentIndex}
              onSeek={seekTo}
              onWordsSelected={handleWordsSelected}
            />
          </div>
        </div>

        <div className="shrink-0">
          <FlashcardPanel
            selectedWords={selectedWords}
            videoId={video.id}
            onSaved={handleFlashcardSaved}
          />
        </div>
      </div>
    </div>
  )
}
