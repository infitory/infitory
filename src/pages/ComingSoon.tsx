import { Check } from 'lucide-react'
import type { AppModule } from '../modules'

/** Placeholder shown for modules that later phases will build. */
export function ComingSoon({ module }: { module: AppModule }) {
  return (
    <>
      <span className="grid size-14 place-items-center rounded-2xl bg-accent-soft text-accent-text">
        <module.icon className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight">{module.name}</h1>
      <p className="mt-2 max-w-prose text-ink-soft">{module.blurb}</p>

      <div className="mt-8 rounded-2xl border border-dashed border-line p-5">
        <p className="text-sm font-medium">
          Coming soon <span className="font-normal text-ink-faint">· {module.phase}</span>
        </p>
        <ul className="mt-3 space-y-2 text-sm text-ink-soft">
          {module.features.map((f) => (
            <li key={f} className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-accent-text" aria-hidden="true" /> {f}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
