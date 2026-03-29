import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { LANGUAGE_MAP } from '../lib/languages'
import { YouTubeUrlInput } from './video/YouTubeUrlInput'
import type { Video } from '../types/video'

export function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [showImport, setShowImport] = useState(false)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [filterLang, setFilterLang] = useState<string | null>(null)

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'there'
  const avatarUrl = user?.user_metadata?.avatar_url

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

  const filteredVideos = filterLang
    ? videos.filter((v) => v.language === filterLang)
    : videos

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <span className="text-2xl font-bold tracking-tight">LLL</span>
        <div className="flex items-center gap-4">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt=""
              className="h-8 w-8 rounded-full"
              referrerPolicy="no-referrer"
            />
          )}
          <button
            onClick={signOut}
            className="rounded-lg border border-slate-600 hover:border-slate-500 px-4 py-2 text-sm font-medium text-slate-300 transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-16 pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {firstName}</h1>
            <p className="text-slate-400">Your video library</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/flashcards')}
              className="rounded-lg border border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10 px-5 py-2.5 text-sm font-medium transition-colors"
            >
              Study Flashcards
            </button>
            <button
              onClick={() => setShowImport(true)}
              className="rounded-lg bg-indigo-500 hover:bg-indigo-400 px-5 py-2.5 text-sm font-medium transition-colors"
            >
              Import video
            </button>
          </div>
        </div>

        {availableLanguages.length > 1 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setFilterLang(null)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filterLang === null
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                  : 'bg-slate-800/50 text-slate-500 border border-slate-700'
              }`}
            >
              All
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
          </div>
        )}

        {loading ? (
          <p className="text-slate-500 text-center mt-16">Loading...</p>
        ) : filteredVideos.length === 0 ? (
          <p className="text-slate-500 text-center mt-16">
            {videos.length === 0
              ? 'Import your first video to get started.'
              : 'No videos match this filter.'}
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.map((video) => (
              <button
                key={video.id}
                onClick={() => navigate(`/watch/${video.id}`)}
                className="rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden text-left hover:border-slate-600 transition-colors"
              >
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                  alt={video.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="p-4">
                  <h3 className="text-sm font-medium text-white line-clamp-2">
                    {video.title}
                  </h3>
                  {video.language && (
                    <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {LANGUAGE_MAP[video.language] ?? video.language}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {showImport && <YouTubeUrlInput onClose={() => setShowImport(false)} />}
    </div>
  )
}
