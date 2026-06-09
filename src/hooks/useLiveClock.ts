'use client'
import { useState, useEffect } from 'react'

export function useLiveClock() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const msUntilNextSecond = 1000 - (Date.now() % 1000)
    let interval: ReturnType<typeof setInterval>

    const timeout = setTimeout(() => {
      setNow(new Date())
      interval = setInterval(() => setNow(new Date()), 1000)
    }, msUntilNextSecond)

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [])

  return now
}
