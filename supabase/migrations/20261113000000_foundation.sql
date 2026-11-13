-- Phase 0 foundation: accounts, worlds, memberships, codex entities and links.
--
-- Security model
--   * Every row of world data carries a world_id.
--   * world_members says who belongs to a world and as what (gm | player).
--   * A GM can read and write everything in their world.
--   * A player can only read rows marked 'revealed' in worlds they belong to.
--   * Anyone else (including logged-out visitors) sees nothing.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------

create type public.world_role as enum ('gm', 'player');
create type public.visibility as enum ('gm_only', 'revealed');
create type public.entity_type as enum ('npc', 'faction', 'location', 'item', 'event', 'lore');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now()
);

create table public.worlds (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  settings jsonb not null default '{}'::jsonb,
  -- In-world date as a running day count; the calendar (Phase 2) turns it into
  -- a year/month/day.
  current_day integer not null default 0,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.world_members (
  world_id uuid not null references public.worlds (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.world_role not null default 'player',
  created_at timestamptz not null default now(),
  primary key (world_id, user_id)
);
create index world_members_user_idx on public.world_members (user_id);

create table public.entities (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.worlds (id) on delete cascade,
  type public.entity_type not null,
  name text not null check (length(trim(name)) > 0),
  summary text not null default '',
  description jsonb,
  tags text[] not null default '{}',
  image_path text,
  visibility public.visibility not null default 'gm_only',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Lets other tables reference (world_id, id) so links can never cross worlds.
  unique (world_id, id)
);
create index entities_world_type_idx on public.entities (world_id, type);
create index entities_world_name_idx on public.entities (world_id, lower(name));
create index entities_tags_idx on public.entities using gin (tags);

-- GM-only notes for an entity. Kept in a separate table so that revealing an
-- entity to players never reveals its secrets.
create table public.entity_secrets (
  entity_id uuid primary key,
  world_id uuid not null references public.worlds (id) on delete cascade,
  notes jsonb,
  updated_at timestamptz not null default now(),
  foreign key (world_id, entity_id) references public.entities (world_id, id) on delete cascade
);

create table public.entity_links (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.worlds (id) on delete cascade,
  from_id uuid not null,
  to_id uuid not null,
  label text not null default '',
  visibility public.visibility not null default 'gm_only',
  created_at timestamptz not null default now(),
  foreign key (world_id, from_id) references public.entities (world_id, id) on delete cascade,
  foreign key (world_id, to_id) references public.entities (world_id, id) on delete cascade,
  check (from_id <> to_id)
);
create index entity_links_from_idx on public.entity_links (from_id);
create index entity_links_to_idx on public.entity_links (to_id);

-- ---------------------------------------------------------------------------
-- Helper functions
--
-- These live in a schema the API does not expose. They run with the table
-- owner's rights so that policies can ask "is this user a member?" without
-- the question itself being blocked by row-level security.
-- ---------------------------------------------------------------------------

create schema if not exists private;

create function private.is_world_member(target_world uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.world_members m
    where m.world_id = target_world and m.user_id = (select auth.uid())
  );
$$;

create function private.is_world_gm(target_world uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.world_members m
    where m.world_id = target_world
      and m.user_id = (select auth.uid())
      and m.role = 'gm'
  );
$$;

create function private.shares_world_with(other_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.world_members mine
    join public.world_members theirs on theirs.world_id = mine.world_id
    where mine.user_id = (select auth.uid()) and theirs.user_id = other_user
  );
$$;

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(coalesce(new.email, ''), '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create function private.handle_new_world()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.world_members (world_id, user_id, role)
  values (new.id, new.owner_id, 'gm')
  on conflict (world_id, user_id) do update set role = 'gm';
  return new;
end;
$$;

-- The world's owner must always stay its GM, so a world can never be orphaned
-- or taken over by another GM.
create function private.protect_world_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  world_owner uuid;
begin
  select w.owner_id into world_owner from public.worlds w where w.id = old.world_id;
  -- world_owner is null while the world itself is being deleted: allow that.
  if world_owner is null or old.user_id <> world_owner then
    return coalesce(new, old);
  end if;
  -- The owner's account is being deleted (their worlds go with it): allow that.
  if not exists (select 1 from auth.users u where u.id = old.user_id) then
    return coalesce(new, old);
  end if;
  if tg_op = 'DELETE' then
    raise exception 'The owner of a world cannot be removed from it';
  end if;
  if new.role <> 'gm' or new.user_id <> old.user_id or new.world_id <> old.world_id then
    raise exception 'The owner of a world must remain its GM';
  end if;
  return new;
end;
$$;

create function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function private.lock_world_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.owner_id <> old.owner_id then
    raise exception 'A world''s owner cannot be changed';
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create trigger on_world_created
  after insert on public.worlds
  for each row execute function private.handle_new_world();

create trigger worlds_lock_owner
  before update on public.worlds
  for each row execute function private.lock_world_owner();

create trigger world_members_protect_owner
  before update or delete on public.world_members
  for each row execute function private.protect_world_owner();

create trigger worlds_touch before update on public.worlds
  for each row execute function private.touch_updated_at();
create trigger entities_touch before update on public.entities
  for each row execute function private.touch_updated_at();
create trigger entity_secrets_touch before update on public.entity_secrets
  for each row execute function private.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Privileges: only signed-in users may touch these tables at all, and the
-- row-level policies below then decide which rows.
-- ---------------------------------------------------------------------------

grant usage on schema private to authenticated;
grant execute on function private.is_world_member(uuid) to authenticated;
grant execute on function private.is_world_gm(uuid) to authenticated;
grant execute on function private.shares_world_with(uuid) to authenticated;

revoke all on public.profiles, public.worlds, public.world_members,
  public.entities, public.entity_secrets, public.entity_links from anon;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.worlds, public.world_members,
  public.entities, public.entity_secrets, public.entity_links to authenticated;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.worlds enable row level security;
alter table public.world_members enable row level security;
alter table public.entities enable row level security;
alter table public.entity_secrets enable row level security;
alter table public.entity_links enable row level security;

-- profiles: you see yourself and the people you share a world with.
create policy "profiles: read self and world-mates" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or private.shares_world_with(id));

create policy "profiles: update self" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- worlds
create policy "worlds: members read" on public.worlds
  for select to authenticated
  using (owner_id = (select auth.uid()) or private.is_world_member(id));

create policy "worlds: anyone signed in can create their own" on public.worlds
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy "worlds: gm updates" on public.worlds
  for update to authenticated
  using (private.is_world_gm(id))
  with check (private.is_world_gm(id));

create policy "worlds: owner deletes" on public.worlds
  for delete to authenticated
  using (owner_id = (select auth.uid()));

-- world_members
create policy "members: members read" on public.world_members
  for select to authenticated
  using (private.is_world_member(world_id));

create policy "members: gm adds" on public.world_members
  for insert to authenticated
  with check (private.is_world_gm(world_id));

create policy "members: gm updates" on public.world_members
  for update to authenticated
  using (private.is_world_gm(world_id))
  with check (private.is_world_gm(world_id));

create policy "members: gm removes, or you leave" on public.world_members
  for delete to authenticated
  using (private.is_world_gm(world_id) or user_id = (select auth.uid()));

-- entities
create policy "entities: gm reads all, players read revealed" on public.entities
  for select to authenticated
  using (
    private.is_world_gm(world_id)
    or (visibility = 'revealed' and private.is_world_member(world_id))
  );

create policy "entities: gm inserts" on public.entities
  for insert to authenticated
  with check (private.is_world_gm(world_id));

create policy "entities: gm updates" on public.entities
  for update to authenticated
  using (private.is_world_gm(world_id))
  with check (private.is_world_gm(world_id));

create policy "entities: gm deletes" on public.entities
  for delete to authenticated
  using (private.is_world_gm(world_id));

-- entity_secrets: GM only, always.
create policy "entity_secrets: gm only" on public.entity_secrets
  for all to authenticated
  using (private.is_world_gm(world_id))
  with check (private.is_world_gm(world_id));

-- entity_links: a player sees a link only if the link is revealed AND both
-- ends are entities they can see. (The inner lookups on entities are
-- themselves filtered by the entities policy above.)
create policy "links: gm reads all, players read fully revealed" on public.entity_links
  for select to authenticated
  using (
    private.is_world_gm(world_id)
    or (
      visibility = 'revealed'
      and private.is_world_member(world_id)
      and exists (select 1 from public.entities e where e.id = from_id)
      and exists (select 1 from public.entities e where e.id = to_id)
    )
  );

create policy "links: gm inserts" on public.entity_links
  for insert to authenticated
  with check (private.is_world_gm(world_id));

create policy "links: gm updates" on public.entity_links
  for update to authenticated
  using (private.is_world_gm(world_id))
  with check (private.is_world_gm(world_id));

create policy "links: gm deletes" on public.entity_links
  for delete to authenticated
  using (private.is_world_gm(world_id));
