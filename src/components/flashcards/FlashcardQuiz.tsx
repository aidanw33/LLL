import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { LANGUAGE_MAP } from '../../lib/languages'
import { Lou } from '../brand/Lou'
import type { Flashcard } from '../../types/video'

type Props = {
  flashcards: Flashcard[]
  onUpdate: () => void
}

type Rating = 'wrong' | 'hard' | 'good' | 'easy'

function buildWeightedQueue(cards: Flashcard[]): Flashcard[] {
  const weighted: Flashcard[] = []
  for (const card of cards) {
    const weight = 5 - card.comfortLevel
    for (let i = 0; i < weight; i++) {
      weighted.push(card)
    }
  }
  for (let i = weighted.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[weighted[i], weighted[j]] = [weighted[j], weighted[i]]
  }
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
  const queue = useMemo(() => buildWeightedQueue(flashcards), [flashcards])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [reviewed, setReviewed] = useState(0)
  const [lastRating, setLastRating] = useState<Rating | null>(null)

  const current = queue[currentIndex] ?? null

  const handleRate = useCallback(async (rating: Rating) => {
    if (!current || !session) return

    let newComfort: number
    if (rating === 'wrong') newComfort = 1
    else if (rating === 'hard') newComfort = Math.max(1, current.comfortLevel - 1)
    else if (rating === 'easy') newComfort = Math.min(4, current.comfortLevel + 1)
    else newComfort = current.comfortLevel

    setLastRating(rating)

    await fetch('/api/flashcard', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ id: current.id, comfortLevel: newComfort }),
    })

    setReviewed((r) => r + 1)

    setTimeout(() => {
      setRevealed(false)
      setLastRating(null)
      if (currentIndex < queue.length - 1) {
        setCurrentIndex((i) => i + 1)
      } else {
        onUpdate()
      }
    }, 350)
  }, [current, session, currentIndex, queue.length, onUpdate])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (!revealed) setRevealed(true)
      } else if (revealed && !lastRating) {
        if (e.key === '1') handleRate('wrong')
        else if (e.key === '2') handleRate('hard')
        else if (e.key === '3') handleRate('good')
        else if (e.key === '4') handleRate('easy')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [revealed, lastRating, handleRate])

  if (!current) {
    return (
      <div className="text-center py-20">
        <Lou pose="cheer" size={140} animated className="text-[var(--color-acid-500)] mx-auto" />
        <h2 className="text-4xl mt-4 tracking-tight">
          Session complete.
        </h2>
        <p className="text-[var(--color-paper-400)] text-sm mt-3">
          You reviewed {reviewed} {reviewed === 1 ? 'card' : 'cards'}.
        </p>
      </div>
    )
  }

  const progress = queue.length > 0 ? ((currentIndex + (revealed ? 1 : 0)) / queue.length) * 100 : 0
  const lang = current.video?.language
  const louPose =
    lastRating === 'easy' || lastRating === 'good'
      ? 'cheer'
      : lastRating === 'wrong'
        ? 'skeptic'
        : 'sit'

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-baseline justify-between mb-2">
        <div className="mono-label">
          {lang ? (LANGUAGE_MAP[lang] ?? lang).toUpperCase() : ''} · {currentIndex + 1} / {queue.length}
        </div>
        <div className="mono-label !text-[var(--color-paper-400)]">LEVEL · {current.comfortLevel}</div>
      </div>
      <div className="h-[3px] bg-[var(--color-obsidian-800)] rounded-full overflow-hidden mb-10">
        <div
          className="h-full bg-[var(--color-acid-500)] transition-[width]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="relative">
        <div
          onClick={() => !revealed && setRevealed(true)}
          className="quiz-card-glow rounded-md p-10 min-h-[260px] flex flex-col items-center justify-center text-center border-2 border-[var(--color-obsidian-600)] cursor-pointer select-none"
          style={{ background: 'var(--color-obsidian-800)' }}
        >
          <div className="mono-label mb-3">
            {lang ? (LANGUAGE_MAP[lang] ?? lang).toUpperCase() : 'CARD'} · LEVEL {current.comfortLevel}
          </div>
          <div className="text-5xl leading-tight tracking-tight max-w-full break-words">
            {current.originalText}
          </div>
          {current.video?.title && (
            <div className="mono-label !text-[9px] mt-4 !text-[var(--color-paper-400)] truncate max-w-full">
              FROM · {current.video.title}
            </div>
          )}
          {revealed ? (
            <div className="mt-5 font-[Figtree] text-lg text-[var(--color-paper-200)]">
              {current.translatedText}
            </div>
          ) : (
            <div className="mt-5 mono-label">
              PRESS SPACE TO REVEAL
            </div>
          )}
        </div>

        <div className="absolute -bottom-4 -right-4 pointer-events-none">
          <Lou
            pose={louPose}
            size={100}
            animated
            className={
              lastRating === 'wrong'
                ? 'text-[var(--color-signal-red)]'
                : 'text-[var(--color-acid-500)]'
            }
          />
        </div>
      </div>

      {revealed && (
        <div className="grid grid-cols-4 gap-2 mt-10">
          <RateBtn tone="red" hotkey="1" onClick={() => handleRate('wrong')}>Wrong</RateBtn>
          <RateBtn tone="amber" hotkey="2" onClick={() => handleRate('hard')}>Hard</RateBtn>
          <RateBtn tone="moss" hotkey="3" onClick={() => handleRate('good')}>Good</RateBtn>
          <RateBtn tone="acid" hotkey="4" onClick={() => handleRate('easy')}>Easy</RateBtn>
        </div>
      )}
    </div>
  )
}

function RateBtn({
  children,
  hotkey,
  tone,
  onClick,
}: {
  children: React.ReactNode
  hotkey: string
  tone: 'red' | 'amber' | 'moss' | 'acid'
  onClick: () => void
}) {
  const tones: Record<string, string> = {
    red: 'border-[color:color-mix(in_oklch,var(--color-signal-red)_50%,var(--color-obsidian-700))] hover:bg-[color:color-mix(in_oklch,var(--color-signal-red)_20%,transparent)] hover:text-[var(--color-signal-red)]',
    amber: 'border-[color:color-mix(in_oklch,var(--color-signal-amber)_50%,var(--color-obsidian-700))] hover:bg-[color:color-mix(in_oklch,var(--color-signal-amber)_18%,transparent)] hover:text-[var(--color-signal-amber)]',
    moss: 'border-[var(--color-moss-500)] hover:bg-[color:color-mix(in_oklch,var(--color-moss-500)_25%,transparent)] hover:text-[var(--color-paper-50)]',
    acid: 'border-[var(--color-acid-500)] hover:bg-[var(--color-acid-500)] hover:text-[var(--color-obsidian-900)]',
  }
  return (
    <button
      onClick={onClick}
      className={`group py-4 px-3 rounded-sm border text-center transition-colors ${tones[tone]}`}
    >
      <div className="font-[Figtree] font-semibold text-sm">{children}</div>
      <div className="mono-label mt-1 !text-[9px] opacity-70 group-hover:opacity-100">
        [{hotkey}]
      </div>
    </button>
  )
}
