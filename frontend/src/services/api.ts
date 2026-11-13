import axios from 'axios'
import type { ApiApprovalResponse, DashboardResponse, ImpactGraphData, Recommendation, Sponsor } from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
})

export const getDashboard = () => api.get<DashboardResponse>('/dashboard')
export const getSponsors = () => api.get<Sponsor[]>('/sponsors')
export const runInvestigation = (payload: { sponsorId: string; previousAmount: number; currentAmount: number }) =>
  api.post<{ recommendations: Recommendation[] }>('/investigations/run', payload)
export const getGraph = () => api.get<ImpactGraphData>('/graph')
export const getApprovals = () => api.get<Recommendation[]>('/approvals')
export const submitApproval = (id: string, decision: 'approved' | 'rejected') =>
  api.post<ApiApprovalResponse>(`/approvals/${encodeURIComponent(id)}`, { decision })

export default api
