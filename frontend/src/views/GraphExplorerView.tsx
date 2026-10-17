import React, { useState } from 'react';
import {
  Network,
  Search,
  Filter,
  Maximize2,
  RefreshCw,
  Info,
  Terminal,
  Database,
  Layers,
} from 'lucide-react';
import { InteractiveGraph } from '../components/InteractiveGraph';
import { useApp } from '../context/AppContext';

export const GraphExplorerView: React.FC = () => {
  const { systemStats } = useApp();
  const [cypherQuery, setCypherQuery] = useState(
    'MATCH (s:Supplier)-[:SUPPLIES]->(m:Material)<-[:USES_BOM]-(p:Product)<-[:ORDERS]-(o:Order) RETURN s, m, p, o LIMIT 50'
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Controls Header */}
      <div
        className="nexus-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-cyan-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Network size={20} color="var(--accent-cyan)" />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
              FalkorDB Supply Chain Topology
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Connected ontology linking suppliers, shipments, BOM, factories, and orders
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge badge-cyan" style={{ fontSize: '11px' }}>
            {systemStats.graphNodeCount} Nodes Loaded
          </span>
          <span className="badge badge-purple" style={{ fontSize: '11px' }}>
            {systemStats.graphEdgeCount} Relationships
          </span>
          <span className="badge badge-emerald" style={{ fontSize: '11px' }}>
            FalkorDB In-Memory
          </span>
        </div>
      </div>

      {/* Main Full-Size Graph Canvas */}
      <InteractiveGraph height="560px" highlightImpact={true} />

      {/* Interactive Cypher Query Console */}
      <div className="nexus-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={15} color="var(--accent-cyan)" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Live Cypher Graph Console
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Queries execute directly against FalkorDB Cypher Engine
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={cypherQuery}
            onChange={(e) => setCypherQuery(e.target.value)}
            className="input-control font-mono"
            style={{ flex: 1, fontSize: '12px' }}
          />
          <button className="btn btn-primary" style={{ padding: '0 16px', fontSize: '12px' }}>
            Execute Cypher
          </button>
        </div>
      </div>
    </div>
  );
};
