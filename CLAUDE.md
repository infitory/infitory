# CLAUDE.md

Web app for a tabletop RPG game master and their players. The full scope, stack, rules and phases are in `PROJECT_PLAN.md` — read it first and follow it in order.

## Project settings (kickoff, 2026-11-13)

- **App name:** Loreloom (working name chosen by Claude; user may rename)
- **World name:** Aldermere (temporary sample world; the user's focus is the app, not this world)
- **Game system:** system-agnostic — character sheets use flexible custom fields, nothing hard-codes one ruleset
- **Visual style:** clean modern UI for now. The user plans to explore other styles later (browsing awwwards.com for ideas), so keep colours, fonts and spacing in theme tokens that are easy to swap
- **User comfort with code/terminal:** a little — explain manual steps one at a time in plain language
- **Starter content:** invent a small sample world
- **Domain name:** none yet (needed at Phase 1.5)
- **Multiple worlds/campaigns:** wanted later — every table is scoped by `world_id` and roles are per world from the start

## Working with this user

- The user runs the app on their own **Windows** PC (PowerShell) from `C:\Users\Mael\infitory`; the cloud session's preview is not visible to them. To try new work they run `git pull`, then `npm.cmd install` (if dependencies changed) and `npm.cmd run dev`. PowerShell blocks `npm`, so always write **`npm.cmd`** in instructions.
- New migrations are applied by the user pasting the file into the Supabase **SQL Editor** (link them to the file on GitHub). Tell them exactly which file, once.
- The cloud container cannot reach `*.supabase.co`; verify database behaviour with the PGlite tests.
- **Dev Supabase project:** `loreloom-dev`, URL `https://pyonmuneplivatpyavad.supabase.co`. "Confirm email" is turned off there (keep it on for prod). The publishable key is in the user's local `.env`.

## Decisions

- 2026-11-13 — The repository's previous contents (an old static "TTRPG Manager" page and an unrelated `trieur-fichiers` tool) were removed at the user's request. They remain in Git history before the `phase-0-foundation` branch.
- 2026-11-13 — **Multi-world from day one.** Roles are per world (`world_members.role`), not global on `profiles`. Every data table has `world_id`; RLS policies go through `private.is_world_member()` / `private.is_world_gm()`.
- 2026-11-13 — **`entity_secrets` table** holds GM-only notes separately, because RLS hides rows, not columns: revealing an entity must not reveal its secrets. Follow this pattern for any GM-only field on a player-visible row.
- 2026-11-13 — **Links** are visible to players only if the link is revealed _and_ both endpoints are visible to them.
- 2026-11-13 — **oxlint instead of ESLint.** The current Vite template ships oxlint and TypeScript 7; kept it rather than fight tooling. Prettier handles formatting.
- 2026-11-13 — **RLS tests run on PGlite** (in-memory Postgres) against the real migration files, with a small stub of Supabase's `auth` schema (`tests/rls/harness.ts`). No network or Supabase project needed. Every new table needs tests here.
- 2026-11-13 — **In-world date** is `worlds.current_day`, a running integer day count; the calendar converts it.
- 2026-11-13 — **Login** is email + password.
- 2026-11-13 — **`[[Name]]` links are plain text** inside the rich-text JSON, resolved by name when a page is displayed (`src/logic/wikilinks.ts`, `src/components/RichTextView.tsx`). Page names are therefore unique per world (case-insensitive index). "Mentioned in" backlinks are computed client-side from descriptions. For players, a `[[Name]]` pointing at a page they cannot see renders as ordinary words.
- 2026-11-13 — **Rich text** is TipTap JSON in a `jsonb` column; read-only display uses our own small renderer, not TipTap.
- 2026-11-13 — **Images** live in the private `entity-images` bucket at `<world_id>/<entity_id>/<file>`, shown through signed URLs. Storage policies reuse the entities policy, so an image is visible exactly when its page is. In storage policies always write `objects.name` — a bare `name` inside an entities subquery silently means the entity's name.
- 2026-11-13 — **Export/import** format is versioned (`src/logic/worldExport.ts`). Import always creates new ids, never overwrites, and skips pages whose name exists. Importing a file creates a new world; "Add sample content" merges `src/data/sampleWorld.ts` into the current one. Images are not in the export yet.
- 2026-11-13 — The whole Codex of a world is loaded in one query (`useCodex`) and searched/filtered in the browser. Revisit if a world passes a few thousand pages.

## Architecture

- Static React front end (Vite, TypeScript strict, Tailwind v4, React Router, TanStack Query) talking directly to Supabase. No server of our own.
- **Security lives in the database**: RLS on every table; UI hiding is never the protection. API-facing helper functions live in the unexposed `private` schema.
- `src/logic/` is framework-free TypeScript with unit tests (no React/Supabase/browser imports).
- Routes: `/login`, `/worlds`, `/w/:worldId/<module>`. Pages inside a world get the world and role from `useWorld()` (`src/pages/WorldLayout.tsx`). The module list is `src/modules.ts`.
- Row types in `src/lib/types.ts` are hand-written; keep them in step with migrations.

## Conventions

- **Theme tokens only.** Colours/fonts are CSS variables in `src/index.css` exposed as Tailwind colours (`bg-surface`, `text-ink-soft`, `bg-accent`…). Never hard-code colours or use `dark:` variants in components — the restyle later must be a one-file change.
- Mobile-first; tap targets at least 44px (`min-h-11`, `size-11`).
- Migrations: new timestamped file in `supabase/migrations/`, never edit one that has been applied. Explicit `grant`s to `authenticated`, nothing to `anon`.
- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY` (public key only). `.env` is git-ignored.
- One branch per phase (`phase-N-name`); update Progress in `PROJECT_PLAN.md` at the end of each phase.

## Commands

- `npm run dev` — dev server
- Browser walkthroughs: since the container cannot reach Supabase, UI is checked with Playwright against an in-memory fake of the REST API (see the scratchpad scripts pattern: route `http://localhost:54321/**`, seed `sb-localhost-auth-token` in localStorage).
- `npm run check` — typecheck + lint + tests (run before every commit)
- `npm run build` — production build to `dist/`
- `npm run format` — Prettier
