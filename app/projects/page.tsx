import type { Metadata } from 'next'
import { Page } from '../components'
import { projects } from '../data'

export const metadata: Metadata = { title: 'Projects · Rehan Mohammed' }

export default function Projects() {
  return (
    <Page title="Projects" intro="Things I have built and shipped.">
      <ul className="grid">
        {projects.map((p) => (
          <li key={p.name}>
            {p.href ? (
              <a href={p.href} target="_blank" rel="noopener noreferrer" className="key">
                {p.name} <span className="arrow">↗</span>
              </a>
            ) : (
              <span className="key">{p.name}</span>
            )}
            <p>{p.desc}</p>
            {p.code && (
              <a href={p.code} target="_blank" rel="noopener noreferrer" className="dim small">code</a>
            )}
          </li>
        ))}
      </ul>
      <p className="dim small more">
        <a href="https://github.com/RehanMohammed985" target="_blank" rel="noopener noreferrer">More on GitHub ↗</a>
      </p>
    </Page>
  )
}
