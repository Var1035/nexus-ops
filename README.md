# Nexus Ops — Graph-Powered Autonomous Supply Chain Response

Nexus Ops is an autonomous supply chain incident triage, simulation, and response system powered by **FalkorDB Graph Database** and a **Multi-Agent Reasoning Swarm**.

When supply chain disruptions strike (e.g. supplier delays, port congestion, factory outages), Nexus Ops traverses the connected graph ontology, assesses blast-radius financial exposure, evaluates dual-sourcing alternatives, models what-if scenarios, and facilitates human-in-the-loop authorization with writeback to FalkorDB Episodic Memory ("Company Brain").

---

##  Key Features

- **Real-Time Operations Dashboard**: Network health, active supply disruptions, revenue at risk, and interactive subgraph canvas.
- **Incident War Room**: 100% full-width FalkorDB Subgraph Traversal canvas paired with grounded multi-agent findings and decision trade-offs.
- **5-Agent Cognitive Swarm**:
  - **Impact Analysis Agent**: Computes component depletion hour and assembly line downtime.
  - **Risk Assessment Agent**: Calculates contractual SLA exposure and liquidated damages across customer tiers.
  - **Procurement Agent**: Discovers alternative certified vendors via `[:CAN_SUPPLY]` graph edges.
  - **Logistics Agent**: Balances freight expediting surcharges vs line stoppage penalties.
  - **Decision Synthesis Agent**: Formulates multi-criteria response options with utility scoring.
- **Human-in-the-Loop Authorization**: Operators approve mitigation protocols, instantly recording decisions and verified outcomes into FalkorDB Episodic Memory.
- **Supply Chain Graph Explorer**: Topology canvas with an integrated Cypher query console.
- **Grounded AI Copilot**: Persistent slide-out assistant that queries the FalkorDB graph to answer operational queries.
- **Dark & Light Mode**: Complete theme support with smooth transitions.

---

## Architecture & Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Vanilla CSS Design System, Lucide Icons.
- **Backend API**: Node.js, Express, TypeScript, Official `falkordb` SDK.
- **Database**: FalkorDB Cloud (Graph database powered by Redis protocol & Cypher engine).

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- FalkorDB Cloud instance (or local FalkorDB Docker container)

### 2. Installation
Clone the repository and install dependencies:

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..
```

### 3. Environment Configuration
Create a `.env` file inside `backend/` based on `backend/.env.example`:

```env
PORT=5000
FALKORDB_URL=redis://falkordb:<PASSWORD>@<HOST>:<PORT>
FALKORDB_HOST=<HOST>
FALKORDB_PORT=<PORT>
FALKORDB_USERNAME=falkordb
FALKORDB_PASSWORD=<PASSWORD>
FALKORDB_GRAPH_NAME=nexus_ops
```

### 4. Seed FalkorDB Graph Ontology
Populate your FalkorDB instance with suppliers, materials, shipments, facilities, and customer orders:

```bash
npm run seed
```

### 5. Run the Application
Start both frontend and backend:

```bash
# Run backend server (http://localhost:5000)
npm run backend

# Run frontend client (http://localhost:5173)
npm run dev
```

---

## 📄 License
MIT
