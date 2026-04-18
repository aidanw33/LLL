import { Lou } from './brand/Lou'

export function EmptyLibrary({ onAdd }: { onAdd?: () => void }) {
  return (
    <StateShell>
      <Lou pose="sleep" size={160} animated className="text-[var(--color-moss-500)]" />
      <Headline>Nothing here. Yet.</Headline>
      <Sub>Lou's taking a nap. Wake him with your first video.</Sub>
      {onAdd && (
        <button
          onClick={onAdd}
          className="mt-6 rounded-sm bg-[var(--color-acid-500)] text-[var(--color-obsidian-900)] px-5 py-2.5 text-sm font-semibold hover:bg-[var(--color-acid-400)]"
        >
          Paste a YouTube link →
        </button>
      )}
    </StateShell>
  )
}

export function EmptyFlashcards({ onGoToVideos }: { onGoToVideos?: () => void }) {
  return (
    <StateShell>
      <Lou pose="skeptic" size={140} className="text-[var(--color-moss-500)]" />
      <Headline>Zero flashcards.</Headline>
      <Sub>"An elegant vocabulary, for a mute." — Lou</Sub>
      <div className="mono-label mt-6 opacity-60">
        CLICK ANY WORD IN A TRANSCRIPT TO SAVE IT
      </div>
      {onGoToVideos && (
        <button
          onClick={onGoToVideos}
          className="mt-6 rounded-sm bg-[var(--color-acid-500)] text-[var(--color-obsidian-900)] px-5 py-2.5 text-sm font-semibold hover:bg-[var(--color-acid-400)]"
        >
          Go to videos →
        </button>
      )}
    </StateShell>
  )
}

export function LoadingState({ label = 'Reading your video…' }: { label?: string }) {
  return (
    <StateShell>
      <Lou pose="reading" size={140} animated className="text-[var(--color-acid-500)]" />
      <Headline>{label}</Headline>
      <Sub>Lou's taking notes.</Sub>
    </StateShell>
  )
}

export function NotFound() {
  return (
    <StateShell>
      <Lou pose="skeptic" size={140} className="text-[var(--color-signal-red)]" />
      <Headline>
        404<span className="text-[var(--color-paper-400)]">.</span>
      </Headline>
      <Sub>"That broke. Not your fault — probably." — Lou</Sub>
      <a
        href="/"
        className="mt-6 mono-label hover:!text-[var(--color-acid-500)]"
      >
        ← BACK TO LIBRARY
      </a>
    </StateShell>
  )
}

function StateShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      {children}
    </div>
  )
}

function Headline({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-4xl leading-[1.1] mt-5 tracking-tight">
      {children}
    </h2>
  )
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[var(--color-paper-400)] text-sm leading-relaxed mt-4 font-[Figtree] max-w-sm">
      {children}
    </p>
  )
}
