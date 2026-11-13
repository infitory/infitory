import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { currentTheme, setTheme, type Theme } from '../lib/theme'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setLocal] = useState<Theme>(() => currentTheme())
  const next: Theme = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      onClick={() => {
        setTheme(next)
        setLocal(next)
      }}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className={`inline-grid size-11 place-items-center rounded-xl text-ink-soft transition hover:bg-surface-2 hover:text-ink ${className}`}
    >
      {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  )
}
