'use client'
import { useState } from 'react'
import { CategoryType } from '@/lib/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface Props {
  isOpen: boolean
  onClose: () => void
  date: string
  category: CategoryType
  existingGoal?: { id: string; title: string } | null
  onSaved: () => void
}

export function GoalForm({ isOpen, onClose, date, category, existingGoal, onSaved }: Props) {
  const [title, setTitle] = useState(existingGoal?.title ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleClose() {
    setTitle(existingGoal?.title ?? '')
    setError(null)
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError(null)

    try {
      if (existingGoal) {
        const res = await fetch(`/api/goals/${existingGoal.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title.trim() }),
        })
        if (!res.ok) throw new Error('Failed to update goal')
      } else {
        const res = await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date, category, title: title.trim() }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error ?? 'Failed to create goal')
        }
      }
      onSaved()
      handleClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={existingGoal ? 'Edit Goal' : 'Set Goal'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge category={category} />
          <span className="text-sm text-gray-500 dark:text-gray-400">priority for today</span>
        </div>
        <textarea
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={`What's your ${category.toLowerCase()} goal today?`}
          className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 text-base min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">Cancel</Button>
          <Button type="submit" loading={saving} disabled={!title.trim()} className="flex-1">
            {existingGoal ? 'Update' : 'Set Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
