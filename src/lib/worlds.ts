import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase'
import type { World, WorldMembership, WorldRole } from './types'

const WORLD_COLUMNS = 'id, name, settings, current_day, owner_id, created_at'

async function fetchMyWorlds(userId: string): Promise<WorldMembership[]> {
  const { data, error } = await supabase()
    .from('world_members')
    .select(`role, world:worlds (${WORLD_COLUMNS})`)
    .eq('user_id', userId)
  if (error) throw error
  const rows = (data ?? []) as unknown as { role: WorldRole; world: World | null }[]
  return rows
    .filter((r): r is { role: WorldRole; world: World } => r.world !== null)
    .map((r) => ({ role: r.role, world: r.world }))
    .sort((a, b) => a.world.name.localeCompare(b.world.name))
}

/** Every world the signed-in user belongs to, with their role in each. */
export function useMyWorlds(userId: string | undefined) {
  return useQuery({
    queryKey: ['worlds', userId],
    queryFn: () => fetchMyWorlds(userId!),
    enabled: Boolean(userId),
  })
}

/** Creates a world. The database makes the creator its GM automatically. */
export function useCreateWorld() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (name: string): Promise<World> => {
      const { data, error } = await supabase()
        .from('worlds')
        .insert({ name: name.trim() })
        .select(WORLD_COLUMNS)
        .single()
      if (error) throw error
      return data as World
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['worlds'] }),
  })
}
