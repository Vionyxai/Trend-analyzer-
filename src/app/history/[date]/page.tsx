'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { formatDisplayDate } from '@/lib/date-utils'
import { GoalList } from '@/components/goals/GoalList'
import { useGoals } from '@/hooks/useGoals'

export default function HistoryPage() {
  const params = useParams()
  const date = params.date as string
  const { goals, loading } = useGoals(date)

  const completedCount = goals.filter(g => g.completion).length

  return (
    <div className="px-4 pt-12 pb-4">
      <div className="mb-6 space-y-2">
        <Link
          href="/calendar"
          className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Calendar
        </Link>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">
          {formatDisplayDate(date)}
        </h1>
        {!loading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {goals.length === 0
              ? 'No goals were set this day'
              : `${completedCount} of ${goals.length} goal${goals.length === 1 ? '' : 's'} completed`}
          </p>
        )}
      </div>

      {!loading && goals.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600">
          <svg className="w-14 h-14 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm">No goals were set this day</p>
        </div>
      ) : (
        <GoalList goals={goals} date={date} isToday={false} onChanged={() => {}} loading={loading} />
      )}
    </div>
  )
}
