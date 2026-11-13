import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'outline'
}

const BUTTON_STYLES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-accent text-accent-ink hover:brightness-110',
  outline: 'border border-line bg-surface text-ink hover:bg-surface-2',
  ghost: 'text-ink-soft hover:bg-surface-2 hover:text-ink',
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_STYLES[variant]} ${className}`}
    />
  )
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }

export function Field({ label, hint, id, className = '', ...props }: FieldProps) {
  const fieldId = id ?? props.name
  return (
    <label htmlFor={fieldId} className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        id={fieldId}
        {...props}
        className={`block min-h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-base text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 ${className}`}
      />
      {hint ? <span className="mt-1.5 block text-xs text-ink-faint">{hint}</span> : null}
    </label>
  )
}

export function Notice({ tone, children }: { tone: 'error' | 'info'; children: ReactNode }) {
  const styles = tone === 'error' ? 'bg-danger-soft text-danger' : 'bg-accent-soft text-accent-text'
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-xl px-3.5 py-2.5 text-sm ${styles}`}
    >
      {children}
    </p>
  )
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 font-semibold tracking-tight text-ink ${className}`}
    >
      <svg viewBox="0 0 32 32" className="size-7 shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="8" className="fill-accent" />
        <path
          d="M9 8v16M16 8v16M23 8v16M6 12h20M6 20h20"
          className="stroke-accent-ink"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      Loreloom
    </span>
  )
}

export function FullPageMessage({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-full place-items-center p-6 text-sm text-ink-soft" role="status">
      {children}
    </div>
  )
}
