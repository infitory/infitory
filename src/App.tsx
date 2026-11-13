import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router'
import { FullPageMessage } from './components/ui'
import { useAuth } from './lib/auth'
import { MODULES } from './modules'
import { ComingSoon } from './pages/ComingSoon'
import { LoginPage } from './pages/LoginPage'
import { WorldHome } from './pages/WorldHome'
import { WorldLayout } from './pages/WorldLayout'
import { WorldsPage } from './pages/WorldsPage'

/** Everything inside requires being signed in. */
function RequireAuth() {
  const { session, loading } = useAuth()
  if (loading) return <FullPageMessage>Loading…</FullPageMessage>
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/worlds" element={<WorldsPage />} />
          <Route path="/w/:worldId" element={<WorldLayout />}>
            <Route index element={<WorldHome />} />
            {MODULES.map((m) => (
              <Route key={m.slug} path={m.slug} element={<ComingSoon module={m} />} />
            ))}
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/worlds" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
