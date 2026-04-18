import { useEffect, useMemo, useRef, useState } from 'react'
import type { Flashcard } from '../../types/video'

type Props = {
  flashcards: Flashcard[]
}

type Tile = {
  id: string
  cardId: string
  text: string
  type: 'original' | 'translation'
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function MatchGame({ flashcards }: Props) {
  const gameCards = useMemo(() => shuffle(flashcards).slice(0, 8), [flashcards])

  const tiles = useMemo<Tile[]>(() => {
    const originals: Tile[] = gameCards.map((c) => ({
      id: `orig-${c.id}`,
      cardId: c.id,
      text: c.originalText,
      type: 'original',
    }))
    const translations: Tile[] = gameCards.map((c) => ({
      id: `trans-${c.id}`,
      cardId: c.id,
      text: c.translatedText,
      type: 'translation',
    }))
    return shuffle([...originals, ...translations])
  }, [gameCards])

  const [selected, setSelected] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrong, setWrong] = useState<Set<string>>(new Set())
  const [moves, setMoves] = useState(0)
  const startTime = useRef(0)
  const [elapsed, setElapsed] = useState(0)
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    startTime.current = Date.now()
    if (complete) return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [complete])

  function handleClick(tile: Tile) {
    if (matched.has(tile.cardId)) return
    if (wrong.size > 0) return

    if (!selected) {
      setSelected(tile.id)
      return
    }

    if (selected === tile.id) {
      setSelected(null)
      return
    }

    const selectedTile = tiles.find((t) => t.id === selected)!
    setMoves((m) => m + 1)

    if (selectedTile.cardId === tile.cardId && selectedTile.type !== tile.type) {
      const newMatched = new Set(matched)
      newMatched.add(tile.cardId)
      setMatched(newMatched)
      setSelected(null)
      if (newMatched.size === gameCards.length) {
        setComplete(true)
      }
    } else {
      setWrong(new Set([selectedTile.id, tile.id]))
      setTimeout(() => {
        setWrong(new Set())
        setSelected(null)
      }, 800)
    }
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  if (complete) {
    return (
      <div className="text-center py-16">
        <h2 className="text-3xl tracking-tight">Matched all pairs.</h2>
        <p className="text-[var(--color-paper-400)] mt-2">
          {moves} moves in {formatTime(elapsed)}.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="mono-label">
          {matched.size} / {gameCards.length} MATCHED
        </span>
        <div className="flex gap-4 mono-label">
          <span>MOVES · {moves}</span>
          <span>{formatTime(elapsed)}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {tiles.map((tile) => {
          const isMatched = matched.has(tile.cardId)
          const isSelected = selected === tile.id
          const isWrong = wrong.has(tile.id)

          const base =
            'rounded-sm border p-4 min-h-[80px] text-sm font-medium transition-all'
          const state = isMatched
            ? 'bg-[color:color-mix(in_oklch,var(--color-acid-500)_15%,transparent)] border-[var(--color-acid-500)]/40 text-[var(--color-acid-500)] opacity-60'
            : isWrong
              ? 'bg-[color:color-mix(in_oklch,var(--color-signal-red)_20%,transparent)] border-[var(--color-signal-red)]/60 text-[var(--color-signal-red)] scale-95'
              : isSelected
                ? 'bg-[var(--color-obsidian-700)] border-[var(--color-acid-500)] text-[var(--color-acid-500)] scale-105'
                : tile.type === 'original'
                  ? 'bg-[var(--color-obsidian-800)] border-[var(--color-obsidian-700)] text-[var(--color-paper-50)] hover:border-[var(--color-moss-500)]'
                  : 'bg-[var(--color-obsidian-800)] border-[var(--color-obsidian-700)] text-[var(--color-paper-200)] hover:border-[var(--color-moss-500)]'

          return (
            <button
              key={tile.id}
              onClick={() => handleClick(tile)}
              disabled={isMatched}
              className={`${base} ${state}`}
            >
              {tile.text}
            </button>
          )
        })}
      </div>
    </div>
  )
}
