import { useState, useCallback } from 'react'
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

  const allWords = visibleSegments.flatMap((s) => s.originalText.split(/\s+/)).filter(Boolean)

  const handleWordClick = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation()

    setSelectedIndices((prev) => {
      let next: number[]

      if (prev.length === 0) {
        next = [index]
      } else if (prev.includes(index)) {
        // Deselect: only allow removing from ends
        if (index === prev[0] || index === prev[prev.length - 1]) {
          next = prev.filter((i) => i !== index)
        } else {
          next = prev
        }
      } else {
        // Only allow adjacent selection
        const min = Math.min(...prev)
        const max = Math.max(...prev)
        if (index === min - 1 || index === max + 1) {
          next = [...prev, index].sort((a, b) => a - b)
        } else {
          next = [index]
        }
      }

      const selectedText = next.length > 0
        ? next.map((i) => allWords[i]).join(' ')
        : null
      onWordsSelected(selectedText)
      return next
    })
  }, [allWords, onWordsSelected])

  // Reset selection when segments change
  const currentPairKey = pairIndex
  const [lastPairKey, setLastPairKey] = useState(currentPairKey)
  if (currentPairKey !== lastPairKey) {
    setLastPairKey(currentPairKey)
    if (selectedIndices.length > 0) {
      setSelectedIndices([])
      onWordsSelected(null)
    }
  }

  return (
    <div className="mt-4">
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
          <div
            onClick={() => onSeek(visibleSegments[0].startTime)}
            className="w-full text-left px-4 py-3 rounded-lg bg-indigo-500/20 border-l-2 border-indigo-400 cursor-pointer"
          >
            <span className="text-sm text-slate-500 font-mono">
              {formatTime(visibleSegments[0].startTime)}
            </span>
            {showOriginal && (
              <p className="text-lg mt-1 leading-relaxed">
                {allWords.map((word, i) => (
                  <span
                    key={i}
                    onClick={(e) => handleWordClick(i, e)}
                    className={`cursor-pointer rounded px-0.5 transition-colors ${
                      selectedIndices.includes(i)
                        ? 'bg-indigo-500/40 text-indigo-200'
                        : 'text-white hover:bg-slate-700/50'
                    }`}
                  >
                    {word}{' '}
                  </span>
                ))}
              </p>
            )}
            {showTranslated && (
              <p className="text-base text-slate-400 mt-1">
                {visibleSegments.map((s) => s.translatedText).join(' ')}
              </p>
            )}
          </div>
        ) : (
          <p className="px-4 py-3 text-lg text-slate-500">
            Waiting for playback...
          </p>
        )}
      </div>
    </div>
  )
}
