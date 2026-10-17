import React, { useState } from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  Network,
  Building2,
  Truck,
  FileText,
  Bot,
  Sliders,
  BrainCircuit,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Database,
  Radio,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { NavSection } from '../types';

interface NavItem {
  id: NavSection;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string | number;
  badgeColor?: 'rose' | 'cyan' | 'amber' | 'emerald';
}

export const Sidebar: React.FC = () => {
  const { activeSection, setActiveSection, incidents, isCopilotOpen, toggleCopilot, systemStats } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const activeIncidentsCount = incidents.filter((i) => i.status !== 'RESOLVED').length;

  const navGroups: { group: string; items: NavItem[] }[] = [
    {
      group: 'COMMAND & CONTROL',
      items: [
        { id: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard },
        {
          id: 'incidents',
          label: 'Incident War Room',
          icon: AlertTriangle,
          badge: activeIncidentsCount > 0 ? activeIncidentsCount : undefined,
          badgeColor: 'rose',
        },
        { id: 'graph', label: 'Graph Explorer', icon: Network },
      ],
    },
    {
      group: 'SUPPLY NETWORK',
      items: [
        { id: 'suppliers', label: 'Suppliers Directory', icon: Building2 },
        { id: 'shipments', label: 'Shipments & Inventory', icon: Truck },
        { id: 'orders', label: 'Customer Orders', icon: FileText },
      ],
    },
    {
      group: 'AI & COGNITIVE LAYER',
      items: [
        { id: 'agents', label: 'Agent Swarm Activity', icon: Bot, badge: '5 Active', badgeColor: 'cyan' },
        { id: 'decisions', label: 'Decision & Simulation', icon: Sliders },
        { id: 'history', label: 'Company Brain / Memory', icon: BrainCircuit },
      ],
    },
    {
      group: 'PREFERENCES',
      items: [{ id: 'settings', label: 'Platform Settings', icon: Settings }],
    },
  ];

  return (
    <aside
      style={{
        width: collapsed ? '72px' : '260px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        transition: 'width var(--transition-normal)',
        position: 'relative',
        zIndex: 30,
        flexShrink: 0,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: collapsed ? '18px 12px' : '20px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--accent-cyan) 0%, #3B82F6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
              flexShrink: 0,
            }}
          >
            <BrainCircuit size={20} color="#FFFFFF" />
          </div>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '17px',
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                  lineHeight: 1.2,
                }}
              >
                NEXUS OPS
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  color: 'var(--accent-cyan)',
                  textTransform: 'uppercase',
                }}
              >
                FalkorDB Graph AI
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Collapse Sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Re-expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          style={{
            margin: '8px auto',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Expand Sidebar"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Nav Items List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: collapsed ? '12px 8px' : '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {navGroups.map((group) => (
          <div key={group.group} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {!collapsed && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)',
                  padding: '4px 10px',
                  textTransform: 'uppercase',
                }}
              >
                {group.group}
              </span>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: '11px',
                    padding: collapsed ? '10px' : '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--border-glow)' : 'transparent',
                    backgroundColor: isActive ? 'var(--bg-active)' : 'transparent',
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)',
                    position: 'relative',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={18} className={isActive ? 'text-accent' : ''} />
                  {!collapsed && (
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                  )}
                  {!collapsed && item.badge !== undefined && (
                    <span
                      className={`badge badge-${item.badgeColor || 'gray'}`}
                      style={{ padding: '2px 6px', fontSize: '10px' }}
                    >
                      {item.badge}
                    </span>
                  )}
                  {collapsed && item.badge !== undefined && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: item.badgeColor === 'rose' ? 'var(--accent-rose)' : 'var(--accent-cyan)',
                      }}
                    />
                  )}
                </button>
              );
            })}

            {group.group === 'AI & COGNITIVE LAYER' && (
              <button
                onClick={toggleCopilot}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  gap: '11px',
                  padding: collapsed ? '10px' : '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid',
                  borderColor: isCopilotOpen ? 'var(--accent-cyan)' : 'transparent',
                  backgroundColor: isCopilotOpen ? 'var(--bg-active)' : 'transparent',
                  color: isCopilotOpen ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                  marginTop: '4px',
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  if (!isCopilotOpen) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCopilotOpen) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
                title={collapsed ? 'Nexus AI Copilot' : undefined}
              >
                <Sparkles size={18} color="var(--accent-cyan)" />
                {!collapsed && (
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Nexus AI Copilot
                  </span>
                )}
                {!collapsed && (
                  <span
                    className={`badge ${isCopilotOpen ? 'badge-cyan' : 'badge-purple'}`}
                    style={{ padding: '2px 6px', fontSize: '10px' }}
                  >
                    {isCopilotOpen ? 'OPEN' : 'AI'}
                  </span>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Footer: Theme Switcher & Database Status */}
      <div
        style={{
          padding: collapsed ? '12px 6px' : '14px 16px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          backgroundColor: 'var(--bg-subtle)',
        }}
      >
        {/* FalkorDB Live Status - Dynamic */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database
              size={13}
              color={systemStats.falkorDbStatus === 'CONNECTED' ? 'var(--accent-emerald)' : 'var(--text-muted)'}
            />
            {!collapsed && <span>FalkorDB Cloud</span>}
          </div>
          {!collapsed && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: systemStats.falkorDbStatus === 'CONNECTED' ? 'var(--accent-emerald)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '10px',
              }}
            >
              <Radio
                size={10}
                className={systemStats.falkorDbStatus === 'CONNECTED' ? 'pulse-indicator' : ''}
              />{' '}
              {systemStats.falkorDbStatus === 'CONNECTED' ? 'ONLINE' : 'DISCONNECTED'}
            </span>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            gap: '8px',
            padding: '7px 10px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 500,
            transition: 'all var(--transition-fast)',
          }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {theme === 'dark' ? (
              <Sun size={15} color="var(--accent-amber)" />
            ) : (
              <Moon size={15} color="var(--accent-purple)" />
            )}
            {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </div>
          {!collapsed && (
            <span
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: 'var(--text-muted)',
              }}
            >
              {theme}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};
