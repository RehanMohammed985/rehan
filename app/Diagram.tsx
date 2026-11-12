'use client'

import { useEffect, useRef, useState } from 'react'
import { mountNet, type Status } from './net'

export default function Diagram() {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<Status>({ step: 0, loss: 0 })
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return mountNet(canvas, setStatus, reduce)
  }, [])

  return (
    <div className={`diagram${open ? ' open' : ''}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-describedby="net"
        onClick={() => setOpen((o) => !o)}
        aria-label="A neural network learning to separate two spirals, live"
      >
        <canvas ref={ref} />
        <span className="caption">
          step {status.step.toLocaleString()} <span className="dim">· loss {status.loss.toFixed(3)}</span>
        </span>
      </button>
      <div className="tip" id="net" role="tooltip">
        <p>
          A neural network learning, live. Two layers of sixteen neurons, trained in your
          browser to tell two tangled spirals apart. Nothing is precomputed and the weights
          start random, so every visit learns from scratch. The shading is what it currently
          believes. Once it has it figured out, it forgets and tries again.
        </p>
      </div>
    </div>
  )
}
