import React, { useState } from 'react';
import {
  BrainCircuit,
  Search,
  Database,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Terminal,
  History,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CompanyBrainView: React.FC = () => {
  const { history } = useApp();
  const [searchMemory, setSearchMemory] = useState('');

  const filteredHistory = history.filter(
    (h) =>
      h.title.toLowerCase().includes(searchMemory.toLowerCase()) ||
      h.disruptedEntity.toLowerCase().includes(searchMemory.toLowerCase()) ||
      h.decisionChosen.toLowerCase().includes(searchMemory.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div
        className="nexus-card"
        style={{
          padding: '18px 22px',
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
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BrainCircuit size={22} color="#FFFFFF" />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
              Company Brain & Episodic Incident Memory
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              FalkorDB graph stores historical incidents, agent findings, decisions, actions, and verified outcomes
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-purple">{history.length} Memories Stored</span>
          <span className="badge badge-emerald">Active Learning Enabled</span>
        </div>
      </div>

      {/* Memory Search & Cypher Formula Banner */}
      <div
        className="nexus-card"
        style={{
          padding: '16px 20px',
          backgroundColor: 'var(--bg-app)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search past memories, supplier disruptions..."
            value={searchMemory}
            onChange={(e) => setSearchMemory(e.target.value)}
            className="input-control"
            style={{ paddingLeft: '32px', height: '36px', width: '100%', fontSize: '12px' }}
          />
        </div>

        {/* Ontology Chain Visual */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--accent-rose)' }}>(:Incident)</span>
          <span style={{ color: 'var(--text-muted)' }}>&rarr; [:INVESTIGATED_BY] &rarr;</span>
          <span style={{ color: 'var(--accent-purple)' }}>(:AgentFinding)</span>
          <span style={{ color: 'var(--text-muted)' }}>&rarr; [:LEADS_TO] &rarr;</span>
          <span style={{ color: 'var(--accent-cyan)' }}>(:Action)</span>
          <span style={{ color: 'var(--text-muted)' }}>&rarr; [:HAS_OUTCOME] &rarr;</span>
          <span style={{ color: 'var(--accent-emerald)' }}>(:Outcome)</span>
        </div>
      </div>

      {/* Historical Incidents Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredHistory.length === 0 ? (
          <div
            className="nexus-card"
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <History size={24} color="var(--accent-purple)" />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              No Episodic Memories Stored Yet
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '440px', margin: 0 }}>
              When supply chain disruptions are investigated and resolved by human operators, the full decision trace, actions, and verified outcomes are written into FalkorDB episodic memory graph.
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="nexus-card"
              style={{
                padding: '18px 22px',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge badge-cyan">{item.incidentCode}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.date}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-purple)' }}>
                    {item.falkorDbKey}
                  </span>
                </div>
                <span className="badge badge-emerald">Verified Outcome</span>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0' }}>
                  {item.title}
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong>Disrupted Entity:</strong> {item.disruptedEntity}
                </div>
              </div>

              {/* Decision & Action Sequence */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  backgroundColor: 'var(--bg-app)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '3px' }}>Decision Chosen:</div>
                  <div style={{ color: 'var(--text-primary)' }}>{item.decisionChosen}</div>
                </div>

                <div>
                  <div style={{ fontWeight: 600, color: 'var(--accent-emerald)', marginBottom: '3px' }}>Recorded Action:</div>
                  <div style={{ color: 'var(--text-primary)' }}>{item.actionExecuted}</div>
                </div>
              </div>

              {/* Outcome Delta */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '10px',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  <TrendingUp size={15} />
                  <span>{item.outcomeMetric}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {item.financialDelta}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
