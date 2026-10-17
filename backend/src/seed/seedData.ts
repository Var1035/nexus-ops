import { getGraph, getFalkorClient } from '../config/falkordb.js';

export async function seedFalkorDatabase() {
  console.log('[Seed] Initializing FalkorDB graph schema & supply chain ontology...');
  const graph = await getGraph();

  // Clear existing graph nodes and relationships in this keyspace for a clean seed
  console.log('[Seed] Clearing existing graph...');
  try {
    await graph.query('MATCH (n) DETACH DELETE n');
  } catch (e: any) {
    console.log('[Seed] Graph was clean or uninitialized:', e.message);
  }

  console.log('[Seed] Creating Nodes...');

  // 1. Suppliers
  await graph.query(`
    CREATE (s1:Supplier {
      id: 'sup-1',
      name: 'Apex Microelectronics Ltd',
      tier: 1,
      category: 'Titanium & Silicon Substrates',
      location: 'Yokohama, Japan',
      contactEmail: 'logistics@apexmicro.jp',
      reliabilityScore: 94,
      leadTimeDays: 14,
      status: 'disrupted'
    }),
    (s2:Supplier {
      id: 'sup-2',
      name: 'Vanguard Materials Inc',
      tier: 1,
      category: 'Titanium-Silicon Alloy (Aerospace)',
      location: 'Reno, NV, USA',
      contactEmail: 'priority@vanguardmaterials.com',
      reliabilityScore: 97,
      leadTimeDays: 3,
      status: 'backup'
    }),
    (s3:Supplier {
      id: 'sup-3',
      name: 'Nordic Battery Systems',
      tier: 1,
      category: 'Lithium NMC Cell Pack',
      location: 'Gothenburg, Sweden',
      contactEmail: 'operations@nordicbattery.se',
      reliabilityScore: 91,
      leadTimeDays: 6,
      status: 'disrupted'
    }),
    (s4:Supplier {
      id: 'sup-4',
      name: 'SinoPrecision Castings',
      tier: 2,
      category: 'Cast Aluminum Chassis',
      location: 'Shenzhen, China',
      contactEmail: 'export@sinoprecision.cn',
      reliabilityScore: 89,
      leadTimeDays: 3,
      status: 'operational'
    })
  `);

  // 2. Materials
  await graph.query(`
    CREATE (m1:Material {
      id: 'mat-402',
      name: 'Titanium-Silicon Alloy (MAT-402)',
      specCode: 'ASTM-B265-TiSi',
      unitCost: 320,
      bufferStockKg: 450,
      dailyConsumptionKg: 150
    }),
    (m2:Material {
      id: 'mat-309',
      name: 'Lithium NMC Cell Pack (MAT-309)',
      specCode: 'IEC-62660-NMC',
      unitCost: 180,
      bufferStockKg: 800,
      dailyConsumptionKg: 100
    }),
    (m3:Material {
      id: 'mat-112',
      name: 'Cast Aluminum Chassis (MAT-112)',
      specCode: 'AL-6061-T6',
      unitCost: 95,
      bufferStockKg: 1200,
      dailyConsumptionKg: 200
    })
  `);

  // 3. Warehouses & Facilities
  await graph.query(`
    CREATE (w1:Warehouse {
      id: 'wh-01',
      name: 'Central Hub Reno',
      location: 'Reno, Nevada',
      capacityUnits: 50000
    }),
    (f1:Factory {
      id: 'fac-1',
      name: 'GigaFactory Nevada - Line 3',
      location: 'Storey County, NV',
      primaryLine: 'Assembly Line 3 (Flight Avionics)',
      downtimeCostPerHour: 4000
    }),
    (f2:Factory {
      id: 'fac-2',
      name: 'Munich Assembly Center',
      location: 'Munich, Germany',
      primaryLine: 'Powertrain Integration',
      downtimeCostPerHour: 3500
    })
  `);

  // 4. In-Transit Shipments
  await graph.query(`
    CREATE (shp1:Shipment {
      id: 'shp-1',
      trackingCode: 'SHP-8821',
      carrier: 'Pacific Ocean Express',
      material: 'Titanium-Silicon Alloy (MAT-402)',
      quantity: 1500,
      origin: 'Yokohama, Japan',
      destination: 'Central Hub Reno',
      scheduledEta: '2026-10-18',
      delayDays: 10,
      currentStatus: 'CRITICAL_DELAY'
    }),
    (shp2:Shipment {
      id: 'shp-2',
      trackingCode: 'SHP-8842',
      carrier: 'Maersk Line Intermodal',
      material: 'Lithium NMC Cell Pack (MAT-309)',
      quantity: 2400,
      origin: 'Rotterdam Port',
      destination: 'Munich Assembly Center',
      scheduledEta: '2026-10-21',
      delayDays: 6,
      currentStatus: 'DELAYED'
    }),
    (shp3:Shipment {
      id: 'shp-3',
      trackingCode: 'SHP-8711',
      carrier: 'Cosco Freightways',
      material: 'Cast Aluminum Chassis (MAT-112)',
      quantity: 3200,
      origin: 'Shenzhen, China',
      destination: 'Central Hub Reno',
      scheduledEta: '2026-10-24',
      delayDays: 3,
      currentStatus: 'DELAYED'
    })
  `);

  // 5. Products & BOM
  await graph.query(`
    CREATE (p1:Product {
      id: 'prod-1',
      sku: 'SKU-FC90',
      name: 'Autonomous Flight Controller X1',
      category: 'Avionics',
      unitPrice: 12500
    }),
    (p2:Product {
      id: 'prod-2',
      sku: 'SKU-BP44',
      name: 'Solid-State EV Battery Pack',
      category: 'Energy Storage',
      unitPrice: 8500
    })
  `);

  // 6. Customers & Customer Purchase Orders
  await graph.query(`
    CREATE (c1:Customer {
      id: 'cust-1',
      name: 'SpaceDynamics Corp',
      tier: 'Enterprise Tier-1 VIP',
      relationshipYears: 6
    }),
    (c2:Customer {
      id: 'cust-2',
      name: 'AeroDefense Systems Ltd',
      tier: 'Enterprise Tier-1 VIP',
      relationshipYears: 4
    }),
    (c3:Customer {
      id: 'cust-3',
      name: 'SkyRoute Autonomous Logistics',
      tier: 'Commercial Tier-2',
      relationshipYears: 2
    }),
    (c4:Customer {
      id: 'cust-4',
      name: 'Quantum Aerospace Industries',
      tier: 'Commercial Tier-2',
      relationshipYears: 3
    }),
    (o1:Order {
      id: 'ord-101',
      customerName: 'SpaceDynamics Corp',
      tier: 'Enterprise Tier-1 VIP',
      productName: 'Autonomous Flight Controller X1',
      quantity: 22,
      value: 280000,
      deadline: '2026-10-22',
      slaPenaltyPerDay: 2400,
      status: 'AT_RISK'
    }),
    (o2:Order {
      id: 'ord-102',
      customerName: 'AeroDefense Systems Ltd',
      tier: 'Enterprise Tier-1 VIP',
      productName: 'Autonomous Flight Controller X1',
      quantity: 16,
      value: 205000,
      deadline: '2026-10-24',
      slaPenaltyPerDay: 1800,
      status: 'AT_RISK'
    }),
    (o3:Order {
      id: 'ord-103',
      customerName: 'SkyRoute Autonomous Logistics',
      tier: 'Commercial Tier-2',
      productName: 'Solid-State EV Battery Pack',
      quantity: 25,
      value: 120000,
      deadline: '2026-10-28',
      slaPenaltyPerDay: 850,
      status: 'ON_TRACK'
    }),
    (o4:Order {
      id: 'ord-104',
      customerName: 'Quantum Aerospace Industries',
      tier: 'Commercial Tier-2',
      productName: 'Autonomous Flight Controller X1',
      quantity: 7,
      value: 90000,
      deadline: '2026-11-02',
      slaPenaltyPerDay: 600,
      status: 'ON_TRACK'
    })
  `);

  // 7. Active Supply Incidents
  await graph.query(`
    CREATE (inc1:Incident {
      id: 'inc-1',
      code: 'INC-2024-8891',
      title: 'Apex Microelectronics: 10-Day Supply Disruption on Titanium Alloy',
      severity: 'CRITICAL',
      status: 'ACTIVE_INVESTIGATION',
      timestamp: '14 minutes ago',
      financialExposure: 485000,
      supplierName: 'Apex Microelectronics Ltd',
      materialName: 'Titanium-Silicon Alloy (MAT-402)',
      delayDays: 10,
      summary: 'Apex announced unplanned vacuum furnace maintenance delay. Inbound shipment SHP-8821 delayed by 10 days, risking downstream production line stoppage in 72 hours across 2 assembly lines and breach of enterprise Tier-1 customer contracts.'
    }),
    (inc2:Incident {
      id: 'inc-2',
      code: 'INC-2024-8842',
      title: 'Rotterdam Port Congestion: High-Density Battery Cells Delay',
      severity: 'HIGH',
      status: 'ACTIVE_INVESTIGATION',
      timestamp: '2 hours ago',
      financialExposure: 210000,
      supplierName: 'Nordic Battery Systems',
      materialName: 'Lithium NMC Cell Pack (MAT-309)',
      delayDays: 6,
      summary: 'Severe berth congestion at Rotterdam terminal delayed maritime carrier Maersk Line. Inbound cargo delayed by 6 days affecting Munich powertrain integration.'
    })
  `);

  console.log('[Seed] Creating Relationships (Ontology Graph Edges)...');

  // Connect Supplier -> Supplies -> Material
  await graph.query(`
    MATCH (s:Supplier {id: 'sup-1'}), (m:Material {id: 'mat-402'}) CREATE (s)-[:SUPPLIES {leadTimeDays: 14}]->(m)
  `);
  await graph.query(`
    MATCH (s:Supplier {id: 'sup-2'}), (m:Material {id: 'mat-402'}) CREATE (s)-[:CAN_SUPPLY {leadTimeDays: 3, reliability: 97}]->(m)
  `);
  await graph.query(`
    MATCH (s:Supplier {id: 'sup-3'}), (m:Material {id: 'mat-309'}) CREATE (s)-[:SUPPLIES {leadTimeDays: 6}]->(m)
  `);
  await graph.query(`
    MATCH (s:Supplier {id: 'sup-4'}), (m:Material {id: 'mat-112'}) CREATE (s)-[:SUPPLIES {leadTimeDays: 3}]->(m)
  `);

  // Connect Shipments -> Carries -> Material & Delivered_To -> Warehouse
  await graph.query(`
    MATCH (shp:Shipment {id: 'shp-1'}), (m:Material {id: 'mat-402'}) CREATE (shp)-[:CARRIES]->(m)
  `);
  await graph.query(`
    MATCH (shp:Shipment {id: 'shp-1'}), (w:Warehouse {id: 'wh-01'}) CREATE (shp)-[:DELIVERED_TO]->(w)
  `);
  await graph.query(`
    MATCH (shp:Shipment {id: 'shp-2'}), (m:Material {id: 'mat-309'}) CREATE (shp)-[:CARRIES]->(m)
  `);
  await graph.query(`
    MATCH (shp:Shipment {id: 'shp-2'}), (f:Factory {id: 'fac-2'}) CREATE (shp)-[:DELIVERED_TO]->(f)
  `);

  // Connect Products -> Uses_BOM -> Materials
  await graph.query(`
    MATCH (p:Product {id: 'prod-1'}), (m:Material {id: 'mat-402'}) CREATE (p)-[:USES_BOM {qtyPerUnit: 1.2}]->(m)
  `);
  await graph.query(`
    MATCH (p:Product {id: 'prod-1'}), (m:Material {id: 'mat-112'}) CREATE (p)-[:USES_BOM {qtyPerUnit: 1.0}]->(m)
  `);
  await graph.query(`
    MATCH (p:Product {id: 'prod-2'}), (m:Material {id: 'mat-309'}) CREATE (p)-[:USES_BOM {qtyPerUnit: 4.0}]->(m)
  `);

  // Connect Products -> Produced_At -> Factories
  await graph.query(`
    MATCH (p:Product {id: 'prod-1'}), (f:Factory {id: 'fac-1'}) CREATE (p)-[:PRODUCED_AT]->(f)
  `);
  await graph.query(`
    MATCH (p:Product {id: 'prod-2'}), (f:Factory {id: 'fac-2'}) CREATE (p)-[:PRODUCED_AT]->(f)
  `);

  // Connect Orders -> Orders -> Products & Placed_By -> Customers
  await graph.query(`
    MATCH (o:Order {id: 'ord-101'}), (p:Product {id: 'prod-1'}) CREATE (o)-[:ORDERS]->(p)
  `);
  await graph.query(`
    MATCH (o:Order {id: 'ord-101'}), (c:Customer {id: 'cust-1'}) CREATE (o)-[:PLACED_BY]->(c)
  `);
  await graph.query(`
    MATCH (o:Order {id: 'ord-102'}), (p:Product {id: 'prod-1'}) CREATE (o)-[:ORDERS]->(p)
  `);
  await graph.query(`
    MATCH (o:Order {id: 'ord-102'}), (c:Customer {id: 'cust-2'}) CREATE (o)-[:PLACED_BY]->(c)
  `);
  await graph.query(`
    MATCH (o:Order {id: 'ord-103'}), (p:Product {id: 'prod-2'}) CREATE (o)-[:ORDERS]->(p)
  `);
  await graph.query(`
    MATCH (o:Order {id: 'ord-103'}), (c:Customer {id: 'cust-3'}) CREATE (o)-[:PLACED_BY]->(c)
  `);
  await graph.query(`
    MATCH (o:Order {id: 'ord-104'}), (p:Product {id: 'prod-1'}) CREATE (o)-[:ORDERS]->(p)
  `);
  await graph.query(`
    MATCH (o:Order {id: 'ord-104'}), (c:Customer {id: 'cust-4'}) CREATE (o)-[:PLACED_BY]->(c)
  `);

  // Connect Incident -> Affects -> Shipment & Supplier
  await graph.query(`
    MATCH (inc:Incident {id: 'inc-1'}), (s:Supplier {id: 'sup-1'}) CREATE (inc)-[:AFFECTS]->(s)
  `);
  await graph.query(`
    MATCH (inc:Incident {id: 'inc-1'}), (shp:Shipment {id: 'shp-1'}) CREATE (inc)-[:AFFECTS]->(shp)
  `);

  // 8. Historical Episodic Memory Case (Company Brain)
  await graph.query(`
    CREATE (h1:HistoricalIncident {
      id: 'hist-1',
      incidentCode: 'INC-2024-7102',
      title: 'Trans-Pacific Port Congestion on Titanium Alloy',
      date: 'Aug 14, 2026',
      disruptedEntity: 'Apex Microelectronics (Yokohama Hub)',
      decisionChosen: 'Execute Dual-Sourcing via Vanguard Materials',
      actionExecuted: 'Issued emergency PO #VNG-9921 for 600kg alloy via Air Express (FedEx Charter)',
      outcomeMetric: 'Prevented Line 3 stoppage; 0 days customer SLA delay',
      financialDelta: '+$6,400 freight surcharge vs $340,000 saved downtime',
      falkorDbKey: 'EPISODIC_MEM_2026_08_14'
    })
  `);

  console.log('[Seed] FalkorDB Supply Chain Graph seeded successfully!');
}

if (process.argv[1]?.includes('seedData')) {
  seedFalkorDatabase()
    .then(() => {
      console.log('[Seed] Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Error:', err);
      process.exit(1);
    });
}
