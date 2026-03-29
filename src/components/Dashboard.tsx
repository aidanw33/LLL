import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { LANGUAGE_MAP } from '../lib/languages'
import { YouTubeUrlInput } from './video/YouTubeUrlInput'
import type { Video } from '../types/video'

export function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showImport, setShowImport] = useState(false)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [filterLang, setFilterLang] = useState<string | null>(null)

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'there'

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
    <div className="px-8 py-10 pb-24 md:pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {firstName}</h1>
          <p className="text-sm text-slate-500 mt-1">Your video library</p>
        </div>
        <button
          onClick={() => setShowImport(true)}
          className="rounded-lg bg-indigo-500 hover:bg-indigo-400 px-5 py-2.5 text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
        >
          + Import video
        </button>
      </div>

      {/* Filters */}
      {availableLanguages.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilterLang(null)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              filterLang === null
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                : 'bg-slate-800/50 text-slate-500 border border-slate-700/50'
            }`}
          >
            All
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
        </div>
      )}

      {/* Video grid */}
      {loading ? (
        <p className="text-slate-500 text-center mt-16">Loading...</p>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center mt-24">
          <div className="text-4xl mb-4">🎬</div>
          <p className="text-slate-400 mb-2">
            {videos.length === 0
              ? 'No videos yet'
              : 'No videos match this filter'}
          </p>
          {videos.length === 0 && (
            <p className="text-sm text-slate-600">Import your first video to get started.</p>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((video) => (
            <button
              key={video.id}
              onClick={() => navigate(`/watch/${video.id}`)}
              className="group rounded-xl bg-slate-800/30 border border-slate-800/50 overflow-hidden text-left hover:border-slate-700 hover:-translate-y-1 transition-all duration-200 hover:shadow-xl hover:shadow-black/20"
            >
              <div className="overflow-hidden">
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                  alt={video.title}
                  className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-slate-200 line-clamp-2 group-hover:text-white transition-colors">
                  {video.title}
                </h3>
                {video.language && (
                  <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-700/50 text-slate-400">
                    {LANGUAGE_MAP[video.language] ?? video.language}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {showImport && <YouTubeUrlInput onClose={() => setShowImport(false)} />}
    </div>
  )
}
