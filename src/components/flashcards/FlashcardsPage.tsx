import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { LANGUAGE_MAP } from '../../lib/languages'
import { FlashcardStats } from './FlashcardStats'
import { FlashcardQuiz } from './FlashcardQuiz'
import { FlashcardBrowse } from './FlashcardBrowse'
import type { Flashcard } from '../../types/video'

type StudyMode = 'quiz' | 'browse'

const COMFORT_LABELS = ['New', 'Learning', 'Familiar', 'Known']

export function FlashcardsPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)
  const [filterLang, setFilterLang] = useState<string | null>(null)
  const [filterComfort, setFilterComfort] = useState<number | null>(null)
  const [mode, setMode] = useState<StudyMode>('quiz')

  const loadFlashcards = useCallback(async () => {
    if (!session) return
    const res = await fetch('/api/flashcard', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    if (res.ok) {
      const data = await res.json()
      setFlashcards(data.flashcards)
    }
    setLoading(false)
  }, [session])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!session) return
      const res = await fetch('/api/flashcard', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (cancelled) return
      if (res.ok) {
        const data = await res.json()
        setFlashcards(data.flashcards)
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [session])

  const availableLanguages = useMemo(() => {
    const langs = new Set(
      flashcards.map((f) => f.video?.language).filter(Boolean) as string[],
    )
    return Array.from(langs).sort()
  }, [flashcards])

  const filtered = useMemo(() => {
    return flashcards.filter((f) => {
      if (filterLang && f.video?.language !== filterLang) return false
      if (filterComfort && f.comfortLevel !== filterComfort) return false
      return true
    })
  }, [flashcards, filterLang, filterComfort])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Loading flashcards...</p>
      </div>
    )
  }

  const modeButton = (m: StudyMode, label: string, minCards = 0) => (
    <button
      onClick={() => setMode(m)}
      disabled={minCards > 0 && filtered.length < minCards}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        mode === m
          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
          : 'bg-slate-800/30 text-slate-400 border border-slate-800 hover:border-slate-700'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="px-8 py-10 pb-24 md:pb-10">
      <h1 className="text-2xl font-bold mb-1">Flashcards</h1>
      <p className="text-sm text-slate-500 mb-8">Study your vocabulary</p>

      {flashcards.length === 0 ? (
        <div className="text-center mt-24">
          <div className="text-4xl mb-4">🗂</div>
          <p className="text-slate-400 mb-2">No flashcards yet</p>
          <p className="text-sm text-slate-600 mb-6">
            Create flashcards by clicking words in video transcripts.
          </p>
          <button
            onClick={() => navigate('/')}
            className="rounded-lg bg-indigo-500 hover:bg-indigo-400 px-6 py-2.5 text-sm font-medium transition-colors"
          >
            Go to videos
          </button>
        </div>
      ) : (
        <>
          <FlashcardStats flashcards={filtered} />

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {availableLanguages.length > 1 && (
              <>
                <button
                  onClick={() => setFilterLang(null)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    filterLang === null
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                      : 'bg-slate-800/50 text-slate-500 border border-slate-700/50'
                  }`}
                >
                  All languages
                </button>
                {availableLanguages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setFilterLang(lang === filterLang ? null : lang)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      filterLang === lang
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                        : 'bg-slate-800/50 text-slate-500 border border-slate-700/50'
                    }`}
                  >
                    {LANGUAGE_MAP[lang] ?? lang}
                  </button>
                ))}
                <span className="w-px h-4 bg-slate-800" />
              </>
            )}

            <button
              onClick={() => setFilterComfort(null)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                filterComfort === null
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                  : 'bg-slate-800/50 text-slate-500 border border-slate-700/50'
              }`}
            >
              All levels
            </button>
            {[1, 2, 3, 4].map((level) => (
              <button
                key={level}
                onClick={() => setFilterComfort(level === filterComfort ? null : level)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  filterComfort === level
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                    : 'bg-slate-800/50 text-slate-500 border border-slate-700/50'
                }`}
              >
                {COMFORT_LABELS[level - 1]}
              </button>
            ))}
          </div>

          {/* Mode selector */}
          <div className="flex gap-2 mt-6 mb-6">
            {modeButton('quiz', 'Quiz')}
            {modeButton('browse', 'Browse')}
          </div>

          {/* Study area */}
          {filtered.length === 0 ? (
            <p className="text-center text-slate-500 py-12">
              No flashcards match these filters.
            </p>
          ) : mode === 'quiz' ? (
            <FlashcardQuiz flashcards={filtered} onUpdate={loadFlashcards} />
          ) : (
            <FlashcardBrowse flashcards={filtered} onUpdate={loadFlashcards} />
          )}
        </>
      )}
    </div>
  )
}
