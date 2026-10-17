// Zero dummy data. All operational data is fetched live from FalkorDB.
import {
  Incident,
  GraphNode,
  GraphEdge,
  AgentFinding,
  DecisionOption,
  Supplier,
  Shipment,
  Order,
  HistoricalIncident,
} from '../types';

export const INITIAL_INCIDENTS: Incident[] = [];
export const MOCK_GRAPH_NODES: GraphNode[] = [];
export const MOCK_GRAPH_EDGES: GraphEdge[] = [];
export const MOCK_AGENT_FINDINGS: AgentFinding[] = [];
export const MOCK_DECISION_OPTIONS: DecisionOption[] = [];
export const MOCK_SUPPLIERS: Supplier[] = [];
export const MOCK_SHIPMENTS: Shipment[] = [];
export const MOCK_ORDERS: Order[] = [];
export const MOCK_HISTORICAL_INCIDENTS: HistoricalIncident[] = [];
