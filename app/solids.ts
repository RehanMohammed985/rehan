// The five Platonic solids as unit-radius vertex lists with edges found by
// nearest-neighbour distance, which is the same for every edge of a regular solid.
type V = [number, number, number]
const phi = (1 + Math.sqrt(5)) / 2

function signs(f: (a: number, b: number, c: number) => V[]): V[] {
  const out: V[] = []
  for (const a of [1, -1]) for (const b of [1, -1]) for (const c of [1, -1]) out.push(...f(a, b, c))
  return out
}

function unique(vs: V[]): V[] {
  const seen = new Set<string>()
  return vs.filter((v) => {
    const k = v.map((n) => n.toFixed(6)).join(',')
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

const raw: { name: string; element: string; verts: V[] }[] = [
  { name: 'Tetrahedron', element: 'fire', verts: [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]] },
  { name: 'Cube', element: 'earth', verts: signs((a, b, c) => [[a, b, c]]) },
  { name: 'Octahedron', element: 'air', verts: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]] },
  { name: 'Icosahedron', element: 'water', verts: unique(signs((a, b) => [[0, a, b * phi], [a, b * phi, 0], [a * phi, 0, b]])) },
  {
    name: 'Dodecahedron',
    element: 'the cosmos',
    verts: unique(signs((a, b, c) => [[a, b, c], [0, a / phi, b * phi], [a / phi, b * phi, 0], [a * phi, 0, b / phi]])),
  },
]

export const solids = raw.map(({ name, element, verts }) => {
  const r = Math.hypot(...verts[0])
  const v: V[] = verts.map(([x, y, z]) => [x / r, y / r, z / r])
  let min = Infinity
  for (let i = 0; i < v.length; i++)
    for (let j = i + 1; j < v.length; j++) min = Math.min(min, Math.hypot(v[i][0] - v[j][0], v[i][1] - v[j][1], v[i][2] - v[j][2]))
  const edges: [number, number][] = []
  for (let i = 0; i < v.length; i++)
    for (let j = i + 1; j < v.length; j++)
      if (Math.abs(Math.hypot(v[i][0] - v[j][0], v[i][1] - v[j][1], v[i][2] - v[j][2]) - min) < 1e-6) edges.push([i, j])
  return { name, element, verts: v, edges }
})
