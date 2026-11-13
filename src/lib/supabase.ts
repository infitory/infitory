import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const key = import.meta.env.VITE_SUPABASE_KEY?.trim()

/** False until the two values in `.env` are filled in. */
export const isSupabaseConfigured = Boolean(url && key)

let client: SupabaseClient | null = null

/** The single Supabase connection used by the whole app. */
export function supabase(): SupabaseClient {
  if (!url || !key) throw new Error('Supabase is not configured: fill in .env')
  client ??= createClient(url, key)
  return client
}
