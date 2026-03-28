import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { useVideoPlayer } from '../../hooks/useVideoPlayer'
import { YouTubeEmbed } from './YouTubeEmbed'
import { TranscriptPanel } from './TranscriptPanel'
import { LoadingScreen } from '../LoadingScreen'
import { supabase } from '../../lib/supabase'
import type { TranscriptSegment, Video } from '../../types/video'

export function VideoPlayerPage() {
  const { videoId } = useParams<{ videoId: string }>()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [video, setVideo] = useState<Video | null>(null)
  const [segments, setSegments] = useState<TranscriptSegment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (loading) return <LoadingScreen />

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-400 mb-4">{error ?? 'Video not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="rounded-lg bg-indigo-500 hover:bg-indigo-400 px-6 py-2 text-sm font-medium transition-colors"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="text-2xl font-bold tracking-tight hover:text-indigo-400 transition-colors"
        >
          LLL
        </button>
        <div className="flex items-center gap-4">
          <h1 className="text-sm text-slate-400 hidden sm:block">{video.title}</h1>
          <button
            onClick={signOut}
            className="rounded-lg border border-slate-600 hover:border-slate-500 px-4 py-2 text-sm font-medium text-slate-300 transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pb-12">
        <YouTubeEmbed
          ref={playerRef}
          youtubeId={video.youtubeId}
          onReady={onPlayerReady}
        />

        <TranscriptPanel
          segments={segments}
          activeIndex={activeSegmentIndex}
          onSeek={seekTo}
        />
      </main>
    </div>
  )
}
