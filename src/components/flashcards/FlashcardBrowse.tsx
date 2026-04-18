import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { LANGUAGE_MAP } from '../../lib/languages'
import type { Flashcard } from '../../types/video'

type Props = {
  flashcards: Flashcard[]
  onUpdate: () => void
}

const COMFORT_LABELS = ['New', 'Learning', 'Familiar', 'Known']

const COMFORT_COLORS = [
  'text-[var(--color-signal-red)]',
  'text-[var(--color-signal-amber)]',
  'text-[var(--color-moss-400)]',
  'text-[var(--color-acid-500)]',
]

export function FlashcardBrowse({ flashcards, onUpdate }: Props) {
  const { session } = useAuth()
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTranslation, setEditTranslation] = useState('')
  const [editComfort, setEditComfort] = useState(1)

  const filtered = flashcards.filter((c) => {
    const q = query.toLowerCase()
    return (
      c.originalText.toLowerCase().includes(q) ||
      c.translatedText.toLowerCase().includes(q)
    )
  })

  function startEditing(card: Flashcard) {
    setEditingId(card.id)
    setEditTranslation(card.translatedText)
    setEditComfort(card.comfortLevel)
  }

  async function handleUpdate(id: string) {
    await fetch('/api/flashcard', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        id,
        translatedText: editTranslation,
        comfortLevel: editComfort,
      }),
    })
    setEditingId(null)
    onUpdate()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/flashcard?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session?.access_token}` },
    })
    onUpdate()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search words…"
          className="flex-1 bg-[var(--color-obsidian-800)] border border-[var(--color-obsidian-700)] rounded-sm px-3 py-2 text-sm font-[Figtree] placeholder:text-[var(--color-paper-400)] focus:outline-none focus:border-[var(--color-moss-500)]"
        />
        <div className="mono-label">
          {filtered.length} / {flashcards.length}
        </div>
      </div>

      <div className="mt-2">
        {filtered.map((card) => {
          const lang = card.video?.language
          const isEditing = editingId === card.id
          return (
            <div
              key={card.id}
              className="group border-b border-dashed border-[var(--color-obsidian-700)]"
            >
              {isEditing ? (
                <div className="py-4 px-2">
                  <div className="flex items-baseline gap-3 mb-3">
                    <div className="mono-label w-8 shrink-0">
                      {lang ? (LANGUAGE_MAP[lang] ?? lang).slice(0, 2).toUpperCase() : '—'}
                    </div>
                    <span className="text-2xl">{card.originalText}</span>
                  </div>
                  <input
                    type="text"
                    value={editTranslation}
                    onChange={(e) => setEditTranslation(e.target.value)}
                    className="w-full rounded-sm bg-[var(--color-obsidian-900)] border border-[var(--color-obsidian-700)] px-3 py-2 text-sm font-[Figtree] text-[var(--color-paper-50)] focus:outline-none focus:border-[var(--color-moss-500)] mb-3"
                  />
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[1, 2, 3, 4].map((level) => (
                      <button
                        key={level}
                        onClick={() => setEditComfort(level)}
                        className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                          editComfort === level
                            ? 'bg-[var(--color-acid-500)] text-[var(--color-obsidian-900)] border-[var(--color-acid-500)]'
                            : 'text-[var(--color-paper-200)] border-[var(--color-obsidian-700)] hover:border-[var(--color-moss-500)]'
                        }`}
                      >
                        {COMFORT_LABELS[level - 1]}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(card.id)}
                      className="rounded-sm bg-[var(--color-acid-500)] text-[var(--color-obsidian-900)] px-4 py-1.5 text-xs font-semibold hover:bg-[var(--color-acid-400)] transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-sm border border-[var(--color-obsidian-700)] hover:border-[var(--color-moss-500)] px-4 py-1.5 text-xs font-medium text-[var(--color-paper-200)] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-[auto_1fr_auto] items-baseline gap-6 py-4 px-2 rounded-sm hover:bg-[var(--color-obsidian-800)]">
                  <div className="mono-label w-8 shrink-0">
                    {lang ? (LANGUAGE_MAP[lang] ?? lang).slice(0, 2).toUpperCase() : '—'}
                  </div>
                  <div className="flex items-baseline gap-3 min-w-0 flex-wrap">
                    <span className="text-2xl">{card.originalText}</span>
                    <span className="text-[var(--color-paper-400)] text-sm font-[Figtree]">·</span>
                    <span className="font-[Figtree] text-base text-[var(--color-paper-200)] truncate">
                      {card.translatedText}
                    </span>
                    {card.video?.title && (
                      <span className="mono-label opacity-0 group-hover:opacity-100 transition-opacity truncate">
                        FROM · {card.video.title}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`mono-label ${COMFORT_COLORS[card.comfortLevel - 1]}`}>
                      {COMFORT_LABELS[card.comfortLevel - 1].toUpperCase()}
                    </span>
                    <button
                      onClick={() => startEditing(card)}
                      className="opacity-0 group-hover:opacity-100 mono-label hover:!text-[var(--color-acid-500)] transition-opacity"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="opacity-0 group-hover:opacity-100 mono-label hover:!text-[var(--color-signal-red)] transition-opacity"
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
