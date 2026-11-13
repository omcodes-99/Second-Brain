import { useMemo, useState, type FormEvent } from 'react'
import { ArrowDownRight, ArrowUpRight, CircleDollarSign, GitFork, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import { useDemo } from '../context/useDemo'
import type { Sponsor } from '../types'

const currency = (amount: number) => amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export default function Sponsors() {
  const { sponsors, updateCommitment, latestChange, runDemoInvestigation } = useDemo()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(sponsors[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [savedChange, setSavedChange] = useState<typeof latestChange>(null)
  const total = sponsors.reduce((sum, item) => sum + item.currentCommitment, 0)
  const selected = sponsors.find((item) => item.id === selectedId)
  const filtered = useMemo(() => sponsors.filter((sponsor) => `${sponsor.name} ${sponsor.category}`.toLowerCase().includes(query.toLowerCase())), [sponsors, query])

  function submit(e: FormEvent) {
    e.preventDefault()
    const parsedAmount = Number(amount)
    if (!selected) return setError('Choose a sponsor before saving.')
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0 || parsedAmount > 10000000) return setError('Enter an amount between $0 and $10,000,000.')
    const change = updateCommitment(selected.id, Math.round(parsedAmount))
    setSavedChange(change)
    setAmount('')
    setError('')
  }

  return (
    <>
      <PageHeader eyebrow="FUNDING WORKSPACE" title="Sponsor management" description="Keep every commitment clear, current and connected." />
      <div className="stats-grid sponsor-stats">
        <StatCard label="Total committed" value={currency(total)} note="Across all active and pending sponsors" icon={CircleDollarSign} tone="violet" />
        <StatCard label="Confirmed sponsors" value={String(sponsors.filter((item) => item.status === 'Active').length).padStart(2, '0')} note="Commitment confirmed" icon={ArrowUpRight} tone="green" />
        <StatCard label="Needs follow-up" value={String(sponsors.filter((item) => item.status !== 'Active').length).padStart(2, '0')} note="Pending or at-risk commitments" icon={ArrowDownRight} tone="amber" />
      </div>
      <section className="panel sponsor-table-panel">
        <div className="panel-heading"><div><h3>Sponsor commitments</h3><p>Updates here are local to this demo workspace.</p></div><label className="search-field"><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search sponsors" /></label></div>
        <div className="table-scroll"><table className="data-table"><thead><tr><th>SPONSOR</th><th>STATUS</th><th>PREVIOUS</th><th>CURRENT COMMITMENT</th><th>CHANGE</th><th>CONTACT</th></tr></thead><tbody>
          {filtered.map((sponsor) => <SponsorRow key={sponsor.id} sponsor={sponsor} />)}
        </tbody></table></div>
        {!filtered.length && <div className="empty-table">No sponsors match “{query}”.</div>}
        <div className="table-footer">Showing <strong>{filtered.length}</strong> of {sponsors.length} sponsors <span>Last synced just now</span></div>
      </section>
      <section className="panel update-panel">
        <div className="update-panel-intro"><div className="update-icon"><CircleDollarSign size={20} /></div><div><h3>Update a commitment</h3><p>Record a funding change and see what it could affect.</p></div></div>
        <form className="commitment-form" onSubmit={submit}>
          <label>Sponsor<select value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setError(''); setSavedChange(null) }}>{sponsors.map((sponsor) => <option key={sponsor.id} value={sponsor.id}>{sponsor.name}</option>)}</select></label>
          <label>New commitment <span className="amount-input"><span>$</span><input aria-label="New commitment amount" type="number" min="0" max="10000000" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={selected?.currentCommitment.toString() ?? '0'} required /></span></label>
          <button className="button primary" type="submit">Save commitment</button>
        </form>
        {error && <div className="form-error" role="alert">{error}</div>}
        {savedChange && <div className="funding-change-summary">
          <div className="change-summary-title"><span className="success-pulse" />Funding change saved locally <button onClick={() => setSavedChange(null)} aria-label="Dismiss"><X size={14} /></button></div>
          <div className="change-numbers"><span>{savedChange.sponsorName}</span><strong>{currency(savedChange.previousAmount)} <ArrowUpRight size={14} /> {currency(savedChange.currentAmount)}</strong><em className={savedChange.difference >= 0 ? 'positive' : 'negative'}>{savedChange.difference >= 0 ? '+' : '−'}{currency(Math.abs(savedChange.difference))}</em></div>
          <button className="text-link" onClick={() => { runDemoInvestigation(savedChange.sponsorId); navigate('/ripple') }}>Analyze downstream impact <GitFork size={14} /></button>
        </div>}
      </section>
    </>
  )
}

function SponsorRow({ sponsor }: { sponsor: Sponsor }) {
  const difference = sponsor.currentCommitment - sponsor.previousCommitment
  return <tr>
    <td><div className="sponsor-cell"><span className={`sponsor-avatar avatar-${sponsor.id}`}>{sponsor.initials}</span><span><strong>{sponsor.name}</strong><small>{sponsor.category}</small></span></div></td>
    <td><span className={`status-pill ${sponsor.status.toLowerCase().replace(' ', '-')}`}><i />{sponsor.status}</span></td>
    <td className="table-money">{currency(sponsor.previousCommitment)}</td>
    <td className="table-money current-money">{currency(sponsor.currentCommitment)}</td>
    <td><span className={`delta-pill ${difference > 0 ? 'positive' : difference < 0 ? 'negative' : ''}`}>{difference > 0 ? '+' : difference < 0 ? '−' : ''}{currency(Math.abs(difference))}</span></td>
    <td className="contact-name">{sponsor.contact}</td>
  </tr>
}
