import { CategoryType } from '@/lib/types'

const styles: Record<CategoryType, string> = {
  MENTAL: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  FINANCIAL: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  PHYSICAL: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
}

const labels: Record<CategoryType, string> = {
  MENTAL: '🧠 Mental',
  FINANCIAL: '💰 Financial',
  PHYSICAL: '💪 Physical',
}

export function Badge({ category }: { category: CategoryType }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[category]}`}>
      {labels[category]}
    </span>
  )
}
