import { Eye, EyeOff } from 'lucide-react'
import { ENTITY_TYPES } from '../lib/entityTypes'
import type { EntityType, Visibility } from '../lib/types'

export function TypeIcon({
  type,
  className = 'size-11',
}: {
  type: EntityType
  className?: string
}) {
  const info = ENTITY_TYPES[type]
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-xl ${className}`}
      style={{
        color: info.color,
        backgroundColor: `color-mix(in srgb, ${info.color} 14%, transparent)`,
      }}
    >
      <info.icon className="size-1/2" aria-hidden="true" />
    </span>
  )
}

export function VisibilityBadge({ visibility }: { visibility: Visibility }) {
  const hidden = visibility === 'gm_only'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        hidden ? 'bg-hidden-soft text-hidden' : 'bg-accent-soft text-accent-text'
      }`}
    >
      {hidden ? (
        <EyeOff className="size-3" aria-hidden="true" />
      ) : (
        <Eye className="size-3" aria-hidden="true" />
      )}
      {hidden ? 'Hidden' : 'Revealed'}
    </span>
  )
}

export function Tag({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-ink-soft">{children}</span>
  )
}
