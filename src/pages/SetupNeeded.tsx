import { Logo } from '../components/ui'

/** Shown when .env has not been filled in yet. */
export function SetupNeeded() {
  return (
    <div className="grid min-h-full place-items-center p-6">
      <div className="w-full max-w-lg rounded-3xl border border-line bg-surface p-8 shadow-card">
        <Logo className="text-lg" />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Almost there</h1>
        <p className="mt-2 text-ink-soft">
          The app is running, but it is not connected to a database yet.
        </p>
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-ink-soft">
          <li>
            Copy <code className="rounded bg-surface-2 px-1.5 py-0.5 text-ink">.env.example</code>{' '}
            to <code className="rounded bg-surface-2 px-1.5 py-0.5 text-ink">.env</code>
          </li>
          <li>Paste in your Supabase project URL and public key</li>
          <li>Restart the dev server</li>
        </ol>
        <p className="mt-6 text-xs text-ink-faint">The README has the full step-by-step guide.</p>
      </div>
    </div>
  )
}
