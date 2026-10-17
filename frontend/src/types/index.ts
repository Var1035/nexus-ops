export type NavSection =
  | 'dashboard'
  | 'incidents'
  | 'graph'
  | 'suppliers'
  | 'shipments'
  | 'orders'
  | 'agents'
  | 'decisions'
  | 'history'
  | 'settings';

export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentStatus = 'ACTIVE_DISRUPTION' | 'INVESTIGATING' | 'AWAITING_APPROVAL' | 'RESOLVED';

export interface Incident {
  id: string;
  code: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  supplierName: string;
  supplierId: string;
  materialName: string;
  materialId: string;
  delayDays: number;
  affectedOrdersCount: number;
  financialExposure: number;
  timestamp: string;
  summary: string;
  rootCause: string;
}

export type GraphNodeType =
  | 'Supplier'
  | 'Material'
  | 'Product'
  | 'Factory'
  | 'Warehouse'
  | 'Shipment'
  | 'Order'
  | 'Customer';

export interface GraphNode {
  id: string;
  label: string;
  type: GraphNodeType;
  subType?: string;
  isImpacted?: boolean;
  isAlternative?: boolean;
  properties: Record<string, string | number | boolean>;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  isImpactPath?: boolean;
  label?: string;
}

export type AgentRole = 'Impact' | 'Risk' | 'Procurement' | 'Logistics' | 'Decision';

export interface AgentFinding {
  id: string;
  agentRole: AgentRole;
  status: 'completed' | 'running' | 'pending';
  title: string;
  summary: string;
  confidence: number;
  metrics: Record<string, string | number>;
  evidence: string[];
  executionTimeMs: number;
}

export interface DecisionOption {
  id: string;
  title: string;
  tag: string;
  description: string;
  costDelta: number;
  timeDeltaDays: number;
  slaRiskScore: number; // 0 - 100
  feasibilityScore: number; // 0 - 100
  recommended: boolean;
  rationale: string;
  actions: string[];
  simulatedOutcome?: string;
}

export interface Supplier {
  id: string;
  name: string;
  tier: number;
  category: string;
  location: string;
  leadTimeDays: number;
  reliabilityScore: number;
  capacityUnits: number;
  materialsSupplied: string[];
  status: 'active' | 'disrupted' | 'backup';
  contactEmail: string;
}

export interface Shipment {
  id: string;
  trackingCode: string;
  carrier: string;
  origin: string;
  destination: string;
  material: string;
  quantity: number;
  scheduledEta: string;
  currentStatus: 'ON_TIME' | 'DELAYED' | 'CRITICAL_DELAY' | 'REROUTED';
  delayDays: number;
  transportMode: 'AIR_FREIGHT' | 'OCEAN_FREIGHT' | 'RAIL' | 'GROUND';
}

export interface Order {
  id: string;
  customerName: string;
  tier: 'Tier-1 Enterprise' | 'Tier-2 Preferred' | 'Tier-3 Standard';
  productName: string;
  quantity: number;
  value: number;
  deadline: string;
  status: 'AT_RISK' | 'ON_TRACK' | 'RESOLVED';
  slaPenaltyPerDay: number;
}

export interface HistoricalIncident {
  id: string;
  incidentCode: string;
  date: string;
  title: string;
  disruptedEntity: string;
  decisionChosen: string;
  actionExecuted: string;
  outcomeMetric: string;
  financialDelta: string;
  slaPreserved: string;
  falkorDbKey: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  graphCitations?: {
    entity: string;
    type: string;
    cypherQuery?: string;
  }[];
}
