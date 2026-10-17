import React from 'react';
import {
  Search,
  Bell,
  Sparkles,
  ShieldAlert,
  Activity,
  Sun,
  Moon,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

export const Header: React.FC = () => {
  const {
    activeSection,
    incidents,
    toggleCopilot,
    isCopilotOpen,
    runInvestigation,
  } = useApp();
  const { theme, toggleTheme } = useTheme();

  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');
  const totalExposure = activeIncidents.reduce((sum, i) => sum + i.financialExposure, 0);

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard':
        return { title: 'Operations Dashboard', desc: 'Real-time supply chain health, incident triage, and network alerts' };
      case 'incidents':
        return { title: 'Incident War Room', desc: 'FalkorDB graph traversal, multi-agent analysis, and human approval' };
      case 'graph':
        return { title: 'Supply Chain Graph Explorer', desc: 'Interactive topology of suppliers, materials, BOM, factories, and orders' };
      case 'suppliers':
        return { title: 'Suppliers Directory', desc: 'Tier-1 & Tier-2 vendor reliability, capacity, and alternative sources' };
      case 'shipments':
        return { title: 'Shipments & Inventory', desc: 'In-transit cargo telemetry, route risks, and warehouse buffer levels' };
      case 'orders':
        return { title: 'Customer Orders', desc: 'Enterprise SLAs, fulfillment deadlines, and liquidated damage risk' };
      case 'agents':
        return { title: 'Agent Swarm Activity Room', desc: 'Telemetry, prompts, and reasoning traces for specialized AI agent roles' };
      case 'decisions':
        return { title: 'Decision & Simulation Center', desc: 'Multi-criteria option trade-offs and what-if scenario testing' };
      case 'history':
        return { title: 'Company Brain & Memory', desc: 'Episodic memory of past disruptions, decisions, actions, and outcomes' };
      case 'settings':
        return { title: 'Platform Settings', desc: 'Database connections, model parameters, and simulation controls' };
      default:
        return { title: 'Nexus Ops', desc: 'Graph-powered autonomous supply chain response' };
    }
  };

  const { title, desc } = getSectionTitle();

  return (
    <header
      style={{
        height: '68px',
        backgroundColor: 'var(--bg-header)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        gap: '20px',
      }}
    >
      {/* Title & Description */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          {title}
        </h1>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{desc}</span>
      </div>

      {/* Center Search Input */}
      <div
        style={{
          position: 'relative',
          maxWidth: '380px',
          width: '100%',
          display: 'none', // Shown on medium+ screens
        }}
        className="header-search-wrapper"
      >
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }}
        />
        <input
          type="text"
          placeholder="Search graph nodes, orders, materials..."
          className="input-control"
          style={{
            width: '100%',
            paddingLeft: '36px',
            height: '36px',
            fontSize: '12px',
          }}
        />
      </div>

      {/* Action Metrics & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Exposure Chip */}
        {totalExposure > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-rose-subtle)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--accent-rose)',
              fontSize: '12px',
              fontWeight: 600,
            }}
            title="Total financial exposure across active disruptions"
          >
            <ShieldAlert size={14} />
            <span>${totalExposure.toLocaleString()} at Risk</span>
          </div>
        )}

        {/* Network Health */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
          }}
        >
          <Activity size={14} color={activeIncidents.length > 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)'} />
          <span>Network Health: <strong style={{ color: activeIncidents.length > 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
            {activeIncidents.length === 0 ? '100%' : `${Math.max(65, 100 - activeIncidents.length * 15)}%`}
          </strong></span>
        </div>

        {/* Quick Trigger: Run Disruption Investigation */}
        {activeIncidents.length > 0 && (
          <button
            onClick={() => runInvestigation(activeIncidents[0].id)}
            className="btn btn-primary"
            style={{ padding: '6px 13px', fontSize: '12px' }}
            title="Run FalkorDB multi-agent blast radius investigation on active disruption"
          >
            <Zap size={14} />
            <span>Investigate Disruption</span>
          </button>
        )}

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '8px',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={16} color="var(--accent-amber)" /> : <Moon size={16} color="var(--accent-purple)" />}
        </button>

        {/* AI Copilot Drawer Button */}
        <button
          onClick={toggleCopilot}
          className="btn"
          style={{
            backgroundColor: isCopilotOpen ? 'var(--accent-cyan)' : 'var(--bg-card)',
            color: isCopilotOpen ? '#FFFFFF' : 'var(--text-primary)',
            borderColor: isCopilotOpen ? 'var(--accent-cyan)' : 'var(--border-color)',
            padding: '6px 14px',
            fontSize: '12px',
          }}
          title="Open AI Supply Chain Copilot"
        >
          <Sparkles size={14} color={isCopilotOpen ? '#FFFFFF' : 'var(--accent-cyan)'} />
          <span>Copilot</span>
        </button>
      </div>
    </header>
  );
};
