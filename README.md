# Loreloom

A world and campaign manager for tabletop RPG game masters and their players:
a linked wiki (Codex), a custom calendar, a map with travel planning, a faction
simulator, a player hub and a GM toolkit — all sharing one world.

The full roadmap is in [`PROJECT_PLAN.md`](PROJECT_PLAN.md). Working notes for
Claude Code are in [`CLAUDE.md`](CLAUDE.md).

## What you need

- [Node.js](https://nodejs.org) (the "LTS" version)
- A free [Supabase](https://supabase.com) project (the online database and login system)

## First-time setup

1. **Install the libraries** (once, and again whenever `package.json` changes):

   ```bash
   npm install
   ```

2. **Connect the database.** Copy `.env.example` to a new file named `.env`
   and fill in the two values from your Supabase project: the project URL and
   the _public_ key (called "publishable" or "anon"). Never use the "secret" or
   "service_role" key here.

3. **Create the tables.** In the Supabase dashboard open **SQL Editor**, paste
   the contents of each file in `supabase/migrations/` (oldest first), and
   press **Run**. Each file is only ever run once per project.

## Everyday commands

| Command          | What it does                                                   |
| ---------------- | -------------------------------------------------------------- |
| `npm run dev`    | Starts the app on your computer and prints the address to open |
| `npm run check`  | Type-check, lint and run all tests                             |
| `npm run test`   | Run the tests only (includes the database security tests)      |
| `npm run build`  | Builds the final website into `dist/`                          |
| `npm run format` | Tidies the code formatting                                     |

## How it is organised

| Folder                 | Contents                                                       |
| ---------------------- | -------------------------------------------------------------- |
| `src/pages/`           | The screens                                                    |
| `src/components/`      | Reusable interface pieces                                      |
| `src/lib/`             | Database connection, login state, data loading                 |
| `src/logic/`           | Pure rules code (dice, calendar, travel, simulator) with tests |
| `src/index.css`        | The theme: every colour and font is defined here, once         |
| `supabase/migrations/` | Every database change, in order                                |
| `tests/rls/`           | Tests proving players cannot see GM-only data                  |

## Security in one paragraph

Who may see what is enforced by the database itself (Supabase "row-level
security"), not by the website. Everything belongs to a world; the game master
of a world can read and change all of it; players can only read what has been
marked "revealed"; everyone else sees nothing. `npm run test` runs the real
database rules against an in-memory Postgres and checks all of this.
