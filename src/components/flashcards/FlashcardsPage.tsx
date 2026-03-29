import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { LANGUAGE_MAP } from '../../lib/languages'
import { FlashcardStats } from './FlashcardStats'
import { FlashcardQuiz } from './FlashcardQuiz'
import { MatchGame } from './MatchGame'
import type { Flashcard } from '../../types/video'

type StudyMode = 'quiz' | 'match'

export function FlashcardsPage() {
  const navigate = useNavigate()
  const { session, signOut } = useAuth()
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
    // Fetch flashcards on mount and when session changes
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <p className="text-slate-400">Loading flashcards...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <nav className="flex items-center justify-between px-8 py-6 max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="text-2xl font-bold tracking-tight hover:text-indigo-400 transition-colors"
        >
          LLL
        </button>
        <div className="flex items-center gap-4">
          <h1 className="text-sm text-slate-400">Flashcards</h1>
          <button
            onClick={signOut}
            className="rounded-lg border border-slate-600 hover:border-slate-500 px-4 py-2 text-sm font-medium text-slate-300 transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pb-12">
        {flashcards.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-2xl font-bold text-white mb-2">No flashcards yet</p>
            <p className="text-slate-400 mb-6">
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
            {/* Stats */}
            <FlashcardStats flashcards={filtered} />

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {/* Language filters */}
              {availableLanguages.length > 1 && (
                <>
                  <button
                    onClick={() => setFilterLang(null)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      filterLang === null
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                        : 'bg-slate-800/50 text-slate-500 border border-slate-700'
                    }`}
                  >
                    All languages
                  </button>
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setFilterLang(lang === filterLang ? null : lang)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        filterLang === lang
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                          : 'bg-slate-800/50 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {LANGUAGE_MAP[lang] ?? lang}
                    </button>
                  ))}
                </>
              )}

              <span className="w-px h-4 bg-slate-700" />

              {/* Comfort filters */}
              <button
                onClick={() => setFilterComfort(null)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterComfort === null
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                    : 'bg-slate-800/50 text-slate-500 border border-slate-700'
                }`}
              >
                All levels
              </button>
              {[1, 2, 3, 4].map((level) => {
                const labels = ['New', 'Learning', 'Familiar', 'Known']
                return (
                  <button
                    key={level}
                    onClick={() => setFilterComfort(level === filterComfort ? null : level)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      filterComfort === level
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                        : 'bg-slate-800/50 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {labels[level - 1]}
                  </button>
                )
              })}
            </div>

            {/* Mode selector */}
            <div className="flex gap-2 mt-6 mb-6">
              <button
                onClick={() => setMode('quiz')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  mode === 'quiz'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-500'
                }`}
              >
                Quiz
              </button>
              <button
                onClick={() => setMode('match')}
                disabled={filtered.length < 4}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  mode === 'match'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-500'
                }`}
              >
                Match
              </button>
            </div>

            {/* Study area */}
            {filtered.length === 0 ? (
              <p className="text-center text-slate-500 py-12">
                No flashcards match these filters.
              </p>
            ) : mode === 'quiz' ? (
              <FlashcardQuiz flashcards={filtered} onUpdate={loadFlashcards} />
            ) : (
              <MatchGame flashcards={filtered} />
            )}
          </>
        )}
      </main>
    </div>
  )
}
