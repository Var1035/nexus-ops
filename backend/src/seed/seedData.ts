import fs from 'fs';
import path from 'path';
import { getGraph } from '../config/falkordb.js';

function parseCSV(text: string): Record<string, string>[] {
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && text[i + 1] === '\n') {
        i++;
      }
      if (current.trim().length > 0) {
        lines.push(current);
      }
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim().length > 0) {
    lines.push(current);
  }

  if (lines.length === 0) return [];

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let field = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQ && line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQ = !inQ;
        }
      } else if (c === ',' && !inQ) {
        result.push(field.trim());
        field = '';
      } else {
        field += c;
      }
    }
    result.push(field.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? '';
    });
    rows.push(row);
  }
  return rows;
}

function escapeCypher(str: string | undefined): string {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export async function seedFalkorDatabase() {
  console.log('[Seed] Connecting to FalkorDB Cloud...');
  const graph = await getGraph();

  console.log('[Seed] Clearing all existing graph data in keyspace...');
  try {
    await graph.query('MATCH (n) DETACH DELETE n');
    console.log('[Seed] Cleared existing graph successfully.');
  } catch (err: any) {
    console.warn('[Seed] Warning clearing graph:', err.message);
  }

  const baseDir = path.resolve(__dirname, '../../../');

  // 1. Read all CSVs
  console.log('[Seed] Reading provided CSV files...');
  const companiesRaw = fs.readFileSync(path.join(baseDir, 'companies.csv'), 'utf-8');
  const facilitiesRaw = fs.readFileSync(path.join(baseDir, 'facilities.csv'), 'utf-8');
  const materialsRaw = fs.readFileSync(path.join(baseDir, 'materials.csv'), 'utf-8');
  const relationshipsRaw = fs.readFileSync(path.join(baseDir, 'supplier_relationships.csv'), 'utf-8');
  const shipmentsRaw = fs.readFileSync(path.join(baseDir, 'shipments.csv'), 'utf-8');
  const incidentsRaw = fs.readFileSync(path.join(baseDir, 'incidents.csv'), 'utf-8');
  const ordersRaw = fs.readFileSync(path.join(baseDir, 'orders.csv'), 'utf-8');

  const companies = parseCSV(companiesRaw);
  const facilities = parseCSV(facilitiesRaw);
  const materials = parseCSV(materialsRaw);
  const relationships = parseCSV(relationshipsRaw);
  const shipments = parseCSV(shipmentsRaw);
  const incidents = parseCSV(incidentsRaw);
  const orders = parseCSV(ordersRaw);

  const activeIncidentCompanyIds = new Set(
    incidents.filter(i => i.resolution_status !== 'Resolved').map(i => i.company_id)
  );

  // 2. Create Company / Supplier Nodes
  console.log(`[Seed] Ingesting ${companies.length} Companies...`);
  const companyStatements = companies.map(c => {
    const isDisrupted = activeIncidentCompanyIds.has(c.company_id);
    const email = `ops@${c.company_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    return `(:Company:Supplier {
      id: '${escapeCypher(c.company_id)}',
      name: '${escapeCypher(c.company_name)}',
      industry: '${escapeCypher(c.industry)}',
      category: '${escapeCypher(c.industry)}',
      headquartersCountry: '${escapeCypher(c.headquarters_country)}',
      location: '${escapeCypher(c.headquarters_country)}',
      tier: ${c.industry.includes('Semiconductor') || c.industry.includes('Batteries') ? 1 : 2},
      reliabilityScore: ${Math.floor(92 + (c.company_id.charCodeAt(c.company_id.length - 1) % 7))},
      leadTimeDays: 7,
      contactEmail: '${escapeCypher(email)}',
      status: '${isDisrupted ? 'disrupted' : 'active'}'
    })`;
  });

  await graph.query(`CREATE ${companyStatements.join(', ')}`);

  // 3. Create Facilities (Factories, Warehouses, Ports)
  console.log(`[Seed] Ingesting ${facilities.length} Facilities...`);
  const facilityStatements = facilities.map(f => {
    const extraLabel = f.facility_type === 'Factory' ? ':Factory' : (f.facility_type === 'Warehouse' ? ':Warehouse' : ':Port');
    return `(:Facility${extraLabel} {
      id: '${escapeCypher(f.facility_id)}',
      name: '${escapeCypher(f.facility_name)}',
      city: '${escapeCypher(f.city)}',
      country: '${escapeCypher(f.country)}',
      location: '${escapeCypher(f.city + ', ' + f.country)}',
      facilityType: '${escapeCypher(f.facility_type)}',
      type: '${escapeCypher(f.facility_type)}'
    })`;
  });

  await graph.query(`CREATE ${facilityStatements.join(', ')}`);

  // 4. Create Materials
  console.log(`[Seed] Ingesting ${materials.length} Materials...`);
  const materialStatements = materials.map(m => {
    return `(:Material {
      id: '${escapeCypher(m.material_id)}',
      name: '${escapeCypher(m.material_name)}',
      category: '${escapeCypher(m.category)}',
      specCode: '${escapeCypher(m.material_id)}'
    })`;
  });

  await graph.query(`CREATE ${materialStatements.join(', ')}`);

  // 5. Create Products & BOM linkages
  console.log('[Seed] Ingesting Products & BOM Relationships...');
  const products = [
    { name: 'Laptop', materials: ['M009', 'M010', 'M017'] },
    { name: 'Automotive ECU', materials: ['M013', 'M014', 'M023'] },
    { name: 'Smartphone', materials: ['M011', 'M016', 'M008'] },
    { name: 'EV battery pack', materials: ['M003', 'M004', 'M015'] },
    { name: 'Display module', materials: ['M008', 'M017'] },
    { name: 'Power controller', materials: ['M002', 'M013'] },
    { name: 'GPU server', materials: ['M001', 'M012', 'M010'] },
    { name: 'Memory module', materials: ['M001', 'M010', 'M011'] }
  ];

  for (const p of products) {
    await graph.query(`
      CREATE (prod:Product {
        name: '${escapeCypher(p.name)}'
      })
    `);

    for (const mId of p.materials) {
      await graph.query(`
        MATCH (prod:Product {name: '${escapeCypher(p.name)}'})
        MATCH (m:Material {id: '${escapeCypher(mId)}'})
        CREATE (prod)-[:REQUIRES]->(m)
      `);
    }
  }

  // 6. Create Supplier Relationships
  console.log(`[Seed] Ingesting ${relationships.length} Supplier Relationships...`);
  const relBatchSize = 25;
  for (let i = 0; i < relationships.length; i += relBatchSize) {
    const chunk = relationships.slice(i, i + relBatchSize);
    for (const r of chunk) {
      await graph.query(`
        MATCH (c:Company {id: '${escapeCypher(r.company_id)}'})
        MATCH (m:Material {id: '${escapeCypher(r.material_id)}'})
        MATCH (f:Facility {id: '${escapeCypher(r.destination_facility_id)}'})
        CREATE (c)-[:SUPPLIES {
          id: '${escapeCypher(r.relationship_id)}',
          leadTimeDays: ${Number(r.estimated_lead_time_days) || 7},
          capacityUnits: ${Number(r.simulated_capacity_units) || 5000}
        }]->(m),
        (c)-[:CAN_SUPPLY {
          leadTimeDays: ${Number(r.estimated_lead_time_days) || 7},
          capacityUnits: ${Number(r.simulated_capacity_units) || 5000}
        }]->(m),
        (c)-[:DELIVERS_TO {
          leadTimeDays: ${Number(r.estimated_lead_time_days) || 7}
        }]->(f),
        (f)-[:STOCKS {
          capacityUnits: ${Number(r.simulated_capacity_units) || 5000}
        }]->(m)
      `);
    }
  }

  // 7. Create Incidents
  console.log(`[Seed] Ingesting ${incidents.length} Incidents...`);
  for (const inc of incidents) {
    const delayDays = Number(inc.estimated_delay_days) || 1;
    const sev = inc.severity.toUpperCase();
    const multiplier = sev === 'CRITICAL' ? 65000 : (sev === 'HIGH' ? 35000 : (sev === 'MEDIUM' ? 18000 : 7500));
    const exposure = delayDays * multiplier;
    const status = inc.resolution_status === 'Under review'
      ? 'ACTIVE_DISRUPTION'
      : (inc.resolution_status === 'Mitigated' ? 'AWAITING_APPROVAL' : 'RESOLVED');

    await graph.query(`
      CREATE (i:Incident {
        id: '${escapeCypher(inc.incident_id)}',
        code: '${escapeCypher(inc.incident_id)}',
        title: '${escapeCypher(inc.incident_type + ' at ' + inc.facility_name)}',
        incidentType: '${escapeCypher(inc.incident_type)}',
        severity: '${escapeCypher(sev)}',
        status: '${escapeCypher(status)}',
        timestamp: '${escapeCypher(inc.incident_date)}',
        supplierId: '${escapeCypher(inc.company_id)}',
        supplierName: '${escapeCypher(inc.company_name)}',
        facilityId: '${escapeCypher(inc.facility_id)}',
        facilityName: '${escapeCypher(inc.facility_name)}',
        delayDays: ${delayDays},
        summary: '${escapeCypher(inc.description)}',
        resolutionStatus: '${escapeCypher(inc.resolution_status)}',
        financialExposure: ${exposure},
        affectedOrdersCount: ${Math.min(12, Math.max(1, Math.round(delayDays * 1.5)))}
      })
    `);

    // Connect to affected Company and Facility
    await graph.query(`
      MATCH (i:Incident {id: '${escapeCypher(inc.incident_id)}'})
      MATCH (c:Company {id: '${escapeCypher(inc.company_id)}'})
      MATCH (f:Facility {id: '${escapeCypher(inc.facility_id)}'})
      CREATE (i)-[:AFFECTS_COMPANY]->(c),
             (i)-[:AFFECTS_FACILITY]->(f)
    `);

    // If resolved, create Episodic Memory node (:HistoricalIncident)
    if (inc.resolution_status === 'Resolved') {
      await graph.query(`
        CREATE (:HistoricalIncident {
          id: 'hist-${escapeCypher(inc.incident_id)}',
          incidentCode: '${escapeCypher(inc.incident_id)}',
          title: '${escapeCypher(inc.incident_type + ' at ' + inc.facility_name)}',
          date: '${escapeCypher(inc.incident_date)}',
          disruptedEntity: '${escapeCypher(inc.company_name + ' / ' + inc.facility_name)}',
          decisionChosen: 'Autonomous Dual-Sourcing & Logistics Reroute',
          actionExecuted: 'Rerouted alternate certified supplier buffer via priority charter freight',
          outcomeMetric: '${delayDays}d disruption absorbed; zero contract SLA penalties breached',
          financialDelta: '+$${(delayDays * 4200).toLocaleString()} logistics surcharge (saved $${(exposure).toLocaleString()} SLA breach)',
          falkorDbKey: 'memory:${escapeCypher(inc.incident_id)}'
        })
      `);
    }
  }

  // 8. Create Shipments (in batches)
  console.log(`[Seed] Ingesting ${shipments.length} Shipments...`);
  const shipmentBatchSize = 40;
  for (let i = 0; i < shipments.length; i += shipmentBatchSize) {
    const chunk = shipments.slice(i, i + shipmentBatchSize);
    for (const s of chunk) {
      const delayDays = Number(s.delay_days) || 0;
      const curStatus = delayDays > 0 ? (delayDays >= 7 ? 'CRITICAL_DELAY' : 'DELAYED') : 'ON_TIME';

      await graph.query(`
        CREATE (shp:Shipment {
          id: '${escapeCypher(s.shipment_id)}',
          trackingCode: '${escapeCypher(s.shipment_id)}',
          carrierId: '${escapeCypher(s.company_id)}',
          materialId: '${escapeCypher(s.material_id)}',
          quantity: ${Number(s.quantity_units) || 1000},
          originId: '${escapeCypher(s.origin_facility_id)}',
          origin: '${escapeCypher(s.origin_facility_name)}',
          destinationId: '${escapeCypher(s.destination_facility_id)}',
          destination: '${escapeCypher(s.destination_facility_name)}',
          shipmentDate: '${escapeCypher(s.shipment_date)}',
          scheduledEta: '${escapeCypher(s.expected_arrival_date)}',
          actualArrival: '${escapeCypher(s.actual_arrival_date)}',
          delayDays: ${delayDays},
          currentStatus: '${curStatus}',
          status: '${escapeCypher(s.status)}'
        })
      `);

      // Link to Carrier, Material, Origin, Destination
      await graph.query(`
        MATCH (shp:Shipment {id: '${escapeCypher(s.shipment_id)}'})
        MATCH (c:Company {id: '${escapeCypher(s.company_id)}'})
        MATCH (m:Material {id: '${escapeCypher(s.material_id)}'})
        MATCH (orig:Facility {id: '${escapeCypher(s.origin_facility_id)}'})
        MATCH (dest:Facility {id: '${escapeCypher(s.destination_facility_id)}'})
        CREATE (c)-[:CARRIES]->(shp),
               (shp)-[:TRANSPORTS]->(m),
               (shp)-[:ORIGINATES_FROM]->(orig),
               (shp)-[:DESTINED_FOR]->(dest)
      `);
    }
    console.log(`[Seed] Shipments ${Math.min(i + shipmentBatchSize, shipments.length)} / ${shipments.length} ingested`);
  }

  // 9. Create Orders (in batches)
  console.log(`[Seed] Ingesting ${orders.length} Customer Orders...`);
  const orderBatchSize = 40;
  for (let i = 0; i < orders.length; i += orderBatchSize) {
    const chunk = orders.slice(i, i + orderBatchSize);
    for (const o of chunk) {
      const qty = Number(o.quantity) || 100;
      const delayDays = Number(o.simulated_delay_days) || 0;
      const tier = o.priority === 'Critical' ? 'Tier-1 Enterprise' : (o.priority === 'High' ? 'Tier-2 Preferred' : 'Tier-3 Standard');
      const unitVal = o.product_name.includes('server') ? 450 : (o.product_name.includes('battery') ? 350 : 180);
      const val = qty * unitVal;
      const slaPenalty = o.priority === 'Critical' ? 2400 : (o.priority === 'High' ? 1200 : 400);
      const status = o.order_status === 'Delayed' || o.order_status === 'At risk' ? 'AT_RISK' : 'ON_TRACK';

      await graph.query(`
        CREATE (ord:Order {
          id: '${escapeCypher(o.order_id)}',
          orderDate: '${escapeCypher(o.order_date)}',
          customerName: '${escapeCypher(o.customer_name)}',
          tier: '${tier}',
          priority: '${escapeCypher(o.priority)}',
          productName: '${escapeCypher(o.product_name)}',
          quantity: ${qty},
          value: ${val},
          deadline: '${escapeCypher(o.promised_delivery_date)}',
          delayDays: ${delayDays},
          status: '${status}',
          slaPenaltyPerDay: ${slaPenalty},
          fulfillmentFacilityId: '${escapeCypher(o.fulfillment_facility_id)}'
        })
      `);

      // Link to fulfillment facility and product
      await graph.query(`
        MATCH (ord:Order {id: '${escapeCypher(o.order_id)}'})
        MATCH (f:Facility {id: '${escapeCypher(o.fulfillment_facility_id)}'})
        OPTIONAL MATCH (p:Product {name: '${escapeCypher(o.product_name)}'})
        CREATE (ord)-[:FULFILLED_BY]->(f)
      `);
    }
    console.log(`[Seed] Orders ${Math.min(i + orderBatchSize, orders.length)} / ${orders.length} ingested`);
  }

  console.log('[Seed] All CSV data successfully seeded into FalkorDB Cloud!');
  const nodeCount = await graph.query('MATCH (n) RETURN count(n) AS c');
  const edgeCount = await graph.query('MATCH ()-[r]->() RETURN count(r) AS c');
  console.log(`[Seed] Verified FalkorDB Totals: ${nodeCount.data[0].c} Nodes, ${edgeCount.data[0].c} Edges.`);
}

// Allow running directly via CLI
if (process.argv[1]?.endsWith('seedData.ts') || process.argv[1]?.endsWith('seedData.js')) {
  seedFalkorDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}
