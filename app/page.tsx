import Link from 'next/link'
import { Links } from './components'

export default function Home() {
  return (
    <div className="home">
      <div>
        <blockquote className="quote">
          <p>It is not because things are difficult that we do not dare; it is because we do not dare that things are difficult.</p>
          <cite>Seneca</cite>
        </blockquote>
        <h1>Rehan Mohammed</h1>
        <p>
          I love building solutions that scale.
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
