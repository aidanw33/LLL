import type { Flashcard } from '../../types/video'

type Props = {
  flashcards: Flashcard[]
}

const LEVELS = [
  { level: 1, label: 'New', color: 'bg-[var(--color-signal-red)]' },
  { level: 2, label: 'Learning', color: 'bg-[var(--color-signal-amber)]' },
  { level: 3, label: 'Familiar', color: 'bg-[var(--color-moss-400)]' },
  { level: 4, label: 'Known', color: 'bg-[var(--color-acid-500)]' },
]

export function FlashcardStats({ flashcards }: Props) {
  const total = flashcards.length
  if (total === 0) return null

  const counts = LEVELS.map(({ level }) => ({
    level,
    count: flashcards.filter((f) => f.comfortLevel === level).length,
  }))

  return (
    <div className="rounded-md bg-[var(--color-obsidian-800)] border border-[var(--color-obsidian-700)] p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <span className="mono-label">{total} CARDS</span>
        <div className="flex gap-4 flex-wrap">
          {counts.map(({ level, count }) => {
            const meta = LEVELS[level - 1]
            return (
              <span key={level} className="flex items-center gap-1.5 text-xs text-[var(--color-paper-200)]">
                <span className={`w-2 h-2 rounded-full ${meta.color}`} />
                {count} {meta.label}
              </span>
            )
          })}
        </div>
      </div>

      <div className="h-2 rounded-full bg-[var(--color-obsidian-900)] overflow-hidden flex">
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
