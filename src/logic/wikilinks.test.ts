import { describe, expect, it } from 'vitest'
import { linkedNames, normalizeName, splitWikilinks } from './wikilinks.ts'

describe('splitWikilinks', () => {
  it('returns plain text untouched', () => {
    expect(splitWikilinks('No links here.')).toEqual([{ kind: 'text', text: 'No links here.' }])
    expect(splitWikilinks('')).toEqual([])
  })

  it('finds links and keeps the text around them', () => {
    expect(splitWikilinks('Meet [[Bram]] in [[Harrowgate]].')).toEqual([
      { kind: 'text', text: 'Meet ' },
      { kind: 'link', target: 'Bram', label: 'Bram' },
      { kind: 'text', text: ' in ' },
      { kind: 'link', target: 'Harrowgate', label: 'Harrowgate' },
      { kind: 'text', text: '.' },
    ])
  })

  it('supports a custom label with |', () => {
    expect(splitWikilinks('[[Harrowgate|the town]]')).toEqual([
      { kind: 'link', target: 'Harrowgate', label: 'the town' },
    ])
  })

  it('trims spaces inside the brackets', () => {
    expect(splitWikilinks('[[  Old Mill  ]]')).toEqual([
      { kind: 'link', target: 'Old Mill', label: 'Old Mill' },
    ])
  })

  it('leaves broken or empty brackets as text', () => {
    for (const text of ['[[ ]]', '[[]]', '[[unclosed', 'a ]] b [[', '[single]']) {
      expect(splitWikilinks(text).every((p) => p.kind === 'text')).toBe(true)
    }
  })

  it('does not link across lines', () => {
    expect(splitWikilinks('[[a\nb]]').every((p) => p.kind === 'text')).toBe(true)
  })

  it('handles links right next to each other', () => {
    expect(splitWikilinks('[[A]][[B]]').map((p) => p.kind)).toEqual(['link', 'link'])
  })
})

describe('linkedNames', () => {
  it('lists each name once, ignoring capitals and spacing', () => {
    expect(linkedNames('[[Bram]] and [[ bram ]] and [[The  Old Mill|mill]]')).toEqual([
      'bram',
      'the old mill',
    ])
  })
})

describe('normalizeName', () => {
  it('ignores capitals and extra spaces', () => {
    expect(normalizeName('  The   Old Mill ')).toBe('the old mill')
  })
})
