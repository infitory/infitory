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

## Decisions

- 2026-11-13 — The repository's previous contents (an old static "TTRPG Manager" page and an unrelated `trieur-fichiers` tool) were removed at the user's request. They remain in Git history before the `phase-0-foundation` branch.
