import { ArrowLeft, Maximize, Minus, Plus } from 'lucide-react'
import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ENTITY_TYPE_LIST, ENTITY_TYPES } from '../../lib/entityTypes'
import type { EntityType } from '../../lib/types'
import { bounds, layoutGraph } from '../../logic/graphLayout'
import { useCodex } from './useCodex'

const NODE_RADIUS = 20

function shorten(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

export function RelationshipMap() {
  const { entities, links, codexPath, isLoading, isGm } = useCodex()
  const navigate = useNavigate()
  const [hiddenTypes, setHiddenTypes] = useState<Set<EntityType>>(new Set())
  const [linkedOnly, setLinkedOnly] = useState(true)
  const [view, setView] = useState({ x: 0, y: 0, k: 1 })
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const graph = useMemo(() => {
    const typed = entities.filter((e) => !hiddenTypes.has(e.type))
    const ids = new Set(typed.map((e) => e.id))
    const edges = links.filter((l) => ids.has(l.from_id) && ids.has(l.to_id))
    const connected = new Set(edges.flatMap((l) => [l.from_id, l.to_id]))
    const nodes = linkedOnly ? typed.filter((e) => connected.has(e.id)) : typed
    const layout = layoutGraph(
      nodes.map((n) => n.id),
      edges.map((l) => ({ from: l.from_id, to: l.to_id })),
    )
    return { nodes, edges, layout, box: bounds(layout.values()) }
  }, [entities, links, hiddenTypes, linkedOnly])

  const { box } = graph

  /** How many map units one screen pixel is, so dragging follows the finger. */
  function unitsPerPixel() {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect || !rect.width) return 1
    return Math.max(box.width / rect.width, box.height / rect.height)
  }

  function onPointerDown(e: ReactPointerEvent<SVGSVGElement>) {
    drag.current = { x: e.clientX, y: e.clientY, moved: false }
  }
  function onPointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (!d.moved && Math.hypot(dx, dy) < 5) return
    if (!d.moved) e.currentTarget.setPointerCapture(e.pointerId)
    d.moved = true
    d.x = e.clientX
    d.y = e.clientY
    const scale = unitsPerPixel()
    setView((v) => ({ ...v, x: v.x + dx * scale, y: v.y + dy * scale }))
  }
  function onPointerUp() {
    // Keep "moved" readable for the click handler that fires right after.
    setTimeout(() => (drag.current = null), 0)
  }
  const zoom = (factor: number) =>
    setView((v) => ({ ...v, k: Math.min(4, Math.max(0.3, v.k * factor)) }))

  function open(id: string) {
    if (drag.current?.moved) return
    navigate(`${codexPath}/${id}`)
  }

  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2
  const chip = (active: boolean) =>
    `inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-sm transition ${
      active
        ? 'border-line bg-surface text-ink'
        : 'border-line bg-transparent text-ink-faint line-through'
    }`

  return (
    <>
      <Link
        to={codexPath}
        className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Codex
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Relationship map</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Drag to move around, click a dot to open its page.
        {isGm && ' Dashed lines and rings are hidden from players.'}
      </p>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Show or hide types">
        {ENTITY_TYPE_LIST.map((t) => {
          const active = !hiddenTypes.has(t.type)
          return (
            <button
              key={t.type}
              type="button"
              aria-pressed={active}
              className={chip(active)}
              onClick={() => {
                const next = new Set(hiddenTypes)
                if (active) next.add(t.type)
                else next.delete(t.type)
                setHiddenTypes(next)
              }}
            >
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: t.color }}
                aria-hidden="true"
              />
              {t.plural}
            </button>
          )
        })}
        <label className="inline-flex min-h-9 cursor-pointer items-center gap-2 px-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={!linkedOnly}
            onChange={(e) => setLinkedOnly(!e.target.checked)}
            className="size-4 accent-(--accent)"
          />
          Show pages without links
        </label>
      </div>

      <div className="relative mt-4 h-[65vh] min-h-80 overflow-hidden rounded-2xl border border-line bg-surface">
        {isLoading ? (
          <p className="p-6 text-sm text-ink-soft">Loading…</p>
        ) : graph.nodes.length === 0 ? (
          <p className="p-6 text-sm text-ink-soft">
            Nothing to show yet. Add links between pages and they will appear here.
          </p>
        ) : (
          <svg
            ref={svgRef}
            viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
            className="size-full cursor-grab touch-none select-none active:cursor-grabbing"
            role="group"
            aria-label={`Relationship map with ${graph.nodes.length} pages and ${graph.edges.length} links`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={(e) => zoom(e.deltaY < 0 ? 1.12 : 1 / 1.12)}
          >
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0 0 10 5 0 10z" fill="var(--ink-faint)" />
              </marker>
            </defs>
            <g
              transform={`translate(${view.x} ${view.y}) translate(${cx} ${cy}) scale(${view.k}) translate(${-cx} ${-cy})`}
            >
              {graph.edges.map((l) => {
                const a = graph.layout.get(l.from_id)!
                const b = graph.layout.get(l.to_id)!
                const length = Math.hypot(b.x - a.x, b.y - a.y) || 1
                const ux = (b.x - a.x) / length
                const uy = (b.y - a.y) / length
                const pad = NODE_RADIUS + 4
                return (
                  <g key={l.id}>
                    <line
                      x1={a.x + ux * pad}
                      y1={a.y + uy * pad}
                      x2={b.x - ux * pad}
                      y2={b.y - uy * pad}
                      stroke="var(--ink-faint)"
                      strokeWidth="1.5"
                      strokeDasharray={l.visibility === 'gm_only' ? '5 5' : undefined}
                      markerEnd="url(#arrow)"
                    />
                    {l.label && (
                      <text
                        x={(a.x + b.x) / 2}
                        y={(a.y + b.y) / 2 - 5}
                        textAnchor="middle"
                        fontSize="11"
                        fill="var(--ink-soft)"
                        stroke="var(--surface)"
                        strokeWidth="4"
                        paintOrder="stroke"
                      >
                        {shorten(l.label, 26)}
                      </text>
                    )}
                  </g>
                )
              })}
              {graph.nodes.map((n) => {
                const p = graph.layout.get(n.id)!
                const info = ENTITY_TYPES[n.type]
                const Icon = info.icon
                return (
                  <g
                    key={n.id}
                    transform={`translate(${p.x} ${p.y})`}
                    role="link"
                    tabIndex={0}
                    aria-label={`${n.name}, ${info.label}${n.visibility === 'gm_only' ? ', hidden from players' : ''}`}
                    className="cursor-pointer outline-none [&:focus-visible>circle]:stroke-(--accent) [&:focus-visible>circle]:[stroke-width:3]"
                    onClick={() => open(n.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate(`${codexPath}/${n.id}`)
                      }
                    }}
                  >
                    <title>{n.summary ? `${n.name} — ${n.summary}` : n.name}</title>
                    <circle
                      r={NODE_RADIUS}
                      fill={info.color}
                      stroke="var(--surface)"
                      strokeWidth="2"
                    />
                    {n.visibility === 'gm_only' && (
                      <circle
                        r={NODE_RADIUS + 4}
                        fill="none"
                        stroke={info.color}
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                    )}
                    <Icon x={-10} y={-10} width={20} height={20} color="#fff" aria-hidden="true" />
                    <text
                      y={NODE_RADIUS + 16}
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="500"
                      fill="var(--ink)"
                      stroke="var(--surface)"
                      strokeWidth="4"
                      paintOrder="stroke"
                    >
                      {shorten(n.name, 24)}
                    </text>
                  </g>
                )
              })}
            </g>
          </svg>
        )}

        <div className="absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card">
          {(
            [
              [Plus, 'Zoom in', () => zoom(1.25)],
              [Minus, 'Zoom out', () => zoom(0.8)],
              [Maximize, 'Reset the view', () => setView({ x: 0, y: 0, k: 1 })],
            ] as const
          ).map(([Icon, label, action]) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              title={label}
              onClick={action}
              className="grid size-11 place-items-center text-ink-soft hover:bg-surface-2 hover:text-ink"
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
