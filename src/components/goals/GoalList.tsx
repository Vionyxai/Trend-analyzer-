'use client'
import { GoalWithCompletion, CategoryType } from '@/lib/types'
import { GoalCard } from './GoalCard'

const CATEGORIES: CategoryType[] = ['MENTAL', 'FINANCIAL', 'PHYSICAL']

interface Props {
  goals: GoalWithCompletion[]
  date: string
  isToday: boolean
  onChanged: () => void
  loading?: boolean
}

export function GoalList({ goals, date, isToday, onChanged, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {CATEGORIES.map(cat => (
          <div key={cat} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {CATEGORIES.map(category => (
        <GoalCard
          key={category}
          goal={goals.find(g => g.category === category) ?? null}
          category={category}
          date={date}
          isToday={isToday}
          onChanged={onChanged}
        />
      ))}
    </div>
  )
}
