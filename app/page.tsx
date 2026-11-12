import Link from 'next/link'
import { Links } from './components'
import Quote from './Quote'

export default function Home() {
  return (
    <div className="home">
      <div>
        <Quote />
        <h1>Rehan Mohammed</h1>
        <p>Business, Computer Science and Philosophy at NC State.</p>
        <p>Interested in startups, innovation and building solutions that scale.</p>
        <ul className="nav">
          <li><Link href="/projects">Projects</Link></li>
          <li><Link href="/work">Work</Link></li>
        </ul>
        <Links />
      </div>
    </div>
  )
}
