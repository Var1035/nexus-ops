import React, { useState } from 'react';
import {
  Building2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Search,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Supplier } from '../types';

export const SuppliersView: React.FC = () => {
  const { suppliers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('ALL');

  const backupSupplier = suppliers.find((s) => s.status === 'backup');

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'ALL' || s.tier.toString() === filterTier;
    return matchesSearch && matchesTier;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Controls */}
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
              backgroundColor: 'var(--accent-blue-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Building2 size={20} color="var(--accent-blue)" />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
              Global Suppliers Directory
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Connected supplier nodes with verified reliability scores and active SLA lead times
            </span>
          </div>
        </div>

        {/* Search & Tier Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search vendor, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-control"
              style={{ paddingLeft: '30px', fontSize: '12px', height: '34px', width: '220px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {['ALL', '1', '2'].map((tier) => (
              <button
                key={tier}
                onClick={() => setFilterTier(tier)}
                style={{
                  background: filterTier === tier ? 'var(--accent-cyan)' : 'var(--bg-app)',
                  color: filterTier === tier ? '#FFFFFF' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 10px',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                {tier === 'ALL' ? 'All Tiers' : `Tier ${tier}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alternative Supplier Spotlight Box - Dynamic */}
      {backupSupplier && (
        <div
          className="nexus-card"
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--accent-emerald-subtle)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sparkles size={22} color="var(--accent-emerald)" />
            <div>
              <strong style={{ fontSize: '13px', color: 'var(--accent-emerald)' }}>
                FalkorDB Autonomous Supplier Discovery Active
              </strong>
              <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                <strong>{backupSupplier.name}</strong> is verified as an active backup supplier for {backupSupplier.category} with {backupSupplier.leadTimeDays}-day lead time.
              </div>
            </div>
          </div>
          <span className="badge badge-emerald">Discovered via Graph</span>
        </div>
      )}

      {/* Suppliers Table */}
      <div className="nexus-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Supplier Name</th>
              <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Tier & Category</th>
              <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Location</th>
              <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Reliability</th>
              <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Lead Time</th>
              <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '36px 18px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Building2 size={32} style={{ margin: '0 auto 8px', opacity: 0.4, display: 'block' }} />
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    No Suppliers Found
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Awaiting FalkorDB database connection or data synchronization.
                  </div>
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((supplier) => (
                <tr
                  key={supplier.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background-color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{supplier.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{supplier.contactEmail}</div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span className="badge badge-cyan" style={{ fontSize: '10px' }}>Tier {supplier.tier}</span>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>{supplier.category}</div>
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>{supplier.location}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '48px', height: '6px', backgroundColor: 'var(--bg-app)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${supplier.reliabilityScore}%`, height: '100%', backgroundColor: supplier.reliabilityScore > 92 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }} />
                      </div>
                      <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{supplier.reliabilityScore}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {supplier.leadTimeDays} Days
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      className={`badge ${
                        supplier.status === 'disrupted'
                          ? 'badge-rose'
                          : supplier.status === 'backup'
                          ? 'badge-emerald'
                          : 'badge-cyan'
                      }`}
                    >
                      {supplier.status === 'disrupted'
                        ? 'Disrupted (+10d)'
                        : supplier.status === 'backup'
                        ? 'Verified Backup'
                        : 'Operational'}
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
