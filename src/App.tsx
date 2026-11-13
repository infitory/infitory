import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router'
import { FullPageMessage } from './components/ui'
import { useAuth } from './lib/auth'
import { MODULES } from './modules'
import { CodexList } from './pages/codex/CodexList'
import { EntityFormPage } from './pages/codex/EntityForm'
import { EntityView } from './pages/codex/EntityView'
import { RelationshipMap } from './pages/codex/RelationshipMap'
import { ComingSoon } from './pages/ComingSoon'
import { LoginPage } from './pages/LoginPage'
import { WorldHome } from './pages/WorldHome'
import { WorldLayout } from './pages/WorldLayout'
import { WorldSettings } from './pages/WorldSettings'
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
            <Route path="codex" element={<CodexList />} />
            <Route path="codex/map" element={<RelationshipMap />} />
            <Route path="codex/new" element={<EntityFormPage />} />
            <Route path="codex/:entityId" element={<EntityView />} />
            <Route path="codex/:entityId/edit" element={<EntityFormPage />} />
            <Route path="settings" element={<WorldSettings />} />
            {MODULES.filter((m) => !m.ready).map((m) => (
              <Route key={m.slug} path={m.slug} element={<ComingSoon module={m} />} />
            ))}
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/worlds" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
