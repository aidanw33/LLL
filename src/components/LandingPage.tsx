import { useAuth } from '../hooks/useAuth'
import { Lou } from './brand/Lou'
import { Wordmark } from './brand/Wordmark'

export function LandingPage() {
  const { signInWithGoogle } = useAuth()

  return (
    <div className="terrarium-bg min-h-screen text-[var(--color-paper-50)]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <Wordmark size={28} />
        <div className="flex items-center gap-6 text-sm text-[var(--color-paper-200)]">
          <a href="#how" className="hover:text-[var(--color-paper-50)]">How it works</a>
          <a href="#languages" className="hover:text-[var(--color-paper-50)]">Languages</a>
          <button
            onClick={signInWithGoogle}
            className="rounded-md bg-[var(--color-acid-500)] text-[var(--color-obsidian-900)] px-4 py-1.5 text-sm font-semibold hover:bg-[var(--color-acid-400)] transition-colors"
          >
            Sign in
          </button>
        </div>
      </nav>

      {/* Hero — Lou-first */}
      <main className="max-w-5xl mx-auto px-6 pt-20 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="mono-label mb-5">A language lab · for readers</div>
          <h1 className="font-[Figtree] text-5xl md:text-6xl font-extrabold leading-[1.02] tracking-tight mb-6">
            Learn a language the way you{' '}
            <span className="text-[var(--color-acid-500)]">actually use</span>{' '}
            the internet.
          </h1>
          <p className="text-lg text-[var(--color-paper-200)] max-w-md leading-relaxed mb-8">
            Drop in any YouTube link. Click any word to translate. Save what
            surprises you. Lou — your perpetually unimpressed chameleon tutor — keeps score.
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={signInWithGoogle}
              className="cta-shine rounded-md bg-[var(--color-acid-500)] text-[var(--color-obsidian-900)] px-6 py-3 text-sm font-semibold hover:bg-[var(--color-acid-400)] transition-colors"
            >
              Start free →
            </button>
            <button className="rounded-md border border-[var(--color-obsidian-600)] px-6 py-3 text-sm font-medium text-[var(--color-paper-200)] hover:border-[var(--color-moss-500)] hover:text-[var(--color-paper-50)] transition-colors">
              Watch 30-sec demo
            </button>
          </div>
          <div className="mono-label !text-[10px]">
            NO CARD · 40+ LANGUAGES · WORKS WITH ANY YT VIDEO
          </div>
        </div>

        {/* Lou portrait */}
        <div className="acid-ring relative flex items-center justify-center">
          <Lou
            pose="sit"
            size={320}
            animated
            className="text-[var(--color-acid-500)] relative z-10"
            title="Lou the chameleon"
          />
          <div className="absolute bottom-4 right-0 z-20 bg-[var(--color-obsidian-800)] border border-[var(--color-obsidian-600)] rounded-md px-3 py-2 max-w-[210px] text-sm">
            "Fluent in six. Judgmental in all of them."
            <div className="mono-label !text-[10px] mt-1">— LOU</div>
          </div>
        </div>
      </main>

      {/* How it works */}
      <section id="how" className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-5">
        {[
          { n: '01', t: 'Any YouTube link', d: 'Paste a URL. We fetch the transcript, detect the language, segment it.' },
          { n: '02', t: 'Click to understand', d: 'Every word is tappable. Translations appear inline, in context.' },
          { n: '03', t: 'Lou remembers', d: 'Save what matters. Spaced repetition keeps the words close.' },
        ].map((f) => (
          <div
            key={f.n}
            className="rounded-lg bg-[var(--color-obsidian-800)] border border-[var(--color-obsidian-700)] p-6"
          >
            <div className="mono-label">{f.n}</div>
            <div className="text-lg font-semibold mt-2">{f.t}</div>
            <p className="text-sm text-[var(--color-paper-200)] mt-2 leading-relaxed">{f.d}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
