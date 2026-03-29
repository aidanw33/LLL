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
  { level: 1, label: 'New', color: 'bg-red-500/20 text-red-300 border-red-500/50' },
  { level: 2, label: 'Learning', color: 'bg-orange-500/20 text-orange-300 border-orange-500/50' },
  { level: 3, label: 'Familiar', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' },
  { level: 4, label: 'Known', color: 'bg-green-500/20 text-green-300 border-green-500/50' },
]

function comfortStyle(level: number) {
  return COMFORT_LEVELS.find((c) => c.level === level)?.color ?? ''
}

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

  // Reset form when selection changes
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
    <div className="space-y-4">
      {/* Creation form */}
      <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-5">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
          Create Flashcard
        </h3>

        {selectedWords ? (
          <>
            <div className="rounded-lg bg-slate-900/50 border border-slate-700 p-4 mb-4">
              <p className="text-lg text-white font-medium">{selectedWords}</p>
            </div>

            <label className="block text-xs text-slate-400 mb-1">Translation</label>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                placeholder="Enter translation..."
                className="flex-1 rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                onClick={handleGenerateTranslation}
                disabled={translating}
                className="rounded-lg border border-slate-600 hover:border-slate-500 px-3 py-2 text-xs font-medium text-slate-300 transition-colors disabled:opacity-50 shrink-0"
              >
                {translating ? '...' : 'Auto'}
              </button>
            </div>

            <label className="block text-xs text-slate-400 mb-1">Comfort level</label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {COMFORT_LEVELS.map(({ level, label, color }) => (
                <button
                  key={level}
                  onClick={() => setComfortLevel(level)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    comfortLevel === level
                      ? color
                      : 'bg-slate-800/50 text-slate-500 border-slate-700'
                  }`}
                >
                  {level}. {label}
                </button>
              ))}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 px-4 py-2.5 text-sm font-medium transition-colors"
            >
              {saving ? 'Saving...' : 'Save flashcard'}
            </button>
          </>
        ) : (
          <p className="text-sm text-slate-500">
            Click words in the transcript to create a flashcard.
          </p>
        )}
      </div>

      {/* Flashcard list */}
      {flashcards.length > 0 && (
        <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-5">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
            Flashcards ({flashcards.length})
          </h3>

          <div className="space-y-2">
            {flashcards.map((card) => (
              <div
                key={card.id}
                className="rounded-lg bg-slate-900/50 border border-slate-700 p-3"
              >
                {editingId === card.id ? (
                  <>
                    <p className="text-sm text-white font-medium mb-2">{card.originalText}</p>
                    <input
                      type="text"
                      value={editTranslation}
                      onChange={(e) => setEditTranslation(e.target.value)}
                      className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors mb-2"
                    />
                    <div className="grid grid-cols-4 gap-1 mb-2">
                      {COMFORT_LEVELS.map(({ level, color }) => (
                        <button
                          key={level}
                          onClick={() => setEditComfort(level)}
                          className={`px-2 py-1 text-xs font-medium rounded border transition-colors ${
                            editComfort === level
                              ? color
                              : 'bg-slate-800/50 text-slate-500 border-slate-700'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(card.id)}
                        className="flex-1 rounded-lg bg-indigo-500 hover:bg-indigo-400 px-3 py-1.5 text-xs font-medium transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 rounded-lg border border-slate-600 hover:border-slate-500 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm text-white font-medium">{card.originalText}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{card.translatedText}</p>
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 text-xs font-medium rounded border ${comfortStyle(card.comfortLevel)}`}>
                        {card.comfortLevel}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => startEditing(card)}
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="text-xs text-red-500/70 hover:text-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
