import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDaysInMonth } from '@/lib/date-utils'
import { DayStatus } from '@/lib/types'

export async function GET(req: NextRequest) {
  const month = req.nextUrl.searchParams.get('month')

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: 'month param required in YYYY-MM format' }, { status: 400 })
  }

  const [year, monthNum] = month.split('-').map(Number)
  const firstDay = `${month}-01`
  const daysCount = getDaysInMonth(year, monthNum)
  const lastDay = `${month}-${String(daysCount).padStart(2, '0')}`

  const goals = await prisma.dailyGoal.findMany({
    where: { date: { gte: firstDay, lte: lastDay } },
    include: { completion: true },
  })

  const dayMap = new Map<string, { total: number; completed: number }>()
  for (const goal of goals) {
    const entry = dayMap.get(goal.date) ?? { total: 0, completed: 0 }
    entry.total++
    if (goal.completion) entry.completed++
    dayMap.set(goal.date, entry)
  }

  const days: DayStatus[] = []
  for (let d = 1; d <= daysCount; d++) {
    const dateStr = `${month}-${String(d).padStart(2, '0')}`
    const counts = dayMap.get(dateStr)
    let status: DayStatus['status'] = 'empty'
    if (counts) {
      if (counts.completed === counts.total) status = 'complete'
      else if (counts.completed > 0) status = 'partial'
      else status = 'incomplete'
    }
    days.push({ date: dateStr, totalGoals: counts?.total ?? 0, completedGoals: counts?.completed ?? 0, status })
  }

  return NextResponse.json({ year, month: monthNum, days })
}
