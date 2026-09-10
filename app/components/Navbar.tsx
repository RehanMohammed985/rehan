'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Experience', href: '/experience' },
  { label: 'Projects', href: '/projects' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header>
      <div className="max-w-2xl mx-auto px-6 pt-10 sm:pt-14">
        <div className="flex items-baseline justify-between">
          <Link href="/" className="text-neutral-100 text-sm tracking-wide hover:text-white transition-colors">
            Rehan Mohammed
          </Link>
          <nav className="flex items-baseline gap-6 sm:gap-8">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href}>
                  <span className={`text-[13px] tracking-wide transition-colors ${isActive ? 'text-neutral-100' : 'text-neutral-500 hover:text-neutral-200'}`}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
