import { memo } from 'react'
import type { TranscriptSegment } from '../../types/video'

type Props = {
  segment: TranscriptSegment
  isActive: boolean
  onSeek: (time: number) => void
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const TranscriptSegmentRow = memo(function TranscriptSegmentRow({
  segment,
  isActive,
  onSeek,
}: Props) {
  return (
    <button
      onClick={() => onSeek(segment.startTime)}
      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? 'bg-indigo-500/20 border-l-2 border-indigo-400'
          : 'hover:bg-slate-800/50 border-l-2 border-transparent'
      }`}
    >
      <span className="text-xs text-slate-500 font-mono">
        {formatTime(segment.startTime)}
      </span>
      <p className="text-sm text-white mt-1">{segment.originalText}</p>
      <p className="text-xs text-slate-400 mt-1">{segment.translatedText}</p>
    </button>
  )
})
