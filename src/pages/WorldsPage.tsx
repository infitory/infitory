import { Globe, LogOut, Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { RoleBadge } from '../components/RoleBadge'
import { ThemeToggle } from '../components/ThemeToggle'
import { Button, Field, Logo, Notice } from '../components/ui'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { useCreateWorld, useMyWorlds } from '../lib/worlds'

export function WorldsPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const worlds = useMyWorlds(session?.user.id)
  const createWorld = useCreateWorld()
  const [name, setName] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    const world = await createWorld.mutateAsync(name).catch(() => null)
    if (world) navigate(`/w/${world.id}`)
  }

  const list = worlds.data ?? []

  return (
    <div className="mx-auto min-h-full w-full max-w-3xl px-4 pb-16 sm:px-6">
      <header className="flex items-center justify-between py-4">
        <Logo className="text-lg" />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" onClick={() => supabase().auth.signOut()}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </header>

      <main className="mt-6">
        <h1 className="text-3xl font-semibold tracking-tight">Your worlds</h1>
        <p className="mt-2 text-ink-soft">
          Each world is its own campaign setting. You are the game master of worlds you create.
        </p>

        {worlds.isLoading && <p className="mt-8 text-sm text-ink-soft">Loading your worlds…</p>}
        {worlds.error && (
          <div className="mt-8">
            <Notice tone="error">Could not load your worlds: {worlds.error.message}</Notice>
          </div>
        )}

        {list.length > 0 && (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {list.map(({ world, role }) => (
              <li key={world.id}>
                <Link
                  to={`/w/${world.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card transition hover:border-accent"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-text">
                    <Globe className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{world.name}</span>
                    <RoleBadge role={role} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {worlds.isSuccess && list.length === 0 && (
          <p className="mt-8 rounded-2xl border border-dashed border-line p-6 text-sm text-ink-soft">
            You are not in any world yet. Create your first one below.
          </p>
        )}

        <form
          onSubmit={submit}
          className="mt-8 rounded-2xl border border-line bg-surface p-5 shadow-card"
        >
          <h2 className="font-medium">Create a world</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field
                label="World name"
                name="world-name"
                placeholder="e.g. Aldermere"
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={createWorld.isPending || !name.trim()}>
              <Plus className="size-4" /> {createWorld.isPending ? 'Creating…' : 'Create world'}
            </Button>
          </div>
          {createWorld.error && (
            <div className="mt-3">
              <Notice tone="error">Could not create the world: {createWorld.error.message}</Notice>
            </div>
          )}
        </form>
      </main>
    </div>
  )
}
