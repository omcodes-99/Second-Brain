export default function LoadingState({ label = 'Loading your workspace…' }: { label?: string }) {
  return <div className="loading-state"><span className="spinner" />{label}</div>
}
