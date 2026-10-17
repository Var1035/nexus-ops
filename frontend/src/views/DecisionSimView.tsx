import React, { useState } from 'react';
import {
  Sliders,
  Play,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Clock,
  ShieldAlert,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DecisionSimView: React.FC = () => {
  const { decisionOptions, approveAndExecute } = useApp();

  const [simulatedDelay, setSimulatedDelay] = useState<number>(10);
  const [useBackupSupplier, setUseBackupSupplier] = useState<boolean>(true);
  const [useAirExpedite, setUseAirExpedite] = useState<boolean>(true);
  const [prioritizeVipOrders, setPrioritizeVipOrders] = useState<boolean>(true);

  // Dynamic calculations based on simulation parameters
  const bufferDays = 3;
  const daysOverBuffer = Math.max(0, simulatedDelay - bufferDays);

  const baseLineDowntimeHours = useBackupSupplier
    ? 0
    : useAirExpedite
    ? Math.max(0, (simulatedDelay - 6) * 24)
    : daysOverBuffer * 24;

  const expeditedLogisticsCost = useAirExpedite ? 6500 : 0;
  const procurementDeltaCost = useBackupSupplier ? 7200 : 0;
  const totalMitigationCost = expeditedLogisticsCost + procurementDeltaCost;

  const slaPenalties = useBackupSupplier
    ? 0
    : prioritizeVipOrders
    ? Math.round(baseLineDowntimeHours * 450)
    : Math.round(baseLineDowntimeHours * 1250);

  const netSavingsVsUnmitigated = Math.max(0, simulatedDelay * 12500 - totalMitigationCost - slaPenalties);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
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
              backgroundColor: 'var(--accent-cyan-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sliders size={22} color="var(--accent-cyan)" />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
              What-If Supply Chain Scenario Simulator
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Model custom disruption lengths, freight expedites, and supplier dual-sourcing outcomes
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setSimulatedDelay(10);
            setUseBackupSupplier(true);
            setUseAirExpedite(true);
          }}
          className="btn btn-secondary"
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          <RotateCcw size={13} />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Simulator Controls & Real-Time Projections Split */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(360px, 1fr) minmax(420px, 1.2fr)',
          gap: '20px',
        }}
      >
        {/* Controls Card */}
        <div className="nexus-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Simulation Parameters</h3>

          {/* Delay Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Supplier Delay Duration:</span>
              <strong style={{ color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
                +{simulatedDelay} Days
              </strong>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={simulatedDelay}
              onChange={(e) => setSimulatedDelay(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted)' }}>
              <span>1 Day (Minor)</span>
              <span>15 Days (Severe)</span>
              <span>30 Days (Catastrophic)</span>
            </div>
          </div>

          {/* Action Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '13px' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Switch to Qualified Backup Supplier</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Lead time: 3 days, Cost: +₹7,200</div>
              </div>
              <input
                type="checkbox"
                checked={useBackupSupplier}
                onChange={(e) => setUseBackupSupplier(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-emerald)' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '13px' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Charter Priority Air Cargo</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Reduces transit by 6 days, Cost: +₹6,500</div>
              </div>
              <input
                type="checkbox"
                checked={useAirExpedite}
                onChange={(e) => setUseAirExpedite(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '13px' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Prioritize Enterprise Tier-1 Orders</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Protects high-value contracts, reschedules standard orders</div>
              </div>
              <input
                type="checkbox"
                checked={prioritizeVipOrders}
                onChange={(e) => setPrioritizeVipOrders(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-purple)' }}
              />
            </label>
          </div>
        </div>

        {/* Projected Outcomes Card */}
        <div className="nexus-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Projected Simulation Impact</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            <div style={{ padding: '14px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>LINE DOWNTIME</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: baseLineDowntimeHours === 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
                {baseLineDowntimeHours} Hours
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {baseLineDowntimeHours === 0 ? 'Continuous manufacturing preserved' : 'Assembly Line 3 halted'}
              </div>
            </div>

            <div style={{ padding: '14px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SLA LIQUIDATED DAMAGES</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: slaPenalties === 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
                ₹{slaPenalties.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {slaPenalties === 0 ? 'Zero customer SLA breach' : 'Penalties incurred from delay'}
              </div>
            </div>

            <div style={{ padding: '14px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ACTION SURCHARGE</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                ₹{totalMitigationCost.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Air freight + procurement delta
              </div>
            </div>

            <div style={{ padding: '14px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>NET SAVINGS AVOIDED</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                ₹{netSavingsVsUnmitigated.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Compared to unmitigated fallout
              </div>
            </div>
          </div>

          {/* AI Recommendation Summary */}
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-cyan-subtle)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              fontSize: '12.5px',
              lineHeight: 1.45,
            }}
          >
            <strong>Decision Agent Assessment:</strong> Combining dual-sourcing with expedited logistics minimizes line stoppage risk, saving an estimated net <strong>₹{netSavingsVsUnmitigated.toLocaleString()}</strong> in downtime and contractual SLA penalties.
          </div>
        </div>
      </div>
    </div>
  );
};
