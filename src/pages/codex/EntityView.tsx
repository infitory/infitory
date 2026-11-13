import { ArrowLeft, ArrowRight, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Tag, TypeIcon, VisibilityBadge } from '../../components/codexBits'
import { RichTextView } from '../../components/RichTextView'
import { Button, Notice } from '../../components/ui'
import {
  friendlyError,
  useAddLink,
  useDeleteEntity,
  useDeleteLink,
  useImageUrl,
  useSecretNotes,
  useSetVisibility,
  useUpdateLink,
} from '../../lib/codex'
import { ENTITY_TYPES } from '../../lib/entityTypes'
import type { Entity, EntityLink } from '../../lib/types'
import { isEmptyDoc, mentionedNames } from '../../logic/richText'
import { normalizeName } from '../../logic/wikilinks'
import { useCodex } from './useCodex'

const inputClass =
  'block min-h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-base text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30'

export function EntityView() {
  const { entityId } = useParams()
  const codex = useCodex()
  const { byId, isLoading, codexPath, isGm } = codex
  const entity = entityId ? byId.get(entityId) : undefined

  if (isLoading) return <p className="text-sm text-ink-soft">Loading…</p>
  if (!entity) {
    return (
      <div>
        <p className="text-lg font-medium">Page not found</p>
        <p className="mt-1 text-sm text-ink-soft">
          {isGm
            ? 'It may have been deleted.'
            : 'It may not exist, or it has not been revealed to you.'}
        </p>
        <Link
          to={codexPath}
          className="mt-4 inline-block font-medium text-accent-text hover:underline"
        >
          Back to the Codex
        </Link>
      </div>
    )
  }
  return <EntityPage key={entity.id} entity={entity} />
}

function EntityPage({ entity }: { entity: Entity }) {
  const { world, isGm, codexPath, pages, byId, links, entities } = useCodex()
  const navigate = useNavigate()
  const image = useImageUrl(entity.image_path)
  const secret = useSecretNotes(entity.id, isGm)
  const setVisibility = useSetVisibility(world.id)
  const deleteEntity = useDeleteEntity(world.id)
  const info = ENTITY_TYPES[entity.type]
  const hidden = entity.visibility === 'gm_only'

  const outgoing = links.filter((l) => l.from_id === entity.id && byId.has(l.to_id))
  const incoming = links.filter((l) => l.to_id === entity.id && byId.has(l.from_id))
  const mentionedIn = useMemo(() => {
    const me = normalizeName(entity.name)
    return entities.filter((e) => e.id !== entity.id && mentionedNames(e.description).includes(me))
  }, [entities, entity.id, entity.name])

  async function remove() {
    if (
      !window.confirm(`Delete "${entity.name}"? Its links are deleted too. This cannot be undone.`)
    )
      return
    await deleteEntity.mutateAsync(entity)
    navigate(codexPath)
  }

  const fields = entity.data.fields ?? []
  const richProps = { codexPath, pages, canCreate: isGm }

  return (
    <article>
      <Link
        to={codexPath}
        className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Codex
      </Link>

      <header className="mt-4 flex flex-wrap items-start gap-4">
        <TypeIcon type={entity.type} className="size-14" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
            {info.label}
            {isGm && <VisibilityBadge visibility={entity.visibility} />}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{entity.name}</h1>
          {entity.summary && <p className="mt-2 text-lg text-ink-soft">{entity.summary}</p>}
          {entity.tags.length > 0 && (
            <p className="mt-3 flex flex-wrap gap-1.5">
              {entity.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </p>
          )}
        </div>
      </header>

      {isGm && (
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            variant={hidden ? 'primary' : 'outline'}
            disabled={setVisibility.isPending}
            onClick={() =>
              setVisibility.mutate({ id: entity.id, visibility: hidden ? 'revealed' : 'gm_only' })
            }
          >
            {hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            {hidden ? 'Reveal to players' : 'Hide from players'}
          </Button>
          <Link
            to="edit"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-medium hover:bg-surface-2"
          >
            <Pencil className="size-4" aria-hidden="true" /> Edit
          </Link>
          <Button
            variant="ghost"
            className="hover:!text-danger"
            disabled={deleteEntity.isPending}
            onClick={remove}
          >
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      )}
      {(setVisibility.error || deleteEntity.error) && (
        <div className="mt-3">
          <Notice tone="error">{friendlyError(setVisibility.error ?? deleteEntity.error)}</Notice>
        </div>
      )}

      {entity.image_path && image.data && (
        <img
          src={image.data}
          alt={`Illustration of ${entity.name}`}
          className="mt-6 max-h-[28rem] w-full rounded-2xl border border-line object-cover"
        />
      )}

      {fields.length > 0 && (
        <dl className="mt-6 grid gap-x-6 gap-y-3 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-2">
          {fields.map((f, i) => (
            <div key={i}>
              <dt className="text-xs uppercase tracking-wide text-ink-faint">{f.label}</dt>
              <dd className="text-sm">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {!isEmptyDoc(entity.description) && (
        <section className="mt-6" aria-label="Description">
          <RichTextView doc={entity.description} {...richProps} />
        </section>
      )}

      {isGm && !isEmptyDoc(secret.data) && (
        <section className="mt-6 rounded-2xl border border-hidden/40 bg-hidden-soft p-4">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-hidden">
            <EyeOff className="size-4" aria-hidden="true" /> GM secret notes
          </h2>
          <RichTextView doc={secret.data} {...richProps} />
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">Connections</h2>
        {outgoing.length + incoming.length + mentionedIn.length === 0 && (
          <p className="mt-2 text-sm text-ink-soft">No connections yet.</p>
        )}
        <ul className="mt-3 space-y-2">
          {outgoing.map((l) => (
            <LinkRow key={l.id} link={l} self={entity} other={byId.get(l.to_id)!} direction="out" />
          ))}
          {incoming.map((l) => (
            <LinkRow
              key={l.id}
              link={l}
              self={entity}
              other={byId.get(l.from_id)!}
              direction="in"
            />
          ))}
        </ul>

        {mentionedIn.length > 0 && (
          <>
            <h3 className="mt-6 text-sm font-semibold text-ink-soft">Mentioned in</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {mentionedIn.map((e) => (
                <li key={e.id}>
                  <Link
                    to={`${codexPath}/${e.id}`}
                    className="inline-flex min-h-9 items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm hover:border-accent"
                  >
                    {e.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {isGm && <AddLinkForm entity={entity} />}
      </section>
    </article>
  )
}

function LinkRow(props: {
  link: EntityLink
  self: Entity
  other: Entity
  direction: 'in' | 'out'
}) {
  const { link, self, other, direction } = props
  const { world, isGm, codexPath } = useCodex()
  const update = useUpdateLink(world.id)
  const remove = useDeleteLink(world.id)
  const hidden = link.visibility === 'gm_only'
  const label = link.label || 'is linked to'
  const otherLink = (
    <Link to={`${codexPath}/${other.id}`} className="font-medium text-accent-text hover:underline">
      {other.name}
    </Link>
  )

  return (
    <li className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm">
      <span className="min-w-0 flex-1">
        {direction === 'out' ? (
          <>
            <span className="text-ink-soft">{self.name}</span>{' '}
            <em className="not-italic">{label}</em>{' '}
            <ArrowRight className="inline size-3.5 text-ink-faint" aria-hidden="true" /> {otherLink}
          </>
        ) : (
          <>
            {otherLink} <em className="not-italic">{label}</em>{' '}
            <ArrowRight className="inline size-3.5 text-ink-faint" aria-hidden="true" />{' '}
            <span className="text-ink-soft">{self.name}</span>
          </>
        )}
      </span>
      {isGm && (
        <span className="flex items-center gap-1">
          <VisibilityBadge visibility={link.visibility} />
          <button
            type="button"
            title={hidden ? 'Reveal this link to players' : 'Hide this link from players'}
            aria-label={hidden ? 'Reveal this link to players' : 'Hide this link from players'}
            disabled={update.isPending}
            onClick={() =>
              update.mutate({ id: link.id, visibility: hidden ? 'revealed' : 'gm_only' })
            }
            className="grid size-10 place-items-center rounded-lg text-ink-soft hover:bg-surface-2 hover:text-ink"
          >
            {hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          </button>
          <button
            type="button"
            title="Delete this link"
            aria-label="Delete this link"
            disabled={remove.isPending}
            onClick={() => remove.mutate(link.id)}
            className="grid size-10 place-items-center rounded-lg text-ink-soft hover:bg-surface-2 hover:text-danger"
          >
            <Trash2 className="size-4" />
          </button>
        </span>
      )}
    </li>
  )
}

function AddLinkForm({ entity }: { entity: Entity }) {
  const { world, entities } = useCodex()
  const addLink = useAddLink(world.id)
  const [toId, setToId] = useState('')
  const [label, setLabel] = useState('')
  const [revealed, setRevealed] = useState(false)
  const others = entities.filter((e) => e.id !== entity.id)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!toId) return
    const ok = await addLink
      .mutateAsync({
        fromId: entity.id,
        toId,
        label,
        visibility: revealed ? 'revealed' : 'gm_only',
      })
      .then(() => true)
      .catch(() => false)
    if (ok) {
      setToId('')
      setLabel('')
      setRevealed(false)
    }
  }

  if (others.length === 0) return null

  return (
    <form onSubmit={submit} className="mt-6 rounded-2xl border border-line bg-surface p-4">
      <h3 className="text-sm font-semibold">Add a link</h3>
      <p className="mt-0.5 text-xs text-ink-faint">
        Reads as: {entity.name} — <em>label</em> → other page. For example “works for” or “is
        located in”.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Label</span>
          <input
            value={label}
            maxLength={80}
            placeholder="e.g. works for"
            onChange={(e) => setLabel(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Other page</span>
          <select
            required
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            className={inputClass}
          >
            <option value="">Choose a page…</option>
            {others.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({ENTITY_TYPES[e.type].label})
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          checked={revealed}
          onChange={(e) => setRevealed(e.target.checked)}
          className="size-5 accent-(--accent)"
        />
        Revealed to players (only shows if both pages are revealed too)
      </label>
      {addLink.error && (
        <div className="mt-2">
          <Notice tone="error">{friendlyError(addLink.error)}</Notice>
        </div>
      )}
      <Button type="submit" className="mt-2" disabled={addLink.isPending || !toId}>
        {addLink.isPending ? 'Adding…' : 'Add link'}
      </Button>
    </form>
  )
}
