import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void
  }
}

export type YouTubePlayerHandle = {
  getCurrentTime: () => number
  seekTo: (seconds: number) => void
  getPlayerState: () => number
}

type Props = {
  youtubeId: string
  onReady?: () => void
}

let apiLoaded: Promise<void> | null = null

function loadYouTubeAPI(): Promise<void> {
  if (apiLoaded) return apiLoaded
  apiLoaded = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    window.onYouTubeIframeAPIReady = () => resolve()
    document.head.appendChild(script)
  })
  return apiLoaded
}

export const YouTubeEmbed = forwardRef<YouTubePlayerHandle, Props>(
  function YouTubeEmbed({ youtubeId, onReady }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<YT.Player | null>(null)

    useImperativeHandle(ref, () => ({
      getCurrentTime: () => playerRef.current?.getCurrentTime() ?? 0,
      seekTo: (seconds: number) => playerRef.current?.seekTo(seconds, true),
      getPlayerState: () =>
        playerRef.current?.getPlayerState() ?? YT.PlayerState.UNSTARTED,
    }))

    useEffect(() => {
      let destroyed = false

      loadYouTubeAPI().then(() => {
        if (destroyed || !containerRef.current) return

        playerRef.current = new YT.Player(containerRef.current, {
          videoId: youtubeId,
          playerVars: {
            autoplay: 0,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: () => {
              if (!destroyed) onReady?.()
            },
          },
        })
      })

      return () => {
        destroyed = true
        playerRef.current?.destroy()
        playerRef.current = null
      }
    }, [youtubeId, onReady])

    return (
      <div className="aspect-video w-full max-w-4xl mx-auto rounded-lg overflow-hidden bg-black">
        <div ref={containerRef} className="w-full h-full" />
      </div>
    )
  },
)
