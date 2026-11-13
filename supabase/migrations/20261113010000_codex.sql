-- Phase 1 (World Codex): unique page names per world, and image storage.

-- ---------------------------------------------------------------------------
-- Page names are unique inside a world (ignoring capitals), so that a
-- [[Name]] link always points at exactly one page.
-- ---------------------------------------------------------------------------

drop index if exists public.entities_world_name_idx;
create unique index entities_world_name_unique
  on public.entities (world_id, lower(trim(name)));

-- ---------------------------------------------------------------------------
-- Images
--
-- A private storage bucket. Files are stored as
--   <world id>/<entity id>/<file name>
-- and can be read only by someone who is allowed to read that entity:
-- the GM always, a player only once the page is revealed.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'entity-images',
  'entity-images',
  false,
  5242880, -- 5 MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Turns text into an id, or NULL when it is not one (so an oddly named file
-- is simply invisible instead of causing an error).
create function private.try_uuid(value text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
begin
  return value::uuid;
exception when others then
  return null;
end;
$$;

grant execute on function private.try_uuid(text) to authenticated;

-- Note: the file's name is written "objects.name" throughout, because inside
-- the entity lookups a bare "name" would mean the entity's name instead.
--
-- The lookups on public.entities below are themselves filtered by the
-- entities policy, so "this entity exists for me" means "I may see it".
create policy "entity images: readable with the entity" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'entity-images'
    and exists (
      select 1 from public.entities e
      where e.id = private.try_uuid((storage.foldername(objects.name))[2])
        and e.world_id = private.try_uuid((storage.foldername(objects.name))[1])
    )
  );

create policy "entity images: gm uploads" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'entity-images'
    and private.is_world_gm(private.try_uuid((storage.foldername(objects.name))[1]))
    and exists (
      select 1 from public.entities e
      where e.id = private.try_uuid((storage.foldername(objects.name))[2])
        and e.world_id = private.try_uuid((storage.foldername(objects.name))[1])
    )
  );

create policy "entity images: gm replaces" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'entity-images'
    and private.is_world_gm(private.try_uuid((storage.foldername(objects.name))[1]))
  )
  with check (
    bucket_id = 'entity-images'
    and private.is_world_gm(private.try_uuid((storage.foldername(objects.name))[1]))
  );

create policy "entity images: gm deletes" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'entity-images'
    and private.is_world_gm(private.try_uuid((storage.foldername(objects.name))[1]))
  );
