import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { title } = await req.json()

  if (!title?.trim()) {
    return NextResponse.json({ error: 'title required' }, { status: 400 })
  }

  const goal = await prisma.dailyGoal.update({
    where: { id },
    data: { title: title.trim() },
    include: { completion: true },
  })

  return NextResponse.json(goal)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.dailyGoal.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
