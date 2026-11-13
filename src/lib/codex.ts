import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isEmptyDoc } from '../logic/richText'
import { supabase } from './supabase'
import type { Entity, EntityLink, EntityType, Visibility } from './types'

export const IMAGE_BUCKET = 'entity-images'
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

/** Turns database errors into something a person can act on. */
export function friendlyError(error: unknown): string {
  const e = error as { code?: string; message?: string } | null
  if (e?.code === '23505') return 'A page with this name already exists in this world.'
  if (e?.code === '42501') return 'You do not have permission to do that.'
  return e?.message || 'Something went wrong. Please try again.'
}

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

/** Every page of a world that the signed-in user is allowed to see. */
export function useEntities(worldId: string) {
  return useQuery({
    queryKey: ['entities', worldId],
    queryFn: async (): Promise<Entity[]> => {
      const { data, error } = await supabase()
        .from('entities')
        .select('*')
        .eq('world_id', worldId)
        .order('name')
      if (error) throw error
      return (data ?? []) as Entity[]
    },
  })
}

/** Every link of a world that the signed-in user is allowed to see. */
export function useLinks(worldId: string) {
  return useQuery({
    queryKey: ['links', worldId],
    queryFn: async (): Promise<EntityLink[]> => {
      const { data, error } = await supabase()
        .from('entity_links')
        .select('*')
        .eq('world_id', worldId)
      if (error) throw error
      return (data ?? []) as EntityLink[]
    },
  })
}

/** GM-only notes of one page. Players always get null (the database refuses). */
export function useSecretNotes(entityId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['secret', entityId],
    enabled: enabled && Boolean(entityId),
    queryFn: async (): Promise<unknown> => {
      const { data, error } = await supabase()
        .from('entity_secrets')
        .select('notes')
        .eq('entity_id', entityId!)
        .maybeSingle()
      if (error) throw error
      return data?.notes ?? null
    },
  })
}

/** A temporary private address for a stored image (the bucket is not public). */
export function useImageUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ['image-url', path],
    enabled: Boolean(path),
    staleTime: 50 * 60_000,
    gcTime: 55 * 60_000,
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await supabase()
        .storage.from(IMAGE_BUCKET)
        .createSignedUrl(path!, 3600)
      if (error) return null
      return data.signedUrl
    },
  })
}

// ---------------------------------------------------------------------------
// Writing (GM only — the database enforces it)
// ---------------------------------------------------------------------------

export interface EntityDraft {
  id?: string
  type: EntityType
  name: string
  summary: string
  description: unknown
  tags: string[]
  visibility: Visibility
  data: Entity['data']
  secretNotes: unknown
  /** A new picture to upload, `null` to remove the current one, undefined to keep it. */
  image?: File | null
}

async function removeImage(path: string | null) {
  if (path) await supabase().storage.from(IMAGE_BUCKET).remove([path])
}

async function uploadImage(worldId: string, entityId: string, file: File): Promise<string> {
  const ext = IMAGE_EXTENSIONS[file.type]
  if (!ext) throw new Error('Please choose a PNG, JPEG, WebP or GIF image.')
  if (file.size > MAX_IMAGE_BYTES) throw new Error('That image is larger than 5 MB.')
  const path = `${worldId}/${entityId}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase()
    .storage.from(IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: '31536000' })
  if (error) throw error
  return path
}

export function useSaveEntity(worldId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (draft: EntityDraft): Promise<Entity> => {
      const db = supabase()
      const fields = {
        type: draft.type,
        name: draft.name.trim(),
        summary: draft.summary.trim(),
        description: isEmptyDoc(draft.description) ? null : draft.description,
        tags: draft.tags,
        visibility: draft.visibility,
        data: draft.data,
      }
      const query = draft.id
        ? db.from('entities').update(fields).eq('id', draft.id)
        : db.from('entities').insert({ ...fields, world_id: worldId })
      const { data, error } = await query.select('*').single()
      if (error) throw error
      let entity = data as Entity

      if (isEmptyDoc(draft.secretNotes)) {
        const { error } = await db.from('entity_secrets').delete().eq('entity_id', entity.id)
        if (error) throw error
      } else {
        const { error } = await db
          .from('entity_secrets')
          .upsert({ entity_id: entity.id, world_id: worldId, notes: draft.secretNotes })
        if (error) throw error
      }

      if (draft.image !== undefined) {
        const oldPath = entity.image_path
        const newPath = draft.image ? await uploadImage(worldId, entity.id, draft.image) : null
        const { data, error } = await db
          .from('entities')
          .update({ image_path: newPath })
          .eq('id', entity.id)
          .select('*')
          .single()
        if (error) throw error
        entity = data as Entity
        await removeImage(oldPath)
      }
      return entity
    },
    onSuccess: (entity) => {
      queryClient.invalidateQueries({ queryKey: ['entities', worldId] })
      queryClient.invalidateQueries({ queryKey: ['secret', entity.id] })
    },
  })
}

export function useSetVisibility(worldId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; visibility: Visibility }) => {
      const { error } = await supabase()
        .from('entities')
        .update({ visibility: input.visibility })
        .eq('id', input.id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entities', worldId] }),
  })
}

export function useDeleteEntity(worldId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (entity: Entity) => {
      const { error } = await supabase().from('entities').delete().eq('id', entity.id)
      if (error) throw error
      await removeImage(entity.image_path)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities', worldId] })
      queryClient.invalidateQueries({ queryKey: ['links', worldId] })
    },
  })
}

export function useAddLink(worldId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      fromId: string
      toId: string
      label: string
      visibility: Visibility
    }) => {
      const { error } = await supabase().from('entity_links').insert({
        world_id: worldId,
        from_id: input.fromId,
        to_id: input.toId,
        label: input.label.trim(),
        visibility: input.visibility,
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['links', worldId] }),
  })
}

export function useUpdateLink(worldId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; visibility: Visibility }) => {
      const { error } = await supabase()
        .from('entity_links')
        .update({ visibility: input.visibility })
        .eq('id', input.id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['links', worldId] }),
  })
}

export function useDeleteLink(worldId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase().from('entity_links').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['links', worldId] }),
  })
}
