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

const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Incidents
  async getIncidents(): Promise<Incident[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/incidents`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async getIncident(id: string): Promise<Incident | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/incidents/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async investigateIncident(id: string): Promise<{
    findings: AgentFinding[];
    options: DecisionOption[];
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/incidents/${id}/investigate`, {
        method: 'POST',
      });
      if (!res.ok) return { findings: [], options: [] };
      return await res.json();
    } catch {
      return { findings: [], options: [] };
    }
  },

  // Graph Data
  async getGraph(incidentId?: string): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    try {
      const url = incidentId
        ? `${API_BASE_URL}/graph/impact/${incidentId}`
        : `${API_BASE_URL}/graph`;
      const res = await fetch(url);
      if (!res.ok) return { nodes: [], edges: [] };
      return await res.json();
    } catch {
      return { nodes: [], edges: [] };
    }
  },

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/suppliers`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  // Shipments
  async getShipments(): Promise<Shipment[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/shipments`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  // Historical Memory
  async getHistory(): Promise<HistoricalIncident[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/history`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  // Action Approval
  async approveDecision(decisionId: string): Promise<{ success: boolean; outcome: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/decisions/${decisionId}/approve`, {
        method: 'POST',
      });
      if (!res.ok) return { success: false, outcome: '' };
      return await res.json();
    } catch {
      return { success: false, outcome: '' };
    }
  },

  // Copilot Chat
  async sendChat(message: string): Promise<{ reply: string; citations?: any[] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/copilot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch {
      return {
        reply: 'Backend not connected. Connect FalkorDB to query live graph.',
      };
    }
  },
};
