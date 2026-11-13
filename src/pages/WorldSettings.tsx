import { Download, Sparkles } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Field, Notice } from '../components/ui'
import { SAMPLE_WORLD } from '../data/sampleWorld'
import { friendlyError } from '../lib/codex'
import { supabase } from '../lib/supabase'
import { downloadJson, exportWorld, importIntoWorld } from '../lib/worldTransfer'
import { useWorld } from './WorldLayout'

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <h2 className="font-medium">{title}</h2>
      {children}
    </section>
  )
}

export function WorldSettings() {
  const { world, role } = useWorld()
  const queryClient = useQueryClient()
  const [name, setName] = useState(world.name)

  const rename = useMutation({
    mutationFn: async (newName: string) => {
      const { error } = await supabase()
        .from('worlds')
        .update({ name: newName.trim() })
        .eq('id', world.id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['worlds'] }),
  })

  const exporter = useMutation({
    mutationFn: async () => {
      const file = await exportWorld(world)
      const safeName =
        world.name
          .replace(/[^a-z0-9]+/gi, '-')
          .replace(/^-|-$/g, '')
          .toLowerCase() || 'world'
      downloadJson(`${safeName}-${file.exportedAt.slice(0, 10)}.json`, file)
      return file.entities.length
    },
  })

  const sample = useMutation({
    mutationFn: () => importIntoWorld(world.id, SAMPLE_WORLD),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities', world.id] })
      queryClient.invalidateQueries({ queryKey: ['links', world.id] })
    },
  })

  if (role !== 'gm') return <Navigate to={`/w/${world.id}`} replace />

  function submitName(event: FormEvent) {
    event.preventDefault()
    if (name.trim() && name.trim() !== world.name) rename.mutate(name)
  }

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">World settings</h1>
      <p className="mt-2 text-ink-soft">Only the game master can see this page.</p>

      <div className="mt-8 space-y-4">
        <Card title="Name">
          <form onSubmit={submitName} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field
                label="World name"
                name="world-name"
                required
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={rename.isPending || !name.trim() || name.trim() === world.name}
            >
              {rename.isPending ? 'Saving…' : 'Rename'}
            </Button>
          </form>
          {rename.error && (
            <div className="mt-3">
              <Notice tone="error">{friendlyError(rename.error)}</Notice>
            </div>
          )}
        </Card>

        <Card title="Export">
          <p className="mt-1 text-sm text-ink-soft">
            Download every page, link and secret note of this world as one file. Keep it as a
            backup, or import it later as a new world. The file includes hidden content and your
            secret notes, so do not share it with players. Images are not included yet.
          </p>
          <Button
            className="mt-3"
            variant="outline"
            disabled={exporter.isPending}
            onClick={() => exporter.mutate()}
          >
            <Download className="size-4" />{' '}
            {exporter.isPending ? 'Preparing…' : 'Download world file'}
          </Button>
          {exporter.isSuccess && (
            <div className="mt-3">
              <Notice tone="info">
                Exported {exporter.data} pages. Check your downloads folder.
              </Notice>
            </div>
          )}
          {exporter.error && (
            <div className="mt-3">
              <Notice tone="error">{friendlyError(exporter.error)}</Notice>
            </div>
          )}
        </Card>

        <Card title="Sample content">
          <p className="mt-1 text-sm text-ink-soft">
            Adds a small example setting ({SAMPLE_WORLD.entities.length} pages around the town of
            Harrowgate) so you can try every feature. Pages you already have are never changed: any
            sample page whose name already exists is skipped.
          </p>
          <Button
            className="mt-3"
            variant="outline"
            disabled={sample.isPending}
            onClick={() => sample.mutate()}
          >
            <Sparkles className="size-4" /> {sample.isPending ? 'Adding…' : 'Add sample content'}
          </Button>
          {sample.isSuccess && (
            <div className="mt-3">
              <Notice tone="info">
                Added {sample.data.added} pages and {sample.data.links} links.
                {sample.data.skipped.length > 0 &&
                  ` Skipped ${sample.data.skipped.length} that already existed.`}
              </Notice>
            </div>
          )}
          {sample.error && (
            <div className="mt-3">
              <Notice tone="error">{friendlyError(sample.error)}</Notice>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
