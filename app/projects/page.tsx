'use client'

type Project = {
  title: string
  desc: string
  meta: string
  github?: string
  live?: string
}

const projects: Project[] = [
  {
    title: 'Advance Cube Solver',
    desc: 'Real-time computer vision Rubik’s cube solver that runs entirely in the browser. Scans any 2x2 or 3x3 through a webcam, computes an optimal solution, and guides every move with AR overlays on live video — verifying each turn and rerouting instantly on mistakes. Custom detection, color-classification, and cube-assembly pipeline, all local at millisecond latency.',
    meta: 'Computer vision · JavaScript',
    github: 'https://github.com/RehanMohammed985/advance-cube-solver',
    live: 'https://advance-cube-solver.vercel.app',
  },
  {
    title: 'Voice Agents',
    desc: 'Open-source AI cold-calling console. Write a mission in plain English, point it at a call list, hit launch — the agent dials each number, runs your instructions, captures structured notes, and books meetings. Built-in guardrails: AI self-disclosure, business-hours dialing, consent handling, do-not-call skipping.',
    meta: 'FastAPI · Vapi · Deepgram',
    github: 'https://github.com/RehanMohammed985/voice-agents',
  },
  {
    title: 'FirstDibs',
    desc: 'Be first to brand-new job postings. Polls companies’ own ATS feeds (Greenhouse, Lever, Ashby) every 10 minutes and sends Telegram alerts with a direct apply link — minutes after a role goes live, before it hits LinkedIn. Runs entirely in one Cloudflare Worker on the free tier.',
    meta: 'Cloudflare Workers · TypeScript',
    github: 'https://github.com/RehanMohammed985/first-dibs',
  },
  {
    title: 'Cursor Mobile Bridge',
    desc: 'Control Cursor on your Mac straight from your phone via Discord. DM it a feature request or bug fix and it plans, edits, verifies, and updates your repo in real time — with persistent per-repository memory, intent classification, and a structured plan-execute-verify loop. Each user runs their own private bridge; nothing leaves your machine.',
    meta: 'Python · Agents',
    github: 'https://github.com/RehanMohammed985/cursor-mobile-bridge',
  },
  {
    title: 'Pathfinder',
    desc: 'Career guidance platform for international students — Flask + a scikit-learn recommendation engine. Personalized education & career pathway plans, CPT/OPT guidance, and visa-friendly employer matching. Recommended by the NC State International Office; matched 3 international students with career opportunities.',
    meta: 'Flask · scikit-learn',
    github: 'https://github.com/RehanMohammed985/GCIS',
  },
  {
    title: 'Second Brain',
    desc: 'Local-first, privacy-first personal AI assistant. Every idea becomes a permanent node in a semantic graph with an interactive idea map, and an Ollama-powered assistant that validates, critiques, and expands on ideas with graph context. SQLite + FastAPI + React; no cloud, no account.',
    meta: 'Ollama · FastAPI · React',
    github: 'https://github.com/RehanMohammed985/ollamaassistant',
  },
  {
    title: 'Orbiter',
    desc: 'A macOS desktop app that delivers the tech stories that actually matter. Pulls from HN, TechCrunch, Ars, The Verge, and NYT Tech, scores every story, and only shows what is relevant.',
    meta: 'macOS',
    github: 'https://github.com/RehanMohammed985/Orbiter',
  },
  {
    title: '1600',
    desc: 'A free, modern SAT prep platform that uses a growth formula and a machine learning model to understand each student and help them improve the smart way. Actively used by 25 high school students.',
    meta: 'TypeScript · ML',
    github: 'https://github.com/RehanMohammed985/1600-modern-SAT-prep',
  },
  {
    title: 'Scalable MARL Coordination',
    desc: 'Multi-agent system for dynamic role assignment and efficient communication through graph-based protocols. Includes a minimal PyTorch framework for selective-communication experiments — fully connected, weighted, and no-comm modes with reward and communication-usage logging.',
    meta: 'PyTorch · MARL',
    github: 'https://github.com/RehanMohammed985/scalable-marl-coordination',
  },
  {
    title: 'Modular Causal Inference Server',
    desc: 'A modular MCP server for causal inference analysis using FastMCP and DoWhy. Enables researchers to perform complex causal analysis with high performance.',
    meta: 'MCP · DoWhy',
    github: 'https://github.com/RehanMohammed985/mcp-causal-inference-server',
  },
  {
    title: 'JARVIS',
    desc: 'A local AI assistant that takes voice input, generates smart responses, and executes system-level actions. Designed to streamline research workflows and enhance productivity.',
    meta: 'Python · Voice',
    github: 'https://github.com/RehanMohammed985/JARVIS',
  },
  {
    title: 'Autonomous Drone Navigation',
    desc: 'AI-powered autonomous drone navigation using computer vision and reinforcement learning. Enables safe flight with dynamic obstacle avoidance.',
    meta: 'RL · Computer vision',
    github: 'https://github.com/RehanMohammed985/autonomous-drone-navigation',
  },
]

export default function Projects() {
  return (
    <div className="max-w-2xl mx-auto px-6 pt-16 sm:pt-20 pb-20">
      <h1 className="rise rise-1 font-serif-display text-neutral-50 text-4xl sm:text-5xl mb-14">
        Projects
      </h1>

      <div className="rise rise-2">
        {projects.map((proj, i) => (
          <div key={i} className="group grid grid-cols-[3.5rem_1fr] gap-x-2 py-7 border-t border-neutral-900 first:border-t-0 first:pt-0">
            <p className="font-serif-display italic text-neutral-800 text-3xl leading-none pt-0.5 group-hover:text-green-400/70 transition-colors">
              {String(i + 1).padStart(2, '0')}
            </p>
            <div>
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 mb-2">
              <p className="text-neutral-100 text-[15px] font-medium">{proj.title}</p>
              {proj.live && (
                <a href={proj.live} target="_blank" rel="noopener noreferrer" className="link-quiet text-green-400/90 text-xs">
                  Live ↗
                </a>
              )}
              {proj.github && (
                <a href={proj.github} target="_blank" rel="noopener noreferrer" className="link-quiet text-neutral-500 hover:text-neutral-200 text-xs">
                  GitHub ↗
                </a>
              )}
              <span className="ml-auto text-neutral-600 text-xs tracking-wide hidden sm:block">{proj.meta}</span>
            </div>
            <p className="text-neutral-500 text-sm leading-relaxed group-hover:text-neutral-400 transition-colors max-w-xl">{proj.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <a href="https://github.com/RehanMohammed985" target="_blank" rel="noopener noreferrer" className="link-quiet inline-block text-neutral-500 hover:text-neutral-200 text-sm mt-12">
        More on GitHub ↗
      </a>
    </div>
  )
}
