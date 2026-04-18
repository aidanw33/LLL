import { useId } from 'react'

type Pose = 'sit' | 'peek' | 'reading' | 'cheer' | 'skeptic' | 'sleep' | 'mark'

type LouProps = {
  pose?: Pose
  size?: number
  animated?: boolean
  className?: string
  title?: string
}

const VIEWBOXES: Record<Pose, string> = {
  sit: '0 0 120 90',
  peek: '0 0 120 60',
  reading: '0 0 120 100',
  cheer: '0 0 120 100',
  skeptic: '0 0 120 90',
  sleep: '0 0 120 90',
  mark: '0 0 60 60',
}

export function Lou({
  pose = 'sit',
  size = 120,
  animated = false,
  className,
  title,
}: LouProps) {
  const id = useId()
  const vb = VIEWBOXES[pose]
  const [, , vbw, vbh] = vb.split(' ').map(Number)
  const height = Math.round(size * (vbh / vbw))

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={vb}
      width={size}
      height={height}
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <LouBody pose={pose} animated={animated} idPrefix={id} />
    </svg>
  )
}

function LouBody({
  pose,
  animated,
  idPrefix,
}: {
  pose: Pose
  animated: boolean
  idPrefix: string
}) {
  const eyeAnim = animated
    ? { style: { transformBox: 'fill-box' as const, transformOrigin: 'center', animation: `${idPrefix}-blink 5s infinite` } }
    : {}

  switch (pose) {
    case 'sit':
      return (
        <>
          {animated && <style>{`@keyframes ${idPrefix}-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(0.1)}}`}</style>}
          {/* tail */}
          <path d="M80 62 C 100 56, 108 40, 96 28 C 84 16, 68 22, 70 36"
            fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="52" cy="58" rx="32" ry="18" fill="currentColor" />
          <path d="M68 72 q 4 8, -4 10" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M34 72 q -2 8, -8 9" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx="28" cy="46" rx="20" ry="16" fill="currentColor" />
          <path d="M18 34 q 8 -12, 22 -4" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="22" cy="44" r="6" fill="#f0ece0" />
          <circle cx="22" cy="44" r="3.2" fill="#0a0e0a" {...eyeAnim} />
          <circle cx="23" cy="43" r="1" fill="#f0ece0" />
          <path d="M12 52 q 6 4, 14 1" stroke="#0a0e0a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </>
      )
    case 'peek':
      return (
        <>
          <ellipse cx="60" cy="58" rx="44" ry="20" fill="currentColor" />
          <circle cx="45" cy="40" r="10" fill="currentColor" />
          <circle cx="45" cy="40" r="7" fill="#f0ece0" />
          <circle cx="45" cy="40" r="3.6" fill="#0a0e0a" />
          <circle cx="46" cy="39" r="1.1" fill="#f0ece0" />
          <circle cx="75" cy="40" r="10" fill="currentColor" />
          <circle cx="75" cy="40" r="7" fill="#f0ece0" />
          <circle cx="75" cy="40" r="3.6" fill="#0a0e0a" />
          <circle cx="76" cy="39" r="1.1" fill="#f0ece0" />
          <path d="M30 40 q -4 -10, 4 -10 M88 40 q 6 -10, 10 -6"
            stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </>
      )
    case 'reading':
      return (
        <>
          <path d="M80 62 C 100 56, 108 40, 96 28 C 84 16, 68 22, 70 36"
            fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="52" cy="58" rx="32" ry="18" fill="currentColor" />
          <ellipse cx="28" cy="46" rx="20" ry="16" fill="currentColor" />
          <path d="M18 34 q 8 -12, 22 -4" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="22" cy="44" r="6" fill="#f0ece0" />
          <circle cx="22" cy="44" r="3.2" fill="#0a0e0a" />
          <path d="M12 52 q 6 4, 14 1" stroke="#0a0e0a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <g transform="translate(34,62)">
            <rect x="0" y="0" width="24" height="14" fill="#f0ece0" stroke="#0a0e0a" strokeWidth="1.5" />
            <line x1="12" y1="0" x2="12" y2="14" stroke="#0a0e0a" strokeWidth="1" />
            <line x1="3" y1="4" x2="9" y2="4" stroke="#0a0e0a" strokeWidth="0.8" />
            <line x1="3" y1="7" x2="9" y2="7" stroke="#0a0e0a" strokeWidth="0.8" />
            <line x1="15" y1="4" x2="21" y2="4" stroke="#0a0e0a" strokeWidth="0.8" />
            <line x1="15" y1="7" x2="21" y2="7" stroke="#0a0e0a" strokeWidth="0.8" />
          </g>
        </>
      )
    case 'cheer':
      return (
        <>
          <path d="M80 62 C 102 56, 110 36, 94 22 C 80 10, 62 20, 66 34"
            fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="52" cy="62" rx="32" ry="18" fill="currentColor" />
          <ellipse cx="28" cy="50" rx="20" ry="16" fill="currentColor" />
          <path d="M34 52 q -4 -16, 2 -22" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M64 54 q 8 -14, 4 -22" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
          <circle cx="22" cy="48" r="6" fill="#f0ece0" />
          <circle cx="22" cy="48" r="3" fill="#0a0e0a" />
          <path d="M12 56 q 6 4, 14 0" stroke="#0a0e0a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <g stroke="#0a0e0a" strokeWidth="1.6" fill="none" strokeLinecap="round">
            <path d="M40 18 v 6 M37 21 h 6" />
            <path d="M78 12 v 5 M76 14 h 5" />
            <path d="M14 20 v 4 M12 22 h 4" />
          </g>
        </>
      )
    case 'skeptic':
      return (
        <>
          <path d="M80 62 C 100 56, 108 40, 96 28 C 84 16, 68 22, 70 36"
            fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="52" cy="58" rx="32" ry="18" fill="currentColor" />
          <ellipse cx="28" cy="46" rx="20" ry="16" fill="currentColor" />
          <rect x="16" y="38" width="12" height="10" fill="#f0ece0" />
          <circle cx="26" cy="44" r="3.2" fill="#0a0e0a" />
          <path d="M10 54 q 6 -2, 14 0" stroke="#0a0e0a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M14 34 q 6 -4, 14 -2" stroke="#0a0e0a" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )
    case 'sleep':
      return (
        <>
          <path d="M78 66 C 102 60, 108 46, 96 34 C 84 24, 72 30, 74 42"
            fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="54" cy="66" rx="34" ry="14" fill="currentColor" />
          <ellipse cx="28" cy="58" rx="20" ry="12" fill="currentColor" />
          <path d="M18 56 q 6 -4, 12 0" stroke="#0a0e0a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <g fill="#f0ece0" fontFamily="ui-sans-serif" fontSize="14" fontWeight="700">
            <text x="54" y="30">z</text>
            <text x="64" y="20">z</text>
            <text x="74" y="10">z</text>
          </g>
        </>
      )
    case 'mark':
      return (
        <>
          <path d="M12 8 L 12 44 Q 12 52, 20 52 L 48 52"
            fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
          <path d="M48 52 Q 58 52, 56 44 Q 54 38, 46 40"
            fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
          <circle cx="12" cy="8" r="4" fill="currentColor" />
          <circle cx="13" cy="7" r="1.2" fill="#f0ece0" />
        </>
      )
  }
}
