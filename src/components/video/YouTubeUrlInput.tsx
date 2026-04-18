import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranscript } from '../../hooks/useTranscript'
import { LANGUAGES } from '../../lib/languages'

type Props = {
  onClose: () => void
}

export function YouTubeUrlInput({ onClose }: Props) {
  const [url, setUrl] = useState('')
  const [lang, setLang] = useState('fr')
  const navigate = useNavigate()
  const { fetchTranscript, loading, error } = useTranscript()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim() || !lang) return

    const result = await fetchTranscript(url.trim(), lang)
    if (result) {
      navigate(`/watch/${result.video.id}`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-[var(--color-obsidian-800)] border border-[var(--color-obsidian-700)] rounded-md p-6 w-full max-w-lg">
        <div className="mono-label mb-1">IMPORT</div>
        <h2 className="text-3xl leading-tight mb-5 tracking-tight">
          Paste a YouTube link.
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded-sm bg-[var(--color-obsidian-900)] border border-[var(--color-obsidian-700)] px-3 py-2.5 text-sm font-[Figtree] text-[var(--color-paper-50)] placeholder:text-[var(--color-paper-400)] focus:outline-none focus:border-[var(--color-moss-500)] transition-colors"
            disabled={loading}
            autoFocus
          />

          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            disabled={loading}
            className="w-full mt-3 rounded-sm bg-[var(--color-obsidian-900)] border border-[var(--color-obsidian-700)] px-3 py-2.5 text-sm font-[Figtree] text-[var(--color-paper-50)] focus:outline-none focus:border-[var(--color-moss-500)] transition-colors"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>

          {error && <p className="text-sm text-[var(--color-signal-red)] mt-2">{error}</p>}

          <div className="flex justify-end gap-3 mt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-sm border border-[var(--color-obsidian-600)] hover:border-[var(--color-moss-500)] px-4 py-2 text-sm font-medium text-[var(--color-paper-200)] hover:text-[var(--color-paper-50)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="rounded-sm bg-[var(--color-acid-500)] text-[var(--color-obsidian-900)] hover:bg-[var(--color-acid-400)] disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm font-semibold transition-colors"
            >
              {loading ? 'Fetching…' : 'Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
