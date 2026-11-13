import { ChevronsUpDown, Home, LogOut, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useOutletContext, useParams } from 'react-router'
import { RoleBadge } from '../components/RoleBadge'
import { ThemeToggle } from '../components/ThemeToggle'
import { Button, FullPageMessage, Logo } from '../components/ui'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import type { WorldMembership } from '../lib/types'
import { useMyWorlds } from '../lib/worlds'
import { MODULES } from '../modules'

/** Pages inside a world call this to get the world and the user's role in it. */
// eslint-disable-next-line react/only-export-components
export function useWorld(): WorldMembership {
  return useOutletContext<WorldMembership>()
}

function navClass({ isActive }: { isActive: boolean }) {
  return `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
    isActive ? 'bg-accent-soft text-accent-text' : 'text-ink-soft hover:bg-surface-2 hover:text-ink'
  }`
}

function Sidebar({
  membership,
  onNavigate,
}: {
  membership: WorldMembership
  onNavigate?: () => void
}) {
  const { world, role } = membership
  const base = `/w/${world.id}`
  return (
    <div className="flex h-full flex-col gap-4 p-3">
      <div className="px-2 pt-2">
        <Logo />
      </div>

      <Link
        to="/worlds"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 transition hover:border-accent"
        title="Switch world"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{world.name}</span>
          <RoleBadge role={role} />
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
        <span className="sr-only">Switch world</span>
      </Link>

      <nav aria-label="World sections" className="flex flex-1 flex-col gap-1 overflow-y-auto">
        <NavLink to={base} end className={navClass} onClick={onNavigate}>
          <Home className="size-5" aria-hidden="true" /> Overview
        </NavLink>
        {MODULES.map((m) => (
          <NavLink key={m.slug} to={`${base}/${m.slug}`} className={navClass} onClick={onNavigate}>
            <m.icon className="size-5" aria-hidden="true" /> {m.name}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center justify-between border-t border-line pt-3">
        <Button variant="ghost" onClick={() => supabase().auth.signOut()}>
          <LogOut className="size-4" /> Sign out
        </Button>
        <ThemeToggle />
      </div>
    </div>
  )
}

export function WorldLayout() {
  const { worldId } = useParams()
  const { session } = useAuth()
  const worlds = useMyWorlds(session?.user.id)
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the phone menu with Escape.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  if (worlds.isLoading) return <FullPageMessage>Opening world…</FullPageMessage>

  const membership = worlds.data?.find((m) => m.world.id === worldId)
  if (!membership) {
    return (
      <FullPageMessage>
        <div className="text-center">
          <p className="text-base font-medium text-ink">World not found</p>
          <p className="mt-1">It may have been deleted, or you are not a member of it.</p>
          <Link
            to="/worlds"
            className="mt-4 inline-block font-medium text-accent-text hover:underline"
          >
            Back to your worlds
          </Link>
        </div>
      </FullPageMessage>
    )
  }

  return (
    <div className="flex h-full">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-line bg-canvas md:block">
        <Sidebar membership={membership} />
      </aside>

      {/* Phone drawer */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-canvas shadow-card">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="absolute right-2 top-2 grid size-11 place-items-center rounded-xl text-ink-soft hover:bg-surface-2"
            >
              <X className="size-5" />
            </button>
            <Sidebar membership={membership} onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-line px-2 py-1.5 md:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="grid size-11 place-items-center rounded-xl text-ink-soft hover:bg-surface-2"
          >
            <Menu className="size-5" />
          </button>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">
            {membership.world.name}
          </span>
          <ThemeToggle />
        </header>
        <main key={location.pathname} className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
            <Outlet context={membership} />
          </div>
        </main>
      </div>
    </div>
  )
}
