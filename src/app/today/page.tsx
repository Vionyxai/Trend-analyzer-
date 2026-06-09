'use client'
import { useEffect, useState } from 'react'
import { toDateString } from '@/lib/date-utils'
import { LiveClock } from '@/components/layout/LiveClock'
import { GoalList } from '@/components/goals/GoalList'
import { useGoals } from '@/hooks/useGoals'

export default function TodayPage() {
  const [date, setDate] = useState<string>('')

  // Set date client-side to use local timezone, not server UTC
  useEffect(() => {
    setDate(toDateString())
  }, [])

  const { goals, loading, error, refetch } = useGoals(date)

  const completedCount = goals.filter(g => g.completion).length
  const allDone = goals.length === 3 && completedCount === 3

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 space-y-4">
        <LiveClock />

        {/* Progress dots */}
        <div className="flex justify-center items-center gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`h-2 w-8 rounded-full transition-all duration-500 ${
                i < completedCount
                  ? 'bg-green-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        {allDone && (
          <div className="text-center py-2">
            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
              🎉 All goals completed today!
            </p>
          </div>
        )}

        {error && (
          <p className="text-center text-sm text-red-500">{error}</p>
        )}
      </div>

      {/* Goals */}
      <div className="px-4 space-y-3">
        {date ? (
          <GoalList goals={goals} date={date} isToday={true} onChanged={refetch} loading={loading} />
        ) : (
          <div className="space-y-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
