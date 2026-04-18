import { useNavigate } from 'react-router'

type Props = {
  title: string
  backTo?: string
}

export function BackHeader({ title, backTo = '/' }: Props) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between gap-4 px-10 py-5 border-b border-[var(--color-obsidian-700)]">
      <button
        onClick={() => navigate(backTo)}
        className="mono-label hover:!text-[var(--color-paper-50)] transition-colors"
      >
        ← BACK TO LIBRARY
      </button>
      <h1 className="text-lg text-[var(--color-paper-200)] truncate">
        {title}
      </h1>
    </div>
  )
}
