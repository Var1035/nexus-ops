import React from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  Clock,
  Building,
  Users,
  DollarSign,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OrdersView: React.FC = () => {
  const { orders } = useApp();

  const atRiskOrders = orders.filter((o) => o.status === 'AT_RISK');
  const atRiskVal = atRiskOrders.reduce((sum, o) => sum + o.value, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top SLA Financial Exposure Header */}
      <div
        className="nexus-card"
        style={{
          padding: '18px 22px',
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
              backgroundColor: 'var(--accent-amber-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldAlert size={22} color="var(--accent-amber)" />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
              Customer Purchase Orders & SLA Commitments
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Connected orders linked to BOM products via [:ORDERS] and [:PLACED_BY]
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>AT-RISK ORDER REVENUE</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
              ₹{atRiskVal.toLocaleString()}
            </div>
          </div>

          <div
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>TOTAL PIPELINE VALUE</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              ₹{orders.reduce((sum, o) => sum + o.value, 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="nexus-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Customer & Account</th>
              <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Client Priority Tier</th>
              <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Product & Units</th>
              <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Contract Value</th>
              <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Delivery Deadline</th>
              <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>SLA Penalty / Day</th>
              <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Fulfillment Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '36px 18px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <FileText size={32} style={{ margin: '0 auto 8px', opacity: 0.4, display: 'block' }} />
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    No Customer Orders Found
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Customer purchase order nodes will load from FalkorDB graph ontology.
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((ord) => (
                <tr
                  key={ord.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: ord.status === 'AT_RISK' ? 'rgba(244, 63, 94, 0.04)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ord.customerName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{ord.id.toUpperCase()}</div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      className={`badge ${
                        ord.tier.includes('Tier-1')
                          ? 'badge-rose'
                          : ord.tier.includes('Tier-2')
                          ? 'badge-cyan'
                          : 'badge-gray'
                      }`}
                    >
                      {ord.tier}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600 }}>{ord.productName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ord.quantity} Units</div>
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    ₹{ord.value.toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)' }}>{ord.deadline}</td>
                  <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', color: 'var(--accent-rose)', fontWeight: 600 }}>
                    ₹{ord.slaPenaltyPerDay.toLocaleString()} / day
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      className={`badge ${
                        ord.status === 'AT_RISK' ? 'badge-rose' : 'badge-emerald'
                      }`}
                    >
                      {ord.status === 'AT_RISK' ? 'At Risk of Breach' : 'On Track'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
