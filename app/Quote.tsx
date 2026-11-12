'use client'

import { useSyncExternalStore } from 'react'
import { quotes } from './quotes'

const DAY = 86_400_000

function todayIndex() {
  const d = new Date()
  const local = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
  return Math.floor(local / DAY) % quotes.length
}

const subscribe = () => () => {}

export default function Quote() {
  const i = useSyncExternalStore(subscribe, todayIndex, () => 0)
  const q = quotes[i]
  return (
    <blockquote className="quote">
      <p>{q.text}</p>
      <cite>{q.by}</cite>
    </blockquote>
  )
}
