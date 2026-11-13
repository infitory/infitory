import type { WorldRole } from '../lib/types'

export function RoleBadge({ role }: { role: WorldRole }) {
  const gm = role === 'gm'
  return (
    <span
      className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        gm ? 'bg-accent-soft text-accent-text' : 'bg-surface-2 text-ink-soft'
      }`}
    >
      {gm ? 'Game master' : 'Player'}
    </span>
  )
}
