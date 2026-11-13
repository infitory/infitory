/** Row shapes mirroring supabase/migrations. Keep the two in step. */

export type WorldRole = 'gm' | 'player'
export type Visibility = 'gm_only' | 'revealed'
export type EntityType = 'npc' | 'faction' | 'location' | 'item' | 'event' | 'lore'

export interface Profile {
  id: string
  display_name: string
}

export interface World {
  id: string
  name: string
  settings: Record<string, unknown>
  current_day: number
  owner_id: string
  created_at: string
}

/** A world together with the signed-in user's role in it. */
export interface WorldMembership {
  world: World
  role: WorldRole
}

export interface DetailField {
  label: string
  value: string
}

export interface Entity {
  id: string
  world_id: string
  type: EntityType
  name: string
  summary: string
  /** Rich text document (see src/logic/richText.ts), or null when empty. */
  description: unknown
  tags: string[]
  image_path: string | null
  visibility: Visibility
  /** Free-form extras. `fields` holds the "Details" rows shown on the page. */
  data: { fields?: DetailField[] } & Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface EntityLink {
  id: string
  world_id: string
  from_id: string
  to_id: string
  label: string
  visibility: Visibility
}
