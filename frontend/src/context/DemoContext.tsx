import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { initialActivity, initialRecommendations, initialSponsors } from '../data/mockData'
import { DemoContext } from './contextModel'
import type { ActivityEvent, FundingChange } from '../types'

export function DemoProvider({ children }: { children: ReactNode }) {
  const [sponsors, setSponsors] = useState(initialSponsors)
  const [recommendations, setRecommendations] = useState(initialRecommendations)
  const [activity, setActivity] = useState(initialActivity)
  const [latestChange, setLatestChange] = useState<FundingChange | null>(null)
  const [investigatedSponsorId, setInvestigatedSponsorId] = useState<string | null>('vertex')

  const addActivity = useCallback((event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    setActivity((items) => [{ ...event, id: `act-${Date.now()}`, timestamp: new Date().toISOString() }, ...items])
  }, [])

  const updateCommitment = useCallback((sponsorId: string, amount: number) => {
    const sponsor = sponsors.find((item) => item.id === sponsorId)
    if (!sponsor) throw new Error(`Unknown sponsor: ${sponsorId}`)
    const change: FundingChange = {
      sponsorId,
      sponsorName: sponsor.name,
      previousAmount: sponsor.currentCommitment,
      currentAmount: amount,
      difference: amount - sponsor.currentCommitment,
      changedAt: new Date().toISOString(),
    }
    setSponsors((items) => items.map((item) => item.id === sponsorId
      ? { ...item, previousCommitment: item.currentCommitment, currentCommitment: amount, status: amount === 0 ? 'At risk' : item.status }
      : item))
    setLatestChange(change)
    setInvestigatedSponsorId(sponsorId)
    addActivity({
      type: 'funding',
      title: `${sponsor.name} commitment updated`,
      description: `Commitment changed from $${change.previousAmount.toLocaleString()} to $${amount.toLocaleString()}.`,
      actor: 'You',
    })
    return change
  }, [sponsors, addActivity])

  const runDemoInvestigation = useCallback((sponsorId: string) => {
    const sponsor = sponsors.find((item) => item.id === sponsorId)
    if (!sponsor) throw new Error(`Unknown sponsor: ${sponsorId}`)
    setInvestigatedSponsorId(sponsorId)
    addActivity({
      type: 'investigation',
      title: `Ripple analysis run for ${sponsor.name}`,
      description: 'Reviewed connected budgets, departments, tasks and deliverables.',
      actor: 'Second Brain AI',
    })
  }, [sponsors, addActivity])

  const decideRecommendation = useCallback((id: string, decision: 'approved' | 'rejected') => {
    const recommendation = recommendations.find((item) => item.id === id)
    if (!recommendation || recommendation.status !== 'pending') return
    setRecommendations((items) => items.map((item) => item.id === id ? { ...item, status: decision } : item))
    addActivity({
      type: 'approval',
      title: `Recommendation ${decision}`,
      description: `“${recommendation.title}” was ${decision}. This local demo decision does not execute an action.`,
      actor: 'You',
    })
  }, [recommendations, addActivity])

  const value = useMemo(() => ({
    sponsors,
    recommendations,
    activity,
    latestChange,
    investigatedSponsorId,
    updateCommitment,
    runDemoInvestigation,
    decideRecommendation,
  }), [sponsors, recommendations, activity, latestChange, investigatedSponsorId, updateCommitment, runDemoInvestigation, decideRecommendation])

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}
