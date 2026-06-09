'use client'
import { useState, useEffect } from 'react'
import { CalendarMonth } from '@/lib/types'

export function useCalendar(year: number, month: number) {
  const [data, setData] = useState<CalendarMonth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const monthStr = `${year}-${String(month).padStart(2, '0')}`
    setLoading(true)
    setError(null)

    fetch(`/api/calendar?month=${monthStr}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load calendar')
        return res.json()
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [year, month])

  return { data, loading, error }
}
