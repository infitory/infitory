import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router'
import { isRichNode, type RichMark, type RichNode } from '../logic/richText'
import { normalizeName, splitWikilinks } from '../logic/wikilinks'

export interface LinkTarget {
  id: string
  hidden: boolean
}

interface Props {
  doc: unknown
  /** Base address of the Codex, e.g. /w/<world>/codex */
  codexPath: string
  /** Pages the reader can see, by normalized name. */
  pages: Map<string, LinkTarget>
  /** GMs get a "create this page" link for names that do not exist yet. */
  canCreate: boolean
}

/** Read-only rich text with [[Name]] turned into links. */
export function RichTextView({ doc, codexPath, pages, canCreate }: Props) {
  if (!isRichNode(doc)) return null

  function renderText(text: string, key: number): ReactNode {
    return (
      <Fragment key={key}>
        {splitWikilinks(text).map((part, i) => {
          if (part.kind === 'text') return part.text
          const target = pages.get(normalizeName(part.target))
          if (target) {
            return (
              <Link
                key={i}
                to={`${codexPath}/${target.id}`}
                title={target.hidden ? 'Hidden from players' : undefined}
                className={target.hidden ? 'decoration-dashed' : undefined}
              >
                {part.label}
              </Link>
            )
          }
          if (canCreate) {
            return (
              <Link
                key={i}
                to={`${codexPath}/new?name=${encodeURIComponent(part.target)}`}
                title="This page does not exist yet. Click to create it."
                className="!text-ink-faint decoration-dotted"
              >
                {part.label}
              </Link>
            )
          }
          // Players just see the words: no hint that a hidden page exists.
          return part.label
        })}
      </Fragment>
    )
  }

  function applyMarks(content: ReactNode, marks: RichMark[] | undefined): ReactNode {
    return (marks ?? []).reduce<ReactNode>((inner, mark) => {
      switch (mark.type) {
        case 'bold':
          return <strong>{inner}</strong>
        case 'italic':
          return <em>{inner}</em>
        case 'strike':
          return <s>{inner}</s>
        case 'underline':
          return <u>{inner}</u>
        case 'code':
          return <code>{inner}</code>
        case 'link': {
          const href = typeof mark.attrs?.href === 'string' ? mark.attrs.href : ''
          // Only ordinary web links: never javascript: or similar.
          if (!/^https?:\/\//i.test(href)) return inner
          return (
            <a href={href} target="_blank" rel="noopener noreferrer nofollow">
              {inner}
            </a>
          )
        }
        default:
          return inner
      }
    }, content)
  }

  function render(node: RichNode, key: number): ReactNode {
    const children = node.content?.map(render)
    switch (node.type) {
      case 'doc':
        return <Fragment key={key}>{children}</Fragment>
      case 'text': {
        const isCode = node.marks?.some((m) => m.type === 'code')
        const content = isCode ? node.text : renderText(node.text ?? '', 0)
        return <Fragment key={key}>{applyMarks(content, node.marks)}</Fragment>
      }
      case 'paragraph':
        return <p key={key}>{children}</p>
      case 'heading':
        return Number(node.attrs?.level) <= 2 ? (
          <h2 key={key}>{children}</h2>
        ) : (
          <h3 key={key}>{children}</h3>
        )
      case 'bulletList':
        return <ul key={key}>{children}</ul>
      case 'orderedList':
        return <ol key={key}>{children}</ol>
      case 'listItem':
        return <li key={key}>{children}</li>
      case 'blockquote':
        return <blockquote key={key}>{children}</blockquote>
      case 'codeBlock':
        return (
          <pre key={key}>
            <code>{node.content?.map((c) => c.text ?? '').join('')}</code>
          </pre>
        )
      case 'horizontalRule':
        return <hr key={key} />
      case 'hardBreak':
        return <br key={key} />
      default:
        return <Fragment key={key}>{children}</Fragment>
    }
  }

  return <div className="rich">{render(doc, 0)}</div>
}
