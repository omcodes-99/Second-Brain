import { ArrowRight, CheckCircle2, Clock3, Sparkles, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import { useDemo } from '../context/useDemo'

export default function RecoveryPlanner() {
  const { recommendations } = useDemo()
  const pending = recommendations.filter((item) => item.status === 'pending')
  const completed = recommendations.filter((item) => item.status !== 'pending')
  return (
    <>
      <PageHeader eyebrow="HUMAN-IN-THE-LOOP" title="Recovery Planner" description="AI-generated options to help your team get ahead of event risks."
        actions={<Link to="/approvals" className="button primary">Review proposals <ArrowRight size={15} /></Link>} />
      <div className="planner-notice"><span className="planner-notice-icon"><Sparkles size={16} /></span><div><strong>Recommendations are proposals, not actions.</strong><p>Nothing changes until an event manager reviews and approves it. Approval decisions in this demo are local-only.</p></div></div>
      <div className="recommendation-section-heading"><div><h3>Awaiting your review</h3><p>{pending.length} proposed actions</p></div><span className="proposed-pill"><i /> PROPOSED</span></div>
      <section className="recommendation-list">
        {pending.map((recommendation, index) => <article className="recommendation-card panel" key={recommendation.id}>
          <div className={`recommendation-index ${recommendation.priority.toLowerCase()}`}>{String(index + 1).padStart(2, '0')}</div>
          <div className="recommendation-content">
            <div className="recommendation-top"><span className={`priority-pill ${recommendation.priority.toLowerCase()}`}>{recommendation.priority} priority</span><span className="recommendation-time"><Clock3 size={13} /> Generated {new Date(recommendation.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span></div>
            <h3>{recommendation.title}</h3><p>{recommendation.explanation}</p>
            <div className="affected-tags"><span>AFFECTED</span>{recommendation.affectedEntities.map((entity) => <span className="entity-chip" key={entity}>{entity}</span>)}</div>
            {recommendation.financialAdjustment && <div className="financial-adjustment"><Wallet size={15} /><span>{recommendation.financialAdjustment.label}</span><strong>${recommendation.financialAdjustment.amount.toLocaleString()}</strong><small>Proposed adjustment</small></div>}
          </div>
          <div className="recommendation-side"><span className="proposed-stamp">PROPOSED</span><Link to="/approvals" className="text-link">Review <ArrowRight size={14} /></Link></div>
        </article>)}
        {!pending.length && <div className="empty-panel panel"><CheckCircle2 size={23} /><strong>You’re all caught up</strong><span>No proposed actions are waiting for review.</span></div>}
      </section>
      {!!completed.length && <section className="resolved-recommendations"><div className="recommendation-section-heading"><div><h3>Decision recorded</h3><p>{completed.length} recommendation{completed.length === 1 ? '' : 's'} reviewed</p></div></div>
        {completed.map((item) => <div className="resolved-row panel" key={item.id}><CheckCircle2 size={17} /><span>{item.title}</span><strong className={item.status}>{item.status}</strong><small>Local demo decision</small></div>)}
      </section>}
    </>
  )
}
