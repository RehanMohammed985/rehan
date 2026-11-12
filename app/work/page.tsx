import type { Metadata } from 'next'
import { Page } from '../components'
import { now, work } from '../data'

export const metadata: Metadata = { title: 'Work · Rehan Mohammed' }

export default function Work() {
  return (
    <Page title="Work" intro="What I am doing now, and where I have been.">
      <ul className="now">
        {now.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      <ol className="timeline">
        {work.map((w) => (
          <li key={w.org}>
            <span className="when">{w.when}</span>
            <span className="key">{w.org}</span>
            <p>{w.role}</p>
          </li>
        ))}
      </ol>
    </Page>
  )
}
