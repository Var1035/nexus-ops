import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Building2,
  Box,
  Factory,
  Warehouse,
  Truck,
  FileText,
  Users,
  AlertCircle,
  Plus,
  Minus,
  RotateCcw,
  Maximize2,
  Minimize2,
  Crosshair,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GraphNode, GraphEdge, GraphNodeType } from '../types';

interface InteractiveGraphProps {
  height?: string | number;
  highlightImpact?: boolean;
  onNodeClick?: (node: GraphNode) => void;
  overrideNodes?: GraphNode[];
  overrideEdges?: GraphEdge[];
}

export const InteractiveGraph: React.FC<InteractiveGraphProps> = ({
  height = '520px',
  highlightImpact = true,
  onNodeClick,
  overrideNodes,
  overrideEdges,
}) => {
  const { graphNodes: contextNodes, graphEdges: contextEdges, selectedNode, setSelectedNode, activeIncident } = useApp();

  const rawNodes = overrideNodes || contextNodes;
  const rawEdges = overrideEdges || contextEdges;

  // Viewport / Camera state (Google Maps style)
  const [zoom, setZoom] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 30 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Node Dragging State
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});

  // Filtering & Modes
  const [filterType, setFilterType] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'BLAST_RADIUS' | 'FULL'>('FULL');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const isInteractingWithNode = useRef<boolean>(false);

  // Initialize and distribute node positions so they NEVER overlap
  useEffect(() => {
    if (rawNodes.length === 0) return;

    const initialPositions: Record<string, { x: number; y: number }> = {};
    const typeOffsets: Record<string, number> = {
      Incident: 160,
      Supplier: 460,
      Company: 460,
      Facility: 960,
      Warehouse: 960,
      Factory: 960,
      Port: 960,
      Material: 1460,
      Product: 1860,
      Order: 2180,
      Customer: 2420,
    };

    const typeCounters: Record<string, number> = {};

    rawNodes.forEach((node) => {
      // Use existing position if already customized
      if (nodePositions[node.id]) {
        initialPositions[node.id] = nodePositions[node.id];
        return;
      }

      const type = node.type || 'Supplier';
      const count = typeCounters[type] || 0;
      typeCounters[type] = count + 1;

      // Stagger into 2 columns for dense types so they never stack on a single line
      const col = count % 2;
      const row = Math.floor(count / 2);
      const baseX = typeOffsets[type] || 500;

      const posX = baseX + (type === 'Supplier' || type === 'Facility' || type === 'Material' ? col * 200 : 0);
      const posY = 100 + row * 120;

      initialPositions[node.id] = {
        x: node.x && node.x > 0 && node.x !== 120 ? node.x : posX,
        y: node.y && node.y > 0 && node.y !== 60 ? node.y : posY,
      };
    });

    setNodePositions(initialPositions);
  }, [rawNodes]);

  // Fit view automatically on initial load
  const handleFitView = useCallback(() => {
    if (rawNodes.length === 0 || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const width = rect.width || 1000;
    const height = rect.height || 500;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    Object.values(nodePositions).forEach((pos) => {
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y);
    });

    if (minX === Infinity) {
      minX = 100; maxX = 1800; minY = 100; maxY = 800;
    }

    const graphWidth = maxX - minX + 260;
    const graphHeight = maxY - minY + 260;

    const scaleX = (width - 60) / graphWidth;
    const scaleY = (height - 60) / graphHeight;
    const calculatedZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.35), 1.2);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setZoom(calculatedZoom);
    setPan({
      x: width / 2 - centerX * calculatedZoom,
      y: height / 2 - centerY * calculatedZoom,
    });
  }, [nodePositions, rawNodes.length]);

  // Mouse Wheel Zoom centered on cursor
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.14 : 0.88;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.2), 3.2);

    if (!containerRef.current) {
      setZoom(newZoom);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Canvas Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isInteractingWithNode.current) return;
    setIsPanning(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    } else if (draggedNodeId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;

      setNodePositions((prev) => ({
        ...prev,
        [draggedNodeId]: { x: Math.round(mouseX), y: Math.round(mouseY) },
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
    isInteractingWithNode.current = false;
  };

  // Node Drag Start
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    isInteractingWithNode.current = true;
    setDraggedNodeId(nodeId);
  };

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    if (onNodeClick) onNodeClick(node);
  };

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
        return Layers;
      case 'Order':
        return FileText;
      case 'Customer':
        return Users;
      default:
        return AlertCircle;
    }
  };

  const getNodeColor = (node: GraphNode) => {
    if (highlightImpact && node.isImpacted) {
      return {
        bg: 'var(--accent-rose-subtle)',
        border: 'var(--accent-rose)',
        glow: 'rgba(244, 63, 94, 0.45)',
        iconColor: 'var(--accent-rose)',
      };
    }
    if (node.isAlternative) {
      return {
        bg: 'var(--accent-emerald-subtle)',
        border: 'var(--accent-emerald)',
        glow: 'rgba(16, 185, 129, 0.45)',
        iconColor: 'var(--accent-emerald)',
      };
    }
    switch (node.type) {
      case 'Supplier':
        return { bg: 'var(--accent-blue-subtle)', border: 'var(--accent-blue)', glow: 'rgba(59, 130, 246, 0.3)', iconColor: 'var(--accent-blue)' };
      case 'Material':
        return { bg: 'var(--accent-amber-subtle)', border: 'var(--accent-amber)', glow: 'rgba(245, 158, 11, 0.3)', iconColor: 'var(--accent-amber)' };
      case 'Factory':
      case 'Warehouse':
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

  // Filtered nodes
  const displayNodes = rawNodes.filter((node) => {
    if (viewMode === 'BLAST_RADIUS') {
      return node.isImpacted || node.isAlternative;
    }
    if (filterType === 'ALL') return true;
    return node.type === filterType;
  });

  const activeNodeIds = new Set(displayNodes.map((n) => n.id));
  const displayEdges = rawEdges.filter((edge) => activeNodeIds.has(edge.source) && activeNodeIds.has(edge.target));

  return (
    <div
      className={`nexus-card ${isFullscreen ? 'graph-fullscreen-overlay' : ''}`}
      style={{
        height: isFullscreen ? '100vh' : height,
        display: 'flex',
        flexDirection: 'column',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : undefined,
        left: isFullscreen ? 0 : undefined,
        right: isFullscreen ? 0 : undefined,
        bottom: isFullscreen ? 0 : undefined,
        zIndex: isFullscreen ? 9999 : 5,
        overflow: 'hidden',
        border: isFullscreen ? 'none' : undefined,
        borderRadius: isFullscreen ? 0 : 'var(--radius-lg)',
      }}
    >
      {/* Top Interactive Graph Header & Mode Switchers */}
      <div
        style={{
          padding: '12px 18px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-subtle)',
          zIndex: 10,
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
            FalkorDB Subgraph Canvas
          </span>

          {/* Mode Pill: Blast Radius vs Full Network */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px',
              border: '1px solid var(--border-color)',
            }}
          >
            <button
              onClick={() => setViewMode('FULL')}
              style={{
                background: viewMode === 'FULL' ? 'var(--accent-cyan)' : 'transparent',
                color: viewMode === 'FULL' ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Full Network
            </button>
            <button
              onClick={() => setViewMode('BLAST_RADIUS')}
              style={{
                background: viewMode === 'BLAST_RADIUS' ? 'var(--accent-rose)' : 'transparent',
                color: viewMode === 'BLAST_RADIUS' ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              🎯 Blast Radius
            </button>
          </div>

          <span className="badge badge-cyan" style={{ fontSize: '10.5px' }}>
            {displayNodes.length} Nodes Displayed
          </span>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
          {['ALL', 'Supplier', 'Material', 'Factory', 'Warehouse', 'Product', 'Order'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                background: filterType === type ? 'var(--accent-cyan-subtle)' : 'var(--bg-card)',
                color: filterType === type ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: filterType === type ? 'var(--accent-cyan)' : 'var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Google Maps Style Canvas */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          cursor: isPanning ? 'grabbing' : 'grab',
          backgroundColor: 'var(--bg-app)',
          userSelect: 'none',
        }}
      >
        {/* Dynamic Map Grid Background that moves with pan & zoom */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            backgroundImage: `
              radial-gradient(circle, var(--border-color) 1.2px, transparent 1.2px),
              linear-gradient(to right, var(--border-subtle) 1px, transparent 1px),
              linear-gradient(to bottom, var(--border-subtle) 1px, transparent 1px)
            `,
            backgroundSize: `${36 * zoom}px ${36 * zoom}px, ${144 * zoom}px ${144 * zoom}px, ${144 * zoom}px ${144 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px, ${pan.x}px ${pan.y}px, ${pan.x}px ${pan.y}px`,
            opacity: 0.75,
          }}
        />

        {/* SVG Drawing Layer */}
        <svg
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            overflow: 'visible',
          }}
        >
          <defs>
            <marker
              id="arrow-impact-dyn"
              viewBox="0 0 10 10"
              refX="28"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-rose)" />
            </marker>
            <marker
              id="arrow-alt-dyn"
              viewBox="0 0 10 10"
              refX="28"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-emerald)" />
            </marker>
            <marker
              id="arrow-norm-dyn"
              viewBox="0 0 10 10"
              refX="28"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border-strong)" />
            </marker>
          </defs>

          {/* Master Transform Group for Pan & Zoom */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* 1. Render Relationships / Edges */}
            {displayEdges.map((edge) => {
              const src = nodePositions[edge.source];
              const tgt = nodePositions[edge.target];
              if (!src || !tgt) return null;

              const isImpact = edge.isImpactPath;
              const isAlt = edge.relationship === 'CAN_SUPPLY';

              // Smooth curve calculation
              const dx = tgt.x - src.x;
              const dy = tgt.y - src.y;
              const cx1 = src.x + dx * 0.45;
              const cy1 = src.y;
              const cx2 = src.x + dx * 0.55;
              const cy2 = tgt.y;
              const pathD = `M ${src.x} ${src.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tgt.x} ${tgt.y}`;

              const strokeColor = isImpact
                ? 'var(--accent-rose)'
                : isAlt
                  ? 'var(--accent-emerald)'
                  : 'var(--border-color)';

              return (
                <g key={edge.id}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isImpact ? 2.5 : isAlt ? 2.0 : 1.2}
                    strokeDasharray={isAlt ? '6 6' : isImpact ? 'none' : 'none'}
                    markerEnd={
                      isImpact
                        ? 'url(#arrow-impact-dyn)'
                        : isAlt
                          ? 'url(#arrow-alt-dyn)'
                          : 'url(#arrow-norm-dyn)'
                    }
                    opacity={isImpact ? 0.95 : isAlt ? 0.85 : 0.45}
                  />

                  {/* Clean edge relationship pill */}
                  {displayEdges.length <= 40 && (
                    <g transform={`translate(${(src.x + tgt.x) / 2}, ${(src.y + tgt.y) / 2 - 8})`}>
                      <rect
                        x="-38"
                        y="-8"
                        width="76"
                        height="16"
                        rx="4"
                        fill="var(--bg-card-solid)"
                        stroke={strokeColor}
                        strokeWidth="0.8"
                        opacity={0.9}
                      />
                      <text
                        x="0"
                        y="4"
                        fill={isImpact ? 'var(--accent-rose)' : isAlt ? 'var(--accent-emerald)' : 'var(--text-muted)'}
                        fontSize="9"
                        fontWeight="600"
                        fontFamily="var(--font-mono)"
                        textAnchor="middle"
                        style={{ pointerEvents: 'none' }}
                      >
                        {edge.label || edge.relationship}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* 2. Render Nodes */}
            {displayNodes.map((node) => {
              const pos = nodePositions[node.id] || { x: node.x || 300, y: node.y || 300 };
              const colors = getNodeColor(node);
              const Icon = getNodeIcon(node.type);
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNode?.id === node.id;

              return (
                <g
                  key={node.id}
                  className="interactive-node"
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{ cursor: draggedNodeId === node.id ? 'grabbing' : 'pointer' }}
                >
                  {/* Outer Pulsing Aura for Impact / Alternatives */}
                  {(node.isImpacted || node.isAlternative || isSelected || isHovered) && (
                    <circle
                      r={isSelected ? 36 : 30}
                      fill="none"
                      stroke={colors.border}
                      strokeWidth={isSelected ? 3 : 1.8}
                      opacity={0.5}
                      className={node.isImpacted ? 'pulsing-border-rose' : ''}
                    />
                  )}

                  {/* Background Circle */}
                  <circle
                    r="24"
                    fill="var(--bg-card-solid)"
                    stroke={colors.border}
                    strokeWidth={isSelected ? 2.5 : 2.0}
                    style={{
                      filter: `drop-shadow(0 4px 12px ${colors.glow})`,
                      transition: 'all 0.2s ease',
                    }}
                  />

                  {/* Node Icon */}
                  <foreignObject x="-12" y="-12" width="24" height="24" style={{ pointerEvents: 'none' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      <Icon size={16} color={colors.iconColor} />
                    </div>
                  </foreignObject>

                  {/* Node Label Card below Circle */}
                  <g transform="translate(0, 36)" style={{ pointerEvents: 'none' }}>
                    <rect
                      x="-65"
                      y="-2"
                      width="130"
                      height="32"
                      rx="6"
                      fill="var(--bg-card-solid)"
                      stroke="var(--border-color)"
                      strokeWidth="1"
                      opacity="0.94"
                      style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' }}
                    />
                    <text
                      x="0"
                      y="12"
                      textAnchor="middle"
                      fill="var(--text-primary)"
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="var(--font-sans)"
                    >
                      {node.label.length > 18 ? node.label.substring(0, 16) + '…' : node.label}
                    </text>
                    <text
                      x="0"
                      y="24"
                      textAnchor="middle"
                      fill={node.isImpacted ? 'var(--accent-rose)' : node.isAlternative ? 'var(--accent-emerald)' : 'var(--text-muted)'}
                      fontSize="9"
                      fontWeight="600"
                      fontFamily="var(--font-mono)"
                    >
                      {node.subType || node.type}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating Google Maps Style Controls (Bottom Right) */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: 20,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card-solid)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Zoom In */}
            <button
              onClick={() => setZoom((z) => Math.min(z * 1.25, 3.5))}
              title="Zoom In (Scroll Up)"
              style={{
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              <Plus size={18} />
            </button>

            {/* Zoom Out */}
            <button
              onClick={() => setZoom((z) => Math.max(z * 0.8, 0.2))}
              title="Zoom Out (Scroll Down)"
              style={{
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              <Minus size={18} />
            </button>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-card-solid)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Reset / Center */}
            <button
              onClick={() => {
                setZoom(1.0);
                setPan({ x: 60, y: 40 });
              }}
              title="Reset 100% Zoom"
              style={{
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={16} />
            </button>

            {/* Fit View to all nodes */}
            <button
              onClick={handleFitView}
              title="Fit Entire Graph to View"
              style={{
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--accent-cyan)',
                cursor: 'pointer',
              }}
            >
              <Crosshair size={16} />
            </button>

            {/* Toggle Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}
              style={{
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>

          {/* Zoom Readout */}
          <div
            style={{
              padding: '4px 8px',
              backgroundColor: 'var(--bg-card-solid)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '10px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            {Math.round(zoom * 100)}%
          </div>
        </div>

        {/* Hover Tooltip Near Cursor */}
        {hoveredNode && !selectedNode && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--bg-card-solid)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 25,
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: hoveredNode.isImpacted ? 'var(--accent-rose)' : 'var(--accent-cyan)',
              }}
            />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {hoveredNode.label}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              ({hoveredNode.type} &bull; {hoveredNode.subType})
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Drag node or click to inspect
            </span>
          </div>
        )}

        {/* Selected Node Drawer / Floating Card (Bottom-Left) */}
        {selectedNode && (
          <div
            className="nexus-card"
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              width: '320px',
              padding: '16px',
              zIndex: 25,
              boxShadow: 'var(--shadow-xl)',
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
                {selectedNode.isAlternative && <span className="badge badge-emerald">Alternative</span>}
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                ✕
              </button>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '4px 0' }}>
              {selectedNode.label}
            </h4>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
              ID: {selectedNode.id}
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '8px',
                maxHeight: '140px',
                overflowY: 'auto',
              }}
            >
              {Object.entries(selectedNode.properties || selectedNode.details || {}).map(([key, val]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
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

        {/* Map Legend */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            backgroundColor: 'var(--bg-card-solid)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '10.5px',
            color: 'var(--text-secondary)',
            zIndex: 15,
            pointerEvents: 'none',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-rose)' }} />
            <span>Blast Radius</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-emerald)' }} />
            <span>Backup Supplier</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)' }} />
            <span>Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};
