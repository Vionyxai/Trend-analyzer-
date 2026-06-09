'use client'
import { useState, useEffect, useCallback } from 'react'
import { GoalWithCompletion } from '@/lib/types'

export function useGoals(date: string) {
  const [goals, setGoals] = useState<GoalWithCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGoals = useCallback(async () => {
    if (!date) return
    try {
      setLoading(true)
      const res = await fetch(`/api/goals?date=${date}`)
      if (!res.ok) throw new Error('Failed to load goals')
      setGoals(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  return { goals, loading, error, refetch: fetchGoals }
}
