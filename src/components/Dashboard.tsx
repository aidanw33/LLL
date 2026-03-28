import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { YouTubeUrlInput } from './video/YouTubeUrlInput'

export function Dashboard() {
  const { user, signOut } = useAuth()
  const [showImport, setShowImport] = useState(false)

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'there'
  const avatarUrl = user?.user_metadata?.avatar_url

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Nav */}
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

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 pt-16 pb-24">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {firstName}</h1>
        <p className="text-slate-400 mb-12">What would you like to do today?</p>

        <div className="grid sm:grid-cols-3 gap-6">
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6 flex flex-col">
            <div className="text-3xl mb-4">🎬</div>
            <h3 className="text-lg font-semibold mb-2">Watch video</h3>
            <p className="text-sm text-slate-400 mb-6 flex-1">
              Import a YouTube video and learn from its transcript.
            </p>
            <button
              onClick={() => setShowImport(true)}
              className="rounded-lg bg-indigo-500 hover:bg-indigo-400 px-4 py-2 text-sm font-medium transition-colors w-full"
            >
              Import
            </button>
          </div>

          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6 flex flex-col opacity-60">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">My library</h3>
            <p className="text-sm text-slate-400 mb-6 flex-1">
              Continue reading your saved texts.
            </p>
            <span className="text-xs text-slate-500 font-medium">Coming soon</span>
          </div>

          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6 flex flex-col opacity-60">
            <div className="text-3xl mb-4">🗂️</div>
            <h3 className="text-lg font-semibold mb-2">Flashcards</h3>
            <p className="text-sm text-slate-400 mb-6 flex-1">
              Review your saved vocabulary with spaced repetition.
            </p>
            <span className="text-xs text-slate-500 font-medium">Coming soon</span>
          </div>
        </div>

        <p className="text-center text-slate-500 mt-16">
          Import your first video to get started.
        </p>
      </main>

      {showImport && <YouTubeUrlInput onClose={() => setShowImport(false)} />}
    </div>
  )
}
