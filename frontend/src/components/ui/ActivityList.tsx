import { Activity, ArrowDownRight, ArrowUpRight, Check, GitFork, Sparkles } from 'lucide-react'
import type { ActivityEvent } from '../../types'

const icons = {
  funding: ArrowDownRight,
  investigation: GitFork,
  approval: Check,
  system: Sparkles,
}

function formatRelativeTime(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function ActivityList({ events, compact = false }: { events: ActivityEvent[]; compact?: boolean }) {
  if (!events.length) return <div className="empty-state"><Activity size={20} /><span>No activity yet.</span></div>
  return (
    <div className={`activity-list${compact ? ' compact' : ''}`}>
      {events.map((event) => {
        const Icon = icons[event.type] ?? ArrowUpRight
        return (
          <div className="activity-item" key={event.id}>
            <div className={`activity-icon ${event.type}`}><Icon size={15} /></div>
            <div className="activity-copy"><strong>{event.title}</strong><p>{event.description}</p>{!compact && <span>By {event.actor}</span>}</div>
            <time>{formatRelativeTime(event.timestamp)}</time>
          </div>
        )
      })}
    </div>
  )
}
