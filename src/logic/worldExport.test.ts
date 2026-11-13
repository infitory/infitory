import { describe, expect, it } from 'vitest'
import { CURRENT_VERSION, FORMAT, ImportError, parseWorldExport, planImport } from './worldExport.ts'

function file(overrides: Record<string, unknown> = {}) {
  return {
    format: FORMAT,
    version: 1,
    exportedAt: '2026-11-13T00:00:00Z',
    world: { name: 'Aldermere', settings: {}, currentDay: 12 },
    entities: [
      { id: 'a', type: 'npc', name: 'Bram', summary: 'Innkeeper', tags: ['inn'], visibility: 'revealed', secretNotes: { type: 'doc' } },
      { id: 'b', type: 'location', name: 'Harrowgate', visibility: 'gm_only' },
      { id: 'c', type: 'faction', name: 'Ash Court' },
    ],
    links: [
      { from: 'a', to: 'b', label: 'lives in', visibility: 'revealed' },
      { from: 'c', to: 'b', label: 'covets' },
    ],
    ...overrides,
  }
}

function counter() {
  let n = 0
  return () => `new-${++n}`
}

describe('parseWorldExport', () => {
  it('accepts a valid file and fills in defaults', () => {
    const parsed = parseWorldExport(file())
    expect(parsed.version).toBe(CURRENT_VERSION)
    expect(parsed.world).toEqual({ name: 'Aldermere', settings: {}, currentDay: 12 })
    expect(parsed.entities).toHaveLength(3)
    expect(parsed.entities[1]).toMatchObject({ summary: '', tags: [], data: {}, description: null })
    expect(parsed.links).toHaveLength(2)
  })

  it('survives a round trip through JSON text', () => {
    const once = parseWorldExport(file())
    expect(parseWorldExport(JSON.parse(JSON.stringify(once)))).toEqual(once)
  })

  it('keeps anything without an explicit "revealed" hidden', () => {
    const parsed = parseWorldExport(file())
    expect(parsed.entities.map((e) => e.visibility)).toEqual(['revealed', 'gm_only', 'gm_only'])
    expect(parsed.links.map((l) => l.visibility)).toEqual(['revealed', 'gm_only'])
    const odd = parseWorldExport(file({ entities: [{ id: 'a', type: 'npc', name: 'X', visibility: 'public' }] }))
    expect(odd.entities[0].visibility).toBe('gm_only')
  })

  it('rejects things that are not world files', () => {
    for (const bad of [null, 'text', [], {}, { format: 'other', version: 1 }]) {
      expect(() => parseWorldExport(bad)).toThrow(ImportError)
    }
  })

  it('rejects files from a newer app version, and bad versions', () => {
    expect(() => parseWorldExport(file({ version: CURRENT_VERSION + 1 }))).toThrow(/newer version/)
    expect(() => parseWorldExport(file({ version: '1' }))).toThrow(ImportError)
    expect(() => parseWorldExport(file({ version: 0 }))).toThrow(ImportError)
  })

  it('rejects pages with no name, unknown type or duplicate names', () => {
    expect(() => parseWorldExport(file({ entities: [{ id: 'a', type: 'npc', name: ' ' }] }))).toThrow(/no name/)
    expect(() => parseWorldExport(file({ entities: [{ id: 'a', type: 'dragon', name: 'X' }] }))).toThrow(/unknown type/)
    expect(() =>
      parseWorldExport(
        file({
          entities: [
            { id: 'a', type: 'npc', name: 'Bram' },
            { id: 'b', type: 'npc', name: ' bram ' },
          ],
        }),
      ),
    ).toThrow(/two pages named/)
  })

  it('drops links that point outside the file or at themselves', () => {
    const parsed = parseWorldExport(
      file({
        links: [
          { from: 'a', to: 'zzz' },
          { from: 'a', to: 'a' },
          'junk',
          { from: 'a', to: 'b' },
        ],
      }),
    )
    expect(parsed.links).toEqual([{ from: 'a', to: 'b', label: '', visibility: 'gm_only' }])
  })
})

describe('planImport', () => {
  it('gives every page a new id and re-points links', () => {
    const plan = planImport(parseWorldExport(file()), [], counter())
    expect(plan.entities.map((e) => e.id)).toEqual(['new-1', 'new-2', 'new-3'])
    expect(plan.links.map((l) => [l.from, l.to])).toEqual([
      ['new-1', 'new-2'],
      ['new-3', 'new-2'],
    ])
    expect(plan.secrets).toEqual([{ entityId: 'new-1', notes: { type: 'doc' } }])
    expect(plan.skipped).toEqual([])
    expect(plan.entities[0]).not.toHaveProperty('secretNotes')
  })

  it('never overwrites: pages whose name already exists are skipped', () => {
    const existing = [{ id: 'old-town', name: 'HARROWGATE' }]
    const plan = planImport(parseWorldExport(file()), existing, counter())
    expect(plan.skipped).toEqual(['Harrowgate'])
    expect(plan.entities.map((e) => e.name)).toEqual(['Bram', 'Ash Court'])
    // Links now point at the page that was already there.
    expect(plan.links.map((l) => l.to)).toEqual(['old-town', 'old-town'])
  })

  it('adds nothing when everything already exists', () => {
    const parsed = parseWorldExport(file())
    const existing = parsed.entities.map((e) => ({ id: `old-${e.id}`, name: e.name }))
    const plan = planImport(parsed, existing, counter())
    expect(plan.entities).toEqual([])
    expect(plan.links).toEqual([])
    expect(plan.skipped).toHaveLength(3)
  })
})
