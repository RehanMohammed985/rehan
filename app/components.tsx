import Link from 'next/link'
import { links } from './data'

export function Links() {
  return (
    <ul className="links">
      {links.map((l) => (
        <li key={l.label}>
          <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
        </li>
      ))}
    </ul>
  )
}

export function Page({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <div className="page">
      <nav>
        <Link href="/">Rehan Mohammed</Link>
      </nav>
      <h1>{title}</h1>
      <p className="intro">{intro}</p>
      {children}
      <footer>
        <Links />
      </footer>
    </div>
  )
}
