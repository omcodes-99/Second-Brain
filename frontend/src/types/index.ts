// Provisional UI shapes; map Member 2's confirmed response contract at the API boundary.
export type SponsorStatus = 'Active' | 'Pending' | 'At risk'
export type RecommendationStatus = 'pending' | 'approved' | 'rejected'
export type ActivityType = 'funding' | 'investigation' | 'approval' | 'system'
export type NodeSeverity = 'critical' | 'high' | 'medium' | 'low' | 'neutral'
export type GraphEntityType = 'sponsor' | 'budget' | 'department' | 'task' | 'deliverable'

export interface Sponsor {
  id: string
  name: string
  initials: string
  category: string
  previousCommitment: number
  currentCommitment: number
  status: SponsorStatus
  contact: string
}

export interface Recommendation {
  id: string
  title: string
  explanation: string
  priority: 'High' | 'Medium' | 'Low'
  affectedEntities: string[]
  financialAdjustment?: { label: string; amount: number }
  status: RecommendationStatus
  createdAt: string
}

export interface ActivityEvent {
  id: string
  type: ActivityType
  title: string
  description: string
  timestamp: string
  actor: string
}

export interface ImpactGraphNode {
  id: string
  type: GraphEntityType
  title: string
  detail: string
  severity: NodeSeverity
  x: number
  y: number
  sponsorId?: string
}

export interface ImpactGraphEdge {
  id: string
  source: string
  target: string
  label?: string
}

export interface ImpactGraphData {
  nodes: ImpactGraphNode[]
  edges: ImpactGraphEdge[]
}

export interface DashboardResponse {
  totalSponsors: number
  committedFunding: number
  activeTasks: number
  pendingApprovals: number
}

export interface ApiApprovalResponse {
  id: string
  status: RecommendationStatus
  message?: string
}

export interface FundingChange {
  sponsorId: string
  sponsorName: string
  previousAmount: number
  currentAmount: number
  difference: number
  changedAt: string
}
