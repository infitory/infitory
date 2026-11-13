/**
 * Runs the real migration files against an in-memory Postgres (PGlite) so the
 * row-level security rules can be tested without a network or a Supabase
 * project. A tiny stand-in for Supabase's `auth` schema is created first.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PGlite } from '@electric-sql/pglite'

const MIGRATIONS_DIR = join(import.meta.dirname, '../../supabase/migrations')

const SUPABASE_STUB = `
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  create table auth.users (
    id uuid primary key default gen_random_uuid(),
    email text unique,
    raw_user_meta_data jsonb not null default '{}'::jsonb
  );
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  grant usage on schema auth to anon, authenticated;
  grant usage on schema public to anon, authenticated;
  -- Mimic Supabase's permissive defaults, so the tests prove that the
  -- migration itself locks things down.
  alter default privileges in schema public grant all on tables to anon, authenticated;
`

export type Db = PGlite

export async function createTestDb(): Promise<Db> {
  const db = new PGlite()
  await db.exec(SUPABASE_STUB)
  for (const file of readdirSync(MIGRATIONS_DIR).sort()) {
    if (file.endsWith('.sql')) await db.exec(readFileSync(join(MIGRATIONS_DIR, file), 'utf8'))
  }
  return db
}

/** Creates an account (as the database admin) and returns its id. */
export async function createUser(db: Db, email: string): Promise<string> {
  const res = await db.query<{ id: string }>(
    'insert into auth.users (email) values ($1) returning id',
    [email],
  )
  return res.rows[0].id
}

type Row = Record<string, unknown>

/**
 * Runs one SQL statement the way the API would for a signed-in user (or a
 * logged-out visitor when userId is null). Always resets back to admin.
 */
export async function as<T = Row>(
  db: Db,
  userId: string | null,
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  await db.exec(`set role ${userId ? 'authenticated' : 'anon'}`)
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [userId ?? ''])
  try {
    const res = await db.query<T>(sql, params)
    return res.rows
  } finally {
    await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`)
  }
}

/** Number of rows a statement changed/returned for that user (0 when RLS hides them). */
export async function affected(
  db: Db,
  userId: string | null,
  sql: string,
  params: unknown[] = [],
): Promise<number> {
  return (await as(db, userId, `${sql} returning 1 as ok`, params)).length
}
