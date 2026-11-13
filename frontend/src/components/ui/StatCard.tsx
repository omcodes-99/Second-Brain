import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export default function StatCard({ label, value, note, icon: Icon, tone = 'blue' }: {
  label: string
  value: string
  note: ReactNode
  icon: LucideIcon
  tone?: 'blue' | 'violet' | 'green' | 'amber'
}) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={18} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-note">{note}</div>
    </article>
  )
}
