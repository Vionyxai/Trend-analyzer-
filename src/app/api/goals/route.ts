import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Category } from '@prisma/client'

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date')
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })

  const goals = await prisma.dailyGoal.findMany({
    where: { date },
    include: { completion: true },
    orderBy: { category: 'asc' },
  })

  return NextResponse.json(goals)
}

export async function POST(req: NextRequest) {
  const { date, category, title } = await req.json()

  if (!date || !category || !title) {
    return NextResponse.json({ error: 'date, category, and title are required' }, { status: 400 })
  }

  if (!['MENTAL', 'FINANCIAL', 'PHYSICAL'].includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }

  try {
    const goal = await prisma.dailyGoal.create({
      data: { date, category: category as Category, title: title.trim() },
      include: { completion: true },
    })
    return NextResponse.json(goal, { status: 201 })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'A goal for this category already exists today' }, { status: 409 })
    }
    throw e
  }
}
