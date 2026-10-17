import React from 'react';
import {
  Truck,
  Ship,
  Plane,
  AlertTriangle,
  Clock,
  Warehouse,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ShipmentsView: React.FC = () => {
  const { shipments, setActiveSection, runInvestigation } = useApp();

  const criticalShipment = shipments.find((s) => s.currentStatus === 'CRITICAL_DELAY');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Inventory Buffer Warning Banner - Dynamic */}
      {criticalShipment && (
        <div
          className="nexus-card"
          style={{
            padding: '18px 22px',
            backgroundColor: 'var(--accent-amber-subtle)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--accent-amber)',
              }}
            >
              <Warehouse size={22} color="var(--accent-amber)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-amber">CRITICAL BUFFER STOCK THRESHOLD</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Warehouse: {criticalShipment.destination}</span>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '2px 0 0 0' }}>
                {criticalShipment.material} delayed by +{criticalShipment.delayDays} days
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Carried by {criticalShipment.carrier} ({criticalShipment.quantity.toLocaleString()} units) &bull; Origin: {criticalShipment.origin}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveSection('incidents');
            }}
            className="btn btn-primary"
            style={{ fontSize: '12.5px', padding: '8px 16px' }}
          >
            <span>Investigate in War Room</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Active Shipments Table */}
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
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>In-Transit Freight Telemetry</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Live shipments linked to graph nodes via [:CARRIES] and [:DELIVERED_TO]
            </span>
          </div>
          <span className="badge badge-cyan">{shipments.length} Active Shipments</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Tracking & Carrier</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Cargo & Quantity</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Route</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Scheduled ETA</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Variance / Delay</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {shipments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px 18px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Truck size={32} style={{ margin: '0 auto 8px', opacity: 0.4, display: 'block' }} />
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      No In-Transit Shipments
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Shipment tracking will populate live upon graph synchronization with carrier telemetry.
                    </div>
                  </td>
                </tr>
              ) : (
                shipments.map((shipment) => (
                  <tr
                    key={shipment.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: shipment.currentStatus === 'CRITICAL_DELAY' ? 'rgba(244, 63, 94, 0.04)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {shipment.trackingCode}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{shipment.carrier}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600 }}>{shipment.material}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{shipment.quantity.toLocaleString()} units</div>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {shipment.origin} &rarr; {shipment.destination}
                    </td>
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)' }}>{shipment.scheduledEta}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: shipment.delayDays > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                        }}
                      >
                        {shipment.delayDays > 0 ? `+${shipment.delayDays} Days` : 'On Time'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        className={`badge ${
                          shipment.currentStatus === 'CRITICAL_DELAY'
                            ? 'badge-rose'
                            : shipment.currentStatus === 'DELAYED'
                            ? 'badge-amber'
                            : 'badge-emerald'
                        }`}
                      >
                        {shipment.currentStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
