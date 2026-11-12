'use client'

import { useSyncExternalStore } from 'react'
import { quotes } from './quotes'

const DAY = 86_400_000
const START = Date.UTC(2026, 10, 10) // first day shows quotes[0]

function todayIndex() {
  const d = new Date()
  const local = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
  const days = Math.floor((local - START) / DAY)
  return ((days % quotes.length) + quotes.length) % quotes.length
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
