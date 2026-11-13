/**
 * World export / import file format.
 *
 * The file carries a `version`. When the format changes, bump
 * CURRENT_VERSION and add a step to `migrate` so older files still load.
 */
import { normalizeName } from './wikilinks.ts'

export const FORMAT = 'loreloom-world'
export const CURRENT_VERSION = 1

export const ENTITY_TYPES = ['npc', 'faction', 'location', 'item', 'event', 'lore'] as const
export type ExportEntityType = (typeof ENTITY_TYPES)[number]
export type ExportVisibility = 'gm_only' | 'revealed'

export interface ExportEntity {
  /** Only meaningful inside the file: links refer to entities by this id. */
  id: string
  type: ExportEntityType
  name: string
  summary: string
  description: unknown
  tags: string[]
  visibility: ExportVisibility
  data: Record<string, unknown>
  /** GM-only notes. Absent when there are none. */
  secretNotes?: unknown
}

export interface ExportLink {
  from: string
  to: string
  label: string
  visibility: ExportVisibility
}

export interface WorldExport {
  format: typeof FORMAT
  version: number
  exportedAt: string
  world: { name: string; settings: Record<string, unknown>; currentDay: number }
  entities: ExportEntity[]
  links: ExportLink[]
}

export class ImportError extends Error {}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function visibility(value: unknown): ExportVisibility {
  // Anything unclear stays hidden: importing must never reveal by accident.
  return value === 'revealed' ? 'revealed' : 'gm_only'
}

/** Upgrades older file versions step by step to the current one. */
function migrate(file: Record<string, unknown>): Record<string, unknown> {
  const version = file.version
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
    throw new ImportError('This file has no valid version number.')
  }
  if (version > CURRENT_VERSION) {
    throw new ImportError(
      'This file was made by a newer version of the app. Update the app, then import again.',
    )
  }
  // Future: if (version === 1) { ...convert to 2...; version = 2 }
  return file
}

/** Checks and cleans a parsed JSON file. Throws ImportError with a readable reason. */
export function parseWorldExport(raw: unknown): WorldExport {
  if (!isObject(raw) || raw.format !== FORMAT) {
    throw new ImportError('This does not look like a Loreloom world file.')
  }
  const file = migrate(raw)
  const world = isObject(file.world) ? file.world : {}
  if (!Array.isArray(file.entities)) throw new ImportError('The file has no list of pages.')

  const seenIds = new Set<string>()
  const seenNames = new Set<string>()
  const entities: ExportEntity[] = file.entities.map((e: unknown, i: number) => {
    if (!isObject(e)) throw new ImportError(`Page ${i + 1} is not valid.`)
    const name = typeof e.name === 'string' ? e.name.trim() : ''
    if (!name) throw new ImportError(`Page ${i + 1} has no name.`)
    if (typeof e.id !== 'string' || !e.id) throw new ImportError(`"${name}" has no id.`)
    if (seenIds.has(e.id)) throw new ImportError(`Two pages share the id of "${name}".`)
    if (seenNames.has(normalizeName(name))) {
      throw new ImportError(`The file contains two pages named "${name}".`)
    }
    if (!ENTITY_TYPES.includes(e.type as ExportEntityType)) {
      throw new ImportError(`"${name}" has an unknown type.`)
    }
    seenIds.add(e.id)
    seenNames.add(normalizeName(name))
    const entity: ExportEntity = {
      id: e.id,
      type: e.type as ExportEntityType,
      name,
      summary: typeof e.summary === 'string' ? e.summary : '',
      description: isObject(e.description) ? e.description : null,
      tags: Array.isArray(e.tags)
        ? e.tags.filter((t): t is string => typeof t === 'string' && t.trim() !== '')
        : [],
      visibility: visibility(e.visibility),
      data: isObject(e.data) ? e.data : {},
    }
    if (isObject(e.secretNotes)) entity.secretNotes = e.secretNotes
    return entity
  })

  const rawLinks = Array.isArray(file.links) ? file.links : []
  const links: ExportLink[] = []
  for (const l of rawLinks) {
    if (!isObject(l) || typeof l.from !== 'string' || typeof l.to !== 'string') continue
    // Links to pages that are not in the file are dropped rather than failing.
    if (!seenIds.has(l.from) || !seenIds.has(l.to) || l.from === l.to) continue
    links.push({
      from: l.from,
      to: l.to,
      label: typeof l.label === 'string' ? l.label : '',
      visibility: visibility(l.visibility),
    })
  }

  return {
    format: FORMAT,
    version: CURRENT_VERSION,
    exportedAt: typeof file.exportedAt === 'string' ? file.exportedAt : '',
    world: {
      name:
        typeof world.name === 'string' && world.name.trim() ? world.name.trim() : 'Imported world',
      settings: isObject(world.settings) ? world.settings : {},
      currentDay: typeof world.currentDay === 'number' ? Math.trunc(world.currentDay) : 0,
    },
    entities,
    links,
  }
}

export interface ImportPlan {
  entities: (Omit<ExportEntity, 'secretNotes'> & { id: string })[]
  secrets: { entityId: string; notes: unknown }[]
  links: ExportLink[]
  /** Names left out because the world already has a page with that name. */
  skipped: string[]
}

/**
 * Works out what to insert. Every page gets a brand-new id (so importing the
 * same file twice, or into another world, can never collide), and pages whose
 * name already exists in the target world are skipped — existing data is
 * never overwritten. Links to a skipped page are re-pointed at the existing one.
 */
export function planImport(
  file: WorldExport,
  existing: { id: string; name: string }[],
  newId: () => string,
): ImportPlan {
  const existingByName = new Map(existing.map((e) => [normalizeName(e.name), e.id]))
  const idMap = new Map<string, string>()
  const plan: ImportPlan = { entities: [], secrets: [], links: [], skipped: [] }

  for (const entity of file.entities) {
    const already = existingByName.get(normalizeName(entity.name))
    if (already) {
      idMap.set(entity.id, already)
      plan.skipped.push(entity.name)
      continue
    }
    const id = newId()
    idMap.set(entity.id, id)
    const { secretNotes, ...rest } = entity
    plan.entities.push({ ...rest, id })
    if (secretNotes) plan.secrets.push({ entityId: id, notes: secretNotes })
  }

  const created = new Set(plan.entities.map((e) => e.id))
  for (const link of file.links) {
    const from = idMap.get(link.from)
    const to = idMap.get(link.to)
    if (!from || !to || from === to) continue
    // A link between two pages that both already existed is not ours to add.
    if (!created.has(from) && !created.has(to)) continue
    plan.links.push({ ...link, from, to })
  }
  return plan
}

/** Builds the export file from the rows of one world. */
export function buildExport(input: {
  world: { name: string; settings: Record<string, unknown>; currentDay: number }
  entities: Omit<ExportEntity, 'secretNotes'>[]
  secrets: { entityId: string; notes: unknown }[]
  links: ExportLink[]
  now: Date
}): WorldExport {
  const notes = new Map(input.secrets.map((s) => [s.entityId, s.notes]))
  return {
    format: FORMAT,
    version: CURRENT_VERSION,
    exportedAt: input.now.toISOString(),
    world: input.world,
    entities: input.entities.map((e) => {
      const entity: ExportEntity = {
        id: e.id,
        type: e.type,
        name: e.name,
        summary: e.summary,
        description: e.description ?? null,
        tags: e.tags,
        visibility: e.visibility,
        data: e.data,
      }
      const secret = notes.get(e.id)
      if (secret) entity.secretNotes = secret
      return entity
    }),
    links: input.links.map((l) => ({
      from: l.from,
      to: l.to,
      label: l.label,
      visibility: l.visibility,
    })),
  }
}
