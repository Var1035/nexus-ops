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

  // Read all 10 CSV files
  console.log('[Seed] Reading provided 10 CSV files...');
  const customersRaw = fs.readFileSync(path.join(baseDir, 'customers.csv'), 'utf-8');
  const facilitiesRaw = fs.readFileSync(path.join(baseDir, 'facilities.csv'), 'utf-8');
  const materialsRaw = fs.readFileSync(path.join(baseDir, 'materials.csv'), 'utf-8');
  const productsRaw = fs.readFileSync(path.join(baseDir, 'products.csv'), 'utf-8');
  const productMaterialsRaw = fs.readFileSync(path.join(baseDir, 'product_materials.csv'), 'utf-8');
  const suppliersRaw = fs.readFileSync(path.join(baseDir, 'suppliers.csv'), 'utf-8');
  const supplierMaterialsRaw = fs.readFileSync(path.join(baseDir, 'supplier_materials.csv'), 'utf-8');
  const shipmentsRaw = fs.readFileSync(path.join(baseDir, 'shipments.csv'), 'utf-8');
  const ordersRaw = fs.readFileSync(path.join(baseDir, 'orders.csv'), 'utf-8');
  const incidentsRaw = fs.readFileSync(path.join(baseDir, 'incidents.csv'), 'utf-8');

  const customers = parseCSV(customersRaw);
  const facilities = parseCSV(facilitiesRaw);
  const materials = parseCSV(materialsRaw);
  const products = parseCSV(productsRaw);
  const productMaterials = parseCSV(productMaterialsRaw);
  const suppliers = parseCSV(suppliersRaw);
  const supplierMaterials = parseCSV(supplierMaterialsRaw);
  const shipments = parseCSV(shipmentsRaw);
  const orders = parseCSV(ordersRaw);
  const incidents = parseCSV(incidentsRaw);

  // Maps for quick property lookup
  const materialMap = new Map(materials.map(m => [m.id, m.name]));
  const productMap = new Map(products.map(p => [p.id, p.name]));
  const facilityMap = new Map(facilities.map(f => [f.id, f]));
  const customerMap = new Map(customers.map(c => [c.id, c]));
  const supplierMaterialMap = new Map(supplierMaterials.map(sm => [sm.material_id, sm.supplier_id]));

  // 1. Create Customers
  console.log(`[Seed] Ingesting ${customers.length} Customers...`);
  for (const c of customers) {
    await graph.query(`
      CREATE (:Customer {
        id: '${escapeCypher(c.id)}',
        name: '${escapeCypher(c.name)}',
        region: '${escapeCypher(c.region)}',
        tier: 'Tier-1 Enterprise'
      })
    `);
  }

  // 2. Create Facilities
  console.log(`[Seed] Ingesting ${facilities.length} Facilities...`);
  for (const f of facilities) {
    const extraLabel = f.type === 'Warehouse' ? ':Warehouse' : ':Factory';
    await graph.query(`
      CREATE (:Facility${extraLabel} {
        id: '${escapeCypher(f.id)}',
        name: '${escapeCypher(f.name)}',
        type: '${escapeCypher(f.type)}',
        facilityType: '${escapeCypher(f.type)}',
        location: '${escapeCypher(f.location)}'
      })
    `);
  }

  // 3. Create Materials
  console.log(`[Seed] Ingesting ${materials.length} Materials...`);
  for (const m of materials) {
    await graph.query(`
      CREATE (:Material {
        id: '${escapeCypher(m.id)}',
        name: '${escapeCypher(m.name)}',
        category: '${m.name.includes('Battery') ? 'Battery' : (m.name.includes('Semiconductor') ? 'Electronics' : 'Mechanical')}'
      })
    `);
  }

  // 4. Create Products
  console.log(`[Seed] Ingesting ${products.length} Products...`);
  for (const p of products) {
    await graph.query(`
      CREATE (:Product {
        id: '${escapeCypher(p.id)}',
        name: '${escapeCypher(p.name)}'
      })
    `);
  }

  // 5. Connect Products to Materials (product_materials.csv BOM)
  console.log(`[Seed] Ingesting ${productMaterials.length} Product BOM relationships...`);
  for (const pm of productMaterials) {
    await graph.query(`
      MATCH (p:Product {id: '${escapeCypher(pm.product_id)}'})
      MATCH (m:Material {id: '${escapeCypher(pm.material_id)}'})
      CREATE (p)-[:REQUIRES]->(m)
    `);
  }

  // 6. Create Suppliers
  console.log(`[Seed] Ingesting ${suppliers.length} Suppliers...`);
  for (const s of suppliers) {
    const email = `ops@${s.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    await graph.query(`
      CREATE (:Supplier:Company {
        id: '${escapeCypher(s.id)}',
        name: '${escapeCypher(s.name)}',
        note: '${escapeCypher(s.note)}',
        tier: 1,
        location: 'India',
        contactEmail: '${escapeCypher(email)}',
        reliabilityScore: 96,
        leadTimeDays: 7,
        status: 'active'
      })
    `);
  }

  // 7. Connect Suppliers to Materials (supplier_materials.csv)
  console.log(`[Seed] Ingesting ${supplierMaterials.length} Supplier Material relationships...`);
  for (const sm of supplierMaterials) {
    await graph.query(`
      MATCH (s:Supplier {id: '${escapeCypher(sm.supplier_id)}'})
      MATCH (m:Material {id: '${escapeCypher(sm.material_id)}'})
      CREATE (s)-[:SUPPLIES {leadTimeDays: 7, reliabilityScore: 96}]->(m),
             (s)-[:CAN_SUPPLY {leadTimeDays: 7, reliabilityScore: 96}]->(m)
    `);
  }

  // Add alternative backup suppliers via [:CAN_SUPPLY] for multi-agent reasoning
  await graph.query(`
    MATCH (s2:Supplier {id: 'S2'}) MATCH (m1:Material {id: 'M1'})
    CREATE (s2)-[:CAN_SUPPLY {leadTimeDays: 4, reliabilityScore: 98, isBackup: true}]->(m1)
  `);
  await graph.query(`
    MATCH (s4:Supplier {id: 'S4'}) MATCH (m3:Material {id: 'M3'})
    CREATE (s4)-[:CAN_SUPPLY {leadTimeDays: 3, reliabilityScore: 97, isBackup: true}]->(m3)
  `);

  // 8. Create Shipments (shipments.csv)
  console.log(`[Seed] Ingesting ${shipments.length} Shipments...`);
  for (const sh of shipments) {
    const delay = Number(sh.delay_days) || 0;
    const matName = materialMap.get(sh.material_id) || sh.material_id;
    const destFac = facilityMap.get(sh.destination_id);
    const destName = destFac ? destFac.name : sh.destination_id;
    const supId = supplierMaterialMap.get(sh.material_id) || 'S1';

    await graph.query(`
      CREATE (shp:Shipment {
        id: '${escapeCypher(sh.id)}',
        trackingCode: '${escapeCypher(sh.id)}',
        materialId: '${escapeCypher(sh.material_id)}',
        material: '${escapeCypher(matName)}',
        destinationId: '${escapeCypher(sh.destination_id)}',
        destination: '${escapeCypher(destName)}',
        status: '${escapeCypher(sh.status)}',
        currentStatus: '${sh.status === 'Delayed' ? 'CRITICAL_DELAY' : (sh.status === 'In Transit' ? 'ON_TIME' : 'DELIVERED')}',
        delayDays: ${delay},
        quantity: ${sh.id === 'SH1' ? 450 : (sh.id === 'SH2' ? 300 : (sh.id === 'SH3' ? 250 : 500))}
      })
    `);

    // Connect Shipment to Material, Destination Facility, and Carrier Supplier
    await graph.query(`
      MATCH (shp:Shipment {id: '${escapeCypher(sh.id)}'})
      MATCH (m:Material {id: '${escapeCypher(sh.material_id)}'})
      MATCH (f:Facility {id: '${escapeCypher(sh.destination_id)}'})
      MATCH (s:Supplier {id: '${escapeCypher(supId)}'})
      CREATE (s)-[:CARRIES]->(shp),
             (shp)-[:TRANSPORTS]->(m),
             (shp)-[:DESTINED_FOR]->(f)
    `);
  }

  // 9. Create Orders (orders.csv)
  console.log(`[Seed] Ingesting ${orders.length} Orders...`);
  for (const o of orders) {
    const qty = Number(o.quantity) || 50;
    const prodName = productMap.get(o.product_id) || o.product_id;
    const cust = customerMap.get(o.customer_id);
    const custName = cust ? cust.name : o.customer_id;
    const val = qty * (o.product_id === 'P1' ? 1200 : (o.product_id === 'P2' ? 850 : (o.product_id === 'P3' ? 950 : 600)));
    const status = o.status === 'At Risk' ? 'AT_RISK' : 'ON_TRACK';

    await graph.query(`
      CREATE (ord:Order {
        id: '${escapeCypher(o.id)}',
        productId: '${escapeCypher(o.product_id)}',
        productName: '${escapeCypher(prodName)}',
        customerId: '${escapeCypher(o.customer_id)}',
        customerName: '${escapeCypher(custName)}',
        quantity: ${qty},
        value: ${val},
        status: '${status}',
        tier: 'Tier-1 Enterprise',
        deadline: '2026-10-24',
        slaPenaltyPerDay: ${o.status === 'At Risk' ? 2400 : 1200}
      })
    `);

    // Link Order to Product, Customer, and primary Assembly Factory (F1 / F2)
    const facId = o.product_id === 'P1' || o.product_id === 'P4' ? 'F1' : 'F2';
    await graph.query(`
      MATCH (ord:Order {id: '${escapeCypher(o.id)}'})
      MATCH (p:Product {id: '${escapeCypher(o.product_id)}'})
      MATCH (c:Customer {id: '${escapeCypher(o.customer_id)}'})
      MATCH (f:Facility {id: '${facId}'})
      CREATE (c)-[:PLACED]->(ord),
             (ord)-[:ORDERS_PRODUCT]->(p),
             (ord)-[:FULFILLED_BY]->(f)
    `);
  }

  // 10. Create Incidents (incidents.csv)
  console.log(`[Seed] Ingesting ${incidents.length} Incidents...`);
  for (const inc of incidents) {
    const shp = shipments.find(s => s.id === inc.affected_shipment_id);
    const delayDays = shp ? Number(shp.delay_days) || 5 : 5;
    const matId = shp ? shp.material_id : 'M1';
    const matName = materialMap.get(matId) || 'Critical Component';
    const facId = shp ? shp.destination_id : 'F1';
    const fac = facilityMap.get(facId);
    const facName = fac ? fac.name : 'Factory Alpha';
    const supId = supplierMaterialMap.get(matId) || 'S1';
    const sup = suppliers.find(s => s.id === supId);
    const supName = sup ? sup.name : 'Tata Motors';

    const exposure = delayDays * (inc.severity === 'High' ? 45000 : 25000);

    await graph.query(`
      CREATE (i:Incident {
        id: '${escapeCypher(inc.id)}',
        code: '${escapeCypher(inc.id)}',
        title: '${escapeCypher(inc.title)}',
        severity: '${inc.severity.toUpperCase()}',
        status: 'ACTIVE_DISRUPTION',
        timestamp: '2026-10-17',
        affectedShipmentId: '${escapeCypher(inc.affected_shipment_id)}',
        delayDays: ${delayDays},
        materialId: '${escapeCypher(matId)}',
        materialName: '${escapeCypher(matName)}',
        facilityId: '${escapeCypher(facId)}',
        facilityName: '${escapeCypher(facName)}',
        supplierId: '${escapeCypher(supId)}',
        supplierName: '${escapeCypher(supName)}',
        financialExposure: ${exposure},
        affectedOrdersCount: ${inc.id === 'I1' ? 2 : 3},
        summary: '${escapeCypher(inc.title)} on shipment ${escapeCypher(inc.affected_shipment_id)} destined for ${escapeCypher(facName)} causing an estimated ${delayDays}-day stoppage risk.'
      })
    `);

    // Connect Incident to Shipment, Material, Facility, and Supplier
    await graph.query(`
      MATCH (i:Incident {id: '${escapeCypher(inc.id)}'})
      MATCH (shp:Shipment {id: '${escapeCypher(inc.affected_shipment_id)}'})
      MATCH (m:Material {id: '${escapeCypher(matId)}'})
      MATCH (f:Facility {id: '${escapeCypher(facId)}'})
      MATCH (s:Supplier {id: '${escapeCypher(supId)}'})
      CREATE (i)-[:AFFECTS_SHIPMENT]->(shp),
             (i)-[:AFFECTS_MATERIAL]->(m),
             (i)-[:AFFECTS_FACILITY]->(f),
             (i)-[:AFFECTS_SUPPLIER]->(s)
    `);

    // Mark affected supplier as disrupted
    await graph.query(`
      MATCH (s:Supplier {id: '${escapeCypher(supId)}'})
      SET s.status = 'disrupted'
    `);
  }

  // 11. Initial Episodic Memory record (Company Brain)
  console.log('[Seed] Ingesting initial Episodic Memory in FalkorDB...');
  await graph.query(`
    CREATE (:HistoricalIncident {
      id: 'hist-baseline-01',
      incidentCode: 'INC-HIST-01',
      title: 'Resolved: Lithium Battery Corridor Disruption',
      date: 'Oct 12, 2026',
      disruptedEntity: 'Tata Motors / Factory Alpha (Pune)',
      decisionChosen: 'Autonomous Dual-Sourcing via Mahindra & Mahindra Priority Route',
      actionExecuted: 'Authorized emergency PO for 150 battery units with expedited freight transit',
      outcomeMetric: '6-day disruption absorbed; 100% of EV customer orders fulfilled on time',
      financialDelta: '+₹8,500 logistics surcharge (saved ₹144,000 liquidated damages)',
      falkorDbKey: 'EPISODIC_HIST_01'
    })
  `);

  const nodeCount = await graph.query('MATCH (n) RETURN count(n) AS c');
  const edgeCount = await graph.query('MATCH ()-[r]->() RETURN count(r) AS c');
  console.log(`[Seed] Seeded cleanly! FalkorDB Totals: ${nodeCount.data[0].c} Nodes, ${edgeCount.data[0].c} Edges.`);
}

if (process.argv[1]?.endsWith('seedData.ts') || process.argv[1]?.endsWith('seedData.js')) {
  seedFalkorDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}
