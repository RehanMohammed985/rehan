'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Line = {
  kind: 'cmd' | 'out'
  text: string
  href?: string
}

const BANNER: Line[] = [
  { kind: 'out', text: 'rehan-os — guest session' },
  { kind: 'out', text: "type 'help' to look around, esc to close" },
]

export default function CommandOverlay() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [lines, setLines] = useState<Line[]>(BANNER)
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const historyRef = useRef<string[]>([])
  const historyPos = useRef(-1)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines, open])

  const openOverlay = useCallback((seed = '') => {
    setOpen(true)
    setValue((v) => v + seed)
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  // typing anywhere summons the terminal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      const inField = !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
      if (inField || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key.length === 1) {
        e.preventDefault()
        openOverlay(e.key)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openOverlay])

  const run = (raw: string): Line[] => {
    const cmd = raw.trim().toLowerCase()
    switch (cmd) {
      case 'help':
        return [
          { kind: 'out', text: 'available commands:' },
          { kind: 'out', text: '  whoami       who is this guy' },
          { kind: 'out', text: '  now          what he is doing right now' },
          { kind: 'out', text: '  projects     things he has built' },
          { kind: 'out', text: '  experience   where he has worked' },
          { kind: 'out', text: '  agents       status of the swarm' },
          { kind: 'out', text: '  ping         broadcast from your cursor' },
          { kind: 'out', text: '  fragments    memories recovered from the swarm' },
          { kind: 'out', text: '  reset        release the swarm and start over' },
          { kind: 'out', text: '  socials      find him elsewhere' },
          { kind: 'out', text: '  clear        wipe the screen' },
        ]
      case 'whoami':
        return [
          { kind: 'out', text: 'Rehan Mohammed. Business + CS at NC State.' },
          { kind: 'out', text: 'Builds multi-agent systems, evals, and software that sees through cameras.' },
          { kind: 'out', text: 'Believes obsession, directed with purpose, turns impossible goals into achievable ones.' },
        ]
      case 'now':
        return [
          { kind: 'out', text: '● multi-agent research @ ARNAV Lab, NC State' },
          { kind: 'out', text: '● eval pipelines @ Boardy' },
        ]
      case 'projects':
        return [
          { kind: 'out', text: 'advance-cube-solver   CV cube solver with AR guidance, in the browser', href: 'https://advance-cube-solver.vercel.app' },
          { kind: 'out', text: 'voice-agents          AI cold-calling console with guardrails', href: 'https://github.com/RehanMohammed985/voice-agents' },
          { kind: 'out', text: 'first-dibs            job alerts minutes after roles go live', href: 'https://github.com/RehanMohammed985/first-dibs' },
          { kind: 'out', text: 'cursor-mobile-bridge  drive Cursor from your phone via Discord', href: 'https://github.com/RehanMohammed985/cursor-mobile-bridge' },
          { kind: 'out', text: 'full list -> /projects', href: '/projects' },
        ]
      case 'experience':
        return [
          { kind: 'out', text: 'ARNAV Lab · Boardy · Telora · Cohere Labs · UNCC · NCSSM' },
          { kind: 'out', text: 'full history -> /experience', href: '/experience' },
        ]
      case 'agents': {
        const stats = (window as unknown as { __swarmStats?: { agents: number; coordinators: number; messages: number; consensus: number; aligned: number } }).__swarmStats
        if (!stats) return [{ kind: 'out', text: 'swarm offline' }]
        const out: Line[] = [
          { kind: 'out', text: `${stats.agents} agents online across depth layers · ${stats.coordinators} coordinators (ringed)` },
          { kind: 'out', text: `${stats.messages} messages delivered · ${stats.aligned}/${stats.agents} aligned to you` },
        ]
        if (stats.aligned === 0) {
          out.push({ kind: 'out', text: 'the swarm is neutral. click an agent to plant your signal.' })
        } else if (stats.aligned < stats.agents) {
          out.push({ kind: 'out', text: 'alignment spreads through links. coordinators flip only when surrounded.' })
        } else {
          out.push({ kind: 'out', text: 'full consensus. the swarm answers to you now.' })
        }
        return out
      }
      case 'reset': {
        const reset = (window as unknown as { __swarmReset?: () => void }).__swarmReset
        if (!reset) return [{ kind: 'out', text: 'swarm offline' }]
        reset()
        return [{ kind: 'out', text: 'swarm released — alignment cleared, memories kept' }]
      }
      case 'ping': {
        const ping = (window as unknown as { __swarmPing?: () => number }).__swarmPing
        if (!ping) return [{ kind: 'out', text: 'swarm offline' }]
        const sent = ping()
        return [{ kind: 'out', text: `broadcast sent to ${sent} agent${sent === 1 ? '' : 's'} — watch the swarm` }]
      }
      case 'fragments': {
        const fr = (window as unknown as { __swarmFragments?: { total: number; found: number; facts: string[] } }).__swarmFragments
        if (!fr) return [{ kind: 'out', text: 'swarm offline' }]
        if (fr.found === 0) {
          return [
            { kind: 'out', text: `0/${fr.total} recovered — some agents carry memories about him.` },
            { kind: 'out', text: 'align an agent to read what it knows. click one to begin.' },
          ]
        }
        const out: Line[] = [{ kind: 'out', text: `${fr.found}/${fr.total} memory fragments recovered:` }]
        for (const f of fr.facts) out.push({ kind: 'out', text: `  · ${f}` })
        if (fr.found < fr.total) out.push({ kind: 'out', text: 'the rest are still out there.' })
        return out
      }
      case 'socials':
        return [
          { kind: 'out', text: 'github   -> github.com/RehanMohammed985', href: 'https://github.com/RehanMohammed985' },
          { kind: 'out', text: 'linkedin -> rehan-mohammed', href: 'https://linkedin.com/in/rehan-mohammed-237bab273/' },
          { kind: 'out', text: 'x        -> @rehan_m0', href: 'https://x.com/rehan_m0' },
        ]
      case 'exit':
        setOpen(false)
        return []
      case 'clear':
        return []
      case '':
        return []
      default:
        if (cmd.startsWith('sudo')) {
          return [{ kind: 'out', text: 'permission denied (but he is available)' }]
        }
        if (cmd.startsWith('cd ')) {
          const dest = cmd.slice(3).trim().replace(/^\//, '')
          if (dest === 'projects' || dest === 'experience') {
            router.push(`/${dest}`)
            return [{ kind: 'out', text: `navigating to /${dest} ...` }]
          }
          return [{ kind: 'out', text: `cd: no such directory: ${dest}` }]
        }
        return [{ kind: 'out', text: `command not found: ${cmd} — try 'help'` }]
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false)
      setValue('')
      inputRef.current?.blur()
      return
    }
    if (e.key === 'Enter') {
      const raw = value
      const out = run(raw)
      if (raw.trim().toLowerCase() === 'clear') {
        setLines([])
      } else {
        setLines((prev) => [...prev, { kind: 'cmd', text: raw }, ...out])
      }
      if (raw.trim()) {
        historyRef.current.push(raw)
      }
      historyPos.current = -1
      setValue('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const h = historyRef.current
      if (!h.length) return
      historyPos.current = historyPos.current === -1 ? h.length - 1 : Math.max(0, historyPos.current - 1)
      setValue(h[historyPos.current])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const h = historyRef.current
      if (historyPos.current === -1) return
      historyPos.current += 1
      if (historyPos.current >= h.length) {
        historyPos.current = -1
        setValue('')
      } else {
        setValue(h[historyPos.current])
      }
    }
  }

  return (
    <>
      {/* silent summon hint */}
      {!open && (
        <button
          onClick={() => openOverlay()}
          aria-label="open command line"
          className="fixed bottom-14 right-5 sm:right-8 z-40 font-mono text-sm text-neutral-600 hover:text-green-400 transition-colors"
        >
          <span className="text-green-400">$</span> <span className="cursor-blink" />
        </button>
      )}

      {open && (
        <div className="holo-in fixed bottom-5 left-4 sm:left-8 z-50 w-[min(92vw,29rem)] pointer-events-none">
          {/* translucent projection pane — page stays visible behind it */}
          <div className="holo-pane absolute -inset-x-5 -top-10 -bottom-4" aria-hidden="true" />
          <div className="holo-scan absolute -inset-x-5 -top-10 -bottom-4" aria-hidden="true" />
          <div className="relative pointer-events-auto">
            <div ref={scrollRef} className="max-h-[21vh] overflow-y-auto font-mono text-[13px] leading-relaxed mb-1">
              {lines.map((l, i) =>
                l.kind === 'cmd' ? (
                  <p key={i} className="holo-text-bright">
                    <span className="text-green-400">$</span> {l.text}
                  </p>
                ) : l.href ? (
                  <p key={i} className="whitespace-pre-wrap">
                    <a
                      href={l.href}
                      target={l.href.startsWith('/') ? undefined : '_blank'}
                      rel="noopener noreferrer"
                      className="holo-text underline decoration-green-400/30 underline-offset-4 hover:text-green-200 transition-colors"
                    >
                      {l.text}
                    </a>
                  </p>
                ) : (
                  <p key={i} className="holo-text whitespace-pre-wrap">{l.text}</p>
                )
              )}
            </div>
            <div className="flex items-center gap-2 font-mono text-[13px]">
              <span className="text-green-400 holo-text-bright">$</span>
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                className="holo-text-bright flex-1 bg-transparent outline-none border-none placeholder-neutral-700 font-mono text-[13px]"
                spellCheck={false}
                autoComplete="off"
                aria-label="terminal input"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
