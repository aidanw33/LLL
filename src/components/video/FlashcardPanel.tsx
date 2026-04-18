import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

type Flashcard = {
  id: string
  originalText: string
  translatedText: string
  comfortLevel: number
  createdAt: string
}

type Props = {
  selectedWords: string | null
  videoId: string
  onSaved: () => void
}

const COMFORT_LEVELS = [
  { level: 1, label: 'New' },
  { level: 2, label: 'Learning' },
  { level: 3, label: 'Familiar' },
  { level: 4, label: 'Known' },
]

const COMFORT_COLORS = [
  'text-[var(--color-signal-red)]',
  'text-[var(--color-signal-amber)]',
  'text-[var(--color-moss-400)]',
  'text-[var(--color-acid-500)]',
]

export function FlashcardPanel({ selectedWords, videoId, onSaved }: Props) {
  const { session } = useAuth()
  const [translation, setTranslation] = useState('')
  const [comfortLevel, setComfortLevel] = useState(1)
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTranslation, setEditTranslation] = useState('')
  const [editComfort, setEditComfort] = useState(1)

  function getHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
    }
  }

  const loadFlashcards = useCallback(async () => {
    const res = await fetch(`/api/flashcard?videoId=${videoId}`, {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    })
    if (res.ok) {
      const data = await res.json()
      setFlashcards(data.flashcards)
    }
  }, [videoId, session?.access_token])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const res = await fetch(`/api/flashcard?videoId=${videoId}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })
      if (cancelled) return
      if (res.ok) {
        const data = await res.json()
        setFlashcards(data.flashcards)
      }
    }
    load()
    return () => { cancelled = true }
  }, [videoId, session?.access_token])

  useEffect(() => {
    setTranslation('')
  }, [selectedWords])

  async function handleGenerateTranslation() {
    if (!selectedWords) return
    setTranslating(true)
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ text: selectedWords }),
      })
      if (res.ok) {
        const data = await res.json()
        setTranslation(data.translatedText)
      }
    } finally {
      setTranslating(false)
    }
  }

  async function handleSave() {
    if (!selectedWords) return
    setSaving(true)
    try {
      const res = await fetch('/api/flashcard', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          videoId,
          originalText: selectedWords,
          translatedText: translation || undefined,
          comfortLevel,
        }),
      })
      if (res.ok) {
        setTranslation('')
        setComfortLevel(1)
        onSaved()
        await loadFlashcards()
      }
    } finally {
      setSaving(false)
    }
  }

  function startEditing(card: Flashcard) {
    setEditingId(card.id)
    setEditTranslation(card.translatedText)
    setEditComfort(card.comfortLevel)
  }

  async function handleUpdate(id: string) {
    await fetch('/api/flashcard', {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({
        id,
        translatedText: editTranslation,
        comfortLevel: editComfort,
      }),
    })
    setEditingId(null)
    await loadFlashcards()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/flashcard?id=${id}`, { method: 'DELETE', headers: getHeaders() })
    await loadFlashcards()
  }

  return (
    <div className="sticky top-8 space-y-4">
      {/* Margin note / create */}
      <div className="rounded-md bg-[var(--color-obsidian-800)] border border-[var(--color-obsidian-700)] p-4">
        <div className="mono-label">NEW CARD</div>
        {selectedWords ? (
          <>
            <div className="text-2xl mt-2 break-words">
              {selectedWords}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                placeholder="Translation…"
                className="flex-1 min-w-0 rounded-sm bg-[var(--color-obsidian-900)] border border-[var(--color-obsidian-700)] px-2.5 py-1.5 text-sm font-[Figtree] text-[var(--color-paper-50)] placeholder:text-[var(--color-paper-400)] focus:outline-none focus:border-[var(--color-moss-500)]"
              />
              <button
                onClick={handleGenerateTranslation}
                disabled={translating}
                className="shrink-0 rounded-sm border border-[var(--color-obsidian-700)] hover:border-[var(--color-moss-500)] px-2.5 py-1.5 mono-label hover:!text-[var(--color-paper-50)] disabled:opacity-50"
              >
                {translating ? '…' : 'AUTO'}
              </button>
            </div>

            <div className="mono-label mt-3 !text-[var(--color-paper-400)]">LEVEL</div>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {COMFORT_LEVELS.map(({ level, label }) => (
                <button
                  key={level}
                  onClick={() => setComfortLevel(level)}
                  className={`px-2 py-1 text-xs font-medium rounded-full border transition-colors ${
                    comfortLevel === level
                      ? 'bg-[var(--color-acid-500)] text-[var(--color-obsidian-900)] border-[var(--color-acid-500)]'
                      : 'text-[var(--color-paper-200)] border-[var(--color-obsidian-700)] hover:border-[var(--color-moss-500)]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-4 w-full py-2 rounded-sm bg-[var(--color-acid-500)] text-[var(--color-obsidian-900)] text-sm font-semibold hover:bg-[var(--color-acid-400)] disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : '+ Flashcard'}
            </button>
          </>
        ) : (
          <div className="text-sm text-[var(--color-paper-400)] mt-2">
            Click any word.
          </div>
        )}
      </div>

      {/* Saved list */}
      {flashcards.length > 0 && (
        <div className="rounded-md bg-[var(--color-obsidian-800)] border border-[var(--color-obsidian-700)] p-4">
          <div className="mono-label mb-3">SAVED · {flashcards.length}</div>
          <ul className="space-y-3 font-[Figtree]">
            {flashcards.map((card) => (
              <li key={card.id}>
                {editingId === card.id ? (
                  <div>
                    <p className="text-sm text-[var(--color-paper-50)] font-medium mb-2 break-words">
                      {card.originalText}
                    </p>
                    <input
                      type="text"
                      value={editTranslation}
                      onChange={(e) => setEditTranslation(e.target.value)}
                      className="w-full rounded-sm bg-[var(--color-obsidian-900)] border border-[var(--color-obsidian-700)] px-2.5 py-1.5 text-sm text-[var(--color-paper-50)] focus:outline-none focus:border-[var(--color-moss-500)] mb-2"
                    />
                    <div className="grid grid-cols-4 gap-1 mb-2">
                      {COMFORT_LEVELS.map(({ level }) => (
                        <button
                          key={level}
                          onClick={() => setEditComfort(level)}
                          className={`px-2 py-1 text-xs font-medium rounded-sm border transition-colors ${
                            editComfort === level
                              ? 'bg-[var(--color-acid-500)] text-[var(--color-obsidian-900)] border-[var(--color-acid-500)]'
                              : 'text-[var(--color-paper-200)] border-[var(--color-obsidian-700)] hover:border-[var(--color-moss-500)]'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(card.id)}
                        className="flex-1 rounded-sm bg-[var(--color-acid-500)] text-[var(--color-obsidian-900)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--color-acid-400)]"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 rounded-sm border border-[var(--color-obsidian-700)] hover:border-[var(--color-moss-500)] px-3 py-1.5 text-xs font-medium text-[var(--color-paper-200)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="group">
                    <div className="flex items-baseline gap-2 text-sm">
                      <span className="font-semibold break-words">{card.originalText}</span>
                      <span className="text-[var(--color-paper-400)]">·</span>
                      <span className="text-[var(--color-paper-200)] break-words">{card.translatedText}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`mono-label !text-[9px] ${COMFORT_COLORS[card.comfortLevel - 1]}`}>
                        L{card.comfortLevel}
                      </span>
                      <button
                        onClick={() => startEditing(card)}
                        className="mono-label !text-[9px] opacity-0 group-hover:opacity-100 hover:!text-[var(--color-acid-500)] transition-opacity"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="mono-label !text-[9px] opacity-0 group-hover:opacity-100 hover:!text-[var(--color-signal-red)] transition-opacity"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  )
}
