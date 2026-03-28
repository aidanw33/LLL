import { useAuth } from '../contexts/AuthContext'

export function LandingPage() {
  const { signInWithGoogle } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <span className="text-2xl font-bold tracking-tight">LLL</span>
        <button
          onClick={signInWithGoogle}
          className="rounded-lg bg-indigo-500 hover:bg-indigo-400 px-5 py-2 text-sm font-medium transition-colors"
        >
          Sign in
        </button>
      </nav>

      {/* Hero */}
      <main className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-32 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 text-sm text-indigo-300 mb-8">
          <span>Learn languages by reading</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
          Read anything.
          <br />
          <span className="text-indigo-400">Understand everything.</span>
        </h1>

        <p className="text-lg text-slate-400 max-w-xl mb-12">
          Import text in any language, click any word or sentence to see the
          translation. Build your vocabulary naturally through content you
          actually care about.
        </p>

        <div className="flex gap-4">
          <button
            onClick={signInWithGoogle}
            className="rounded-lg bg-indigo-500 hover:bg-indigo-400 px-8 py-3 text-base font-medium transition-colors"
          >
            Get started
          </button>
          <button className="rounded-lg border border-slate-600 hover:border-slate-500 px-8 py-3 text-base font-medium text-slate-300 transition-colors">
            Learn more
          </button>
        </div>
      </main>

      {/* Feature cards */}
      <section className="max-w-5xl mx-auto px-6 pb-24 grid sm:grid-cols-3 gap-6">
        <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6">
          <div className="text-3xl mb-4">📖</div>
          <h3 className="text-lg font-semibold mb-2">Import any text</h3>
          <p className="text-sm text-slate-400">
            Paste articles, stories, or any content in your target language.
          </p>
        </div>
        <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6">
          <div className="text-3xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">Instant translations</h3>
          <p className="text-sm text-slate-400">
            Click any word or sentence to see what it means in English.
          </p>
        </div>
        <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6">
          <div className="text-3xl mb-4">🗂️</div>
          <h3 className="text-lg font-semibold mb-2">Build flashcards</h3>
          <p className="text-sm text-slate-400">
            Save words you want to remember and study them with spaced repetition.
          </p>
        </div>
      </section>
    </div>
  )
}
