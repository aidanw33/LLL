import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { LANGUAGE_MAP } from '../lib/languages'
import { YouTubeUrlInput } from './video/YouTubeUrlInput'
import { EmptyLibrary } from './states'
import type { Video } from '../types/video'

export function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showImport, setShowImport] = useState(false)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [filterLang, setFilterLang] = useState<string | null>(null)

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'friend'

  useEffect(() => {
    if (!user) return

    async function loadVideos() {
      const { data } = await supabase
        .from('user_videos')
        .select('videoId, videos(id, youtubeId, title, language, createdAt)')
        .eq('userId', user!.id)
        .order('createdAt', { ascending: false })

      const videoList = (data ?? [])
        .map((row) => (row as unknown as { videos: Video }).videos)
        .filter(Boolean)
      setVideos(videoList)
      setLoading(false)
    }
    loadVideos()
  }, [user])

  const availableLanguages = useMemo(() => {
    const langs = new Set(videos.map((v) => v.language).filter(Boolean))
    return Array.from(langs).sort() as string[]
  }, [videos])

  const languageCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const v of videos) {
      if (v.language) counts[v.language] = (counts[v.language] ?? 0) + 1
    }
    return counts
  }, [videos])

  const filteredVideos = filterLang
    ? videos.filter((v) => v.language === filterLang)
    : videos

  return (
    <div className="px-10 py-10 w-full">
      {/* Header */}
      <header className="mb-10 flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="mono-label">YOUR LIBRARY</div>
          <h1 className="text-5xl font-normal mt-2 tracking-tight">
            Welcome back, {firstName}.
          </h1>
        </div>
        <button
          onClick={() => setShowImport(true)}
          className="cta-shine shrink-0 rounded-sm bg-[var(--color-acid-500)] text-[var(--color-obsidian-900)] px-5 py-2.5 text-sm font-semibold hover:bg-[var(--color-acid-400)] transition-colors"
        >
          + Import video
        </button>
      </header>

      {/* Language chips */}
      {availableLanguages.length > 0 && (
        <div className="flex items-center gap-2 mb-10 flex-wrap">
          <Chip active={filterLang === null} onClick={() => setFilterLang(null)}>
            All · {videos.length}
          </Chip>
          {availableLanguages.map((lang) => (
            <Chip
              key={lang}
              active={filterLang === lang}
              onClick={() => setFilterLang(lang === filterLang ? null : lang)}
            >
              {LANGUAGE_MAP[lang] ?? lang} · {languageCounts[lang]}
            </Chip>
          ))}
          <Chip ghost onClick={() => setShowImport(true)}>
            + add video
          </Chip>
        </div>
      )}

      {/* Video grid */}
      {loading ? (
        <p className="mono-label text-center mt-16">LOADING…</p>
      ) : videos.length === 0 ? (
        <EmptyLibrary onAdd={() => setShowImport(true)} />
      ) : filteredVideos.length === 0 ? (
        <p className="mono-label text-center mt-16">NO VIDEOS MATCH THIS FILTER</p>
      ) : (
        <section>
          <div className="flex items-baseline gap-3 mb-4">
            <div className="text-xl text-[var(--color-acid-500)]">
              {filterLang
                ? `${LANGUAGE_MAP[filterLang] ?? filterLang} · ${filteredVideos.length} videos`
                : `All · ${filteredVideos.length} videos`}
            </div>
            <div className="h-px flex-1 bg-[var(--color-obsidian-700)]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                title={video.title}
                youtubeId={video.youtubeId}
                lang={video.language ?? undefined}
                onClick={() => navigate(`/watch/${video.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {showImport && <YouTubeUrlInput onClose={() => setShowImport(false)} />}
    </div>
  )
}

type VideoCardProps = {
  title: string
  youtubeId: string
  lang?: string
  onClick: () => void
}

function VideoCard({ title, youtubeId, lang, onClick }: VideoCardProps) {
  return (
    <button
      onClick={onClick}
      className="card-lift text-left group rounded-md overflow-hidden border border-[var(--color-obsidian-700)] bg-[var(--color-obsidian-800)] fade-up"
    >
      <div className="aspect-video overflow-hidden">
        <img
          src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
      </div>
      <div className="p-3">
        <div className="text-sm font-semibold line-clamp-2 group-hover:text-[var(--color-acid-500)] transition-colors">
          {title}
        </div>
        {lang && (
          <div className="mono-label !text-[9px] mt-1">
            {LANGUAGE_MAP[lang] ?? lang}
          </div>
        )}
      </div>
    </button>
  )
}

function Chip({
  children,
  active,
  ghost,
  onClick,
}: {
  children: React.ReactNode
  active?: boolean
  ghost?: boolean
  onClick?: () => void
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
  if (ghost) {
    return (
      <button
        onClick={onClick}
        className={`${base} text-[var(--color-paper-400)] border-dashed border-[var(--color-obsidian-600)] hover:text-[var(--color-paper-200)] hover:border-[var(--color-moss-500)]`}
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
