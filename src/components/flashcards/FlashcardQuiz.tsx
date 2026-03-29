import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { LANGUAGE_MAP } from '../../lib/languages'
import type { Flashcard } from '../../types/video'

type Props = {
  flashcards: Flashcard[]
  onUpdate: () => void
}

const RATINGS = [
  { key: '1', label: 'Wrong', desc: 'Reset to New', color: 'bg-red-500/20 text-red-300 border-red-500/50 hover:bg-red-500/30' },
  { key: '2', label: 'Hard', desc: 'Decrease level', color: 'bg-orange-500/20 text-orange-300 border-orange-500/50 hover:bg-orange-500/30' },
  { key: '3', label: 'Good', desc: 'Keep level', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 hover:bg-yellow-500/30' },
  { key: '4', label: 'Easy', desc: 'Increase level', color: 'bg-green-500/20 text-green-300 border-green-500/50 hover:bg-green-500/30' },
]

function buildWeightedQueue(cards: Flashcard[]): Flashcard[] {
  const weighted: Flashcard[] = []
  for (const card of cards) {
    const weight = 5 - card.comfortLevel // 4, 3, 2, 1
    for (let i = 0; i < weight; i++) {
      weighted.push(card)
    }
  }
  // Shuffle
  for (let i = weighted.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[weighted[i], weighted[j]] = [weighted[j], weighted[i]]
  }
  // Remove consecutive duplicates
  const result: Flashcard[] = [weighted[0]]
  for (let i = 1; i < weighted.length; i++) {
    if (weighted[i].id !== weighted[i - 1].id) {
      result.push(weighted[i])
    }
  }
  return result
}

export function FlashcardQuiz({ flashcards, onUpdate }: Props) {
  const { session } = useAuth()
  const [queue, setQueue] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [reviewed, setReviewed] = useState(0)

  useEffect(() => {
    if (flashcards.length > 0) {
      setQueue(buildWeightedQueue(flashcards))
      setCurrentIndex(0)
      setRevealed(false)
      setReviewed(0)
    }
  }, [flashcards])

  const current = queue[currentIndex] ?? null

  const handleRate = useCallback(async (rating: number) => {
    if (!current || !session) return

    let newComfort: number
    if (rating === 1) newComfort = 1
    else if (rating === 2) newComfort = Math.max(1, current.comfortLevel - 1)
    else if (rating === 4) newComfort = Math.min(4, current.comfortLevel + 1)
    else newComfort = current.comfortLevel

    await fetch('/api/flashcard', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ id: current.id, comfortLevel: newComfort }),
    })

    setReviewed((r) => r + 1)
    setRevealed(false)

    if (currentIndex < queue.length - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      // Rebuild queue for another round
      onUpdate()
    }
  }, [current, session, currentIndex, queue.length, onUpdate])

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (!revealed) setRevealed(true)
      } else if (revealed && ['1', '2', '3', '4'].includes(e.key)) {
        handleRate(parseInt(e.key, 10))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [revealed, handleRate])

  if (!current) {
    return (
      <div className="text-center py-16">
        <p className="text-2xl font-bold text-white mb-2">Session complete!</p>
        <p className="text-slate-400">You reviewed {reviewed} cards.</p>
      </div>
    )
  }

  const progress = queue.length > 0 ? ((currentIndex + 1) / queue.length) * 100 : 0
  const lang = current.video?.language

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-slate-500 shrink-0">
          {currentIndex + 1} / {queue.length}
        </span>
      </div>

      {/* Card */}
      <div
        onClick={() => !revealed && setRevealed(true)}
        className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-8 min-h-[280px] flex flex-col items-center justify-center cursor-pointer select-none"
      >
        {lang && (
          <span className="px-2 py-0.5 text-xs font-medium rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-4">
            {LANGUAGE_MAP[lang] ?? lang}
          </span>
        )}

        <p className="text-3xl font-bold text-white text-center mb-2">
          {current.originalText}
        </p>

        {current.video?.title && (
          <p className="text-xs text-slate-600 mt-2">{current.video.title}</p>
        )}

        {revealed ? (
          <div className="mt-6 pt-6 border-t border-slate-700 w-full text-center">
            <p className="text-xl text-indigo-300">{current.translatedText}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-600 mt-6">
            Press Space or click to reveal
          </p>
        )}
      </div>

      {/* Rating buttons */}
      {revealed && (
        <div className="grid grid-cols-4 gap-2 mt-4">
          {RATINGS.map(({ key, label, desc, color }) => (
            <button
              key={key}
              onClick={() => handleRate(parseInt(key, 10))}
              className={`rounded-lg border px-3 py-3 text-center transition-colors ${color}`}
            >
              <span className="block text-sm font-medium">{label}</span>
              <span className="block text-xs opacity-70 mt-0.5">{desc}</span>
              <kbd className="inline-block mt-1 px-1.5 py-0.5 text-xs rounded bg-black/20">{key}</kbd>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
