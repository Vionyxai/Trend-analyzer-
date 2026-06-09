import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ProofType } from '@prisma/client'

export async function POST(req: NextRequest) {
  const { goalId, proofType, proofText, proofPhotoUrl } = await req.json()

  if (!goalId || !proofType) {
    return NextResponse.json({ error: 'goalId and proofType are required' }, { status: 400 })
  }

  if (!['PHOTO', 'TEXT'].includes(proofType)) {
    return NextResponse.json({ error: 'Invalid proofType' }, { status: 400 })
  }

  if (proofType === 'TEXT' && (!proofText || proofText.trim().length < 10)) {
    return NextResponse.json({ error: 'Description must be at least 10 characters' }, { status: 400 })
  }

  if (proofType === 'PHOTO' && !proofPhotoUrl) {
    return NextResponse.json({ error: 'Photo URL is required for photo proof' }, { status: 400 })
  }

  try {
    const completion = await prisma.completion.create({
      data: {
        goalId,
        proofType: proofType as ProofType,
        proofText: proofType === 'TEXT' ? proofText.trim() : null,
        proofPhotoUrl: proofType === 'PHOTO' ? proofPhotoUrl : null,
      },
    })
    return NextResponse.json(completion, { status: 201 })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'This goal is already marked complete' }, { status: 409 })
    }
    if ((e as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }
    throw e
  }
}
