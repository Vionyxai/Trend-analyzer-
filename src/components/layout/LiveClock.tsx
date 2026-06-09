'use client'
import { useLiveClock } from '@/hooks/useLiveClock'

export function LiveClock() {
  const now = useLiveClock()

  if (!now) {
    return (
      <div className="text-center space-y-1">
        <div className="h-4 w-52 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
        <div className="h-9 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
      </div>
    )
  }

  return (
    <div className="text-center">
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
        {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
      </p>
      <p className="text-4xl font-bold text-gray-900 dark:text-white tabular-nums tracking-tight">
        {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </p>
    </div>
  )
}
