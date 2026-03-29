import { useNavigate } from 'react-router'

type Props = {
  title: string
  backTo?: string
}

export function BackHeader({ title, backTo = '/' }: Props) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-800/50">
      <button
        onClick={() => navigate(backTo)}
        className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      </button>
      <h1 className="text-sm font-medium text-slate-300 truncate">{title}</h1>
    </div>
  )
}
