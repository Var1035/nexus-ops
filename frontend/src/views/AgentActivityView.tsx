import React, { useState } from 'react';
import {
  Bot,
  Cpu,
  Clock,
  Sparkles,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AgentActivityView: React.FC = () => {
  const { agentFindings } = useApp();
  const [selectedAgent, setSelectedAgent] = useState<string>('Decision');

  const agentPrompts: Record<string, { role: string; instructions: string; guardrails: string }> = {
    Impact: {
      role: 'Impact Analysis Agent',
      instructions: 'Traverse FalkorDB from disrupted shipment to downstream Bill of Materials and manufacturing facilities. Determine exact hour when buffer stock reaches zero.',
      guardrails: 'Strictly bounded to queried FalkorDB edges. Never hallucinate products or assembly lines not present in the graph.',
    },
    Risk: {
      role: 'Financial & Operational Risk Agent',
      instructions: 'Cross-reference impacted customer orders with contractual SLA penalty clauses and customer priority tiers (Enterprise vs Standard). Calculate daily liquidated damages.',
      guardrails: 'All penalty calculations must stem directly from order contract properties; no speculative arithmetic.',
    },
    Procurement: {
      role: 'Autonomous Procurement Agent',
      instructions: 'Query FalkorDB for alternative vendors supplying identical material specifications. Filter by ISO certification, reliability score > 85%, and available capacity.',
      guardrails: 'Cannot invent fake supplier quotes or fictitious warehouses. Must cite verified supplier IDs.',
    },
    Logistics: {
      role: 'Logistics Optimization Agent',
      instructions: 'Evaluate expedited freight modes (commercial cargo charter vs ocean vs ground). Balance freight surcharge against assembly line downtime cost ($95,000/day).',
      guardrails: 'Transit schedules must reflect active carrier timetables and published airport handling limits.',
    },
    Decision: {
      role: 'Executive Decision Synthesis Agent',
      instructions: 'Synthesize findings from Impact, Risk, Procurement, and Logistics agents into 2-3 structured response options. Recommend the highest utility option with explicit trade-off rationale.',
      guardrails: 'Must provide clear justification for human operator approval; highlights all remaining operational assumptions.',
    },
  };

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
              backgroundColor: 'var(--accent-purple-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot size={22} color="var(--accent-purple)" />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
              Specialized Multi-Agent Swarm
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Coordinated AI agents operating under deterministic grounding guardrails against FalkorDB
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-purple">5 Agents Online</span>
          <span className="badge badge-emerald">Zero-Hallucination Enforced</span>
        </div>
      </div>

      {/* Agents Grid */}
      {agentFindings.length === 0 ? (
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
            <Bot size={24} color="var(--accent-purple)" />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Agent Swarm Standing By
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '440px', margin: 0 }}>
            Zero active multi-agent findings. When an incident is investigated, the 5 specialized AI roles (Impact, Risk, Procurement, Logistics, Decision) will output their step-by-step reasoning traces and grounded graph evidence here.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {agentFindings.map((finding) => {
            const promptInfo = agentPrompts[finding.agentRole];
            const isSelected = selectedAgent === finding.agentRole;

            return (
              <div
                key={finding.id}
                onClick={() => setSelectedAgent(finding.agentRole)}
                className="nexus-card nexus-card-interactive"
                style={{
                  padding: '18px',
                  backgroundColor: isSelected ? 'var(--bg-active)' : 'var(--bg-card)',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-purple">{finding.agentRole} Agent</span>
                    <span className="badge badge-emerald">{finding.confidence}% Confidence</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <Clock size={12} />
                    <span>{finding.executionTimeMs}ms</span>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                    {finding.title}
                  </h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                    {finding.summary}
                  </p>
                </div>

                {/* Metrics */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {Object.entries(finding.metrics).map(([k, v]) => (
                    <span
                      key={k}
                      style={{
                        backgroundColor: 'var(--bg-app)',
                        border: '1px solid var(--border-subtle)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <strong>{k}:</strong> {v}
                    </span>
                  ))}
                </div>

                {/* Grounding & Evidence */}
                <div
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                    Extracted Graph Facts:
                  </div>
                  {finding.evidence.map((ev, i) => (
                    <div key={i} style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                      &bull; {ev}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Agent Grounding Contract Inspector */}
      {selectedAgent && agentPrompts[selectedAgent] && (
        <div className="nexus-card" style={{ padding: '18px 22px', backgroundColor: 'var(--bg-app)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <ShieldCheck size={16} color="var(--accent-emerald)" />
            <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>
              Agent Prompt Contract & Hallucination Guardrail: {selectedAgent} Agent
            </h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '12.5px' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '4px' }}>Target Directive:</div>
              <div style={{ color: 'var(--text-secondary)' }}>{agentPrompts[selectedAgent].instructions}</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, color: 'var(--accent-rose)', marginBottom: '4px' }}>Strict Verification Rule:</div>
              <div style={{ color: 'var(--text-secondary)' }}>{agentPrompts[selectedAgent].guardrails}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
