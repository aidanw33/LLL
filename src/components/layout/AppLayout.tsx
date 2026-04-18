import { NavLink } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { Wordmark } from '../brand/Wordmark'

type Props = {
  children: React.ReactNode
}

const NAV_ITEMS = [
  { to: '/', label: 'Library', end: true },
  { to: '/flashcards', label: 'Flashcards', end: false },
]

export function AppLayout({ children }: Props) {
  const { user, signOut } = useAuth()
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'You'
  const avatarUrl = user?.user_metadata?.avatar_url

  return (
    <div className="terrarium-bg min-h-screen flex text-[var(--color-paper-50)]">
      <aside
        className="w-[208px] shrink-0 border-r border-[var(--color-obsidian-700)] flex flex-col fixed inset-y-0 left-0 z-30"
        style={{ background: 'var(--color-obsidian-950)' }}
      >
        <div className="px-5 pt-6 pb-4">
          <Wordmark size={24} />
          <div className="mono-label mt-2 !text-[9px]">A LANGUAGE LAB</div>
        </div>

        <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'px-3 py-2 rounded-sm text-[14px] font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--color-obsidian-800)] text-[var(--color-acid-500)]'
                    : 'text-[var(--color-paper-200)] hover:text-[var(--color-paper-50)] hover:bg-[var(--color-obsidian-800)]',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 pb-4 border-t border-[var(--color-obsidian-700)] pt-3">
          <div className="flex items-center gap-3 px-2 py-2">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full shrink-0" referrerPolicy="no-referrer" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-[var(--color-obsidian-700)] shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm text-[var(--color-paper-50)] font-medium truncate">{firstName}</p>
              <button
                onClick={signOut}
                className="text-xs text-[var(--color-paper-400)] hover:text-[var(--color-acid-500)] transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-[208px] min-w-0">{children}</main>
    </div>
  )
}
