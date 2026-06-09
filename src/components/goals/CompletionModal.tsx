'use client'
import { useState } from 'react'
import { CategoryType } from '@/lib/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PhotoUpload } from '@/components/ui/PhotoUpload'

interface Props {
  isOpen: boolean
  onClose: () => void
  goalId: string
  goalTitle: string
  category: CategoryType
  onCompleted: () => void
}

type ProofMode = 'PHOTO' | 'TEXT' | null

export function CompletionModal({ isOpen, onClose, goalId, goalTitle, category, onCompleted }: Props) {
  const [mode, setMode] = useState<ProofMode>(null)
  const [text, setText] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleClose() {
    setMode(null)
    setText('')
    setPhotoFile(null)
    setError(null)
    onClose()
  }

  async function handleSubmit() {
    if (!mode) return
    if (mode === 'TEXT' && text.trim().length < 10) {
      setError('Description must be at least 10 characters')
      return
    }
    if (mode === 'PHOTO' && !photoFile) {
      setError('Please select a photo')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      let proofPhotoUrl: string | undefined

      if (mode === 'PHOTO' && photoFile) {
        const fd = new FormData()
        fd.append('photo', photoFile)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!uploadRes.ok) {
          const err = await uploadRes.json()
          throw new Error(err.error ?? 'Photo upload failed')
        }
        const { url } = await uploadRes.json()
        proofPhotoUrl = url
      }

      const res = await fetch('/api/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId,
          proofType: mode,
          proofText: mode === 'TEXT' ? text.trim() : undefined,
          proofPhotoUrl,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to save completion')
      }

      onCompleted()
      handleClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit =
    (mode === 'TEXT' && text.trim().length >= 10) ||
    (mode === 'PHOTO' && !!photoFile)

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Mark Complete">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl">
          <Badge category={category} />
          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-snug flex-1">{goalTitle}</p>
        </div>

        {!mode && (
          <>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center">
              Show proof that you completed this goal
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode('PHOTO')}
                className="flex flex-col items-center gap-3 p-5 border-2 border-gray-200 dark:border-gray-700 rounded-2xl active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Photo Proof</span>
              </button>
              <button
                onClick={() => setMode('TEXT')}
                className="flex flex-col items-center gap-3 p-5 border-2 border-gray-200 dark:border-gray-700 rounded-2xl active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
              >
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Write It Out</span>
              </button>
            </div>
          </>
        )}

        {mode === 'PHOTO' && (
          <div className="space-y-3">
            <button onClick={() => { setMode(null); setPhotoFile(null) }} className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              ← Change proof type
            </button>
            <PhotoUpload onFileSelected={file => setPhotoFile(file)} />
          </div>
        )}

        {mode === 'TEXT' && (
          <div className="space-y-2">
            <button onClick={() => { setMode(null); setText('') }} className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              ← Change proof type
            </button>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Describe what you did..."
              className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 text-base min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <p className={`text-xs font-medium ${text.trim().length >= 10 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
              {text.trim().length} / 10 minimum characters
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {mode && (
          <Button onClick={handleSubmit} loading={submitting} disabled={!canSubmit} className="w-full" size="lg">
            ✓ Mark as Complete
          </Button>
        )}
      </div>
    </Modal>
  )
}
