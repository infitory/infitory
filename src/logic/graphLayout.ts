/**
 * Places the dots of the relationship map so that linked pages sit near each
 * other and nothing overlaps. Same input always gives the same picture.
 */
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force'

export interface Point {
  x: number
  y: number
}

export interface GraphEdge {
  from: string
  to: string
}

interface SimNode extends SimulationNodeDatum {
  id: string
}

export function layoutGraph(nodeIds: string[], edges: GraphEdge[]): Map<string, Point> {
  const nodes: SimNode[] = nodeIds.map((id) => ({ id }))
  const known = new Set(nodeIds)
  const links: SimulationLinkDatum<SimNode>[] = edges
    .filter((e) => known.has(e.from) && known.has(e.to) && e.from !== e.to)
    .map((e) => ({ source: e.from, target: e.to }))

  const simulation = forceSimulation(nodes)
    .force(
      'link',
      forceLink<SimNode, SimulationLinkDatum<SimNode>>(links)
        .id((n) => n.id)
        .distance(150)
        .strength(0.5),
    )
    .force('charge', forceManyBody().strength(-520))
    .force('collide', forceCollide(58))
    .force('center', forceCenter(0, 0))
    .stop()

  for (let i = 0; i < 300; i++) simulation.tick()

  return new Map(nodes.map((n) => [n.id, { x: Math.round(n.x ?? 0), y: Math.round(n.y ?? 0) }]))
}

/** The rectangle that contains every point, with some breathing room. */
export function bounds(points: Iterable<Point>, padding = 80) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of points) {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  }
  if (minX === Infinity) return { x: -200, y: -150, width: 400, height: 300 }
  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  }
}
