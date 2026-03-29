import type { Flashcard } from '../../types/video'

type Props = {
  flashcards: Flashcard[]
}

const LEVELS = [
  { level: 1, label: 'New', color: 'bg-red-500' },
  { level: 2, label: 'Learning', color: 'bg-orange-500' },
  { level: 3, label: 'Familiar', color: 'bg-yellow-500' },
  { level: 4, label: 'Known', color: 'bg-green-500' },
]

export function FlashcardStats({ flashcards }: Props) {
  const total = flashcards.length
  if (total === 0) return null

  const counts = LEVELS.map(({ level }) => ({
    level,
    count: flashcards.filter((f) => f.comfortLevel === level).length,
  }))

  return (
    <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-300">{total} cards</span>
        <div className="flex gap-3">
          {counts.map(({ level, count }) => {
            const meta = LEVELS[level - 1]
            return (
              <span key={level} className="flex items-center gap-1 text-xs text-slate-400">
                <span className={`w-2 h-2 rounded-full ${meta.color}`} />
                {count} {meta.label}
              </span>
            )
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-slate-700 overflow-hidden flex">
        {counts.map(({ level, count }) => {
          if (count === 0) return null
          const meta = LEVELS[level - 1]
          return (
            <div
              key={level}
              className={`${meta.color} transition-all`}
              style={{ width: `${(count / total) * 100}%` }}
            />
          )
        })}
      </div>
    </div>
  )
}
