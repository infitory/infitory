import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  type LucideIcon,
} from 'lucide-react'
import { isRichNode } from '../logic/richText'

interface Props {
  label: string
  value: unknown
  onChange: (doc: unknown) => void
  hint?: string
  small?: boolean
}

function ToolButton(props: {
  icon: LucideIcon
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={props.label}
      title={props.label}
      aria-pressed={props.active}
      // Keep the text selection while clicking a toolbar button.
      onMouseDown={(e) => e.preventDefault()}
      onClick={props.onClick}
      className={`grid size-10 place-items-center rounded-lg transition ${
        props.active
          ? 'bg-accent-soft text-accent-text'
          : 'text-ink-soft hover:bg-surface-2 hover:text-ink'
      }`}
    >
      <props.icon className="size-4" />
    </button>
  )
}

export function RichTextEditor({ label, value, onChange, hint, small }: Props) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } })],
    content: isRichNode(value) ? value : '',
    editorProps: {
      attributes: { class: 'rich', role: 'textbox', 'aria-multiline': 'true', 'aria-label': label },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  })

  const active = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive('bold') ?? false,
      italic: editor?.isActive('italic') ?? false,
      h2: editor?.isActive('heading', { level: 2 }) ?? false,
      h3: editor?.isActive('heading', { level: 3 }) ?? false,
      bullet: editor?.isActive('bulletList') ?? false,
      ordered: editor?.isActive('orderedList') ?? false,
      quote: editor?.isActive('blockquote') ?? false,
    }),
  })

  const run = () => editor!.chain().focus()

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <div
        className={`rich-editor ${small ? 'rich-editor-small' : ''} rounded-xl border border-line bg-surface focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30`}
      >
        {editor && active && (
          <div
            className="flex flex-wrap gap-0.5 border-b border-line p-1"
            role="toolbar"
            aria-label={`${label} formatting`}
          >
            <ToolButton
              icon={Bold}
              label="Bold"
              active={active.bold}
              onClick={() => run().toggleBold().run()}
            />
            <ToolButton
              icon={Italic}
              label="Italic"
              active={active.italic}
              onClick={() => run().toggleItalic().run()}
            />
            <ToolButton
              icon={Heading2}
              label="Heading"
              active={active.h2}
              onClick={() => run().toggleHeading({ level: 2 }).run()}
            />
            <ToolButton
              icon={Heading3}
              label="Small heading"
              active={active.h3}
              onClick={() => run().toggleHeading({ level: 3 }).run()}
            />
            <ToolButton
              icon={List}
              label="Bullet list"
              active={active.bullet}
              onClick={() => run().toggleBulletList().run()}
            />
            <ToolButton
              icon={ListOrdered}
              label="Numbered list"
              active={active.ordered}
              onClick={() => run().toggleOrderedList().run()}
            />
            <ToolButton
              icon={Quote}
              label="Quote"
              active={active.quote}
              onClick={() => run().toggleBlockquote().run()}
            />
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
      {hint ? <span className="mt-1.5 block text-xs text-ink-faint">{hint}</span> : null}
    </div>
  )
}
