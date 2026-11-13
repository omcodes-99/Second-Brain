import { Bell, ChevronDown, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const titles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Command Center', subtitle: 'A clear view of your event, all in one place.' },
  '/sponsors': { title: 'Sponsors', subtitle: 'Track commitments and keep funding on course.' },
  '/ripple': { title: 'Ripple Intelligence', subtitle: 'See how a change travels through your event.' },
  '/recovery': { title: 'Recovery Planner', subtitle: 'Thoughtful next steps, ready for your review.' },
  '/approvals': { title: 'Approval Center', subtitle: 'You stay in control of every proposed action.' },
  '/activity': { title: 'Activity History', subtitle: 'A running record of what changed and when.' },
}

export default function Topbar() {
  const { pathname } = useLocation()
  const page = titles[pathname] ?? titles['/']
  return (
    <header className="topbar">
      <div className="topbar-heading"><h1>{page.title}</h1><p>{page.subtitle}</p></div>
      <div className="topbar-actions">
        <button className="event-selector"><span className="event-selector-dot" />Fall '26 Summit<ChevronDown size={14} /></button>
        <button className="icon-button" aria-label="Search"><Search size={18} /></button>
        <button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button>
      </div>
    </header>
  )
}
