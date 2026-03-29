import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { LANGUAGE_MAP } from '../../lib/languages'
import type { Flashcard } from '../../types/video'

type Props = {
  flashcards: Flashcard[]
  onUpdate: () => void
}

const COMFORT_STYLES = [
  'bg-red-500/20 text-red-300 border-red-500/50',
  'bg-orange-500/20 text-orange-300 border-orange-500/50',
  'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  'bg-green-500/20 text-green-300 border-green-500/50',
]

const COMFORT_LABELS = ['New', 'Learning', 'Familiar', 'Known']

export function FlashcardBrowse({ flashcards, onUpdate }: Props) {
  const { session } = useAuth()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTranslation, setEditTranslation] = useState('')
  const [editComfort, setEditComfort] = useState(1)

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
    <div className="space-y-2">
      {flashcards.map((card) => (
        <div
          key={card.id}
          className="rounded-xl bg-slate-800/30 border border-slate-800/50 p-4 hover:border-slate-700 transition-colors"
        >
          {editingId === card.id ? (
            <div className="space-y-3">
              <p className="text-sm text-white font-medium">{card.originalText}</p>
              <input
                type="text"
                value={editTranslation}
                onChange={(e) => setEditTranslation(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <button
                    key={level}
                    onClick={() => setEditComfort(level)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      editComfort === level
                        ? COMFORT_STYLES[level - 1]
                        : 'bg-slate-800/50 text-slate-500 border-slate-700'
                    }`}
                  >
                    {COMFORT_LABELS[level - 1]}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdate(card.id)}
                  className="rounded-lg bg-indigo-500 hover:bg-indigo-400 px-4 py-1.5 text-xs font-medium transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="rounded-lg border border-slate-700 hover:border-slate-600 px-4 py-1.5 text-xs font-medium text-slate-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white font-medium">{card.originalText}</p>
                  {card.video?.language && (
                    <span className="text-[10px] text-slate-600">
                      {LANGUAGE_MAP[card.video.language] ?? card.video.language}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400 mt-0.5">{card.translatedText}</p>
                {card.video?.title && (
                  <p className="text-[10px] text-slate-600 mt-1 truncate">{card.video.title}</p>
                )}
              </div>

              <span className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full border ${COMFORT_STYLES[card.comfortLevel - 1]}`}>
                {COMFORT_LABELS[card.comfortLevel - 1]}
              </span>

              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => startEditing(card)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(card.id)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-slate-800/50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
