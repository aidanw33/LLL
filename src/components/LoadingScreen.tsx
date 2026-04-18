import { Lou } from './brand/Lou'

export function LoadingScreen() {
  return (
    <div className="terrarium-bg min-h-screen flex items-center justify-center">
      <Lou pose="reading" size={120} animated className="text-[var(--color-acid-500)]" />
    </div>
  )
}
