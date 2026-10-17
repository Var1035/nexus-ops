import React, { useState } from 'react';
import {
  Settings,
  Database,
  Cpu,
  Key,
  Sliders,
  CheckCircle,
  RefreshCw,
  Radio,
  Server,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsView: React.FC = () => {
  const { systemStats } = useApp();

  const [falkorUrl, setFalkorUrl] = useState('');
  const [graphName, setGraphName] = useState('nexus_ops');
  const [llmProvider, setLlmProvider] = useState('Google Gemini 1.5 Flash');
  const [autoApprovalThreshold, setAutoApprovalThreshold] = useState(95);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
      {/* Header */}
      <div
        className="nexus-card"
        style={{
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Settings size={22} color="var(--text-primary)" />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
              Platform Configuration & Graph Endpoints
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Configure FalkorDB Cloud credentials, LLM reasoning providers, and automation guardrails
            </span>
          </div>
        </div>
      </div>

      {/* FalkorDB Settings Card */}
      <div className="nexus-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} color={systemStats.falkorDbStatus === 'CONNECTED' ? 'var(--accent-emerald)' : 'var(--text-muted)'} />
            <h3 style={{ fontSize: '14.5px', fontWeight: 700, margin: 0 }}>
              FalkorDB Cloud Connection
            </h3>
          </div>
          <span className={`badge ${systemStats.falkorDbStatus === 'CONNECTED' ? 'badge-emerald' : 'badge-gray'}`}>
            {systemStats.falkorDbStatus === 'CONNECTED' ? 'Connected' : 'Not Connected'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px' }}>
              Connection URI (Redis / FalkorDB Protocol)
            </label>
            <input
              type="text"
              value={falkorUrl}
              onChange={(e) => setFalkorUrl(e.target.value)}
              className="input-control font-mono"
              style={{ width: '100%', fontSize: '12.5px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px' }}>
              Graph Keyspace Identifier
            </label>
            <input
              type="text"
              value={graphName}
              onChange={(e) => setGraphName(e.target.value)}
              className="input-control font-mono"
              style={{ width: '100%', fontSize: '12.5px' }}
            />
          </div>
        </div>
      </div>

      {/* AI Reasoning Model Configuration */}
      <div className="nexus-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={18} color="var(--accent-purple)" />
          <h3 style={{ fontSize: '14.5px', fontWeight: 700, margin: 0 }}>
            AI Agent Reasoning Engine
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px' }}>
              Primary LLM Provider
            </label>
            <select
              value={llmProvider}
              onChange={(e) => setLlmProvider(e.target.value)}
              className="input-control"
              style={{ width: '100%', fontSize: '13px' }}
            >
              <option value="Google Gemini 1.5 Flash">Google Gemini 1.5 Flash (Ultra-low latency)</option>
              <option value="Google Gemini 1.5 Pro">Google Gemini 1.5 Pro (Deep complex graph reasoning)</option>
              <option value="OpenAI GPT-4o">OpenAI GPT-4o</option>
              <option value="Anthropic Claude 3.5 Sonnet">Anthropic Claude 3.5 Sonnet</option>
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Auto-Approval Confidence Threshold</span>
              <strong style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{autoApprovalThreshold}%</strong>
            </div>
            <input
              type="range"
              min="80"
              max="100"
              value={autoApprovalThreshold}
              onChange={(e) => setAutoApprovalThreshold(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Decisions with confidence below this threshold require mandatory human-in-the-loop authorization.
            </span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
        {saveSuccess && (
          <span style={{ fontSize: '12px', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <CheckCircle size={15} /> Configuration saved successfully
          </span>
        )}
        <button onClick={handleSave} className="btn btn-primary" style={{ padding: '9px 24px', fontSize: '13px' }}>
          Save Configuration
        </button>
      </div>
    </div>
  );
};
