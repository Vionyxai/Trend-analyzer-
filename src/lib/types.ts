export type CategoryType = 'MENTAL' | 'FINANCIAL' | 'PHYSICAL'
export type ProofType = 'PHOTO' | 'TEXT'

export interface CompletionData {
  id: string
  completedAt: string
  proofType: ProofType
  proofText: string | null
  proofPhotoUrl: string | null
}

export interface GoalWithCompletion {
  id: string
  date: string
  category: CategoryType
  title: string
  createdAt: string
  completion: CompletionData | null
}

export interface DayStatus {
  date: string
  totalGoals: number
  completedGoals: number
  status: 'complete' | 'partial' | 'incomplete' | 'empty'
}

export interface CalendarMonth {
  year: number
  month: number
  days: DayStatus[]
}
