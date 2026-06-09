import { CalendarGrid } from '@/components/calendar/CalendarGrid'

export default function CalendarPage() {
  return (
    <div className="px-4 pt-12 pb-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Calendar</h1>
      <CalendarGrid />
    </div>
  )
}
