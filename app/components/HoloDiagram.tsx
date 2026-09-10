'use client'

const C = 210

const polar = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) }
}

// static HUD labels with leader ticks, anchored outside the rings
const LABELS = [
  { r: 172, deg: -38, text: 'AGENTS' },
  { r: 172, deg: 24, text: 'EVALS' },
  { r: 172, deg: 152, text: 'VISION' },
  { r: 172, deg: 206, text: 'RL' },
  { r: 172, deg: 96, text: 'CAUSAL' },
]

// orbiting nodes: ring radius, spin duration, node angles, green accents
const ORBITS = [
  { r: 70, dur: 26, rev: false, nodes: [0, 140, 250], accent: 1 },
  { r: 115, dur: 44, rev: true, nodes: [60, 200, 320], accent: 2 },
  { r: 160, dur: 70, rev: false, nodes: [30, 180], accent: -1 },
]

export default function HoloDiagram() {
  return (
    <svg viewBox="0 0 420 420" className="w-full h-full" aria-hidden="true">
      <defs>
        <filter id="holoGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* frame ticks */}
      {[0, 90, 180, 270].map((d) => {
        const o = polar(196, d)
        const i = polar(188, d)
        return <line key={d} x1={i.x} y1={i.y} x2={o.x} y2={o.y} stroke="rgba(229,229,229,0.35)" strokeWidth="1" />
      })}

      {/* static rings */}
      <circle cx={C} cy={C} r={190} fill="none" stroke="rgba(229,229,229,0.1)" strokeWidth="1" strokeDasharray="2 7" />
      {ORBITS.map((o) => (
        <circle key={o.r} cx={C} cy={C} r={o.r} fill="none" stroke="rgba(229,229,229,0.16)" strokeWidth="1" strokeDasharray="3 6" />
      ))}

      {/* sweeping arcs */}
      <g className="holo-spin" style={{ animationDuration: '16s' }}>
        <circle cx={C} cy={C} r={190} fill="none" stroke="rgba(74,222,128,0.45)" strokeWidth="1.2" strokeDasharray="70 1124" filter="url(#holoGlow)" />
      </g>
      <g className="holo-spin holo-spin-rev" style={{ animationDuration: '34s' }}>
        <circle cx={C} cy={C} r={137} fill="none" stroke="rgba(229,229,229,0.3)" strokeWidth="1" strokeDasharray="34 827" />
      </g>

      {/* orbiting nodes */}
      {ORBITS.map((o, oi) => (
        <g key={oi} className={`holo-spin${o.rev ? ' holo-spin-rev' : ''}`} style={{ animationDuration: `${o.dur}s` }}>
          {o.nodes.map((deg, ni) => {
            const p = polar(o.r, deg)
            const green = ni === o.accent
            return (
              <circle
                key={ni}
                cx={p.x}
                cy={p.y}
                r={green ? 3 : 2.2}
                fill={green ? 'rgba(74,222,128,0.9)' : 'rgba(229,229,229,0.65)'}
                filter={green ? 'url(#holoGlow)' : undefined}
              />
            )
          })}
        </g>
      ))}

      {/* core */}
      <circle cx={C} cy={C} r={10} fill="none" stroke="rgba(229,229,229,0.35)" strokeWidth="1" />
      <circle cx={C} cy={C} r={4} fill="rgba(74,222,128,0.95)" filter="url(#holoGlow)" className="holo-core" />
      <line x1={C - 18} y1={C} x2={C - 10} y2={C} stroke="rgba(229,229,229,0.3)" strokeWidth="1" />
      <line x1={C + 10} y1={C} x2={C + 18} y2={C} stroke="rgba(229,229,229,0.3)" strokeWidth="1" />

      {/* domain labels with leader ticks */}
      {LABELS.map((l, i) => {
        const p = polar(l.r, l.deg)
        const q = polar(l.r + 14, l.deg)
        const right = Math.cos((l.deg * Math.PI) / 180) >= 0
        return (
          <g key={i}>
            <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="rgba(229,229,229,0.3)" strokeWidth="1" />
            <text
              x={q.x + (right ? 5 : -5)}
              y={q.y + 3}
              textAnchor={right ? 'start' : 'end'}
              fill="rgba(140,140,140,0.9)"
              style={{ font: '9px ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '0.12em' }}
            >
              {l.text}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
