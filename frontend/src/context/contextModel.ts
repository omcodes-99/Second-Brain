import { createContext } from 'react'
import type { ActivityEvent, FundingChange, Recommendation, Sponsor } from '../types'

export interface DemoContextValue {
  sponsors: Sponsor[]
  recommendations: Recommendation[]
  activity: ActivityEvent[]
  latestChange: FundingChange | null
  investigatedSponsorId: string | null
  updateCommitment: (sponsorId: string, amount: number) => FundingChange
  runDemoInvestigation: (sponsorId: string) => void
  decideRecommendation: (id: string, decision: 'approved' | 'rejected') => void
}

export const DemoContext = createContext<DemoContextValue | null>(null)
