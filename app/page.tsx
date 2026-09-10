'use client'

import Swarm from './components/Swarm'
import CommandOverlay from './components/CommandOverlay'

const socials = [
  { label: 'GitHub', href: 'https://github.com/RehanMohammed985' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/rehan-mohammed-237bab273/' },
  { label: 'X', href: 'https://x.com/rehan_m0' },
]

const marquee = [
  'multi-agent systems',
  'evals',
  'computer vision',
  'reinforcement learning',
  'agent architectures',
  'causal inference',
]

function MarqueeStrip() {
  return (
    <div className="relative border-t border-neutral-900 overflow-hidden py-3 select-none" aria-hidden="true">
      <div className="marquee-track flex items-center text-neutral-600 text-xs tracking-[0.2em] uppercase whitespace-nowrap">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center shrink-0">
            {marquee.map((m, i) => (
              <span key={i} className="flex items-center shrink-0">
                <span className="px-4">{m}</span>
                <span className="text-green-400/70 px-4">·</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <>
    <div className="relative flex flex-col" style={{ minHeight: 'calc(100vh - 5.5rem)' }}>
      <Swarm />

      {/* content sits above the simulation but lets it show through */}
      <div className="relative flex-1 flex flex-col pointer-events-none">
        <div className="max-w-6xl w-full mx-auto px-6 my-auto pt-12 pb-8">
          <div className="rise rise-1 flex items-center gap-2.5 mb-6 pointer-events-auto w-fit">
            <span className="status-dot shrink-0" />
            <p className="text-neutral-400 text-[13px] tracking-wide">
              Live now — multi-agent research at ARNAV Lab, NC State
            </p>
          </div>

          <h1 className="rise rise-2 font-serif-display text-neutral-50 leading-[0.95] text-[15vw] sm:text-[11vw] lg:text-[9.5vw] mb-8">
            Rehan <span className="italic">Mohammed</span>
          </h1>

          <div className="rise rise-3 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <p className="text-neutral-400 text-base leading-relaxed max-w-md pointer-events-auto">
              Business + CS at NC State. Building at the edge of AI —
              agents that think together, evals that keep them honest, and
              software that sees the world through a camera.
            </p>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-3 pointer-events-auto">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="link-quiet text-neutral-500 hover:text-neutral-200 text-sm">
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pointer-events-auto">
          <MarqueeStrip />
        </div>
      </div>
    </div>

    <CommandOverlay />
    </>
  )
}
