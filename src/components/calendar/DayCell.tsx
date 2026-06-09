'use client'
import { DayStatus } from '@/lib/types'

interface Props {
  day: number
  status: DayStatus
  isToday: boolean
  onPress: (date: string) => void
}

const statusClasses: Record<DayStatus['status'], string> = {
  complete: 'bg-green-500 text-white',
  partial: 'bg-amber-400 text-white',
  incomplete: 'border-2 border-red-400 text-red-500 dark:text-red-400',
  empty: 'text-gray-500 dark:text-gray-400',
}

export function DayCell({ day, status, isToday, onPress }: Props) {
  return (
    <button
      onClick={() => onPress(status.date)}
      className={`
        aspect-square flex items-center justify-center rounded-full
        text-sm font-medium transition-all active:opacity-60 mx-auto
        w-9 h-9
        ${isToday ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-950' : ''}
        ${statusClasses[status.status]}
      `}
    >
      {day}
    </button>
  )
}
