import { useMemo, useState } from 'react'
import { Background, Controls, Handle, MiniMap, Position, ReactFlow, type Edge, type Node, type NodeProps } from '@xyflow/react'
import { Building2, CircleDollarSign, ClipboardCheck, Handshake, Layers3, X } from 'lucide-react'
import { getConnectedNodeIds } from '../data/mockData'
import type { GraphEntityType, ImpactGraphData, ImpactGraphNode } from '../types'

const typeLabels: Record<GraphEntityType, string> = {
  sponsor: 'Sponsor',
  budget: 'Budget',
  department: 'Department',
  task: 'Task',
  deliverable: 'Deliverable',
}
const icons = {
  sponsor: Handshake,
  budget: CircleDollarSign,
  department: Building2,
  task: ClipboardCheck,
  deliverable: Layers3,
}

interface FlowNodeData extends Record<string, unknown> {
  item: ImpactGraphNode
  affected: boolean
  selected: boolean
}

function ImpactNode({ data }: NodeProps<Node<FlowNodeData>>) {
  const { item, affected, selected } = data
  const Icon = icons[item.type]
  return (
    <div className={`impact-node ${item.type} severity-${item.severity}${affected ? ' affected' : ''}${selected ? ' selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      <div className="impact-node-top"><span className="impact-node-icon"><Icon size={15} /></span><span className={`severity-dot ${item.severity}`} /></div>
      <span className="impact-node-type">{typeLabels[item.type]}</span>
      <strong>{item.title}</strong>
      <p>{item.detail}</p>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

export default function ImpactGraph({ sponsorId, graphData }: { sponsorId: string | null; graphData: ImpactGraphData }) {
  const nodeTypes = useMemo(() => ({ impact: ImpactNode }), [])
  const [selectedNode, setSelectedNode] = useState<ImpactGraphNode | null>(null)
  const connectedIds = useMemo(() => {
    return sponsorId ? getConnectedNodeIds(graphData, sponsorId) : new Set<string>()
  }, [sponsorId, graphData])

  const nodes: Node<FlowNodeData>[] = useMemo(() => graphData.nodes.map((item) => ({
    id: item.id,
    type: 'impact',
    position: { x: item.x, y: item.y },
    data: { item, affected: connectedIds.has(item.id), selected: selectedNode?.id === item.id },
  })), [connectedIds, graphData, selectedNode])
  const edges: Edge[] = useMemo(() => graphData.edges.map((edge) => ({
    ...edge,
    animated: connectedIds.has(edge.source) && connectedIds.has(edge.target),
    className: connectedIds.has(edge.source) && connectedIds.has(edge.target) ? 'affected-edge' : '',
    labelStyle: { fill: '#8a94aa', fontSize: 10 },
  })), [connectedIds, graphData])

  return (
    <div className="graph-shell">
      <div className="graph-toolbar">
        <div><span className="graph-live-dot" />LIVE DEPENDENCY MAP</div>
        <div className="graph-legend"><span><i className="legend-dot critical" />Critical</span><span><i className="legend-dot high" />High impact</span><span><i className="legend-dot neutral" />Connected</span></div>
      </div>
      <div className="graph-canvas">
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodeClick={(_, node) => setSelectedNode(node.data.item)}
          fitView minZoom={0.35} maxZoom={1.2} fitViewOptions={{ padding: 0.18 }}>
          <Background color="#293143" gap={22} size={1} />
          <MiniMap nodeColor={(node) => {
            const severity = (node.data as FlowNodeData).item.severity
            return severity === 'critical' ? '#f27786' : severity === 'high' ? '#efa85d' : '#59647c'
          }} maskColor="rgba(13, 17, 26, 0.72)" />
          <Controls />
        </ReactFlow>
        {selectedNode && (
          <aside className="node-inspector">
            <button className="inspector-close" onClick={() => setSelectedNode(null)} aria-label="Close details"><X size={15} /></button>
            <div className="eyebrow">{typeLabels[selectedNode.type]}</div>
            <h3>{selectedNode.title}</h3>
            <p>{selectedNode.detail}</p>
            <div className={`inspector-impact ${selectedNode.severity}`}>Impact level <strong>{selectedNode.severity}</strong></div>
            {connectedIds.has(selectedNode.id) && <span className="affected-tag">Affected by this change</span>}
          </aside>
        )}
      </div>
    </div>
  )
}
