import { useMemo, useState } from 'react'
import { ArrowRight, CircleAlert, GitFork, RefreshCw, Sparkles } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import ImpactGraph from '../components/ImpactGraph'
import { useDemo } from '../context/useDemo'
import { createMockImpactGraph, getConnectedNodeIds } from '../data/mockData'

export default function RippleIntelligence() {
  const { sponsors, latestChange, investigatedSponsorId, runDemoInvestigation } = useDemo()
  const [notice, setNotice] = useState('')
  const selectedSponsorId = investigatedSponsorId ?? sponsors[0]?.id ?? null
  const sponsor = sponsors.find((item) => item.id === selectedSponsorId)
  const totalFunding = sponsors.reduce((sum, item) => sum + item.currentCommitment, 0)
  const graphData = useMemo(() => sponsor ? createMockImpactGraph(sponsor, totalFunding) : { nodes: [], edges: [] }, [sponsor, totalFunding])
  const connectedIds = useMemo(() => selectedSponsorId ? getConnectedNodeIds(graphData, selectedSponsorId) : new Set<string>(), [graphData, selectedSponsorId])
  const affectedCount = graphData.nodes.filter((node) => connectedIds.has(node.id) && (node.severity === 'critical' || node.severity === 'high')).length
  const change = latestChange?.sponsorId === selectedSponsorId ? latestChange : null
  function analyze() {
    if (!selectedSponsorId) return
    runDemoInvestigation(selectedSponsorId)
    setNotice('Analysis refreshed using local demo data.')
  }

  return (
    <>
      <PageHeader eyebrow="DEPENDENCY INTELLIGENCE" title="Ripple Intelligence" description="Trace a funding change through every connected part of your event."
        actions={<button className="button primary" onClick={analyze}><RefreshCw size={15} /> Run analysis</button>} />
      <section className="ripple-summary panel">
        <div className="ripple-summary-icon"><Sparkles size={19} /></div>
        <div className="ripple-summary-copy"><span>ANALYSIS SUBJECT</span><strong>{sponsor?.name ?? 'Select a sponsor'}</strong><small>{change ? `Commitment changed by ${change.difference < 0 ? '−' : '+'}$${Math.abs(change.difference).toLocaleString()}` : 'Explore connected funding and event dependencies'}</small></div>
        <div className="summary-separator" />
        <div className="summary-metric"><strong>{affectedCount}</strong><small>high-impact entities</small></div>
        <div className="summary-metric"><strong>3</strong><small>dependency paths</small></div>
        <span className="demo-label"><i /> MOCK ANALYSIS</span>
      </section>
      {notice && <div className="inline-notice"><CircleAlert size={15} />{notice}<button onClick={() => setNotice('')}>Dismiss</button></div>}
      <div className="ripple-layout">
        <section className="ripple-main">
          <div className="section-title-row"><div><h3>Dependency map</h3><p>Click any node to inspect its details · drag to explore</p></div><span className="node-count">{graphData.nodes.length} entities <span>·</span> {graphData.edges.length} connections</span></div>
          <ImpactGraph sponsorId={selectedSponsorId} graphData={graphData} />
          <div className="graph-disclaimer"><CircleAlert size={14} /><span>Illustrative demo graph. Replace with Member 3’s AI engine output when available.</span></div>
        </section>
        <aside className="impact-side-panel panel">
          <div className="side-panel-title"><span className="side-panel-icon"><GitFork size={16} /></span><div><h3>Impact path</h3><p>What this change touches</p></div></div>
          <div className="path-list">
            {['Sponsor commitment', 'Event operating budget', 'Production team', 'Main stage build', 'Opening showcase'].map((step, index) => (
              <div className={`path-step ${index > 0 ? 'path-affected' : ''}`} key={step}><span className={`path-step-icon ${index > 0 ? 'risk' : ''}`}>{index === 0 ? 'S' : String(index)}</span><div><strong>{step}</strong><small>{index === 0 ? sponsor?.name : ['Budget allocation review', 'Allocation may need revision', 'Due in 6 days', 'Primary event deliverable'][index - 1]}</small></div>{index > 0 && <ArrowRight size={13} />}</div>
            ))}
          </div>
          <div className="impact-explanation"><div><CircleAlert size={15} /><strong>Why it matters</strong></div><p>{change?.difference && change.difference < 0
            ? `A ${Math.round(Math.abs(change.difference) / Math.max(change.previousAmount, 1) * 100)}% reduction in ${sponsor?.name} funding may require a review of production allocations before the main stage build.`
            : `${sponsor?.name ?? 'This sponsor'} funding is connected to the event budget. Review downstream allocations before changing a deliverable.`}</p></div>
          <button className="text-link side-action" onClick={() => setNotice('A deeper investigation will be available when the AI engine is connected.')}>View full investigation <ArrowRight size={14} /></button>
        </aside>
      </div>
    </>
  )
}
