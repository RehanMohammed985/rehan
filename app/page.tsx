'use client'

import Swarm from './components/Swarm'
import CommandOverlay from './components/CommandOverlay'
import HoloDiagram from './components/HoloDiagram'

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
        <div className="max-w-6xl w-full mx-auto px-6 my-auto pt-12 pb-8 relative">
          {/* holographic system diagram — layered behind the name, off-axis */}
          <div className="rise rise-3 hidden lg:block absolute right-[-30px] top-[34%] -translate-y-1/2 w-[430px] h-[430px] opacity-80">
            <HoloDiagram />
          </div>

          <div className="relative z-10">
            <div className="rise rise-1 flex items-center gap-2.5 mb-8 pointer-events-auto w-fit">
              <span className="status-dot shrink-0" />
              <p className="text-neutral-400 text-[13px] tracking-wide">
                Live now — multi-agent research at ARNAV Lab, NC State
              </p>
            </div>

            <h1 className="rise rise-2 font-serif-display text-neutral-50 leading-[0.95] text-5xl sm:text-6xl lg:text-7xl">
              <span className="block">Rehan</span>
              <span className="block italic ml-14 sm:ml-28 lg:ml-44 text-[1.18em] -mt-1">Mohammed</span>
            </h1>

            <p className="rise rise-3 text-neutral-400 text-base leading-relaxed max-w-sm pointer-events-auto mt-10 lg:ml-[38%]">
              Business + CS at NC State. Building at the edge of AI —
              agents that think together, evals that keep them honest, and
              software that sees the world through a camera.
            </p>

            <div className="rise rise-4 flex flex-wrap items-center gap-x-7 gap-y-3 pointer-events-auto mt-10">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="link-quiet text-neutral-500 hover:text-neutral-200 text-sm">
                  {s.label}
                </a>
              ))}
              <span className="text-neutral-700 text-[10px] tracking-[0.2em] font-mono">35.78°N / 78.64°W</span>
            </div>

            <p className="rise rise-5 font-serif-display italic text-neutral-600 text-lg mt-12 lg:ml-[56%] rotate-[-1.5deg] pointer-events-none">
              obsession, directed with purpose.
            </p>
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
