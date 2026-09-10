'use client'

import { useEffect, useRef } from 'react'

type Agent = {
  x: number
  y: number
  vx: number
  vy: number
  z: number // depth: 0.35 (far) .. 1 (near)
  role: 'coordinator' | 'relay'
  r: number
  glow: number // green flash
  flash: number // white flash (reclaimed)
  msgs: number
  conv: boolean // aligned with the visitor's signal
  factIdx: number | null
  dx: number
  dy: number
}

type Pulse = {
  sx: number
  sy: number
  to: number // agent index, or -1 for the cursor
  t: number
  speed: number
  chain: number
  convert: boolean
}

type Ripple = { x: number; y: number; r: number; alpha: number; white?: boolean }

type Dust = { x: number; y: number; z: number; r: number }

type Orb = { x: number; y: number; z: number; r: number; vx: number; vy: number }

type HoloLabel = {
  agent: number | null
  x: number
  y: number
  text: string
  born: number
  life: number
}

const LINK_DIST = 150
const CURSOR_DIST = 200
const CONSENSUS_CHAIN = 3
const COORD_NEIGHBORS_TO_FLIP = 3
const RECLAIM_RADIUS = 170
const RECLAIM_INTERVAL = 7000

// memory fragments — aligning a carrier reveals what it knows about him
const FACTS = [
  'studies Business + CS at NC State',
  'researches human-simulation agents at ARNAV Lab',
  'builds eval pipelines for multi-agent AI at Boardy',
  'Telora fellow — backed to build in edtech',
  'researched MARL communication at Cohere Labs',
  'causal inference research at UNCC under Dr. Terejanu',
  'built a cube solver that sees — optimal solutions, all in the browser',
  'runs Cursor from his phone via a Discord bridge he built',
  'his SAT platform "1600" is used by 25 students',
  'matched international students to careers with Pathfinder',
  'taught pre-calc at NCSSM, the #1 public high school in the US',
  'believes obsession, directed with purpose, beats talent',
]

export default function Swarm() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const mouse = { x: -9999, y: -9999, active: false }
    const agents: Agent[] = []
    const pulses: Pulse[] = []
    const ripples: Ripple[] = []
    const dust: Dust[] = []
    const orbs: Orb[] = []
    const labels: HoloLabel[] = []
    const collected = new Set<number>()
    let gameStarted = false
    let gameWon = false
    let nextReclaim = 0

    const stats = { agents: 0, coordinators: 0, messages: 0, consensus: 0, aligned: 0 }
    const fragments = { total: FACTS.length, found: 0, facts: [] as string[] }
    const win = window as unknown as {
      __swarmStats?: typeof stats
      __swarmPing?: () => number
      __swarmReset?: () => void
      __swarmFragments?: typeof fragments
    }
    win.__swarmStats = stats
    win.__swarmFragments = fragments

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const spawn = () => {
      agents.length = 0
      dust.length = 0
      orbs.length = 0
      const count = Math.min(64, Math.max(28, Math.floor((w * h) / 24000)))
      const coordinators = Math.max(3, Math.round(count / 12))
      for (let i = 0; i < count; i++) {
        const z = 0.35 + Math.random() * 0.65
        const role: Agent['role'] = i < coordinators ? 'coordinator' : 'relay'
        agents.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.5 * z,
          vy: (Math.random() - 0.5) * 0.5 * z,
          z,
          role,
          r: (1 + z * 1.8) + (role === 'coordinator' ? 1 : 0),
          glow: 0,
          flash: 0,
          msgs: 0,
          conv: false,
          factIdx: null,
          dx: 0,
          dy: 0,
        })
      }
      const stride = Math.max(1, Math.floor(count / FACTS.length))
      for (let f = 0; f < FACTS.length && f * stride < count; f++) {
        agents[f * stride].factIdx = f
      }
      stats.agents = count
      stats.coordinators = coordinators
      stats.aligned = 0

      const dustCount = Math.min(140, Math.floor((w * h) / 9000))
      for (let i = 0; i < dustCount; i++) {
        dust.push({ x: Math.random() * w, y: Math.random() * h, z: 0.08 + Math.random() * 0.22, r: 0.5 + Math.random() * 0.9 })
      }
      for (let i = 0; i < 5; i++) {
        orbs.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: 1.15 + Math.random() * 0.45,
          r: 50 + Math.random() * 70,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.1,
        })
      }
    }

    resize()
    spawn()

    const alignedCount = () => agents.reduce((n, a) => n + (a.conv ? 1 : 0), 0)

    const alignedNeighborsOf = (idx: number) => {
      let n = 0
      for (let j = 0; j < agents.length; j++) {
        if (j === idx || !agents[j].conv) continue
        if (Math.hypot(agents[idx].x - agents[j].x, agents[idx].y - agents[j].y) < LINK_DIST * 1.3) n++
      }
      return n
    }

    const revealFragment = (idx: number) => {
      const a = agents[idx]
      if (a.factIdx === null) return
      if (!collected.has(a.factIdx)) {
        collected.add(a.factIdx)
        fragments.found = collected.size
        fragments.facts.push(FACTS[a.factIdx])
      }
      labels.push({ agent: idx, x: 0, y: 0, text: FACTS[a.factIdx], born: performance.now(), life: 6500 })
    }

    const checkWin = () => {
      if (gameWon || alignedCount() < agents.length) return
      gameWon = true
      for (const ag of agents) ripples.push({ x: ag.dx, y: ag.dy, r: ag.r, alpha: 0.35 })
      labels.push({
        agent: null,
        x: w / 2,
        y: h * 0.16,
        text: 'full consensus — the swarm is yours, and you have mapped all of him',
        born: performance.now() + 500,
        life: 10000,
      })
    }

    const convert = (idx: number, chain: number) => {
      const a = agents[idx]
      if (a.conv) return
      a.conv = true
      a.glow = 1
      stats.aligned = alignedCount()
      revealFragment(idx)
      ripples.push({ x: a.dx, y: a.dy, r: a.r + 2, alpha: a.role === 'coordinator' ? 0.55 : 0.35 })
      // conversion cascades along network links, weakening each hop
      if (chain < 4) {
        for (let j = 0; j < agents.length; j++) {
          const b = agents[j]
          if (b.conv || b.role === 'coordinator') continue
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < LINK_DIST && Math.random() < 0.5 / chain) {
            if (reduced) {
              convert(j, chain + 1)
            } else {
              pulses.push({ sx: a.x, sy: a.y, to: j, t: 0, speed: 0.025 + Math.random() * 0.02, chain: chain + 1, convert: true })
            }
          }
        }
      }
      checkWin()
    }

    const reclaimWave = (idx: number) => {
      const c = agents[idx]
      ripples.push({ x: c.dx, y: c.dy, r: c.r + 4, alpha: 0.4, white: true })
      let taken = 0
      for (let j = 0; j < agents.length && taken < 3; j++) {
        const b = agents[j]
        if (!b.conv || b.role === 'coordinator') continue
        if (Math.hypot(c.x - b.x, c.y - b.y) < RECLAIM_RADIUS) {
          b.conv = false
          b.flash = 1
          taken++
        }
      }
      if (taken > 0) stats.aligned = alignedCount()
    }

    win.__swarmPing = () => {
      const px = mouse.active ? mouse.x : w / 2
      const py = mouse.active ? mouse.y : h / 2
      let sent = 0
      for (let j = 0; j < agents.length; j++) {
        const d = Math.hypot(agents[j].dx - px, agents[j].dy - py)
        if (d < CURSOR_DIST * 1.4) {
          pulses.push({ sx: px, sy: py, to: j, t: 0, speed: 0.03 + Math.random() * 0.02, chain: 1, convert: false })
          sent++
        }
      }
      ripples.push({ x: px, y: py, r: 4, alpha: 0.5 })
      return sent
    }

    win.__swarmReset = () => {
      for (const a of agents) {
        a.conv = false
        a.glow = 0
        a.flash = 0
      }
      stats.aligned = 0
      gameStarted = false
      gameWon = false
    }

    const onResize = () => {
      resize()
      spawn()
    }
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      mouse.active = true
    }
    const onLeave = () => {
      mouse.active = false
      mouse.x = -9999
      mouse.y = -9999
    }

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null
      if (t && t.closest('a, button, input, nav')) return
      const rect = canvas.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      if (cx < 0 || cy < 0 || cx > rect.width || cy > rect.height) return
      let best = -1
      let bestD = 40
      for (let i = 0; i < agents.length; i++) {
        const d = Math.hypot(agents[i].dx - cx, agents[i].dy - cy)
        if (d < bestD) {
          bestD = d
          best = i
        }
      }
      if (best < 0) {
        // empty space: shockwave scatters nearby agents
        for (const a of agents) {
          const dx = a.dx - cx
          const dy = a.dy - cy
          const d = Math.hypot(dx, dy)
          if (d < 140 && d > 0.001) {
            const f = (1 - d / 140) * 1.6 * a.z
            a.vx += (dx / d) * f
            a.vy += (dy / d) * f
          }
        }
        ripples.push({ x: cx, y: cy, r: 4, alpha: 0.3 })
        return
      }

      const a = agents[best]
      if (!gameStarted) {
        gameStarted = true
        nextReclaim = performance.now() + RECLAIM_INTERVAL
        labels.push({
          agent: null,
          x: w / 2,
          y: h * 0.16,
          text: 'signal planted — align the swarm. coordinators will resist.',
          born: performance.now(),
          life: 6000,
        })
      }

      if (a.conv) {
        // already aligned: re-read its memory, small acknowledgement
        a.glow = 1
        if (a.factIdx !== null) revealFragment(best)
        return
      }

      if (a.role === 'coordinator') {
        const near = alignedNeighborsOf(best)
        if (near >= COORD_NEIGHBORS_TO_FLIP) {
          convert(best, 1)
          labels.push({ agent: best, x: 0, y: 0, text: 'coordinator aligned', born: performance.now(), life: 2600 })
        } else {
          // it fights back
          reclaimWave(best)
          labels.push({
            agent: best,
            x: 0,
            y: 0,
            text: `coordinator resists — ${near}/${COORD_NEIGHBORS_TO_FLIP} neighbors aligned`,
            born: performance.now(),
            life: 3200,
          })
        }
        return
      }

      convert(best, 1)
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerleave', onLeave)
    window.addEventListener('click', onClick)

    const relayFrom = (idx: number, chain: number) => {
      let best = -1
      let bestD = LINK_DIST
      for (let j = 0; j < agents.length; j++) {
        if (j === idx) continue
        const d = Math.hypot(agents[idx].x - agents[j].x, agents[idx].y - agents[j].y)
        if (d < bestD) {
          bestD = d
          best = j
        }
      }
      if (best >= 0) {
        pulses.push({ sx: agents[idx].x, sy: agents[idx].y, to: best, t: 0, speed: 0.02 + Math.random() * 0.02, chain, convert: false })
      }
    }

    const step = (now: number) => {
      ctx.clearRect(0, 0, w, h)

      const sway = !mouse.active
      const oxBase = sway ? Math.sin(now * 0.00025) * 30 : (mouse.x - w / 2) * -0.045
      const oyBase = sway ? Math.cos(now * 0.0002) * 22 : (mouse.y - h / 2) * -0.045

      // far dust field
      for (const d of dust) {
        d.x += 0.02 * d.z
        if (d.x > w + 5) d.x = -5
        ctx.fillStyle = `rgba(255,255,255,${0.05 + 0.12 * d.z})`
        ctx.beginPath()
        ctx.arc(d.x + oxBase * d.z, d.y + oyBase * d.z, d.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // physics
      for (const a of agents) {
        a.x += a.vx
        a.y += a.vy
        a.vx += (Math.random() - 0.5) * 0.02 * a.z
        a.vy += (Math.random() - 0.5) * 0.02 * a.z

        if (mouse.active) {
          const dx = mouse.x - a.dx
          const dy = mouse.y - a.dy
          const d = Math.hypot(dx, dy)
          if (d < CURSOR_DIST && d > 0.001) {
            // aligned agents are drawn to their leader; neutral ones stay wary
            const f = a.conv ? 0.006 * a.z : (d < 70 ? -0.012 : 0.0035) * a.z
            a.vx += (dx / d) * f
            a.vy += (dy / d) * f
          }
        }

        const sp = Math.hypot(a.vx, a.vy)
        const max = 0.75 * a.z
        if (sp > max) {
          a.vx = (a.vx / sp) * max
          a.vy = (a.vy / sp) * max
        }

        if (a.x < -30) a.x = w + 30
        if (a.x > w + 30) a.x = -30
        if (a.y < -30) a.y = h + 30
        if (a.y > h + 30) a.y = -30

        a.dx = a.x + oxBase * a.z
        a.dy = a.y + oyBase * a.z
        a.glow = Math.max(0, a.glow - 0.025)
        a.flash = Math.max(0, a.flash - 0.03)
      }

      // coordinators fight back while unaligned
      if (!reduced && gameStarted && !gameWon && now > nextReclaim) {
        nextReclaim = now + RECLAIM_INTERVAL
        const holdouts = agents
          .map((a, i) => ({ a, i }))
          .filter(({ a }) => a.role === 'coordinator' && !a.conv)
        if (holdouts.length) {
          reclaimWave(holdouts[Math.floor(Math.random() * holdouts.length)].i)
        }
      }

      // links: aligned pairs glow green, neutral stay white
      for (let i = 0; i < agents.length; i++) {
        const a = agents[i]
        for (let j = i + 1; j < agents.length; j++) {
          const b = agents[j]
          if (Math.abs(a.z - b.z) > 0.28) continue
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < LINK_DIST) {
            const depth = (a.z + b.z) / 2
            if (a.conv && b.conv) {
              ctx.strokeStyle = `rgba(74,222,128,${(1 - d / LINK_DIST) * 0.28 * depth})`
            } else {
              ctx.strokeStyle = `rgba(255,255,255,${(1 - d / LINK_DIST) * 0.16 * depth})`
            }
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.dx, a.dy)
            ctx.lineTo(b.dx, b.dy)
            ctx.stroke()
          }
        }
        if (mouse.active) {
          const d = Math.hypot(a.dx - mouse.x, a.dy - mouse.y)
          if (d < CURSOR_DIST) {
            const o = (1 - d / CURSOR_DIST) * (a.conv ? 0.3 : 0.14) * a.z
            ctx.strokeStyle = a.conv ? `rgba(74,222,128,${o})` : `rgba(255,255,255,${o})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.dx, a.dy)
            ctx.lineTo(mouse.x, mouse.y)
            ctx.stroke()
          }
        }
      }

      // ambient chatter
      if (!reduced && Math.random() < 0.07 && pulses.length < 20) {
        const i =
          Math.random() < 0.6
            ? Math.floor(Math.random() * stats.coordinators)
            : Math.floor(Math.random() * agents.length)
        const a = agents[i]
        if (a) {
          if (mouse.active && Math.hypot(a.dx - mouse.x, a.dy - mouse.y) < CURSOR_DIST && Math.random() < 0.45) {
            pulses.push({ sx: a.x, sy: a.y, to: -1, t: 0, speed: 0.02 + Math.random() * 0.02, chain: 1, convert: false })
          } else {
            relayFrom(i, 1)
          }
        }
      }

      // pulses
      for (let p = pulses.length - 1; p >= 0; p--) {
        const pl = pulses[p]
        if (pl.to === -1 && !mouse.active) {
          pulses.splice(p, 1)
          continue
        }
        const tx = pl.to === -1 ? mouse.x : agents[pl.to].dx
        const ty = pl.to === -1 ? mouse.y : agents[pl.to].dy
        pl.t += pl.speed
        if (pl.t >= 1) {
          stats.messages += 1
          if (pl.to >= 0) {
            const rec = agents[pl.to]
            rec.glow = 1
            rec.msgs += 1
            if (pl.convert) {
              convert(pl.to, pl.chain)
            } else if (pl.chain >= CONSENSUS_CHAIN) {
              stats.consensus += 1
              ripples.push({ x: rec.dx, y: rec.dy, r: rec.r + 2, alpha: 0.55 })
            } else if (!reduced && Math.random() < 0.5 && pulses.length < 20) {
              relayFrom(pl.to, pl.chain + 1)
            }
          }
          pulses.splice(p, 1)
          continue
        }
        const x = pl.sx + (tx - pl.sx) * pl.t
        const y = pl.sy + (ty - pl.sy) * pl.t
        const zScale = pl.to === -1 ? 1 : agents[pl.to].z
        ctx.fillStyle = `rgba(74,222,128,${0.5 + 0.5 * zScale})`
        ctx.beginPath()
        ctx.arc(x, y, (pl.convert ? 1.8 : 1.2) + zScale, 0, Math.PI * 2)
        ctx.fill()
      }

      // ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i]
        rp.r += 1.3
        rp.alpha *= 0.955
        if (rp.alpha < 0.03) {
          ripples.splice(i, 1)
          continue
        }
        ctx.strokeStyle = rp.white ? `rgba(229,229,229,${rp.alpha})` : `rgba(74,222,128,${rp.alpha})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2)
        ctx.stroke()
      }

      // agents, far first
      const order = agents.map((_, i) => i).sort((i, j) => agents[i].z - agents[j].z)
      for (const i of order) {
        const a = agents[i]
        if (a.glow > 0) {
          ctx.fillStyle = `rgba(74,222,128,${a.glow * 0.35 * a.z})`
          ctx.beginPath()
          ctx.arc(a.dx, a.dy, a.r + 7 * a.glow, 0, Math.PI * 2)
          ctx.fill()
        }
        if (a.flash > 0) {
          ctx.fillStyle = `rgba(229,229,229,${a.flash * 0.4})`
          ctx.beginPath()
          ctx.arc(a.dx, a.dy, a.r + 6 * a.flash, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.fillStyle = a.conv
          ? `rgba(74,222,128,${0.45 + 0.5 * a.z})`
          : `rgba(229,229,229,${0.25 + 0.55 * a.z})`
        ctx.beginPath()
        ctx.arc(a.dx, a.dy, a.r, 0, Math.PI * 2)
        ctx.fill()
        if (a.role === 'coordinator') {
          ctx.strokeStyle = a.conv
            ? `rgba(74,222,128,${0.35 + 0.3 * a.z})`
            : `rgba(229,229,229,${0.2 + 0.25 * a.z})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(a.dx, a.dy, a.r + 3.5, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      // foreground bokeh orbs
      for (const o of orbs) {
        o.x += o.vx
        o.y += o.vy
        if (o.x < -o.r) o.x = w + o.r
        if (o.x > w + o.r) o.x = -o.r
        if (o.y < -o.r) o.y = h + o.r
        if (o.y > h + o.r) o.y = -o.r
        const px = o.x + oxBase * o.z
        const py = o.y + oyBase * o.z
        const g = ctx.createRadialGradient(px, py, 0, px, py, o.r)
        g.addColorStop(0, 'rgba(255,255,255,0.028)')
        g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(px, py, o.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // hover inspection
      if (mouse.active) {
        let best = -1
        let bestD = 48
        for (let i = 0; i < agents.length; i++) {
          const d = Math.hypot(agents[i].dx - mouse.x, agents[i].dy - mouse.y)
          if (d < bestD) {
            bestD = d
            best = i
          }
        }
        if (best >= 0) {
          const a = agents[best]
          const s = a.r + 7
          ctx.strokeStyle = 'rgba(229,229,229,0.7)'
          ctx.lineWidth = 1
          const corners: [number, number, number, number][] = [
            [-s, -s, 1, 1],
            [s, -s, -1, 1],
            [-s, s, 1, -1],
            [s, s, -1, -1],
          ]
          for (const [ccx, ccy, mx, my] of corners) {
            ctx.beginPath()
            ctx.moveTo(a.dx + ccx, a.dy + ccy + my * 5)
            ctx.lineTo(a.dx + ccx, a.dy + ccy)
            ctx.lineTo(a.dx + ccx + mx * 5, a.dy + ccy)
            ctx.stroke()
          }
          ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace'
          ctx.fillStyle = 'rgba(163,163,163,0.95)'
          let state: string
          if (a.conv) state = 'aligned'
          else if (a.role === 'coordinator') state = `${alignedNeighborsOf(best)}/${COORD_NEIGHBORS_TO_FLIP} to flip`
          else state = 'neutral'
          const carrying = a.factIdx !== null && !collected.has(a.factIdx) ? ' · carrying data' : ''
          const label = `agent-${String(best).padStart(2, '0')} · ${a.role} · ${state}${carrying}`
          const lx = a.dx + s + 8
          const ly = a.dy - 4
          ctx.fillText(label, Math.min(lx, w - 200), Math.max(12, ly))
        }
      }

      // holographic labels
      ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace'
      for (let i = labels.length - 1; i >= 0; i--) {
        const l = labels[i]
        const age = now - l.born
        if (age < 0) continue
        if (age > l.life) {
          labels.splice(i, 1)
          continue
        }
        let lx = l.x
        let ly = l.y
        if (l.agent !== null) {
          const a = agents[l.agent]
          lx = Math.min(a.dx + a.r + 12, w - ctx.measureText(l.text).width - 16)
          ly = Math.max(14, a.dy - a.r - 10)
        }
        const chars = Math.min(l.text.length, Math.floor(age / 22))
        const fadeOut = Math.min(1, (l.life - age) / 600)
        const shown = l.text.slice(0, chars) + (chars < l.text.length ? '█' : '')
        ctx.save()
        ctx.shadowColor = 'rgba(74,222,128,0.6)'
        ctx.shadowBlur = 8
        ctx.fillStyle = `rgba(190,242,208,${0.95 * fadeOut})`
        if (l.agent === null) {
          const tw = ctx.measureText(shown).width
          ctx.fillText(shown, lx - tw / 2, ly)
        } else {
          ctx.fillText(shown, lx, ly)
        }
        ctx.restore()
      }

      // game HUD, once the game has started
      if (gameStarted) {
        ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace'
        const aligned = stats.aligned
        const coordsAligned = agents.filter((a) => a.role === 'coordinator' && a.conv).length
        const l1 = `consensus ${aligned}/${stats.agents} · coordinators ${coordsAligned}/${stats.coordinators}`
        const tw1 = ctx.measureText(l1).width
        ctx.fillStyle = gameWon ? 'rgba(74,222,128,0.9)' : 'rgba(120,120,120,0.9)'
        ctx.fillText(l1, w - tw1 - 18, 20)
        if (fragments.found > 0) {
          const l2 = `memory fragments ${fragments.found}/${fragments.total}`
          const tw2 = ctx.measureText(l2).width
          ctx.fillStyle = fragments.found === fragments.total ? 'rgba(74,222,128,0.8)' : 'rgba(120,120,120,0.75)'
          ctx.fillText(l2, w - tw2 - 18, 34)
        }
      }

      // cursor node
      if (mouse.active) {
        ctx.fillStyle = 'rgba(74,222,128,0.9)'
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, 2.5, 0, Math.PI * 2)
        ctx.fill()
      }

      if (!reduced) raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('click', onClick)
      delete win.__swarmPing
      delete win.__swarmReset
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />
}
