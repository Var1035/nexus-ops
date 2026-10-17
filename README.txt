NEXUS OPS — COMPACT HACKATHON DATASET

Size: 32 graph entities/nodes plus relationship CSVs:
4 suppliers, 4 materials, 4 products, 4 facilities, 4 shipments, 4 orders,
2 customers, and 2 incidents.

Data provenance:
Supplier names are real company names used only as demo labels. Supplier-material
relationships, facilities, shipments, orders, delays, customers, and incidents are
illustrative synthetic data. They are NOT verified real-world supplier relationships,
company-owned facilities, transactions, or actual incidents. Keep this disclaimer
in your demo and README.

Suggested graph relationships:
- (:Supplier)-[:SUPPLIES]->(:Material) from supplier_materials.csv
- (:Product)-[:USES]->(:Material) from product_materials.csv
- (:Shipment)-[:CARRIES]->(:Material) and (:Shipment)-[:DELIVERED_TO]->(:Facility)
  from shipments.csv
- (:Order)-[:ORDERS]->(:Product) and (:Order)-[:PLACED_BY]->(:Customer)
  from orders.csv
- (:Incident)-[:AFFECTS]->(:Shipment) from affected_shipment_id in incidents.csv

Demo: investigate I1 or I2, traverse to affected materials/products/orders/customers,
generate an evidence-grounded recommendation, then create Decision/Action/Outcome
memory nodes during the demo. Operational data is synthetic, not real company events.
