import { useState } from 'react'
import { AlertTriangle, Check, CheckCheck, CircleX, ShieldCheck, X } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import { useDemo } from '../context/useDemo'
import type { Recommendation } from '../types'

export default function ApprovalCenter() {
  const { recommendations, decideRecommendation } = useDemo()
  const [confirmation, setConfirmation] = useState<{ recommendation: Recommendation; decision: 'approved' | 'rejected' } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState('')
  const pending = recommendations.filter((item) => item.status === 'pending')
  const resolved = recommendations.filter((item) => item.status !== 'pending')

  function confirmDecision() {
    if (!confirmation || submitting) return
    setSubmitting(true)
    try {
      decideRecommendation(confirmation.recommendation.id, confirmation.decision)
      setNotice(`Recommendation ${confirmation.decision}. This local demo decision did not execute an action.`)
      setConfirmation(null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader eyebrow="MANAGER REVIEW" title="Approval Center" description="Every proposed change waits for a human decision." />
      <div className="approval-safety-banner"><ShieldCheck size={18} /><div><strong>Human approval required</strong><span>Actions are not applied automatically. Decisions below are recorded locally for this demo only.</span></div><span className="local-only-badge">LOCAL-ONLY DEMO</span></div>
      {notice && <div className="approval-notice"><Check size={15} />{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={14} /></button></div>}
      <div className="approval-overview"><div><span>WAITING FOR YOU</span><strong>{pending.length}</strong></div><div><span>DECISIONS RECORDED</span><strong>{resolved.length}</strong></div><div className="approval-help"><AlertTriangle size={15} /><span>Approving a proposal records your decision only. No budget or task is changed.</span></div></div>
      <section className="approval-list">
        <div className="list-section-label">PENDING PROPOSALS <span>{pending.length}</span></div>
        {pending.map((recommendation) => <article className="approval-card panel" key={recommendation.id}>
          <div className="approval-card-main"><div className={`approval-priority ${recommendation.priority.toLowerCase()}`}><i /></div><div className="approval-card-copy"><div className="approval-card-title"><h3>{recommendation.title}</h3><span className={`priority-pill ${recommendation.priority.toLowerCase()}`}>{recommendation.priority}</span></div><p>{recommendation.explanation}</p><div className="approval-meta">{recommendation.affectedEntities.map((entity) => <span className="entity-chip" key={entity}>{entity}</span>)}{recommendation.financialAdjustment && <span className="adjustment-chip">Proposed: {recommendation.financialAdjustment.label} · ${recommendation.financialAdjustment.amount.toLocaleString()}</span>}</div></div></div>
          <div className="approval-card-actions"><button className="button reject" onClick={() => setConfirmation({ recommendation, decision: 'rejected' })}><CircleX size={15} /> Reject</button><button className="button approve" onClick={() => setConfirmation({ recommendation, decision: 'approved' })}><Check size={15} /> Approve</button></div>
        </article>)}
        {!pending.length && <div className="empty-panel panel"><CheckCheck size={23} /><strong>All caught up</strong><span>There are no proposals waiting for your decision.</span></div>}
      </section>
      {!!resolved.length && <section className="approval-history"><div className="list-section-label">RECENT DECISIONS <span>{resolved.length}</span></div>{resolved.map((item) => <div className="resolved-row panel" key={item.id}><span className={`decision-icon ${item.status}`}>{item.status === 'approved' ? <Check size={15} /> : <X size={15} />}</span><span>{item.title}</span><strong className={item.status}>{item.status}</strong><small>Local demo decision · no action executed</small></div>)}</section>}
      {confirmation && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) setConfirmation(null) }}>
        <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <button className="dialog-close" onClick={() => setConfirmation(null)} aria-label="Close" disabled={submitting}><X size={17} /></button>
          <span className={`confirm-icon ${confirmation.decision}`}><AlertTriangle size={21} /></span>
          <h2 id="confirm-title">{confirmation.decision === 'approved' ? 'Approve this proposal?' : 'Reject this proposal?'}</h2>
          <p><strong>{confirmation.recommendation.title}</strong></p>
          <div className="dialog-disclaimer">Your decision will be stored in this local demo only. It will not execute or apply the proposed action.</div>
          <div className="dialog-actions"><button className="button secondary" onClick={() => setConfirmation(null)} disabled={submitting}>Go back</button><button className={`button ${confirmation.decision === 'approved' ? 'approve' : 'reject'}`} onClick={confirmDecision} disabled={submitting}>{submitting ? 'Recording…' : `Confirm ${confirmation.decision}`}</button></div>
        </section>
      </div>}
    </>
  )
}
