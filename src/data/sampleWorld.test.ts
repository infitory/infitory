import { describe, expect, it } from 'vitest'
import { mentionedNames } from '../logic/richText.ts'
import { parseWorldExport } from '../logic/worldExport.ts'
import { normalizeName } from '../logic/wikilinks.ts'
import { SAMPLE_WORLD } from './sampleWorld.ts'

describe('sample world', () => {
  const parsed = parseWorldExport(JSON.parse(JSON.stringify(SAMPLE_WORLD)))

  it('is a valid world file with every link intact', () => {
    expect(parsed.entities).toHaveLength(SAMPLE_WORLD.entities.length)
    expect(parsed.links).toHaveLength(SAMPLE_WORLD.links.length)
  })

  it('only mentions pages that exist', () => {
    const names = new Set(parsed.entities.map((e) => normalizeName(e.name)))
    for (const e of parsed.entities) {
      for (const doc of [e.description, e.secretNotes]) {
        for (const mention of mentionedNames(doc))
          expect(names, `${e.name} -> ${mention}`).toContain(mention)
      }
    }
  })

  it('never reveals a link whose ends are hidden', () => {
    const visibility = new Map(parsed.entities.map((e) => [e.id, e.visibility]))
    for (const l of parsed.links.filter((l) => l.visibility === 'revealed')) {
      expect(visibility.get(l.from)).toBe('revealed')
      expect(visibility.get(l.to)).toBe('revealed')
    }
  })
})
