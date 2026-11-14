import { useMemo } from 'react'
import { ArrowDownRight, ArrowRight, ArrowUpRight, CircleDollarSign, ClipboardList, GitFork, Handshake, Plus } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import ActivityList from '../components/ui/ActivityList'
import CrystalizedBall from '../components/ui/CrystalizedBall'
import { fundingHistory } from '../data/mockData'
import { useDemo } from '../context/useDemo'

const money = (value: number) => `$${value.toLocaleString()}`

export default function Dashboard() {
  const { sponsors, recommendations, activity } = useDemo()
  const committed = useMemo(() => sponsors.reduce((sum, sponsor) => sum + sponsor.currentCommitment, 0), [sponsors])
  const pending = recommendations.filter((item) => item.status === 'pending').length
  const confirmedSponsors = sponsors.filter((item) => item.status === 'Active').length
  const pendingSponsors = sponsors.filter((item) => item.status === 'Pending').length
  const totalSponsors = sponsors.length || 1
  const confirmedPercentage = confirmedSponsors / totalSponsors * 100
  const pendingPercentage = pendingSponsors / totalSponsors * 100
  const riskStartPercentage = confirmedPercentage + pendingPercentage
  const followUpSponsor = sponsors.find((item) => item.status !== 'Active')
  return (
    <>
      <PageHeader eyebrow="FRIDAY, NOVEMBER 14, 2026" title="Good morning, Maya ✨" description="Here’s what’s happening with your event today."
        actions={<Link className="button primary" to="/sponsors"><Plus size={16} /> Update funding</Link>} />
      <section className="stats-grid">
        <StatCard label="Total sponsors" value={String(sponsors.length).padStart(2, '0')} note={`${confirmedSponsors} confirmed · ${sponsors.length - confirmedSponsors} need attention`} icon={Handshake} tone="blue" />
        <StatCard label="Committed funding" value={money(committed)} note={<><span className="inline-good"><ArrowUpRight size={13} /> 8.4%</span> vs. last event</>} icon={CircleDollarSign} tone="violet" />
        <StatCard label="Active tasks" value="28" note={<><span className="inline-good">22 on track</span> · 6 due soon</>} icon={ClipboardList} tone="green" />
        <StatCard label="Pending approvals" value={String(pending).padStart(2, '0')} note="Your review is needed" icon={GitFork} tone="amber" />
      </section>
      <section className="dashboard-grid">
        <article className="panel funding-panel">
          <div className="panel-heading"><div><h3>Funding overview</h3><p>Committed funding over the last 6 months</p></div><span className="panel-select">This year <span>⌄</span></span></div>
          <div className="chart-summary"><strong>{money(committed)}</strong><span className="inline-good"><ArrowUpRight size={14} /> 8.4%</span><small>of $50,000 target</small></div>
          <div className="funding-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fundingHistory} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                <defs><linearGradient id="fundingFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7274ff" stopOpacity={0.25} /><stop offset="100%" stopColor="#7274ff" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="#232a39" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#788297', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#788297', fontSize: 11 }} tickFormatter={(value) => `$${value}k`} />
                <Tooltip contentStyle={{ background: '#171d2a', border: '1px solid #2b3447', borderRadius: 10, color: '#edf0f7' }} formatter={(value) => [`$${value}k`, 'Committed']} />
                <Area type="monotone" dataKey="confirmed" stroke="#8280ff" strokeWidth={2.5} fill="url(#fundingFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-footnote"><span><i className="chart-key" />Confirmed</span><span><i className="chart-key target" />Target</span><span className="chart-target">Target: $50,000</span></div>
        </article>
        <article className="panel sponsor-summary-panel">
          <div className="panel-heading"><div><h3>Sponsor status</h3><p>Commitment health at a glance</p></div><Link className="text-link" to="/sponsors">View all <ArrowRight size={14} /></Link></div>
          <div className="sponsor-status-summary">
            <div className="status-ring" style={{ background: `conic-gradient(#7375ed 0 ${confirmedPercentage}%, #e5b16a ${confirmedPercentage}% ${riskStartPercentage}%, #5a667a ${riskStartPercentage}% 100%)` }}><div><strong>{sponsors.length}</strong><small>total</small></div></div>
            <div className="status-legend">
              <div><i className="status-dot confirmed" /><span>Confirmed</span><strong>{sponsors.filter((item) => item.status === 'Active').length}</strong></div>
              <div><i className="status-dot pending" /><span>Pending</span><strong>{sponsors.filter((item) => item.status === 'Pending').length}</strong></div>
              <div><i className="status-dot risk" /><span>At risk</span><strong>{sponsors.filter((item) => item.status === 'At risk').length}</strong></div>
            </div>
          </div>
          {followUpSponsor && <div className="sponsor-status-callout"><span className="callout-icon"><ArrowDownRight size={15} /></span><div><strong>{followUpSponsor.name} needs a follow-up</strong><small>{followUpSponsor.status === 'Pending' ? 'Commitment awaiting confirmation' : 'Commitment at risk'}</small></div></div>}
        </article>
        <article className="panel activity-panel">
          <div className="panel-heading"><div><h3>Recent activity</h3><p>Latest updates across your workspace</p></div><Link className="text-link" to="/activity">View history <ArrowRight size={14} /></Link></div>
          <ActivityList events={activity.slice(0, 4)} compact />
        </article>
        <article className="panel intelligence-card">
          <div className="intelligence-art" aria-hidden="true"><CrystalizedBall preset="nebula" color="#8F86FF" size={0.78} particleCount={6000} crackle={0.58} flares={0.52} glow={0.92} sparks={0.3} fill={0.48} speed={0.7} interactive hoverStrength={0.55} /></div>
          <div className="intelligence-copy"><span className="eyebrow">INTELLIGENCE AT A GLANCE</span><h3>See the ripple before it reaches your event.</h3><p>Trace funding changes through budgets, teams, tasks and deliverables.</p><Link className="button subtle" to="/ripple">Explore impact map <ArrowRight size={15} /></Link></div>
        </article>
      </section>
    </>
  )
}
