import { describe, expect, it } from 'vitest'
import { bounds, layoutGraph } from './graphLayout.ts'

const ids = ['a', 'b', 'c', 'd', 'e', 'f']
const edges = [
  { from: 'a', to: 'b' },
  { from: 'b', to: 'c' },
  { from: 'd', to: 'e' },
]

const distance = (p: { x: number; y: number }, q: { x: number; y: number }) =>
  Math.hypot(p.x - q.x, p.y - q.y)

describe('layoutGraph', () => {
  it('places every node, with no two on top of each other', () => {
    const layout = layoutGraph(ids, edges)
    expect([...layout.keys()]).toEqual(ids)
    for (const a of ids) {
      for (const b of ids) {
        if (a < b) expect(distance(layout.get(a)!, layout.get(b)!)).toBeGreaterThan(60)
      }
    }
  })

  it('gives the same picture every time', () => {
    expect(layoutGraph(ids, edges)).toEqual(layoutGraph(ids, edges))
  })

  it('keeps linked pages closer than unlinked ones', () => {
    const layout = layoutGraph(ids, edges)
    expect(distance(layout.get('a')!, layout.get('b')!)).toBeLessThan(
      distance(layout.get('a')!, layout.get('e')!),
    )
  })

  it('ignores edges to unknown nodes and copes with nothing at all', () => {
    expect(layoutGraph(['a'], [{ from: 'a', to: 'zzz' }]).size).toBe(1)
    expect(layoutGraph([], []).size).toBe(0)
    expect(bounds([])).toEqual({ x: -200, y: -150, width: 400, height: 300 })
  })
})
