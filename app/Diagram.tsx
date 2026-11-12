'use client'

import { useEffect, useRef, useState } from 'react'
import { solids } from './solids'

const HOLD = 7000 // ms each solid is shown
const FADE = 900 // ms cross-fade

export default function Diagram() {
  const [open, setOpen] = useState(false)
  const [which, setWhich] = useState(4)
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const size = canvas.clientWidth
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const fg = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim() || '#111'
    const cx = size / 2
    const cy = size / 2
    const R = size * 0.36

    const drawSolid = (s: (typeof solids)[number], ax: number, ay: number, alpha: number) => {
      const cx1 = Math.cos(ax), sx1 = Math.sin(ax), cy1 = Math.cos(ay), sy1 = Math.sin(ay)
      const pts = s.verts.map(([x, y, z]) => {
        // rotate about y then x
        const x1 = x * cy1 + z * sy1
        const z1 = -x * sy1 + z * cy1
        const y1 = y * cx1 - z1 * sx1
        const z2 = y * sx1 + z1 * cx1
        const p = 1 / (1 + z2 * 0.28) // mild perspective
        return { X: cx + x1 * R * p, Y: cy + y1 * R * p, z: z2 }
      })
      ctx.lineWidth = 1
      ctx.lineCap = 'round'
      ctx.strokeStyle = fg
      for (const [a, b] of s.edges) {
        const depth = (pts[a].z + pts[b].z) / 2 // -1 back … 1 front
        ctx.globalAlpha = alpha * (0.18 + 0.62 * (depth + 1) / 2)
        ctx.beginPath()
        ctx.moveTo(pts[a].X, pts[a].Y)
        ctx.lineTo(pts[b].X, pts[b].Y)
        ctx.stroke()
      }
      ctx.fillStyle = fg
      for (const p of pts) {
        ctx.globalAlpha = alpha * (0.3 + 0.7 * (p.z + 1) / 2)
        ctx.beginPath()
        ctx.arc(p.X, p.Y, 1.6, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    if (reduce) {
      drawSolid(solids[4], 0.5, 0.6, 1)
      return
    }

    let raf = 0
    const t0 = performance.now()
    let shown = -1
    const tick = (now: number) => {
      const t = Math.max(0, now - t0)
      const ax = 0.45 + Math.sin(t * 0.00023) * 0.35
      const ay = t * 0.00035
      const slot = Math.floor(t / HOLD) % solids.length
      const into = t % HOLD
      ctx.clearRect(0, 0, size, size)
      if (into < FADE && t > HOLD) {
        const prev = (slot + solids.length - 1) % solids.length
        const k = into / FADE
        drawSolid(solids[prev], ax, ay, 1 - k)
        drawSolid(solids[slot], ax, ay, k)
      } else {
        drawSolid(solids[slot], ax, ay, 1)
      }
      if (slot !== shown) {
        shown = slot
        setWhich(slot)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const s = solids[which]

  return (
    <div className={`diagram${open ? ' open' : ''}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-describedby="solids"
        onClick={() => setOpen((o) => !o)}
        aria-label={`${s.name}, one of the five Platonic solids, rotating`}
      >
        <canvas ref={ref} />
        <span className="caption">
          {s.name} <span className="dim">· {s.element}</span>
        </span>
      </button>
      <div className="tip" id="solids" role="tooltip">
        <p>
          The five Platonic solids, the only convex shapes built from identical regular faces.
          In the Timaeus, Plato matched four of them to fire, earth, air and water and gave the
          fifth, the dodecahedron, to the universe itself. Euclid closed the Elements by proving
          there can be no sixth.
        </p>
      </div>
    </div>
  )
}
