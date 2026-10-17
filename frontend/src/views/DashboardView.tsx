import React from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  ArrowRight,
  TrendingDown,
  Building2,
  Box,
  Truck,
  Zap,
  CheckCircle2,
  Cpu,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InteractiveGraph } from '../components/InteractiveGraph';

export const DashboardView: React.FC = () => {
  const { incidents, orders, systemStats, setActiveSection, setActiveIncident, runInvestigation } = useApp();

  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');
  const criticalIncident = activeIncidents[0] || incidents[0];
  const criticalCount = activeIncidents.filter((i) => i.severity === 'CRITICAL').length;
  const highCount = activeIncidents.filter((i) => i.severity === 'HIGH').length;
  const atRiskOrdersCount = orders.filter((o) => o.status === 'AT_RISK').length;

  const handleInvestigate = (incId: string) => {
    const inc = incidents.find((i) => i.id === incId);
    if (inc) setActiveIncident(inc);
    runInvestigation(incId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Hero Alert Banner */}
      {criticalIncident && criticalIncident.status !== 'RESOLVED' && (
        <div
          className="nexus-card"
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(17, 26, 44, 0.8) 100%)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            boxShadow: 'var(--shadow-glow-rose)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(244, 63, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--accent-rose)',
              }}
            >
              <AlertTriangle size={24} color="var(--accent-rose)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-rose">CRITICAL DISRUPTION ACTIVE</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{criticalIncident.code}</span>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                {criticalIncident.title}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, maxWidth: '650px' }}>
                {criticalIncident.summary}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>FINANCIAL EXPOSURE</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
                ₹{criticalIncident.financialExposure.toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => handleInvestigate(criticalIncident.id)}
              className="btn btn-danger"
              style={{ padding: '10px 18px', fontSize: '13px' }}
            >
              <Zap size={16} />
              <span>Launch War Room</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Ribbon */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <div className="nexus-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              ACTIVE DISRUPTIONS
            </span>
            <AlertTriangle size={18} color="var(--accent-rose)" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {activeIncidents.length} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accent-rose)' }}>Incidents</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {activeIncidents.length > 0 ? `${criticalCount} Critical, ${highCount} High priority` : 'Zero active disruptions'}
          </div>
        </div>

        <div className="nexus-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              REVENUE AT RISK
            </span>
            <ShieldAlert size={18} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
            ₹{systemStats.atRiskRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {atRiskOrdersCount > 0 ? `Across ${atRiskOrdersCount} downstream purchase orders` : 'No revenue exposure'}
          </div>
        </div>

        <div className="nexus-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              AFFECTED CUSTOMER ORDERS
            </span>
            <TrendingDown size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {atRiskOrdersCount} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accent-cyan)' }}>Orders</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {atRiskOrdersCount > 0 ? `${atRiskOrdersCount} orders requiring schedule buffer` : 'All customer SLAs on schedule'}
          </div>
        </div>

        <div className="nexus-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              FALKORDB TRAVERSAL
            </span>
            <Cpu size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
            {systemStats.falkorDbStatus === 'CONNECTED' ? '14ms' : '0ms'} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Latency</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {systemStats.graphNodeCount} nodes, {systemStats.graphEdgeCount} relationships in graph
          </div>
        </div>
      </div>

      {/* Main Grid: Incident Table & Interactive Blast-Radius Preview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(420px, 1.2fr) minmax(360px, 1fr)',
          gap: '20px',
        }}
        className="dashboard-main-grid"
      >
        {/* Active Incidents Table */}
        <div className="nexus-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Active Supply Disruptions</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Directly queried from FalkorDB [:AFFECTS] relationships
              </span>
            </div>
            <button
              onClick={() => setActiveSection('incidents')}
              className="btn btn-secondary"
              style={{ fontSize: '11.5px', padding: '5px 10px' }}
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {incidents.length === 0 ? (
              <div
                style={{
                  padding: '36px 16px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle2 size={22} color="var(--accent-emerald)" />
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  No Active Disruptions Detected
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '340px' }}>
                  All inbound supplier shipments and manufacturing schedules operating normally. Supply chain graph continuously monitored via FalkorDB.
                </div>
              </div>
            ) : (
              incidents.map((inc) => (
                <div
                  key={inc.id}
                  className="nexus-card nexus-card-interactive"
                  style={{
                    padding: '14px 16px',
                    backgroundColor: 'var(--bg-app)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                  onClick={() => handleInvestigate(inc.id)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        className={`badge ${
                          inc.severity === 'CRITICAL'
                            ? 'badge-rose'
                            : inc.severity === 'HIGH'
                            ? 'badge-amber'
                            : 'badge-emerald'
                        }`}
                      >
                        {inc.severity}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {inc.code}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>• {inc.timestamp}</span>
                    </div>
                    <h4 style={{ fontSize: '13.5px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                      {inc.title}
                    </h4>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {inc.supplierName} • {inc.materialName} ({inc.delayDays}d delay)
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>EXPOSURE</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        ₹{inc.financialExposure.toLocaleString()}
                      </div>
                    </div>
                    <button
                      className={`btn ${inc.status === 'RESOLVED' ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ fontSize: '11.5px', padding: '6px 12px' }}
                    >
                      {inc.status === 'RESOLVED' ? 'Inspect History' : 'Investigate'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Subgraph Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <InteractiveGraph height="440px" />
        </div>
      </div>
    </div>
  );
};
