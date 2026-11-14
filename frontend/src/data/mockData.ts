import type { ActivityEvent, ImpactGraphData, Recommendation, Sponsor } from '../types'

export const initialSponsors: Sponsor[] = [
  { id: 'northstar', name: 'Northstar Labs', initials: 'NL', category: 'Technology', previousCommitment: 18000, currentCommitment: 18000, status: 'Active', contact: 'Maya Chen' },
  { id: 'vertex', name: 'Vertex Ventures', initials: 'VV', category: 'Finance', previousCommitment: 12000, currentCommitment: 10000, status: 'At risk', contact: 'Ethan Brooks' },
  { id: 'orbit', name: 'Orbit Mobile', initials: 'OM', category: 'Technology', previousCommitment: 9000, currentCommitment: 9000, status: 'Active', contact: 'Ava Patel' },
  { id: 'greenway', name: 'Greenway Energy', initials: 'GE', category: 'Sustainability', previousCommitment: 7500, currentCommitment: 5000, status: 'Pending', contact: 'Noah Williams' },
  { id: 'atlas', name: 'Atlas Creative', initials: 'AC', category: 'Media', previousCommitment: 6000, currentCommitment: 6000, status: 'Active', contact: 'Sofia Kim' },
]

export const initialRecommendations: Recommendation[] = [
  {
    id: 'rec-1',
    title: 'Rebalance the showcase production budget',
    explanation: 'A 17% reduction in Vertex Ventures funding puts the main-stage production allocation above its safe threshold. Reallocating from contingency protects the event experience while sponsorship is reconfirmed.',
    priority: 'High',
    affectedEntities: ['Main stage', 'Production team', 'Contingency fund'],
    financialAdjustment: { label: 'Move from contingency', amount: 2000 },
    status: 'pending',
    createdAt: '2026-11-13T20:30:00Z',
  },
  {
    id: 'rec-2',
    title: 'Confirm revised catering headcount',
    explanation: 'The current catering estimate assumes the original attendee forecast. Confirming the final count now reduces the risk of a late invoice overrun.',
    priority: 'Medium',
    affectedEntities: ['Catering', 'Operations team'],
    status: 'pending',
    createdAt: '2026-11-13T20:12:00Z',
  },
  {
    id: 'rec-3',
    title: 'Request a decision from Greenway Energy',
    explanation: 'Greenway Energy has not confirmed its commitment. A clear decision date gives the sustainability team time to activate its backup plan.',
    priority: 'Low',
    affectedEntities: ['Sustainability team', 'Eco pavilion'],
    status: 'pending',
    createdAt: '2026-11-13T16:45:00Z',
  },
]

export const initialActivity: ActivityEvent[] = [
  { id: 'act-1', type: 'funding', title: 'Vertex Ventures commitment revised', description: 'Commitment adjusted from $12,000 to $10,000.', timestamp: '2026-11-13T20:24:00Z', actor: 'Maya Chen' },
  { id: 'act-2', type: 'investigation', title: 'Funding ripple analysis completed', description: '6 connected entities reviewed across 3 dependency paths.', timestamp: '2026-11-13T20:16:00Z', actor: 'Second Brain AI' },
  { id: 'act-3', type: 'system', title: 'New task added to event plan', description: '“Finalize speaker green room” was assigned to Operations.', timestamp: '2026-11-13T10:40:00Z', actor: 'Jordan Lee' },
  { id: 'act-4', type: 'approval', title: 'Venue deposit proposal approved', description: 'The proposed $1,500 deposit was approved by Jordan Lee.', timestamp: '2026-11-13T06:05:00Z', actor: 'Jordan Lee' },
]

export const mockImpactGraph: ImpactGraphData = {
  nodes: [
    { id: 'vertex', type: 'sponsor', title: 'Vertex Ventures', detail: '$10,000 committed · down $2,000', severity: 'critical', x: 40, y: 170, sponsorId: 'vertex' },
    { id: 'northstar', type: 'sponsor', title: 'Northstar Labs', detail: '$18,000 committed', severity: 'neutral', x: 40, y: 420, sponsorId: 'northstar' },
    { id: 'event-budget', type: 'budget', title: 'Event operating budget', detail: '$48,000 total funding', severity: 'high', x: 300, y: 170 },
    { id: 'production', type: 'department', title: 'Production team', detail: '$14,200 allocated', severity: 'high', x: 560, y: 80 },
    { id: 'operations', type: 'department', title: 'Operations team', detail: '$8,400 allocated', severity: 'medium', x: 560, y: 300 },
    { id: 'main-stage', type: 'task', title: 'Main stage build', detail: 'Due in 6 days · owner: Production', severity: 'high', x: 820, y: 80 },
    { id: 'catering', type: 'task', title: 'Catering headcount', detail: 'Due tomorrow · owner: Operations', severity: 'medium', x: 820, y: 300 },
    { id: 'showcase', type: 'deliverable', title: 'Opening showcase', detail: 'Deliverable · 1 dependency at risk', severity: 'critical', x: 1080, y: 170 },
    { id: 'guest-ready', type: 'deliverable', title: 'Guest experience ready', detail: 'Deliverable · on track', severity: 'low', x: 1080, y: 390 },
  ],
  edges: [
    { id: 'e1', source: 'vertex', target: 'event-budget', label: 'funds' },
    { id: 'e2', source: 'northstar', target: 'event-budget', label: 'funds' },
    { id: 'e3', source: 'event-budget', target: 'production', label: 'allocates' },
    { id: 'e4', source: 'event-budget', target: 'operations', label: 'allocates' },
    { id: 'e5', source: 'production', target: 'main-stage', label: 'owns' },
    { id: 'e6', source: 'operations', target: 'catering', label: 'owns' },
    { id: 'e7', source: 'main-stage', target: 'showcase', label: 'delivers' },
    { id: 'e8', source: 'catering', target: 'guest-ready', label: 'delivers' },
    { id: 'e9', source: 'showcase', target: 'guest-ready', label: 'supports' },
  ],
}

export function createMockImpactGraph(sponsor: Sponsor, totalFunding: number): ImpactGraphData {
  const difference = sponsor.currentCommitment - sponsor.previousCommitment
  const direction = difference < 0 ? 'down' : difference > 0 ? 'up' : 'unchanged'
  const formatCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
  return {
    nodes: mockImpactGraph.nodes
      .filter((node) => sponsor.id !== 'northstar' || node.id !== 'northstar')
      .map((node) => {
        if (node.id === 'event-budget') return { ...node, detail: `${formatCurrency.format(totalFunding)} total funding` }
        if (node.id !== 'vertex') return node
        return {
          ...node,
          id: sponsor.id,
          sponsorId: sponsor.id,
          title: sponsor.name,
          detail: difference === 0
            ? `${formatCurrency.format(sponsor.currentCommitment)} committed · unchanged`
            : `${formatCurrency.format(sponsor.currentCommitment)} committed · ${direction} ${formatCurrency.format(Math.abs(difference))}`,
        }
      }),
    edges: mockImpactGraph.edges.filter((edge) => sponsor.id !== 'northstar' || edge.id !== 'e2').map((edge) => ({
      ...edge,
      source: edge.source === 'vertex' ? sponsor.id : edge.source,
    })),
  }
}

export function getConnectedNodeIds(graph: ImpactGraphData, sourceId: string) {
  const connected = new Set<string>()
  const queue = [sourceId]
  while (queue.length) {
    const current = queue.shift()
    if (!current || connected.has(current)) continue
    connected.add(current)
    graph.edges.filter((edge) => edge.source === current).forEach((edge) => queue.push(edge.target))
  }
  return connected
}

export const fundingHistory = [
  { month: 'Jun', confirmed: 31, target: 45 },
  { month: 'Jul', confirmed: 35, target: 45 },
  { month: 'Aug', confirmed: 39, target: 45 },
  { month: 'Sep', confirmed: 37, target: 45 },
  { month: 'Oct', confirmed: 43, target: 45 },
  { month: 'Nov', confirmed: 48, target: 50 },
]
