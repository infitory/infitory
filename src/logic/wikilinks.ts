/**
 * [[Name]] links. Writing `[[Harrowgate]]` in any text links to the page
 * called "Harrowgate"; `[[Harrowgate|the town]]` shows "the town" instead.
 */

export type TextPart =
  { kind: 'text'; text: string } | { kind: 'link'; target: string; label: string }

const WIKILINK = /\[\[([^[\]|\n]+?)(?:\|([^[\]\n]+?))?\]\]/g

/** How names are compared: ignoring capitals and surrounding/repeated spaces. */
export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase()
}

/** Splits text into plain pieces and [[links]], in order. */
export function splitWikilinks(text: string): TextPart[] {
  const parts: TextPart[] = []
  let last = 0
  for (const match of text.matchAll(WIKILINK)) {
    const target = match[1].trim()
    if (!target) continue
    const index = match.index
    if (index > last) parts.push({ kind: 'text', text: text.slice(last, index) })
    parts.push({ kind: 'link', target, label: (match[2] ?? target).trim() || target })
    last = index + match[0].length
  }
  if (last < text.length) parts.push({ kind: 'text', text: text.slice(last) })
  return parts
}

/** The names linked to from a piece of text (normalized, no duplicates). */
export function linkedNames(text: string): string[] {
  const names = new Set<string>()
  for (const part of splitWikilinks(text)) {
    if (part.kind === 'link') names.add(normalizeName(part.target))
  }
  return [...names]
}
