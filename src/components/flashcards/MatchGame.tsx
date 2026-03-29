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
  // Take up to 8 cards for a manageable grid
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

  // Timer
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
      // Match!
      const newMatched = new Set(matched)
      newMatched.add(tile.cardId)
      setMatched(newMatched)
      setSelected(null)
      if (newMatched.size === gameCards.length) {
        setComplete(true)
      }
    } else {
      // Wrong
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
        <p className="text-2xl font-bold text-white mb-2">Matched all pairs!</p>
        <p className="text-slate-400">
          {moves} moves in {formatTime(elapsed)}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-400">
          {matched.size} / {gameCards.length} matched
        </span>
        <div className="flex gap-4 text-sm text-slate-400">
          <span>Moves: {moves}</span>
          <span>{formatTime(elapsed)}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {tiles.map((tile) => {
          const isMatched = matched.has(tile.cardId)
          const isSelected = selected === tile.id
          const isWrong = wrong.has(tile.id)

          return (
            <button
              key={tile.id}
              onClick={() => handleClick(tile)}
              disabled={isMatched}
              className={`rounded-xl border p-4 min-h-[80px] text-sm font-medium transition-all ${
                isMatched
                  ? 'bg-green-500/10 border-green-500/30 text-green-400 opacity-50'
                  : isWrong
                    ? 'bg-red-500/20 border-red-500/50 text-red-300 scale-95'
                    : isSelected
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 scale-105'
                      : tile.type === 'original'
                        ? 'bg-slate-800/50 border-slate-700 text-white hover:border-slate-500'
                        : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:border-slate-400 italic'
              }`}
            >
              {tile.text}
            </button>
          )
        })}
      </div>
    </div>
  )
}
