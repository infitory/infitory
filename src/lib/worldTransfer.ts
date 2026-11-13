/** Export a world to a file, and import a file into a world. */
import { buildExport, parseWorldExport, planImport, type WorldExport } from '../logic/worldExport'
import { supabase } from './supabase'
import type { Entity, EntityLink, World } from './types'

function check<T>(result: { data: T; error: unknown }): T {
  if (result.error) throw result.error
  return result.data
}

export async function exportWorld(world: World): Promise<WorldExport> {
  const db = supabase()
  const [entities, secrets, links] = await Promise.all([
    db.from('entities').select('*').eq('world_id', world.id).order('name').then(check),
    db.from('entity_secrets').select('entity_id, notes').eq('world_id', world.id).then(check),
    db.from('entity_links').select('*').eq('world_id', world.id).then(check),
  ])
  return buildExport({
    world: { name: world.name, settings: world.settings, currentDay: world.current_day },
    entities: ((entities ?? []) as Entity[]).map((e) => ({
      id: e.id,
      type: e.type,
      name: e.name,
      summary: e.summary,
      description: e.description,
      tags: e.tags,
      visibility: e.visibility,
      data: e.data,
    })),
    secrets: ((secrets ?? []) as { entity_id: string; notes: unknown }[]).map((s) => ({
      entityId: s.entity_id,
      notes: s.notes,
    })),
    links: ((links ?? []) as EntityLink[]).map((l) => ({
      from: l.from_id,
      to: l.to_id,
      label: l.label,
      visibility: l.visibility,
    })),
    now: new Date(),
  })
}

/** Hands a file to the browser to save. */
export function downloadJson(filename: string, content: unknown): void {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function readWorldFile(file: File): Promise<WorldExport> {
  let raw: unknown
  try {
    raw = JSON.parse(await file.text())
  } catch {
    throw new Error('That file could not be read. Is it a Loreloom world file (.json)?')
  }
  return parseWorldExport(raw)
}

export interface ImportResult {
  added: number
  links: number
  skipped: string[]
}

function chunks<T>(items: T[], size = 200): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

/** Adds a file's pages to an existing world. Pages whose name exists are left alone. */
export async function importIntoWorld(worldId: string, file: WorldExport): Promise<ImportResult> {
  const db = supabase()
  const existing = check(await db.from('entities').select('id, name').eq('world_id', worldId))
  const plan = planImport(file, (existing ?? []) as { id: string; name: string }[], () =>
    crypto.randomUUID(),
  )

  for (const batch of chunks(plan.entities)) {
    check(
      await db.from('entities').insert(
        batch.map((e) => ({
          id: e.id,
          world_id: worldId,
          type: e.type,
          name: e.name,
          summary: e.summary,
          description: e.description,
          tags: e.tags,
          visibility: e.visibility,
          data: e.data,
        })),
      ),
    )
  }
  for (const batch of chunks(plan.secrets)) {
    check(
      await db
        .from('entity_secrets')
        .insert(batch.map((s) => ({ entity_id: s.entityId, world_id: worldId, notes: s.notes }))),
    )
  }
  for (const batch of chunks(plan.links)) {
    check(
      await db.from('entity_links').insert(
        batch.map((l) => ({
          world_id: worldId,
          from_id: l.from,
          to_id: l.to,
          label: l.label,
          visibility: l.visibility,
        })),
      ),
    )
  }
  return { added: plan.entities.length, links: plan.links.length, skipped: plan.skipped }
}

/** Creates a brand-new world from a file. Nothing existing is touched. */
export async function importAsNewWorld(file: WorldExport): Promise<World> {
  const db = supabase()
  const world = check(
    await db
      .from('worlds')
      .insert({
        name: file.world.name,
        settings: file.world.settings,
        current_day: file.world.currentDay,
      })
      .select('id, name, settings, current_day, owner_id, created_at')
      .single(),
  ) as World
  try {
    await importIntoWorld(world.id, file)
  } catch (error) {
    // Don't leave a half-filled world behind.
    await db.from('worlds').delete().eq('id', world.id)
    throw error
  }
  return world
}
