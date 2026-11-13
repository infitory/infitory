# PROJECT_PLAN.md — TTRPG World & Campaign Web App

> **For the human:** put this file in the root of your (empty or freshly cloned) GitHub repository, open Claude Code in that folder with Fable 5.2 selected, and say:
> **“Read PROJECT_PLAN.md and start.”**
> In later sessions, say: **“Read PROJECT_PLAN.md and CLAUDE.md, then continue with the next phase.”**

---

## 0. Instructions for Claude Code (read first)

You are building a complete web app for a tabletop RPG game master (the user) and their players. This file is the single source of truth for scope, stack, rules and phases. Follow it in order.

### How to work with this user

- The user is a hobbyist, not necessarily a developer. Explain anything they must do themselves (creating accounts, copying keys, clicking settings) step by step, in plain language, one step at a time, and wait for confirmation before continuing.
- **Plan before building.** At the start of every phase, summarize your plan (data changes, screens, tests) in plain language and wait for the user's OK.
- **Work in phases, one Git branch per phase** (`phase-N-name`). Commit after each working step with clear messages. When a phase is done and the user has tested it, merge into `main` and push.
- After each meaningful step, start the dev server and tell the user exactly what to click to try the new feature.
- Never put secrets in committed files. Keys live in `.env` (git-ignored); keep `.env.example` updated with placeholder names.
- Never lose existing world data. All schema changes go through committed Supabase migration files.
- When a significant decision is made, record it in `CLAUDE.md`. At the end of every phase, tick it off in the **Progress** section at the bottom of this file and add a one-line note.
- If something in this plan is unclear, conflicts with reality (a library changed, a service limit), or would be a bad idea, say so and propose an alternative instead of guessing.

### First session only: kickoff

1. Ask the user these questions (all at once, briefly), and record the answers in `CLAUDE.md` under “Project settings”:
   - App name and world name
   - Game system (D&D 5e, Pathfinder 2e, system-agnostic, other)
   - Visual style (e.g. “aged parchment, ink and brass” or “clean dark modern UI”)
   - Their comfort level with code and the terminal
   - Whether they have starter content (factions, places, NPCs) to paste, or want a small invented sample world
   - Whether they have a domain name yet (needed for Infomaniak hosting)
2. Check that Node.js (LTS) and Git are installed; if not, guide installation.
3. Then begin **Phase 0**.

---

## 1. Product overview

One web app with connected modules that all share ONE world data model. An NPC created in the Codex appears on the map, is affected by the simulator, and appears in the Player Hub once revealed.

There are two roles:
- **GM** (one account, the owner): sees and edits everything.
- **Player** (invited accounts): sees only revealed content, owns their character sheet, can add notes.

Every world entity has a `visibility` of `gm_only` (default) or `revealed`.

### Modules

1. **World Codex** — self-linking wiki: NPCs, factions, locations, items, events, lore. Backlinks, `[[Name]]` auto-links, relationship map.
2. **Calendar** — custom months, weekdays, moons, holidays, seasons; a current in-world date used everywhere.
3. **Atlas** — uploaded map image, pins, terrain regions with danger levels, travel planner, random encounters.
4. **World Engine** — factions with goals, resources, territory and relationships; “Advance time” simulates off-screen events into a draft chronicle the GM approves, edits or rejects.
5. **Player Hub** — player logins, character sheets, party inventory and gold, quest log, discovered lore, session recaps, live updates.
6. **GM Toolkit** — initiative tracker, dice roller, editable generators, session notes, recap builder.
7. **Extras** — weather, rumor mill, downtime tracker, global search, JSON export/import.

---

## 2. Tech stack

| Concern | Choice |
|---|---|
| Front end | React + Vite + TypeScript (strict), React Router |
| Styling | Tailwind CSS, mobile-first, light/dark aware |
| Data fetching | TanStack Query (or a lighter alternative if you justify it) |
| Backend | Supabase: Postgres, Auth (email magic link or password), Realtime, Storage (map images, portraits) |
| Maps | Leaflet with `CRS.Simple` and an image overlay (tile large maps if needed) |
| Rich text | A lightweight editor that supports `[[Name]]` links (e.g. TipTap) |
| Tests | Vitest for logic; tests (or SQL checks) proving row-level security works |
| Code hosting | GitHub (private repository recommended) |
| Web hosting | **Infomaniak Web Hosting** (user's student offer) serving the static build; deployed by GitHub Actions over SFTP/SSH on every push to `main` |

### Architecture rules

- **Security lives in the database.** GM-only data is protected with Supabase row-level security (RLS) policies on every table. Hiding things in the UI is never enough. Players must be unable to read `gm_only` rows or edit other players' data, even by calling the API directly.
- **Pure logic modules.** World Engine, travel math, dice parsing, calendar math and weather live in framework-free TypeScript modules under `src/logic/` with unit tests. The World Engine uses a seeded random generator so any tick can be replayed.
- **Two Supabase projects:** `dev` for building and experimenting, `prod` for the real campaign. Migrations are applied to both.
- **Static front end.** The production build is static files only, so it can be hosted anywhere. Client-side routing needs an `.htaccess` fallback to `index.html` on Infomaniak.
- **Data versioning.** Export files include a schema version; import migrates older versions.

---

## 3. Data model (starting point — refine in Phase 0)

Propose the final schema in Phase 0, including tables for later phases so the model stays coherent. Expected core tables:

- `profiles` — user id, display name, role (`gm` | `player`)
- `worlds` — id, name, settings (JSON), current date, owner (supports multiple campaigns later)
- `entities` — id, world_id, type (`npc` | `faction` | `location` | `item` | `event` | `lore`), name, summary, description (rich text), tags, image path, visibility, type-specific data (JSON)
- `entity_links` — from_id, to_id, relationship label, visibility
- `calendars` — world_id, months, weekdays, moons, holidays, seasons
- `maps`, `map_pins`, `map_regions` (terrain, danger 1–5), `encounter_tables`
- `faction_state` — faction entity id, goals, resources (wealth, military, influence, secrecy 1–10), territory
- `faction_relations` — faction_a, faction_b, attitude (−5 to +5)
- `sim_ticks`, `chronicle_events` — draft/approved/rejected events with explanation and seed
- `characters` — owner (player), system-specific sheet (JSON)
- `party_inventory`, `inventory_log`, `quests`, `quest_notes`
- `sessions` — real date, in-world date, GM notes, published recap
- `generator_tables` — name, category, entries
- `player_notes` — attached to entities or quests

---

## 4. Phases

Each phase: create the branch → present the plan → build with commits → run locally for the user → user tests → update CLAUDE.md and Progress → merge to `main` and push.

### Phase 0 — Foundation
- Propose architecture, folder structure, full schema and RLS approach in plain language. Wait for approval.
- Scaffold the project (Vite + React + TS + Tailwind + Router), ESLint/Prettier, Vitest.
- Create `CLAUDE.md` (concise: project settings from kickoff, architecture, conventions, commands, pointer to this file).
- `.gitignore`, `.env.example`, README with how to run the project.
- Guide the user through creating the **dev** Supabase project and filling `.env`. Apply the first migration.
- App shell: login, GM/player roles, navigation with “coming soon” placeholders, responsive layout in the chosen style.
- Push to GitHub.

### Phase 1 — World Codex
- CRUD and search for all entity types; tags; images via Supabase Storage; visibility toggle.
- Links with relationship labels; backlinks on every page; `[[Name]]` auto-linking.
- Relationship map (nodes and labeled edges, filter by type).
- JSON export and import of the whole world.
- Seed script with the user's starter content or a small sample world.
- **Security test:** a player account cannot read `gm_only` entities or links.

### Phase 1.5 — First deployment (Infomaniak)
- Guide the user through: creating the **prod** Supabase project and applying migrations; setting up their domain/subdomain on Infomaniak with Let's Encrypt HTTPS; finding their SFTP/SSH credentials.
- Add `.htaccess` for SPA routing (and sensible caching headers).
- Create a GitHub Actions workflow: install, test, build with prod environment variables, upload `dist/` to Infomaniak over SFTP/SSH. Credentials stored as GitHub repository secrets only.
- Set Supabase auth redirect URLs for the live domain.
- Provide a verification checklist, including logging in as a test player to confirm GM content is invisible.
- From now on, every merge to `main` deploys automatically.

### Phase 2 — Calendar
- GM-defined months/lengths, weekdays, moons with cycles, holidays, seasons.
- Current world date; advance by day, week or month.
- Events pinned to dates; calendar view and timeline view (players see revealed only).
- Shared helpers for current date/season. Unit tests for date math and moon phases.

### Phase 3 — Atlas
- Map image upload; smooth pan/zoom on phone and desktop; tile if the image is large.
- Pins linked to Location entities, with popups.
- Draw terrain regions (road, plains, forest, hills, mountains, swamp, desert, water) with danger 1–5.
- Scale calibration with a measuring tool.
- Travel planner: route drawing, mode (foot, horse, cart, ship, flying), pace, terrain modifiers → days of travel and arrival date; optionally advance the world calendar.
- Random encounters per travel day from editable per-region tables.
- Visibility for pins and regions. Travel/encounter logic tested in `src/logic/`.

### Phase 4 — World Engine
- Before building, explain the simulation rules in plain language and get approval.
- Faction goals (priority), resources (1–10), territory, attitudes (−5 to +5).
- “Advance time” by week, month or season, synced with the Calendar.
- Each tick, factions choose actions (expand, trade, scheme, attack, recruit, research, defend, ally) weighted by goals, resources and relationships; dice outcomes weighted by resources. Editable random world-event tables.
- Output a **draft chronicle** of short in-world reports, each with a plain explanation of why it happened. GM approves, edits or rejects each; only approved events change state.
- Approved events become Codex events on the timeline and update the relationship map.
- Dashboards: faction resources over time; “tensions” view of relationships near war or alliance.
- All tuning numbers in a settings panel. Seeded RNG; thorough unit tests.

### Phase 5 — Player Hub
- GM invites players by email; players linked to their character.
- Character sheets for the chosen game system (or a flexible custom-field sheet if system-agnostic).
- Party inventory and gold with a change log; quest log (active/completed/failed) with player notes.
- Discovered Lore: revealed entities, pins and events only. Session recap archive.
- Supabase Realtime so reveals appear without refreshing.
- GM “view as player” preview.
- **Full RLS audit** of every table, with tests proving players can't read `gm_only` data or edit others' sheets. Report results in plain language.

### Phase 6 — GM Toolkit
- Initiative tracker (PCs from sheets + monsters; HP, conditions, rounds, active turn).
- Dice roller with expressions (`2d6+3`, `4d6kh3`, advantage/disadvantage) and history; tested parser.
- Editable generator tables (names by culture/region, taverns, rumors, loot, plot hooks); save results to the Codex in one click.
- Session notes with real and in-world dates and `[[Name]]` links.
- Recap builder: turns notes into a player-facing recap that mentions only revealed content; GM edits and publishes to the Player Hub.

### Phase 7 — Extras and polish
- Weather by region terrain and season, shown in the Calendar and travel planner.
- Rumor mill from recent approved chronicle events (some true, some distorted), handed out by the GM.
- Downtime tracker for players.
- Global search across modules.
- Full review: bugs, security, slow queries, accessibility, mobile layout. Fix and list changes. Update CLAUDE.md and README.

### Backlog (only when the user asks)
- Regional economy reacting to World Engine events
- Dynasty/family trees
- Session scheduler (player availability)
- Styled handouts revealed to players
- Encounter builder feeding the initiative tracker
- Faction reputation toward the party
- Multiple campaigns/groups

---

## 5. Definition of done (every phase)

- Works on a phone-sized screen and desktop.
- No TypeScript errors; lint passes; tests pass.
- RLS covers any new table; players can't see new GM-only data.
- Migrations committed; existing data intact.
- User has tried the feature and is happy.
- CLAUDE.md and the Progress section updated; branch merged and pushed.

---

## 6. Progress

Claude Code: tick items and add a one-line dated note as phases complete.

- [x] Kickoff questions answered
- [x] Phase 0 — Foundation
- [ ] Phase 1 — World Codex
- [ ] Phase 1.5 — First deployment (Infomaniak)
- [ ] Phase 2 — Calendar
- [ ] Phase 3 — Atlas
- [ ] Phase 4 — World Engine
- [ ] Phase 5 — Player Hub
- [ ] Phase 6 — GM Toolkit
- [ ] Phase 7 — Extras and polish

Notes:
- 2026-11-13 — Kickoff done; answers recorded in CLAUDE.md. Old repository contents cleared.
- 2026-11-13 — Phase 0 done: scaffold, schema + RLS (19 passing security tests), login, multi-world shell. Tested by the user against the dev Supabase project.
