import { useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../hooks/useAuth'

type Props = {
  children: React.ReactNode
}

const NAV_ITEMS = [
  {
    path: '/',
    label: 'Home',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    path: '/flashcards',
    label: 'Flashcards',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25-9.75 5.25-9.75-5.25 4.179-2.25" />
      </svg>
    ),
  },
]

export function AppLayout({ children }: Props) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'User'
  const avatarUrl = user?.user_metadata?.avatar_url

  function isActive(path: string) {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex">
      {/* Sidebar — desktop */}
      <aside className="flex w-56 shrink-0 flex-col fixed inset-y-0 left-0 bg-slate-900/80 border-r border-slate-800/50 backdrop-blur-sm z-30">
        {/* Logo */}
        <div className="px-5 pt-6 pb-8">
          <button
            onClick={() => navigate('/')}
            className="text-xl font-bold tracking-tight text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            LLL
          </button>
          <p className="text-[10px] text-slate-600 mt-0.5 tracking-widest uppercase">Language Lab</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive(item.path)
                  ? 'bg-indigo-500/10 text-indigo-300'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 pb-4 mt-auto">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-800/30">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full shrink-0" referrerPolicy="no-referrer" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-slate-700 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white font-medium truncate">{firstName}</p>
              <button
                onClick={signOut}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56 min-h-screen">
        {children}
      </main>

    </div>
  )
}
