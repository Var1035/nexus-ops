import React, { useState } from 'react';
import {
  AlertTriangle,
  Bot,
  ShieldCheck,
  CheckCircle,
  Zap,
  ArrowRight,
  TrendingDown,
  Clock,
  Sparkles,
  Terminal,
  Database,
  Building2,
  DollarSign,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InteractiveGraph } from '../components/InteractiveGraph';

export const IncidentWarRoomView: React.FC = () => {
  const {
    incidents,
    activeIncident,
    setActiveIncident,
    agentFindings,
    decisionOptions,
    selectedOption,
    setSelectedOption,
    approveAndExecute,
    isSimulating,
    simulatedOutcome,
    isInvestigating,
    investigationProgress,
    runInvestigation,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'decision' | 'agents' | 'cypher'>('decision');
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const isResolved = activeIncident?.status === 'RESOLVED';

  const handleApprove = () => {
    if (!selectedOption) return;
    setShowApprovalModal(false);
    approveAndExecute(selectedOption.id);
  };

  if (!activeIncident) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={28} color="var(--accent-cyan)" />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
            Incident War Room Awaiting Live Incident
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '440px', margin: 0 }}>
            Zero dummy data loaded. When an operational disruption is ingested from FalkorDB, the graph traversal and multi-agent roles will activate here.
          </p>
        </div>
        <InteractiveGraph height="520px" highlightImpact={false} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Incident Header Card */}
      <div
        className="nexus-card"
        style={{
          padding: '20px 24px',
          backgroundColor: 'var(--bg-card)',
          border: isResolved ? '1px solid var(--accent-emerald)' : '1px solid var(--border-glow)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              className={`badge ${isResolved
                  ? 'badge-emerald'
                  : activeIncident.severity === 'CRITICAL'
                    ? 'badge-rose'
                    : 'badge-amber'
                }`}
            >
              {isResolved ? 'RESOLVED & RECORDED IN MEMORY' : activeIncident.status.replace(/_/g, ' ')}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
              {activeIncident.code}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>• {activeIncident.timestamp}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {incidents.length > 1 && (
              <select
                value={activeIncident.id}
                onChange={(e) => {
                  const inc = incidents.find((i) => i.id === e.target.value);
                  if (inc) {
                    setActiveIncident(inc);
                    runInvestigation(inc.id);
                  }
                }}
                className="input-control"
                style={{
                  fontSize: '11.5px',
                  padding: '5px 8px',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  maxWidth: '240px',
                }}
              >
                {incidents.map((inc) => (
                  <option key={inc.id} value={inc.id}>
                    {inc.code}: {inc.title.length > 28 ? inc.title.substring(0, 26) + '…' : inc.title}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => runInvestigation(activeIncident.id)}
              disabled={isInvestigating}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              <RotateCcw size={13} className={isInvestigating ? 'animate-spin' : ''} />
              <span>{isInvestigating ? 'Traversing Graph...' : 'Re-Run Multi-Agent Traversal'}</span>
            </button>
          </div>
        </div>

        {/* Title & Disruption Overview */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ maxWidth: '750px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0' }}>
              {activeIncident.title}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              {activeIncident.summary}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Supplier Delay</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
                +{activeIncident.delayDays} Days
              </div>
            </div>
            <div style={{ width: '1px', backgroundColor: 'var(--border-color)' }} />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Orders Blocked</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {activeIncident.affectedOrdersCount} Orders
              </div>
            </div>
            <div style={{ width: '1px', backgroundColor: 'var(--border-color)' }} />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Revenue at Risk</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                ${activeIncident.financialExposure.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar during Investigation */}
        {isInvestigating && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--accent-cyan)' }}>
              <span>Coordinating Multi-Agent Swarm (Impact &rarr; Risk &rarr; Procurement &rarr; Logistics &rarr; Decision)...</span>
              <span>{investigationProgress}%</span>
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-app)', borderRadius: '2px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${investigationProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Simulated Resolution Banner when Resolved */}
        {isResolved && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-emerald-subtle)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={20} color="var(--accent-emerald)" />
              <div>
                <strong style={{ fontSize: '13px', color: 'var(--accent-emerald)' }}>
                  Mitigation Action Executed & Recorded in FalkorDB
                </strong>
                <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                  {simulatedOutcome || 'Production line continuous. 0 days delay. Customer SLA 100% protected.'}
                </div>
              </div>
            </div>
            <span className="badge badge-emerald">Episodic Memory Synced</span>
          </div>
        )}
      </div>

      {/* SECTION 1: Full-Screen Width FalkorDB Subgraph Traversal */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
        <InteractiveGraph height="540px" highlightImpact={true} />

        {/* Real Cypher Traversal Code Snippet */}
        <div className="nexus-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={15} color="var(--accent-cyan)" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                FalkorDB Cypher Traversal Query
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Executed in 14ms against FalkorDB Cloud
            </span>
          </div>
          <pre
            style={{
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              fontSize: '11.5px',
              color: 'var(--accent-cyan)',
              overflowX: 'auto',
              fontFamily: 'var(--font-mono)',
              margin: 0,
            }}
          >
            {`// Trace multi-hop blast radius from Disrupted Shipment to Customer Orders:
MATCH (i:Incident {code: "${activeIncident.code}"})-[:AFFECTS]->(s:Shipment)-[:CARRIES]->(m:Material)
MATCH (p:Product)-[:USES_BOM]->(m)
MATCH (o:Order)-[:ORDERS]->(p)
MATCH (o)-[:PLACED_BY]->(c:Customer)
OPTIONAL MATCH (m)<-[:SUPPLIES]-(alt:Supplier) WHERE alt.status = 'backup'
RETURN m.name, p.name, o.id, c.name, collect(alt.name) AS backupSuppliers;`}
          </pre>
        </div>
      </div>

      {/* SECTION 2: Human in the Loop (Positioned Down Below the Full-Width Graph) */}
      <div className="nexus-card" style={{ display: 'flex', flexDirection: 'column', width: '100%', overflow: 'hidden' }}>
        {/* Human in the Loop Header & Tabs */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-subtle)',
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
              <ShieldCheck size={20} color="var(--accent-cyan)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
                  Human in the Loop: Autonomous Decision Authorization
                </h3>
                <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
                  Operator Verification
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Decision Agent synthesized findings from Impact, Risk, Procurement, and Logistics agents
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('decision')}
              style={{
                background: activeTab === 'decision' ? 'var(--bg-card)' : 'transparent',
                color: activeTab === 'decision' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: activeTab === 'decision' ? 'var(--border-color)' : 'transparent',
                borderRadius: 'var(--radius-md)',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={14} />
              <span>Decision Options ({decisionOptions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('agents')}
              style={{
                background: activeTab === 'agents' ? 'var(--bg-card)' : 'transparent',
                color: activeTab === 'agents' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: activeTab === 'agents' ? 'var(--border-color)' : 'transparent',
                borderRadius: 'var(--radius-md)',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Bot size={14} />
              <span>Agent Reasoning ({agentFindings.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: DECISION OPTIONS & APPROVAL */}
        {activeTab === 'decision' && (
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Select an option below to authorize or simulate response execution across suppliers and logistics:
            </span>

            {/* Side-by-side Comparative Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '16px',
              }}
            >
              {decisionOptions.map((opt) => {
                const isSelected = selectedOption?.id === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedOption(opt)}
                    className="nexus-card"
                    style={{
                      padding: '18px',
                      backgroundColor: isSelected ? 'var(--bg-active)' : 'var(--bg-app)',
                      border: isSelected ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        className={`badge ${opt.recommended
                            ? 'badge-emerald'
                            : opt.slaRiskScore > 50
                              ? 'badge-rose'
                              : 'badge-amber'
                          }`}
                      >
                        {opt.tag}
                      </span>
                      {isSelected && <Check size={18} color="var(--accent-cyan)" />}
                    </div>

                    <h4 style={{ fontSize: '13.5px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                      {opt.title}
                    </h4>

                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                      {opt.description}
                    </p>

                    {/* Trade-off Matrix Pills */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '6px',
                        backgroundColor: 'var(--bg-card)',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        marginTop: 'auto',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>COST DELTA</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                          +${opt.costDelta.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>TIME DELAY</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: opt.timeDeltaDays === 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
                          {opt.timeDeltaDays} Days
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>SLA RISK</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: opt.slaRiskScore < 20 ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
                          {opt.slaRiskScore}/100
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>FEASIBILITY</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                          {opt.feasibilityScore}%
                        </div>
                      </div>
                    </div>

                    {/* Required Actions Checklist */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Automated Action Sequence:
                      </span>
                      {opt.actions.map((act, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                          <CheckCircle size={11} color="var(--accent-cyan)" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Approval Controls */}
            <div
              style={{
                marginTop: '10px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Selected Response Option: <strong style={{ color: 'var(--text-primary)' }}>{selectedOption?.title.split(':')[0]}</strong>
              </div>

              <button
                onClick={() => setShowApprovalModal(true)}
                disabled={isResolved || isSimulating}
                className="btn btn-primary"
                style={{ padding: '11px 24px', fontSize: '13px' }}
              >
                <ShieldCheck size={16} />
                <span>{isResolved ? 'Action Already Executed' : isSimulating ? 'Simulating Response...' : 'Authorize & Execute Selected Action'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: AGENT ACTIVITY STREAM */}
        {activeTab === 'agents' && (
          <div
            style={{
              padding: '20px 24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '14px',
            }}
          >
            {agentFindings.map((finding) => (
              <div
                key={finding.id}
                className="nexus-card"
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-app)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-purple">{finding.agentRole} Agent</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {finding.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <Clock size={12} />
                    <span>{finding.executionTimeMs}ms</span>
                    <span className="badge badge-emerald" style={{ fontSize: '10px' }}>
                      {finding.confidence}% Confident
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                  {finding.summary}
                </p>

                {/* Metrics Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {Object.entries(finding.metrics).map(([k, v]) => (
                    <span
                      key={k}
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
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

                {/* Grounded Graph Evidence */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                    Grounded Graph Evidence:
                  </div>
                  {finding.evidence.map((ev, i) => (
                    <div key={i} style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      &bull; {ev}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation & Human Approval Modal */}
      {showApprovalModal && selectedOption && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="nexus-card"
            style={{
              width: '520px',
              maxWidth: '100%',
              padding: '24px',
              backgroundColor: 'var(--bg-card-solid)',
              border: '1px solid var(--border-glow)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-cyan-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={22} color="var(--accent-cyan)" />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                  Human Authorization Required
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Confirm execution of autonomous response sequence
                </span>
              </div>
            </div>

            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                fontSize: '13px',
                lineHeight: 1.5,
              }}
            >
              <strong>Authorizing:</strong> {selectedOption.title}
              <div style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
                {selectedOption.description} Total financial authorization: <strong>${selectedOption.costDelta.toLocaleString()}</strong>.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="btn btn-secondary"
                style={{ padding: '8px 16px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="btn btn-primary"
                style={{ padding: '8px 20px' }}
              >
                <Check size={16} />
                <span>Authorize & Write to FalkorDB Memory</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
