'use client'

const experiences = [
  {
    title: 'AI Eval Engineer',
    org: 'Boardy',
    period: 'Jun 2026 — Present',
    desc: 'Designing and building eval training pipelines and agent behavior scoring rubrics for a production multi-agent AI platform. Focused on goal drift detection and failure mode classification. Contributing as a volunteer.',
  },
  {
    title: 'Multi-Agent Researcher',
    org: 'ARNAV Lab, NC State',
    period: 'Spring 2025 — Present',
    desc: 'Researching multi-agent systems and human-simulation agents for behavioral modeling and emergent interaction studies, and building AI teaching assistants that combine large language models, RAG, and autonomous agent architectures.',
  },
  {
    title: 'Fellow',
    org: 'Telora',
    period: 'Dec 2025 — Feb 2026',
    desc: 'Backed by non-dilutive capital and working on a startup in the edtech space. Building innovative solutions to transform educational technology and learning experiences.',
  },
  {
    title: 'AI Researcher',
    org: 'Cohere Labs',
    period: 'Jun 2025 — Aug 2025',
    desc: 'Developing models for dynamic role assignment and efficient communication through graph-based protocols. Working with Multi-Agent Reinforcement Learning.',
  },
  {
    title: 'AI Researcher',
    org: 'UNCC College of Computing and Informatics',
    period: 'Jan 2025 — Mar 2025',
    desc: 'Research on causal inference and causal effect estimation using DoWhy and causal models, under PI Dr. Gabriel Terejanu — developing methods for understanding causal relationships in complex systems and applying them to real-world problems.',
  },
  {
    title: 'Tech Researcher',
    org: 'The VONG Movement',
    period: 'Jun 2024 — Jul 2024',
    desc: 'Researching predictive models and creating trends. Used for weather prediction and pollution management.',
  },
  {
    title: 'Pre-Calculus TA',
    org: 'NCSSM',
    period: 'Aug 2023 — May 2024',
    desc: 'Assisted in teaching pre-calculus at the #1 public high school in the USA. One-on-one tutoring and curriculum development.',
  },
  {
    title: 'Summer Researcher',
    org: 'Lenovo Innovation Program',
    period: 'Jul 2023',
    desc: 'Researched and built applications for lead poisoning awareness.',
  },
  {
    title: 'Scientific LLM Researcher',
    org: 'NCSSM',
    period: 'Jun 2023 — Jul 2023',
    desc: 'Research on large language models for scientific applications. Fine-tuned models with multiple prompt engineering techniques to analyze efficiency.',
  },
]

export default function Experience() {
  return (
    <div className="max-w-2xl mx-auto px-6 pt-16 sm:pt-20 pb-20">
      <h1 className="rise rise-1 font-serif-display text-neutral-50 text-4xl sm:text-5xl mb-14">
        Experience
      </h1>

      <div className="rise rise-2">
        {experiences.map((exp, i) => (
          <div key={i} className="group grid grid-cols-[3.5rem_1fr] gap-x-2 py-7 border-t border-neutral-900 first:border-t-0 first:pt-0">
            <p className="font-serif-display italic text-neutral-800 text-3xl leading-none pt-0.5 group-hover:text-green-400/70 transition-colors">
              {String(i + 1).padStart(2, '0')}
            </p>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-y-1 mb-2">
                <p className="text-neutral-100 text-[15px] font-medium">
                  {exp.title} <span className="text-neutral-500 font-normal">· {exp.org}</span>
                </p>
                <p className="text-neutral-600 text-xs tracking-wide shrink-0 sm:ml-6">{exp.period}</p>
              </div>
              <p className="text-neutral-500 text-sm leading-relaxed group-hover:text-neutral-400 transition-colors max-w-xl">{exp.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
