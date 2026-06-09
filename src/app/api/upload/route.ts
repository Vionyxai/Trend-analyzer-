import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('photo') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No photo provided' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image must be under 5MB' }, { status: 400 })
  }

  // Production: use Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob')
    const ext = file.name.split('.').pop() ?? 'jpg'
    const blob = await put(`proofs/${Date.now()}.${ext}`, file, { access: 'public' })
    return NextResponse.json({ url: blob.url })
  }

  // Local dev fallback: save to public/uploads
  const { writeFile, mkdir } = await import('fs/promises')
  const path = await import('path')
  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') ?? 'jpg'
  const filename = `${Date.now()}.${ext}`
  const dir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, filename), buffer)
  return NextResponse.json({ url: `/uploads/${filename}` })
}
