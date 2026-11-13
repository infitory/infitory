import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router'
import { RichTextEditor } from '../../components/RichTextEditor'
import { Button, Field, Notice } from '../../components/ui'
import {
  friendlyError,
  MAX_IMAGE_BYTES,
  useImageUrl,
  useSaveEntity,
  useSecretNotes,
} from '../../lib/codex'
import { ENTITY_TYPE_LIST, isEntityType } from '../../lib/entityTypes'
import type { DetailField, Entity, EntityType, Visibility } from '../../lib/types'
import { useCodex } from './useCodex'

const inputClass =
  'block min-h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-base text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30'

function parseTags(text: string): string[] {
  return [
    ...new Set(
      text
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    ),
  ]
}

/** Loads what the form needs, then shows it. Used for both "new" and "edit". */
export function EntityFormPage() {
  const { entityId } = useParams()
  const { isGm, byId, isLoading, codexPath } = useCodex()
  const entity = entityId ? byId.get(entityId) : undefined
  const secret = useSecretNotes(entityId, isGm)

  if (!isGm) return <Navigate to={codexPath} replace />
  if (isLoading || (entityId && secret.isLoading))
    return <p className="text-sm text-ink-soft">Loading…</p>
  if (entityId && !entity) return <Navigate to={codexPath} replace />
  // The key makes a fresh form whenever a different page is opened.
  return <EntityForm key={entityId ?? 'new'} entity={entity} secretNotes={secret.data ?? null} />
}

function EntityForm({ entity, secretNotes }: { entity?: Entity; secretNotes: unknown }) {
  const { world, codexPath } = useCodex()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const save = useSaveEntity(world.id)
  const currentImage = useImageUrl(entity?.image_path)

  const presetType = params.get('type')
  const [type, setType] = useState<EntityType>(
    entity?.type ?? (isEntityType(presetType) ? presetType : 'npc'),
  )
  const [name, setName] = useState(entity?.name ?? params.get('name') ?? '')
  const [summary, setSummary] = useState(entity?.summary ?? '')
  const [tags, setTags] = useState((entity?.tags ?? []).join(', '))
  const [description, setDescription] = useState<unknown>(entity?.description ?? null)
  const [secret, setSecret] = useState<unknown>(secretNotes)
  const [revealed, setRevealed] = useState(entity?.visibility === 'revealed')
  const [fields, setFields] = useState<DetailField[]>(entity?.data.fields ?? [])
  const [image, setImage] = useState<File | null | undefined>(undefined)
  const [imageError, setImageError] = useState<string | null>(null)

  const backTo = entity ? `${codexPath}/${entity.id}` : codexPath

  async function submit(event: FormEvent) {
    event.preventDefault()
    const visibility: Visibility = revealed ? 'revealed' : 'gm_only'
    const cleanFields = fields
      .map((f) => ({ label: f.label.trim(), value: f.value.trim() }))
      .filter((f) => f.label || f.value)
    const saved = await save
      .mutateAsync({
        id: entity?.id,
        type,
        name,
        summary,
        description,
        tags: parseTags(tags),
        visibility,
        data: { ...entity?.data, fields: cleanFields },
        secretNotes: secret,
        image,
      })
      .catch(() => null)
    if (saved) navigate(`${codexPath}/${saved.id}`)
  }

  function pickImage(file: File | undefined) {
    setImageError(null)
    if (!file) return
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('That image is larger than 5 MB. Please choose a smaller one.')
      return
    }
    setImage(file)
  }

  const showCurrentImage = image === undefined && entity?.image_path

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Cancel
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {entity ? `Edit ${entity.name}` : 'New page'}
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
        <Field
          label="Name"
          name="name"
          required
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Type</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as EntityType)}
            className={inputClass}
          >
            {ENTITY_TYPE_LIST.map((t) => (
              <option key={t.type} value={t.type}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Field
        label="Summary"
        name="summary"
        maxLength={240}
        hint="One line shown in lists and search results."
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />

      <Field
        label="Tags"
        name="tags"
        placeholder="e.g. harrowgate, merchant"
        hint="Separate tags with commas."
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <RichTextEditor
        label="Description"
        value={description}
        onChange={setDescription}
        hint="Type [[Page name]] to link to another page, or [[Page name|other words]] to show different text."
      />

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Details</legend>
        <p className="mb-2 text-xs text-ink-faint">
          Any short facts you like, such as Age, Population or Price.
        </p>
        <div className="space-y-2">
          {fields.map((f, i) => (
            <div key={i} className="flex gap-2">
              <input
                aria-label={`Detail ${i + 1} label`}
                placeholder="Label"
                value={f.label}
                onChange={(e) =>
                  setFields(fields.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))
                }
                className={`${inputClass} w-2/5`}
              />
              <input
                aria-label={`Detail ${i + 1} value`}
                placeholder="Value"
                value={f.value}
                onChange={(e) =>
                  setFields(fields.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))
                }
                className={inputClass}
              />
              <button
                type="button"
                aria-label={`Remove detail ${i + 1}`}
                onClick={() => setFields(fields.filter((_, j) => j !== i))}
                className="grid size-11 shrink-0 place-items-center rounded-xl text-ink-soft hover:bg-surface-2 hover:text-danger"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-2"
          onClick={() => setFields([...fields, { label: '', value: '' }])}
        >
          <Plus className="size-4" /> Add a detail
        </Button>
      </fieldset>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Image</legend>
        {showCurrentImage && currentImage.data && (
          <img
            src={currentImage.data}
            alt=""
            className="mb-2 max-h-40 rounded-xl border border-line"
          />
        )}
        {image && <p className="mb-2 text-sm text-ink-soft">New image: {image.name}</p>}
        {image === null && (
          <p className="mb-2 text-sm text-ink-soft">The image will be removed when you save.</p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            aria-label="Choose an image"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => pickImage(e.target.files?.[0])}
            className="block max-w-full text-sm text-ink-soft file:mr-3 file:min-h-11 file:rounded-xl file:border file:border-solid file:border-line file:bg-surface file:px-4 file:text-sm file:font-medium file:text-ink"
          />
          {(showCurrentImage || image) && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setImage(entity?.image_path ? null : undefined)}
            >
              Remove image
            </Button>
          )}
        </div>
        <p className="mt-1.5 text-xs text-ink-faint">
          PNG, JPEG, WebP or GIF, up to 5 MB. Players only see it once the page is revealed.
        </p>
        {imageError && (
          <div className="mt-2">
            <Notice tone="error">{imageError}</Notice>
          </div>
        )}
      </fieldset>

      <div className="rounded-2xl border border-hidden/40 bg-hidden-soft p-4">
        <RichTextEditor
          label="GM secret notes"
          value={secret}
          onChange={setSecret}
          small
          hint="Never shown to players, even when this page is revealed."
        />
      </div>

      <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border border-line bg-surface p-4">
        <input
          type="checkbox"
          checked={revealed}
          onChange={(e) => setRevealed(e.target.checked)}
          className="mt-0.5 size-5 accent-(--accent)"
        />
        <span>
          <span className="block text-sm font-medium">Revealed to players</span>
          <span className="block text-sm text-ink-soft">
            {revealed
              ? 'Players in this world can read this page (but never the secret notes).'
              : 'Only you can see this page.'}
          </span>
        </span>
      </label>

      {save.error && <Notice tone="error">{friendlyError(save.error)}</Notice>}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={save.isPending || !name.trim()}>
          {save.isPending ? 'Saving…' : entity ? 'Save changes' : 'Create page'}
        </Button>
        <Link
          to={backTo}
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-medium text-ink-soft hover:bg-surface-2"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
