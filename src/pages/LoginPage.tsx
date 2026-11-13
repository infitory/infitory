import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router'
import { ThemeToggle } from '../components/ThemeToggle'
import { Button, Field, Logo, Notice } from '../components/ui'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

type Mode = 'sign-in' | 'sign-up'

export function LoginPage() {
  const { session } = useAuth()
  const [mode, setMode] = useState<Mode>('sign-in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  if (session) return <Navigate to="/worlds" replace />

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setInfo(null)
    try {
      if (mode === 'sign-in') {
        const { error } = await supabase().auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { data, error } = await supabase().auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name.trim() },
            emailRedirectTo: window.location.origin,
          },
        })
        if (error) throw error
        if (!data.session) {
          setInfo(
            'Account created. Check your email and click the confirmation link, then sign in.',
          )
          setMode('sign-in')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const signingIn = mode === 'sign-in'

  return (
    <div className="relative grid min-h-full place-items-center p-4 sm:p-6">
      <ThemeToggle className="absolute right-3 top-3" />
      <main className="w-full max-w-sm">
        <Logo className="text-xl" />
        <h1 className="mt-8 text-3xl font-semibold tracking-tight">
          {signingIn ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="mt-2 text-ink-soft">
          {signingIn
            ? 'Sign in to open your worlds.'
            : 'One account works for every world, as game master or player.'}
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          {!signingIn && (
            <Field
              label="Display name"
              name="name"
              autoComplete="nickname"
              required
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete={signingIn ? 'current-password' : 'new-password'}
            required
            minLength={8}
            hint={signingIn ? undefined : 'At least 8 characters.'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Notice tone="error">{error}</Notice>}
          {info && <Notice tone="info">{info}</Notice>}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? 'Please wait…' : signingIn ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-sm text-ink-soft">
          {signingIn ? 'New here?' : 'Already have an account?'}{' '}
          <button
            type="button"
            className="font-medium text-accent-text underline-offset-4 hover:underline"
            onClick={() => {
              setMode(signingIn ? 'sign-up' : 'sign-in')
              setError(null)
              setInfo(null)
            }}
          >
            {signingIn ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </main>
    </div>
  )
}
