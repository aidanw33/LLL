import { Lou } from './Lou'

type Props = {
  size?: number
  className?: string
}

export function Wordmark({ size = 32, className }: Props) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.05,
        fontFamily: '"Figtree", ui-sans-serif, system-ui, sans-serif',
        fontSize: size,
        fontWeight: 400,
        letterSpacing: '-0.02em',
        lineHeight: 1,
        color: 'var(--color-paper-50)',
      }}
    >
      <span>L</span>
      <Lou pose="mark" size={size * 0.9} className="text-[var(--color-acid-500)]" />
      <span>L</span>
    </span>
  )
}
