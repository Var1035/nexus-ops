import React, { useState } from 'react';
import {
  Building2,
  Box,
  Factory,
  Warehouse,
  Truck,
  FileText,
  Users,
  AlertCircle,
  CheckCircle,
  Maximize2,
  Eye,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GraphNode, GraphEdge, GraphNodeType } from '../types';

interface InteractiveGraphProps {
  height?: string | number;
  highlightImpact?: boolean;
  onNodeClick?: (node: GraphNode) => void;
}

export const InteractiveGraph: React.FC<InteractiveGraphProps> = ({
  height = '480px',
  highlightImpact = true,
  onNodeClick,
}) => {
  const { graphNodes, graphEdges, selectedNode, setSelectedNode } = useApp();
  const [filterType, setFilterType] = useState<string>('ALL');

  const getNodeIcon = (type: GraphNodeType) => {
    switch (type) {
      case 'Supplier':
        return Building2;
      case 'Material':
        return Box;
      case 'Factory':
        return Factory;
      case 'Warehouse':
        return Warehouse;
      case 'Shipment':
        return Truck;
      case 'Product':
        return Box;
      case 'Order':
        return FileText;
      case 'Customer':
        return Users;
      default:
        return Box;
    }
  };

  const getNodeColor = (node: GraphNode) => {
    if (highlightImpact && node.isImpacted) {
      return {
        bg: 'var(--accent-rose-subtle)',
        border: 'var(--accent-rose)',
        glow: 'rgba(244, 63, 94, 0.4)',
        iconColor: 'var(--accent-rose)',
      };
    }
    if (node.isAlternative) {
      return {
        bg: 'var(--accent-emerald-subtle)',
        border: 'var(--accent-emerald)',
        glow: 'rgba(16, 185, 129, 0.4)',
        iconColor: 'var(--accent-emerald)',
      };
    }
    switch (node.type) {
      case 'Supplier':
        return { bg: 'var(--accent-blue-subtle)', border: 'var(--accent-blue)', glow: 'rgba(59, 130, 246, 0.3)', iconColor: 'var(--accent-blue)' };
      case 'Material':
        return { bg: 'var(--accent-amber-subtle)', border: 'var(--accent-amber)', glow: 'rgba(245, 158, 11, 0.3)', iconColor: 'var(--accent-amber)' };
      case 'Factory':
        return { bg: 'var(--accent-purple-subtle)', border: 'var(--accent-purple)', glow: 'rgba(168, 85, 247, 0.3)', iconColor: 'var(--accent-purple)' };
      case 'Product':
        return { bg: 'var(--accent-cyan-subtle)', border: 'var(--accent-cyan)', glow: 'rgba(6, 182, 212, 0.3)', iconColor: 'var(--accent-cyan)' };
      case 'Order':
        return { bg: 'var(--accent-amber-subtle)', border: 'var(--accent-amber)', glow: 'rgba(245, 158, 11, 0.3)', iconColor: 'var(--accent-amber)' };
      case 'Customer':
        return { bg: 'rgba(99, 102, 241, 0.15)', border: '#6366F1', glow: 'rgba(99, 102, 241, 0.3)', iconColor: '#6366F1' };
      default:
        return { bg: 'var(--bg-subtle)', border: 'var(--border-color)', glow: 'none', iconColor: 'var(--text-secondary)' };
    }
  };

  const handleNodeSelect = (node: GraphNode) => {
    setSelectedNode(node);
    if (onNodeClick) onNodeClick(node);
  };

  const filteredNodes = filterType === 'ALL'
    ? graphNodes
    : graphNodes.filter((n) => n.type === filterType);

  return (
    <div
      className="nexus-card"
      style={{
        height: height,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Graph Toolbar */}
      <div
        style={{
          padding: '12px 18px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-subtle)',
          zIndex: 5,
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            FalkorDB Subgraph Traversal
          </span>
          {graphNodes.some((n) => n.isImpacted) && (
            <span className="badge badge-rose" style={{ fontSize: '10px' }}>
              Blast Radius Active
            </span>
          )}
          {graphNodes.filter((n) => n.isAlternative).length > 0 && (
            <span className="badge badge-emerald" style={{ fontSize: '10px' }}>
              {graphNodes.filter((n) => n.isAlternative).length} Alternatives Discovered
            </span>
          )}
          {!graphNodes.some((n) => n.isImpacted) && graphNodes.filter((n) => n.isAlternative).length === 0 && (
            <span className="badge badge-gray" style={{ fontSize: '10px' }}>
              {graphNodes.length > 0 ? 'Topology Nominal' : 'No Graph Data'}
            </span>
          )}
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {['ALL', 'Supplier', 'Material', 'Factory', 'Order', 'Customer'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                background: filterType === type ? 'var(--accent-cyan)' : 'var(--bg-card)',
                color: filterType === type ? '#FFFFFF' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: filterType === type ? 'var(--accent-cyan)' : 'var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-card-solid)',
          backgroundImage:
            'radial-gradient(circle, var(--border-subtle) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {graphNodes.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '24px',
              textAlign: 'center',
              zIndex: 3,
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box size={26} color="var(--accent-cyan)" />
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              FalkorDB Subgraph Canvas
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '420px', lineHeight: 1.5 }}>
              Zero dummy nodes loaded. Live graph topology (Suppliers &rarr; Shipments &rarr; Materials &rarr; Factories &rarr; Orders) will render dynamically once FalkorDB backend is connected.
            </div>
          </div>
        )}

        <svg
          style={{ width: '100%', height: '100%', minWidth: '980px', minHeight: '520px' }}
          viewBox="0 0 1080 580"
        >
          <defs>
            <marker
              id="arrow-impact"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-rose)" />
            </marker>
            <marker
              id="arrow-normal"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-muted)" />
            </marker>
            <marker
              id="arrow-alternative"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-emerald)" />
            </marker>
          </defs>

          {/* Render Edges */}
          {graphEdges.map((edge) => {
            const sourceNode = graphNodes.find((n) => n.id === edge.source);
            const targetNode = graphNodes.find((n) => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            const isImpact = edge.isImpactPath;
            const isAlt = edge.relationship === 'CAN_SUPPLY';

            return (
              <g key={edge.id}>
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={
                    isImpact
                      ? 'var(--accent-rose)'
                      : isAlt
                        ? 'var(--accent-emerald)'
                        : 'var(--border-strong)'
                  }
                  strokeWidth={isImpact ? '2.5' : isAlt ? '2' : '1.2'}
                  strokeDasharray={isAlt ? '5 5' : isImpact ? 'none' : 'none'}
                  markerEnd={
                    isImpact
                      ? 'url(#arrow-impact)'
                      : isAlt
                        ? 'url(#arrow-alternative)'
                        : 'url(#arrow-normal)'
                  }
                  opacity={isImpact ? 0.9 : 0.6}
                />
                {edge.label && (
                  <text
                    x={(sourceNode.x + targetNode.x) / 2}
                    y={(sourceNode.y + targetNode.y) / 2 - 6}
                    fill={isImpact ? 'var(--accent-rose)' : isAlt ? 'var(--accent-emerald)' : 'var(--text-muted)'}
                    fontSize="10"
                    fontFamily="var(--font-mono)"
                    textAnchor="middle"
                    style={{ pointerEvents: 'none' }}
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Render Nodes */}
          {filteredNodes.map((node) => {
            const colors = getNodeColor(node);
            const Icon = getNodeIcon(node.type);
            const isSelected = selectedNode?.id === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => handleNodeSelect(node)}
                style={{ cursor: 'pointer' }}
              >
                {/* Outer Glow Halo for Impacted or Alternative */}
                {(node.isImpacted || node.isAlternative || isSelected) && (
                  <circle
                    r={isSelected ? '32' : '28'}
                    fill="none"
                    stroke={colors.border}
                    strokeWidth={isSelected ? '3' : '1.5'}
                    opacity={0.4}
                    className={node.isImpacted ? 'pulsing-border-rose' : ''}
                  />
                )}

                {/* Base Node Circle */}
                <circle
                  r="22"
                  fill="var(--bg-card-solid)"
                  stroke={colors.border}
                  strokeWidth={isSelected ? '2.5' : '1.8'}
                />

                {/* Node Icon */}
                <foreignObject x="-12" y="-12" width="24" height="24">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <Icon size={14} color={colors.iconColor} />
                  </div>
                </foreignObject>

                {/* Node Label Text */}
                <text
                  y="36"
                  textAnchor="middle"
                  fill="var(--text-primary)"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="var(--font-sans)"
                >
                  {node.label}
                </text>

                {/* Node Subtitle Type */}
                <text
                  y="49"
                  textAnchor="middle"
                  fill={node.isImpacted ? 'var(--accent-rose)' : node.isAlternative ? 'var(--accent-emerald)' : 'var(--text-muted)'}
                  fontSize="9.5"
                  fontWeight="600"
                  fontFamily="var(--font-mono)"
                >
                  {node.subType || node.type}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Node Floating Details Card */}
        {selectedNode && (
          <div
            className="nexus-card"
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              width: '310px',
              padding: '16px',
              zIndex: 10,
              boxShadow: 'var(--shadow-lg)',
              backgroundColor: 'var(--bg-card)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  className={`badge ${selectedNode.isImpacted
                      ? 'badge-rose'
                      : selectedNode.isAlternative
                        ? 'badge-emerald'
                        : 'badge-cyan'
                    }`}
                >
                  {selectedNode.type}
                </span>
                {selectedNode.isImpacted && <span className="badge badge-rose">Impacted</span>}
                {selectedNode.isAlternative && <span className="badge badge-emerald">Candidate</span>}
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                ✕
              </button>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>
              {selectedNode.label}
            </h4>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', fontFamily: 'var(--font-mono)' }}>
              Node ID: {selectedNode.id}
            </div>

            {/* Properties List */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '8px',
              }}
            >
              {Object.entries(selectedNode.properties).map(([key, val]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11.5px',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1')}:
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            backgroundColor: 'var(--bg-card)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '11px',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-rose)' }} />
            <span>Blast Radius</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-emerald)' }} />
            <span>Alternative Backup</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)' }} />
            <span>Operational Node</span>
          </div>
        </div>
      </div>
    </div>
  );
};
