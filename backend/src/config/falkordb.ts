import { FalkorDB } from 'falkordb';
import dotenv from 'dotenv';

dotenv.config();

let client: any = null;
let graph: any = null;

export async function getFalkorClient() {
  if (client) return client;

  try {
    const falkorUrl = process.env.FALKORDB_URL;
    const host = process.env.FALKORDB_HOST || '127.0.0.1';
    const port = Number(process.env.FALKORDB_PORT) || 6379;
    const username = process.env.FALKORDB_USERNAME || 'falkordb';
    const password = process.env.FALKORDB_PASSWORD || '';

    if (falkorUrl) {
      console.log(`[FalkorDB] Connecting via connection URL...`);
      client = await FalkorDB.connect({ url: falkorUrl });
    } else {
      console.log(`[FalkorDB] Connecting to ${host}:${port} as ${username}...`);
      client = await FalkorDB.connect({
        username,
        password,
        socket: {
          host,
          port,
          tls: false,
        },
      });
    }

    client.on('error', (err: any) => {
      console.warn(`[FalkorDB Client Warning]: ${err.message}`);
    });

    const graphName = process.env.FALKORDB_GRAPH_NAME || 'nexus_ops';
    graph = client.selectGraph(graphName);
    console.log(`[FalkorDB] Successfully connected. Graph: ${graphName}`);
    return client;
  } catch (err: any) {
    console.error(`[FalkorDB] Connection error:`, err.message);
    throw err;
  }
}

export async function getGraph() {
  if (!graph) {
    await getFalkorClient();
  }
  return graph;
}

export async function checkFalkorDbStatus(): Promise<{
  connected: boolean;
  nodeCount: number;
  edgeCount: number;
  latencyMs: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    const g = await getGraph();
    const nodeRes = await g.query('MATCH (n) RETURN count(n) AS nodeCount');
    const edgeRes = await g.query('MATCH ()-[r]->() RETURN count(r) AS edgeCount');

    const nodeCount = Number(nodeRes.data?.[0]?.nodeCount ?? 0);
    const edgeCount = Number(edgeRes.data?.[0]?.edgeCount ?? 0);
    const latencyMs = Date.now() - start;

    return {
      connected: true,
      nodeCount,
      edgeCount,
      latencyMs,
    };
  } catch (err: any) {
    return {
      connected: false,
      nodeCount: 0,
      edgeCount: 0,
      latencyMs: Date.now() - start,
      error: err.message,
    };
  }
}
