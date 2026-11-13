import { Flag, Gem, MapPin, ScrollText, Sparkles, User, type LucideIcon } from 'lucide-react'
import type { EntityType } from './types'

export interface EntityTypeInfo {
  type: EntityType
  label: string
  plural: string
  icon: LucideIcon
  /** CSS variable holding this type's colour (defined in src/index.css). */
  color: string
}

export const ENTITY_TYPE_LIST: EntityTypeInfo[] = [
  { type: 'npc', label: 'NPC', plural: 'NPCs', icon: User, color: 'var(--type-npc)' },
  {
    type: 'faction',
    label: 'Faction',
    plural: 'Factions',
    icon: Flag,
    color: 'var(--type-faction)',
  },
  {
    type: 'location',
    label: 'Location',
    plural: 'Locations',
    icon: MapPin,
    color: 'var(--type-location)',
  },
  { type: 'item', label: 'Item', plural: 'Items', icon: Gem, color: 'var(--type-item)' },
  { type: 'event', label: 'Event', plural: 'Events', icon: Sparkles, color: 'var(--type-event)' },
  { type: 'lore', label: 'Lore', plural: 'Lore', icon: ScrollText, color: 'var(--type-lore)' },
]

export const ENTITY_TYPES: Record<EntityType, EntityTypeInfo> = Object.fromEntries(
  ENTITY_TYPE_LIST.map((t) => [t.type, t]),
) as Record<EntityType, EntityTypeInfo>

export function isEntityType(value: string | null | undefined): value is EntityType {
  return Boolean(value) && value! in ENTITY_TYPES
}
