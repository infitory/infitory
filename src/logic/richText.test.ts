import { describe, expect, it } from 'vitest'
import { isEmptyDoc, mentionedNames, plainText, textToDoc } from './richText.ts'

const doc = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'History' }] },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Founded by ' },
        { type: 'text', text: '[[Queen Ysolde]]', marks: [{ type: 'bold' }] },
        { type: 'text', text: '.' },
      ],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'See [[Harrowgate]]' }] }],
        },
      ],
    },
  ],
}

describe('richText', () => {
  it('extracts plain text, one block per line', () => {
    expect(plainText(doc)).toBe('History\nFounded by [[Queen Ysolde]].\nSee [[Harrowgate]]')
  })

  it('finds mentioned page names, even inside bold text and lists', () => {
    expect(mentionedNames(doc)).toEqual(['queen ysolde', 'harrowgate'])
  })

  it('treats missing or blank documents as empty', () => {
    expect(isEmptyDoc(null)).toBe(true)
    expect(isEmptyDoc({ type: 'doc', content: [{ type: 'paragraph' }] })).toBe(true)
    expect(isEmptyDoc(doc)).toBe(false)
    expect(plainText('not a doc')).toBe('')
  })

  it('turns plain text into paragraphs', () => {
    expect(plainText(textToDoc('One.\n\nTwo.'))).toBe('One.\nTwo.')
    expect(isEmptyDoc(textToDoc('  '))).toBe(true)
  })
})
