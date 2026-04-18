import { memo } from 'react'
import type { TranscriptSegment } from '../../types/video'

type Props = {
  segment: TranscriptSegment
  isActive: boolean
  onSeek: (time: number) => void
  showOriginal: boolean
  showTranslated: boolean
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
  showOriginal,
  showTranslated,
}: Props) {
  return (
    <button
      onClick={() => onSeek(segment.startTime)}
      className={`w-full text-left px-4 py-3 rounded-sm transition-colors ${
        isActive
          ? 'bg-[var(--color-obsidian-800)] border-l-2 border-[var(--color-acid-500)]'
          : 'hover:bg-[var(--color-obsidian-800)] border-l-2 border-transparent'
      }`}
    >
      <span className="mono-label">{formatTime(segment.startTime)}</span>
      {showOriginal && (
        <p className="text-[20px] leading-[1.6] text-[var(--color-paper-50)] mt-1">
          {segment.originalText}
        </p>
      )}
      {showTranslated && (
        <p className="text-base font-[Figtree] text-[var(--color-paper-400)] mt-1">
          {segment.translatedText}
        </p>
      )}
    </button>
  )
})
