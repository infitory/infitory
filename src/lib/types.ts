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
