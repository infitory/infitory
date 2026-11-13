import { useMemo } from 'react'
import type { LinkTarget } from '../../components/RichTextView'
import { useEntities, useLinks } from '../../lib/codex'
import type { Entity } from '../../lib/types'
import { normalizeName } from '../../logic/wikilinks'
import { useWorld } from '../WorldLayout'

/** Everything the Codex screens need about the current world. */
export function useCodex() {
  const { world, role } = useWorld()
  const entitiesQuery = useEntities(world.id)
  const linksQuery = useLinks(world.id)

  const derived = useMemo(() => {
    const entities = entitiesQuery.data ?? []
    const byId = new Map<string, Entity>(entities.map((e) => [e.id, e]))
    const pages = new Map<string, LinkTarget>(
      entities.map((e) => [
        normalizeName(e.name),
        { id: e.id, hidden: e.visibility === 'gm_only' },
      ]),
    )
    return { entities, byId, pages }
  }, [entitiesQuery.data])

  return {
    world,
    isGm: role === 'gm',
    codexPath: `/w/${world.id}/codex`,
    ...derived,
    links: linksQuery.data ?? [],
    isLoading: entitiesQuery.isLoading || linksQuery.isLoading,
    error: entitiesQuery.error ?? linksQuery.error,
  }
}
