import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranscript } from '../../hooks/useTranscript'

type Props = {
  onClose: () => void
}

export function YouTubeUrlInput({ onClose }: Props) {
  const [url, setUrl] = useState('')
  const navigate = useNavigate()
  const { fetchTranscript, loading, error } = useTranscript()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return

    const result = await fetchTranscript(url.trim())
    if (result) {
      navigate(`/watch/${result.video.id}`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-lg font-semibold text-white mb-4">
          Import YouTube video
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded-lg bg-slate-900 border border-slate-600 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            disabled={loading}
            autoFocus
          />

          {error && (
            <p className="text-sm text-red-400 mt-2">{error}</p>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-600 hover:border-slate-500 px-4 py-2 text-sm font-medium text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm font-medium transition-colors"
            >
              {loading ? 'Fetching transcript...' : 'Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
