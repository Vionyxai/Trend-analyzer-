'use client'
import { useState } from 'react'
import { CategoryType, GoalWithCompletion } from '@/lib/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { GoalForm } from './GoalForm'
import { CompletionModal } from './CompletionModal'

const placeholders: Record<CategoryType, string> = {
  MENTAL: 'Tap to set your mental priority',
  FINANCIAL: 'Tap to set your financial priority',
  PHYSICAL: 'Tap to set your physical priority',
}

interface Props {
  goal: GoalWithCompletion | null
  category: CategoryType
  date: string
  isToday: boolean
  onChanged: () => void
}

export function GoalCard({ goal, category, date, isToday, onChanged }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [undoing, setUndoing] = useState(false)

  const isCompleted = !!goal?.completion

  async function handleUndo() {
    if (!goal?.completion) return
    setUndoing(true)
    try {
      await fetch(`/api/completions/${goal.completion.id}`, { method: 'DELETE' })
      onChanged()
    } finally {
      setUndoing(false)
    }
  }

  return (
    <>
      <div className={`rounded-2xl border p-4 space-y-3 transition-all ${
        isCompleted
          ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/50'
          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
      }`}>
        {/* Header row */}
        <div className="flex items-center justify-between">
          <Badge category={category} />
          {isCompleted && (
            <span className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}
        </div>

        {/* Content */}
        {!goal ? (
          <button
            onClick={() => isToday && setShowForm(true)}
            className={`w-full text-left ${isToday ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
              {isToday ? placeholders[category] : 'No goal set'}
            </p>
          </button>
        ) : (
          <div className="space-y-2">
            <p className={`font-medium leading-snug ${
              isCompleted ? 'text-green-800 dark:text-green-200' : 'text-gray-900 dark:text-white'
            }`}>
              {goal.title}
            </p>

            {isCompleted && goal.completion && (
              <div className="space-y-2 pt-1">
                <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                  ✓ Done at {new Date(goal.completion.completedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </p>
                {goal.completion.proofType === 'TEXT' && goal.completion.proofText && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-gray-800/60 rounded-xl p-2 line-clamp-3">
                    &ldquo;{goal.completion.proofText}&rdquo;
                  </p>
                )}
                {goal.completion.proofType === 'PHOTO' && goal.completion.proofPhotoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={goal.completion.proofPhotoUrl}
                    alt="Completion proof"
                    className="w-full h-28 object-cover rounded-xl"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions (today only) */}
        {isToday && goal && (
          <div className="flex gap-2 pt-1">
            {!isCompleted ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(true)}>
                  Edit
                </Button>
                <Button size="sm" onClick={() => setShowCompletion(true)} className="flex-1">
                  Mark Complete
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleUndo} loading={undoing} className="text-xs text-gray-400">
                Undo completion
              </Button>
            )}
          </div>
        )}
      </div>

      <GoalForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        date={date}
        category={category}
        existingGoal={goal ? { id: goal.id, title: goal.title } : null}
        onSaved={onChanged}
      />

      {goal && (
        <CompletionModal
          isOpen={showCompletion}
          onClose={() => setShowCompletion(false)}
          goalId={goal.id}
          goalTitle={goal.title}
          category={category}
          onCompleted={onChanged}
        />
      )}
    </>
  )
}
