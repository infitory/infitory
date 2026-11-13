import { Plus, Search, Share2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Tag, TypeIcon, VisibilityBadge } from '../../components/codexBits'
import { Notice } from '../../components/ui'
import { ENTITY_TYPE_LIST, ENTITY_TYPES } from '../../lib/entityTypes'
import type { EntityType } from '../../lib/types'
import { useCodex } from './useCodex'

const chip = (active: boolean) =>
  `inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-sm transition ${
    active
      ? 'border-accent bg-accent-soft text-accent-text'
      : 'border-line bg-surface text-ink-soft hover:text-ink'
  }`

export function CodexList() {
  const { entities, isGm, codexPath, world, isLoading, error } = useCodex()
  const [search, setSearch] = useState('')
  const [type, setType] = useState<EntityType | null>(null)
  const [tag, setTag] = useState('')

  const allTags = useMemo(
    () => [...new Set(entities.flatMap((e) => e.tags))].sort((a, b) => a.localeCompare(b)),
    [entities],
  )
  const counts = useMemo(() => {
    const c = new Map<EntityType, number>()
    for (const e of entities) c.set(e.type, (c.get(e.type) ?? 0) + 1)
    return c
  }, [entities])

  const needle = search.trim().toLowerCase()
  const shown = entities.filter(
    (e) =>
      (!type || e.type === type) &&
      (!tag || e.tags.includes(tag)) &&
      (!needle ||
        e.name.toLowerCase().includes(needle) ||
        e.summary.toLowerCase().includes(needle) ||
        e.tags.some((t) => t.toLowerCase().includes(needle))),
  )

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-3xl font-semibold tracking-tight">Codex</h1>
        <Link
          to="map"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-medium hover:bg-surface-2"
        >
          <Share2 className="size-4" aria-hidden="true" /> Relationship map
        </Link>
        {isGm && (
          <Link
            to="new"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-medium text-accent-ink hover:brightness-110"
          >
            <Plus className="size-4" aria-hidden="true" /> New page
          </Link>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search the Codex</span>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search by name, summary or tag"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block min-h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-3.5 text-base placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </label>
        {allTags.length > 0 && (
          <label>
            <span className="sr-only">Filter by tag</span>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-base sm:w-44"
            >
              <option value="">All tags</option>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by type">
        <button
          type="button"
          className={chip(type === null)}
          aria-pressed={type === null}
          onClick={() => setType(null)}
        >
          All <span className="text-xs opacity-70">{entities.length}</span>
        </button>
        {ENTITY_TYPE_LIST.map((t) => (
          <button
            key={t.type}
            type="button"
            className={chip(type === t.type)}
            aria-pressed={type === t.type}
            onClick={() => setType(type === t.type ? null : t.type)}
          >
            {t.plural} <span className="text-xs opacity-70">{counts.get(t.type) ?? 0}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-6">
          <Notice tone="error">Could not load the Codex: {error.message}</Notice>
        </div>
      )}
      {isLoading && <p className="mt-8 text-sm text-ink-soft">Loading pages…</p>}

      {!isLoading && !error && entities.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-line p-6 text-sm text-ink-soft">
          {isGm ? (
            <>
              <p className="text-base font-medium text-ink">This world has no pages yet.</p>
              <p className="mt-1">
                Create your first page with <strong>New page</strong>, or fill the world with
                example content from{' '}
                <Link
                  to={`/w/${world.id}/settings`}
                  className="font-medium text-accent-text hover:underline"
                >
                  World settings
                </Link>
                .
              </p>
            </>
          ) : (
            <p>Nothing has been revealed to you yet. Check back after your next session.</p>
          )}
        </div>
      )}

      {entities.length > 0 && shown.length === 0 && (
        <p className="mt-8 text-sm text-ink-soft">No pages match your search.</p>
      )}

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {shown.map((e) => (
          <li key={e.id}>
            <Link
              to={`${codexPath}/${e.id}`}
              className="flex h-full gap-3.5 rounded-2xl border border-line bg-surface p-4 shadow-card transition hover:border-accent"
            >
              <TypeIcon type={e.type} />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium">{e.name}</span>
                  {isGm && <VisibilityBadge visibility={e.visibility} />}
                </span>
                <span className="block text-xs text-ink-faint">{ENTITY_TYPES[e.type].label}</span>
                {e.summary && (
                  <span className="mt-1 line-clamp-2 block text-sm text-ink-soft">{e.summary}</span>
                )}
                {e.tags.length > 0 && (
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {e.tags.map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
