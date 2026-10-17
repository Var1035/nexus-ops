import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  NavSection,
  Incident,
  GraphNode,
  GraphEdge,
  AgentFinding,
  DecisionOption,
  Supplier,
  Shipment,
  Order,
  HistoricalIncident,
  ChatMessage,
} from '../types';
import { api } from '../services/api';

interface AppContextType {
  activeSection: NavSection;
  setActiveSection: (section: NavSection) => void;
  incidents: Incident[];
  activeIncident: Incident | null;
  setActiveIncident: (incident: Incident | null) => void;
  isInvestigating: boolean;
  investigationProgress: number;
  runInvestigation: (incidentId: string) => void;
  agentFindings: AgentFinding[];
  decisionOptions: DecisionOption[];
  selectedOption: DecisionOption | null;
  setSelectedOption: (option: DecisionOption | null) => void;
  isSimulating: boolean;
  simulatedOutcome: string | null;
  approveAndExecute: (optionId: string) => void;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  toggleCopilot: () => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  selectedNode: GraphNode | null;
  setSelectedNode: (node: GraphNode | null) => void;
  suppliers: Supplier[];
  shipments: Shipment[];
  orders: Order[];
  history: HistoricalIncident[];
  systemStats: {
    falkorDbStatus: 'CONNECTED' | 'DISCONNECTED';
    graphNodeCount: number;
    graphEdgeCount: number;
    activeIncidentsCount: number;
    atRiskRevenue: number;
  };
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [isInvestigating, setIsInvestigating] = useState<boolean>(false);
  const [investigationProgress, setInvestigationProgress] = useState<number>(0);
  const [agentFindings, setAgentFindings] = useState<AgentFinding[]>([]);
  const [decisionOptions, setDecisionOptions] = useState<DecisionOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<DecisionOption | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedOutcome, setSimulatedOutcome] = useState<string | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [history, setHistory] = useState<HistoricalIncident[]>([]);
  const [falkorDbStatus, setFalkorDbStatus] = useState<'CONNECTED' | 'DISCONNECTED'>('DISCONNECTED');

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Fetch live data from backend FalkorDB API
  const refreshData = useCallback(async () => {
    try {
      const [fetchedIncidents, fetchedSuppliers, fetchedShipments, fetchedOrders, fetchedHistory, fetchedGraph] =
        await Promise.all([
          api.getIncidents(),
          api.getSuppliers(),
          api.getShipments(),
          api.getOrders(),
          api.getHistory(),
          api.getGraph(),
        ]);

      setIncidents(fetchedIncidents);
      if (fetchedIncidents.length > 0 && !activeIncident) {
        setActiveIncident(fetchedIncidents[0]);
      }
      setSuppliers(fetchedSuppliers);
      setShipments(fetchedShipments);
      setOrders(fetchedOrders);
      setHistory(fetchedHistory);
      setGraphNodes(fetchedGraph.nodes || []);
      setGraphEdges(fetchedGraph.edges || []);

      if (fetchedGraph.nodes && fetchedGraph.nodes.length > 0) {
        setFalkorDbStatus('CONNECTED');
      } else {
        setFalkorDbStatus('DISCONNECTED');
      }
    } catch {
      setFalkorDbStatus('DISCONNECTED');
    }
  }, [activeIncident]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const toggleCopilot = useCallback(() => {
    setIsCopilotOpen((prev) => !prev);
  }, []);

  const runInvestigation = useCallback(async (incidentId: string) => {
    setIsInvestigating(true);
    setInvestigationProgress(20);
    setActiveSection('incidents');

    try {
      const result = await api.investigateIncident(incidentId);
      setInvestigationProgress(80);
      setAgentFindings(result.findings || []);
      setDecisionOptions(result.options || []);
      if (result.options && result.options.length > 0) {
        setSelectedOption(result.options[0]);
      }
      setInvestigationProgress(100);
    } catch {
      setInvestigationProgress(100);
    } finally {
      setIsInvestigating(false);
    }
  }, []);

  const approveAndExecute = useCallback(
    async (optionId: string) => {
      setIsSimulating(true);
      try {
        const res = await api.approveDecision(optionId);
        setIsSimulating(false);
        setSimulatedOutcome(res.outcome || 'Action recorded in FalkorDB.');

        if (activeIncident) {
          setActiveIncident((prev) => (prev ? { ...prev, status: 'RESOLVED' } : null));
          setIncidents((prev) =>
            prev.map((inc) => (inc.id === activeIncident.id ? { ...inc, status: 'RESOLVED' } : inc))
          );
        }
        await refreshData();
      } catch {
        setIsSimulating(false);
      }
    },
    [activeIncident, refreshData]
  );

  const sendChatMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now',
    };

    setChatMessages((prev) => [...prev, userMsg]);

    const res = await api.sendChat(text);
    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      sender: 'assistant',
      text: res.reply,
      timestamp: 'Just now',
      graphCitations: res.citations,
    };

    setChatMessages((prev) => [...prev, aiMsg]);
  }, []);

  const systemStats = {
    falkorDbStatus,
    graphNodeCount: graphNodes.length,
    graphEdgeCount: graphEdges.length,
    activeIncidentsCount: incidents.filter((i) => i.status !== 'RESOLVED').length,
    atRiskRevenue: incidents
      .filter((i) => i.status !== 'RESOLVED')
      .reduce((acc, curr) => acc + (curr.financialExposure || 0), 0),
  };

  return (
    <AppContext.Provider
      value={{
        activeSection,
        setActiveSection,
        incidents,
        activeIncident,
        setActiveIncident,
        isInvestigating,
        investigationProgress,
        runInvestigation,
        agentFindings,
        decisionOptions,
        selectedOption,
        setSelectedOption,
        isSimulating,
        simulatedOutcome,
        approveAndExecute,
        isCopilotOpen,
        setIsCopilotOpen,
        toggleCopilot,
        chatMessages,
        sendChatMessage,
        graphNodes,
        graphEdges,
        selectedNode,
        setSelectedNode,
        suppliers,
        shipments,
        orders,
        history,
        systemStats,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
