import { useEffect, useRef } from 'react'
import type { TranscriptSegment } from '../../types/video'
import { TranscriptSegmentRow } from './TranscriptSegmentRow'

type Props = {
  segments: TranscriptSegment[]
  activeIndex: number
  onSeek: (time: number) => void
}

export function TranscriptPanel({ segments, activeIndex, onSeek }: Props) {
  const activeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeIndex])

  return (
    <div className="max-w-4xl mx-auto mt-4 max-h-[400px] overflow-y-auto rounded-xl bg-slate-800/30 border border-slate-700/50 p-2 space-y-1">
      {segments.map((segment, i) => (
        <div key={segment.id} ref={i === activeIndex ? activeRef : undefined}>
          <TranscriptSegmentRow
            segment={segment}
            isActive={i === activeIndex}
            onSeek={onSeek}
          />
        </div>
      ))}
    </div>
  )
}
