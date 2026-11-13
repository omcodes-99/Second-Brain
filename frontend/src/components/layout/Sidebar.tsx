import { NavLink } from 'react-router-dom'
import { Activity, BrainCircuit, CheckCheck, Command, GitFork, Handshake, LayoutDashboard, Sparkles } from 'lucide-react'
import { useDemo } from '../../context/useDemo'

const links = [
  { to: '/', label: 'Command Center', icon: LayoutDashboard, end: true },
  { to: '/sponsors', label: 'Sponsors', icon: Handshake },
  { to: '/ripple', label: 'Ripple Intelligence', icon: GitFork },
  { to: '/recovery', label: 'Recovery Planner', icon: Sparkles },
  { to: '/approvals', label: 'Approval Center', icon: CheckCheck },
  { to: '/activity', label: 'Activity History', icon: Activity },
]

export default function Sidebar() {
  const { recommendations } = useDemo()
  const pendingApprovals = recommendations.filter((item) => item.status === 'pending').length
  return (
    <aside className="sidebar">
      <a className="brand" href="/" aria-label="Second Brain home">
        <span className="brand-mark"><BrainCircuit size={21} /></span>
        <span className="brand-name">second<span>brain</span><small>EVENT OPERATIONS</small></span>
      </a>
      <div className="workspace-switcher">
        <span className="workspace-avatar">N</span>
        <span><strong>Northstar Summit</strong><small>Workspace</small></span>
        <Command size={15} className="muted-icon" />
      </div>
      <div className="nav-section-label">WORKSPACE</div>
      <nav className="side-nav">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <Icon size={17} strokeWidth={1.8} /><span>{label}</span>
            {label === 'Approval Center' && pendingApprovals > 0 && <span className="nav-count">{pendingApprovals}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="season-card">
          <div className="season-icon"><Sparkles size={15} /></div>
          <div><strong>Fall '26 Summit</strong><small>12 days to event</small></div>
          <span className="live-dot" />
        </div>
        <div className="user-profile">
          <div className="user-avatar">MC</div>
          <div><strong>Maya Chen</strong><small>Event manager</small></div>
          <span className="more-dots">•••</span>
        </div>
      </div>
    </aside>
  )
}
