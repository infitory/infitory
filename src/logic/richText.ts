/**
 * Rich text is stored as a small JSON tree (the format the TipTap editor
 * produces). These helpers read that tree without needing the editor.
 */
import { linkedNames } from './wikilinks.ts'

export interface RichMark {
  type: string
  attrs?: Record<string, unknown>
}

export interface RichNode {
  type: string
  text?: string
  attrs?: Record<string, unknown>
  marks?: RichMark[]
  content?: RichNode[]
}

export function isRichNode(value: unknown): value is RichNode {
  return typeof value === 'object' && value !== null && typeof (value as RichNode).type === 'string'
}

const BLOCKS = new Set([
  'paragraph',
  'heading',
  'blockquote',
  'listItem',
  'codeBlock',
  'horizontalRule',
  'hardBreak',
])

/** All the text in a document, blocks separated by new lines. */
export function plainText(doc: unknown): string {
  if (!isRichNode(doc)) return ''
  const out: string[] = []
  const walk = (node: RichNode) => {
    if (node.text) out.push(node.text)
    node.content?.forEach(walk)
    if (BLOCKS.has(node.type)) out.push('\n')
  }
  walk(doc)
  return out
    .join('')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

export function isEmptyDoc(doc: unknown): boolean {
  return plainText(doc) === ''
}

/** Names of every page a document links to with [[Name]] (normalized). */
export function mentionedNames(doc: unknown): string[] {
  return linkedNames(plainText(doc))
}

/** Turns plain text into a document: one paragraph per line. */
export function textToDoc(text: string): RichNode {
  return {
    type: 'doc',
    content: text
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => ({ type: 'paragraph', content: [{ type: 'text', text: line }] })),
  }
}
