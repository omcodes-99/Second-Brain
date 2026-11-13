import { useMemo, useState } from 'react'
import { Activity, CalendarDays, Filter } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import ActivityList from '../components/ui/ActivityList'
import { useDemo } from '../context/useDemo'
import type { ActivityType } from '../types'

const filters: { label: string; value: ActivityType | 'all' }[] = [
  { label: 'All activity', value: 'all' },
  { label: 'Funding', value: 'funding' },
  { label: 'Investigations', value: 'investigation' },
  { label: 'Approvals', value: 'approval' },
  { label: 'Workspace', value: 'system' },
]

export default function ActivityHistory() {
  const { activity } = useDemo()
  const [filter, setFilter] = useState<ActivityType | 'all'>('all')
  const events = useMemo(() => activity.filter((event) => filter === 'all' || event.type === filter), [activity, filter])
  return (
    <>
      <PageHeader eyebrow="AUDIT TRAIL" title="Activity history" description="See the decisions, investigations and updates across your event." />
      <section className="panel history-panel">
        <div className="history-toolbar"><div className="history-total"><Activity size={17} /><strong>{events.length}</strong><span>events</span></div><div className="history-controls"><span className="history-date"><CalendarDays size={14} />All time</span><label className="filter-control"><Filter size={14} /><select aria-label="Filter activity" value={filter} onChange={(event) => setFilter(event.target.value as ActivityType | 'all')}>{filters.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label></div></div>
        <div className="history-date-label">RECENT ACTIVITY</div>
        <ActivityList events={events} />
        {!events.length && <div className="empty-panel"><Activity size={21} /><strong>No matching activity</strong><span>Choose another filter to see more events.</span></div>}
      </section>
    </>
  )
}
