import Link from 'next/link'
import { Links } from './components'

export default function Home() {
  return (
    <div className="home">
      <div>
        <h1>Rehan Mohammed</h1>
        <p>
          I build AI agents and ship fast.
          <br />
          Business, Computer Science and Philosophy at NC State.
        </p>
        <ul className="nav">
          <li><Link href="/projects">Projects</Link></li>
          <li><Link href="/work">Work</Link></li>
        </ul>
        <Links />
      </div>
    </div>
  )
}
