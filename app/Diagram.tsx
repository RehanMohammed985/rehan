'use client'

import { useEffect, useRef, useState } from 'react'

// Lorenz system, sigma = 10, rho = 28, beta = 8/3
function step(p: [number, number, number], dt: number): [number, number, number] {
  const [x, y, z] = p
  return [x + dt * 10 * (y - x), y + dt * (x * (28 - z) - y), z + dt * (x * y - (8 / 3) * z)]
}

export default function Diagram() {
  const [open, setOpen] = useState(false)
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
    const MAX = reduce ? 6000 : 2200
    let pts: [number, number, number][] = []
    let p: [number, number, number] = [0.1, 0, 0]
    // skip the transient so the trail starts on the attractor
    for (let i = 0; i < 400; i++) p = step(p, 0.01)
    for (let i = 0; i < MAX; i++) { p = step(p, reduce ? 0.01 : 0.005); pts.push(p) }

    let t = 0
    let theta = 0
    let raf = 0
    const scale = size / 58
    const cx = size / 2
    const cy = size / 2 + 2

    const draw = () => {
      ctx.clearRect(0, 0, size, size)
      const cos = Math.cos(theta)
      const sin = Math.sin(theta)
      const n = pts.length
      ctx.lineWidth = 1
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      // draw in short runs so the tail fades
      const run = 40
      for (let s = 0; s < n - 1; s += run) {
        const a = reduce ? 0.55 : 0.03 + 0.9 * Math.pow(s / n, 2)
        ctx.strokeStyle = fg
        ctx.globalAlpha = a
        ctx.beginPath()
        for (let i = s; i <= Math.min(s + run, n - 1); i++) {
          const [x, y, z] = pts[i]
          const px = cx + (x * cos - y * sin) * scale
          const py = cy - (z - 27) * scale
          if (i === s) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      if (!reduce && n) {
        const [x, y, z] = pts[n - 1]
        ctx.fillStyle = fg
        ctx.beginPath()
        ctx.arc(cx + (x * cos - y * sin) * scale, cy - (z - 27) * scale, 2.2, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    if (reduce) {
      draw()
      return
    }

    const tick = () => {
      for (let i = 0; i < 4; i++) {
        p = step(p, 0.005)
        pts.push(p)
      }
      if (pts.length > MAX) pts = pts.slice(pts.length - MAX)
      t += 1
      theta = 0.9 * Math.sin(t * 0.008)
      draw()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className={`diagram${open ? ' open' : ''}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-describedby="lorenz"
        onClick={() => setOpen((o) => !o)}
        aria-label="Lorenz attractor, animated"
      >
        <canvas ref={ref} />
      </button>
      <div className="tip" id="lorenz" role="tooltip">
        <p>
          The Lorenz attractor. In 1963 Edward Lorenz reduced the weather to three equations
          and found a system that never repeats and never settles. Nudge the start by a
          millionth and the path is unrecognisable within seconds. The butterfly effect.
        </p>
      </div>
    </div>
  )
}
