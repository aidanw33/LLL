import { useState } from 'react'
import type { TranscriptSegment } from '../../types/video'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

type Props = {
  segments: TranscriptSegment[]
  activeIndex: number
  onSeek: (time: number) => void
}

export function TranscriptPanel({ segments, activeIndex, onSeek }: Props) {
  const [showOriginal, setShowOriginal] = useState(true)
  const [showTranslated, setShowTranslated] = useState(true)

  const pairIndex = activeIndex >= 0 ? Math.floor(activeIndex / 2) * 2 : -1
  const visibleSegments = pairIndex >= 0
    ? [segments[pairIndex], segments[pairIndex + 1]].filter(Boolean)
    : []

  return (
    <div className="max-w-4xl mx-auto mt-4">
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setShowOriginal((v) => !v)}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            showOriginal
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
              : 'bg-slate-800/50 text-slate-500 border border-slate-700'
          }`}
        >
          Original
        </button>
        <button
          onClick={() => setShowTranslated((v) => !v)}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            showTranslated
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
              : 'bg-slate-800/50 text-slate-500 border border-slate-700'
          }`}
        >
          English
        </button>
      </div>

      <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4">
        {visibleSegments.length > 0 ? (
          <button
            onClick={() => onSeek(visibleSegments[0].startTime)}
            className="w-full text-left px-4 py-3 rounded-lg bg-indigo-500/20 border-l-2 border-indigo-400"
          >
            <span className="text-sm text-slate-500 font-mono">
              {formatTime(visibleSegments[0].startTime)}
            </span>
            {showOriginal && (
              <p className="text-lg text-white mt-1">
                {visibleSegments.map((s) => s.originalText).join(' ')}
              </p>
            )}
            {showTranslated && (
              <p className="text-base text-slate-400 mt-1">
                {visibleSegments.map((s) => s.translatedText).join(' ')}
              </p>
            )}
          </button>
        ) : (
          <p className="px-4 py-3 text-lg text-slate-500">
            Waiting for playback...
          </p>
        )}
      </div>
    </div>
  )
}
