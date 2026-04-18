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
  onWordsSelected: (words: string | null) => void
}

export function TranscriptPanel({ segments, activeIndex, onSeek, onWordsSelected }: Props) {
  const [showOriginal, setShowOriginal] = useState(true)
  const [showTranslated, setShowTranslated] = useState(true)
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])

  const pairIndex = activeIndex >= 0 ? Math.floor(activeIndex / 2) * 2 : -1
  const visibleSegments = pairIndex >= 0
    ? [segments[pairIndex], segments[pairIndex + 1]].filter(Boolean)
    : []
  const hasContent = visibleSegments.length > 0
  const segWords = visibleSegments.flatMap((s) => s.originalText.split(/\s+/)).filter(Boolean)
  const translation = visibleSegments.map((s) => s.translatedText).join(' ')
  const startTime = hasContent ? visibleSegments[0].startTime : 0

  function handleWordClick(index: number, e: React.MouseEvent) {
    e.stopPropagation()

    setSelectedIndices((prev) => {
      let next: number[]

      if (prev.length === 0) {
        next = [index]
      } else if (prev.includes(index)) {
        if (index === prev[0] || index === prev[prev.length - 1]) {
          next = prev.filter((i) => i !== index)
        } else {
          next = prev
        }
      } else {
        const min = Math.min(...prev)
        const max = Math.max(...prev)
        if (index === min - 1 || index === max + 1) {
          next = [...prev, index].sort((a, b) => a - b)
        } else {
          next = [index]
        }
      }

      const selectedText = next.length > 0
        ? next.map((i) => segWords[i]).join(' ')
        : null
      onWordsSelected(selectedText)
      return next
    })
  }

  const [lastPairKey, setLastPairKey] = useState(pairIndex)
  if (pairIndex !== lastPairKey) {
    setLastPairKey(pairIndex)
    if (selectedIndices.length > 0) {
      setSelectedIndices([])
      onWordsSelected(null)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-3xl rounded-md bg-[var(--color-obsidian-800)] border border-[var(--color-obsidian-700)] px-8 pt-4 pb-5 overflow-hidden text-center">
        <div
          className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-40"
          style={{
            background:
              'radial-gradient(circle, rgba(163,230,53,0.12), transparent 70%)',
          }}
        />
        {hasContent ? (
          <div className="relative">
            {showOriginal && (
              <p className="text-[26px] leading-[1.4] text-[var(--color-paper-50)]">
                {segWords.map((word, i) => {
                  const isSelected = selectedIndices.includes(i)
                  return (
                    <span key={i}>
                      <span
                        onClick={(e) => handleWordClick(i, e)}
                        className={`cursor-pointer transition-colors rounded-sm px-0.5 -mx-0.5 ${
                          isSelected
                            ? 'bg-[var(--color-acid-500)] text-[var(--color-obsidian-900)]'
                            : 'border-b border-dotted border-[var(--color-moss-500)] hover:bg-[var(--color-obsidian-700)] hover:text-[var(--color-acid-500)]'
                        }`}
                      >
                        {word}
                      </span>
                      {i < segWords.length - 1 && ' '}
                    </span>
                  )
                })}
              </p>
            )}
            {showTranslated && (
              <p className="text-[16px] font-[Figtree] text-[var(--color-paper-400)] leading-relaxed mt-3">
                {translation}
              </p>
            )}
            <button
              onClick={() => onSeek(startTime)}
              className="mono-label hover:!text-[var(--color-acid-500)] transition-colors mt-4 inline-block"
            >
              {formatTime(startTime)}
            </button>
          </div>
        ) : (
          <p className="mono-label relative">WAITING FOR PLAYBACK…</p>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <ToggleButton active={showOriginal} onClick={() => setShowOriginal((v) => !v)}>
          Original
        </ToggleButton>
        <ToggleButton active={showTranslated} onClick={() => setShowTranslated((v) => !v)}>
          English
        </ToggleButton>
      </div>
    </div>
  )
}

function ToggleButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
        active
          ? 'bg-[var(--color-acid-500)] text-[var(--color-obsidian-900)] border-[var(--color-acid-500)]'
          : 'text-[var(--color-paper-200)] border-[var(--color-obsidian-700)] hover:border-[var(--color-moss-500)]'
      }`}
    >
      {children}
    </button>
  )
}
