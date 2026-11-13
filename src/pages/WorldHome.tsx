import { Link } from 'react-router'
import { MODULES } from '../modules'
import { useWorld } from './WorldLayout'

export function WorldHome() {
  const { world, role } = useWorld()
  return (
    <>
      <p className="text-sm font-medium text-accent-text">
        {role === 'gm' ? 'You are the game master' : 'You are a player'}
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{world.name}</h1>
      <p className="mt-3 max-w-prose text-ink-soft">
        {role === 'gm'
          ? 'Everything you create here is hidden from players until you reveal it.'
          : 'You will see here whatever your game master has revealed to the party.'}
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {MODULES.map((m) => (
          <li key={m.slug}>
            <Link
              to={m.slug}
              className="flex h-full gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card transition hover:border-accent"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-text">
                <m.icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2 font-medium">
                  {m.name}
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-normal text-ink-soft">
                    Coming soon
                  </span>
                </span>
                <span className="mt-1 block text-sm text-ink-soft">{m.blurb}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
