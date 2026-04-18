import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { LANGUAGE_MAP } from '../../lib/languages'
import { FlashcardStats } from './FlashcardStats'
import { FlashcardQuiz } from './FlashcardQuiz'
import { FlashcardBrowse } from './FlashcardBrowse'
import { EmptyFlashcards } from '../states'
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
        <p className="mono-label">LOADING FLASHCARDS…</p>
      </div>
    )
  }

  if (flashcards.length === 0) {
    return (
      <div className="px-10 py-10">
        <div className="mb-10">
          <div className="mono-label">FLASHCARDS</div>
          <h1 className="text-5xl leading-[1.1] tracking-tight mt-2">
            Your words.
          </h1>
        </div>
        <EmptyFlashcards onGoToVideos={() => navigate('/')} />
      </div>
    )
  }

  return (
    <div className="px-10 py-10 w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <div className="mono-label">FLASHCARDS</div>
          <h1 className="text-5xl leading-[1.1] tracking-tight mt-2">
            Your words.
          </h1>
        </div>
      </div>

      <FlashcardStats flashcards={filtered} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mt-6">
        {availableLanguages.length > 1 && (
          <>
            <Chip active={filterLang === null} onClick={() => setFilterLang(null)}>
              All languages
            </Chip>
            {availableLanguages.map((lang) => (
              <Chip
                key={lang}
                active={filterLang === lang}
                onClick={() => setFilterLang(lang === filterLang ? null : lang)}
              >
                {LANGUAGE_MAP[lang] ?? lang}
              </Chip>
            ))}
            <span className="w-px h-4 bg-[var(--color-obsidian-700)] mx-1" />
          </>
        )}

        <Chip active={filterComfort === null} onClick={() => setFilterComfort(null)}>
          All levels
        </Chip>
        {[1, 2, 3, 4].map((level) => (
          <Chip
            key={level}
            active={filterComfort === level}
            onClick={() => setFilterComfort(level === filterComfort ? null : level)}
          >
            {COMFORT_LABELS[level - 1]}
          </Chip>
        ))}
      </div>

      {/* Mode selector */}
      <div className="flex gap-2 mt-6 mb-6">
        <ModeButton active={mode === 'quiz'} onClick={() => setMode('quiz')}>
          Quiz
        </ModeButton>
        <ModeButton active={mode === 'browse'} onClick={() => setMode('browse')}>
          Browse
        </ModeButton>
      </div>

      {/* Study area */}
      {filtered.length === 0 ? (
        <p className="mono-label text-center py-12">NO FLASHCARDS MATCH THESE FILTERS</p>
      ) : mode === 'quiz' ? (
        <FlashcardQuiz flashcards={filtered} onUpdate={loadFlashcards} />
      ) : (
        <FlashcardBrowse flashcards={filtered} onUpdate={loadFlashcards} />
      )}
    </div>
  )
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  const base = 'px-3 py-1 rounded-full text-xs font-medium border transition-colors'
  if (active) {
    return (
      <button
        onClick={onClick}
        className={`${base} bg-[var(--color-acid-500)] text-[var(--color-obsidian-900)] border-[var(--color-acid-500)]`}
      >
        {children}
      </button>
    )
  }
  return (
    <button
      onClick={onClick}
      className={`${base} text-[var(--color-paper-200)] border-[var(--color-obsidian-700)] hover:border-[var(--color-moss-500)] hover:text-[var(--color-paper-50)]`}
    >
      {children}
    </button>
  )
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
        active
          ? 'bg-[var(--color-acid-500)] text-[var(--color-obsidian-900)]'
          : 'bg-[var(--color-obsidian-800)] text-[var(--color-paper-200)] border border-[var(--color-obsidian-700)] hover:border-[var(--color-moss-500)] hover:text-[var(--color-paper-50)]'
      }`}
    >
      {children}
    </button>
  )
}
