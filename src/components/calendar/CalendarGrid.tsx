'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCalendar } from '@/hooks/useCalendar'
import { DayCell } from './DayCell'
import { toDateString, getFirstDayOfWeek, getDaysInMonth } from '@/lib/date-utils'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarGrid() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const { data, loading, error } = useCalendar(year, month)
  const router = useRouter()
  const todayStr = toDateString(today)

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  function handleDayPress(date: string) {
    router.push(date === todayStr ? '/today' : `/history/${date}`)
  }

  const monthLabel = new Date(year, month - 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const firstDow = getFirstDayOfWeek(year, month)
  const daysCount = getDaysInMonth(year, month)

  return (
    <div className="space-y-4">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100 dark:active:bg-gray-800">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{monthLabel}</h2>
        <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100 dark:active:bg-gray-800">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs text-gray-400 dark:text-gray-500 font-semibold py-1">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      {loading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse mx-auto" />
          ))}
        </div>
      ) : error ? (
        <p className="text-center py-8 text-sm text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDow }).map((_, i) => <div key={`pad-${i}`} />)}
          {data?.days.map((dayStatus, i) => (
            <DayCell
              key={dayStatus.date}
              day={i + 1}
              status={dayStatus}
              isToday={dayStatus.date === todayStr}
              onPress={handleDayPress}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
        {[
          { color: 'bg-green-500', label: 'All complete' },
          { color: 'bg-amber-400', label: 'Partial' },
          { color: 'border-2 border-red-400', label: 'None done' },
          { color: 'bg-gray-200 dark:bg-gray-700', label: 'No goals' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${item.color}`} />
            <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-gray-400 dark:text-gray-500">
        Tap any day to view goals &amp; proof
      </p>
    </div>
  )
}
