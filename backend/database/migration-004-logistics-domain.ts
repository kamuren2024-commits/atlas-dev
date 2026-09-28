/**
 * PHASE 02: DATABASE MIGRATION 004 — LOGISTICS DOMAIN
 *
 * Creates SQLite tables for the Logistics Intelligence Bounded Context.
 * Provides real persistence for: Facilities, Vehicles, Products, Stock,
 * Orders, Movements, Drivers, Routes, Events.
 *
 * Status: IMPLEMENTATION
 * Date: 2026-09-02
 */

import { DatabaseCore } from './db-core';

export class LogisticsDomainMigration {
  public static async apply(db: DatabaseCore): Promise<void> {
    console.log('[Migration-004] Logistics Domain — creating logistics tables');

    const migrationSQL: string[] = [];

    // ------------------------------------------------------------------
    // 1. logistics_facility
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS logistics_facility (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        facility_type TEXT NOT NULL DEFAULT 'WAREHOUSE',
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        address TEXT,
        city TEXT,
        state TEXT,
        country TEXT,
        latitude REAL,
        longitude REAL,
        capacity INTEGER DEFAULT 0,
        current_stock INTEGER DEFAULT 0,
        operating_hours TEXT,
        contact_info TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_facility_tenant ON logistics_facility(tenant_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_facility_type ON logistics_facility(facility_type);`);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_facility_code ON logistics_facility(tenant_id, code);`);

    // ------------------------------------------------------------------
    // 2. logistics_vehicle
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS logistics_vehicle (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        vehicle_type TEXT NOT NULL DEFAULT 'TRUCK',
        status TEXT NOT NULL DEFAULT 'AVAILABLE',
        license_plate TEXT,
        capacity_weight REAL DEFAULT 0,
        capacity_volume REAL DEFAULT 0,
        fuel_type TEXT DEFAULT 'DIESEL',
        make TEXT,
        model TEXT,
        year INTEGER,
        current_mileage REAL DEFAULT 0,
        facility_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_vehicle_tenant ON logistics_vehicle(tenant_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_vehicle_status ON logistics_vehicle(status);`);

    // ------------------------------------------------------------------
    // 3. logistics_product
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS logistics_product (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        name TEXT NOT NULL,
        sku TEXT NOT NULL,
        product_type TEXT NOT NULL DEFAULT 'GENERAL',
        category TEXT,
        unit_of_measure TEXT DEFAULT 'PCS',
        unit_weight REAL DEFAULT 0,
        unit_volume REAL DEFAULT 0,
        unit_cost REAL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        hazmat INTEGER DEFAULT 0,
        temperature_controlled INTEGER DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_product_tenant ON logistics_product(tenant_id);`);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_product_sku ON logistics_product(tenant_id, sku);`);

    // ------------------------------------------------------------------
    // 4. logistics_stock
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS logistics_stock (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        facility_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER DEFAULT 0,
        reserved INTEGER DEFAULT 0,
        available INTEGER GENERATED ALWAYS AS (quantity - reserved) STORED,
        status TEXT NOT NULL DEFAULT 'AVAILABLE',
        bin_location TEXT,
        last_counted_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(facility_id) REFERENCES logistics_facility(id),
        FOREIGN KEY(product_id) REFERENCES logistics_product(id)
      );
    `);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_stock_facility ON logistics_stock(facility_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_stock_product ON logistics_stock(product_id);`);

    // ------------------------------------------------------------------
    // 5. logistics_order
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS logistics_order (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        order_number TEXT NOT NULL,
        order_type TEXT NOT NULL DEFAULT 'PURCHASE',
        status TEXT NOT NULL DEFAULT 'PENDING',
        priority TEXT NOT NULL DEFAULT 'NORMAL',
        origin_facility_id TEXT,
        destination_facility_id TEXT,
        supplier_id TEXT,
        total_items INTEGER DEFAULT 0,
        total_weight REAL DEFAULT 0,
        estimated_departure TEXT,
        estimated_arrival TEXT,
        actual_departure TEXT,
        actual_arrival TEXT,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_order_tenant ON logistics_order(tenant_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_order_status ON logistics_order(status);`);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_order_number ON logistics_order(tenant_id, order_number);`);

    // ------------------------------------------------------------------
    // 6. logistics_order_item
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS logistics_order_item (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        unit_weight REAL DEFAULT 0,
        allocated INTEGER DEFAULT 0,
        picked INTEGER DEFAULT 0,
        shipped INTEGER DEFAULT 0,
        received INTEGER DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(order_id) REFERENCES logistics_order(id) ON DELETE CASCADE,
        FOREIGN KEY(product_id) REFERENCES logistics_product(id)
      );
    `);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_order_item_order ON logistics_order_item(order_id);`);

    // ------------------------------------------------------------------
    // 7. logistics_movement
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS logistics_movement (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        movement_number TEXT NOT NULL,
        movement_type TEXT NOT NULL DEFAULT 'OUTBOUND',
        status TEXT NOT NULL DEFAULT 'PLANNED',
        order_id TEXT,
        vehicle_id TEXT,
        driver_id TEXT,
        route_id TEXT,
        origin_facility_id TEXT,
        destination_facility_id TEXT,
        cargo_weight REAL DEFAULT 0,
        cargo_volume REAL DEFAULT 0,
        item_count INTEGER DEFAULT 0,
        planned_departure TEXT,
        planned_arrival TEXT,
        actual_departure TEXT,
        actual_arrival TEXT,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(order_id) REFERENCES logistics_order(id),
        FOREIGN KEY(vehicle_id) REFERENCES logistics_vehicle(id)
      );
    `);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_movement_tenant ON logistics_movement(tenant_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_movement_status ON logistics_movement(status);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_movement_order ON logistics_movement(order_id);`);

    // ------------------------------------------------------------------
    // 8. logistics_driver
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS logistics_driver (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        name TEXT NOT NULL,
        employee_id TEXT,
        license_number TEXT,
        license_type TEXT,
        status TEXT NOT NULL DEFAULT 'AVAILABLE',
        phone TEXT,
        email TEXT,
        certifications TEXT,
        assigned_vehicle_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_driver_tenant ON logistics_driver(tenant_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_driver_status ON logistics_driver(status);`);

    // ------------------------------------------------------------------
    // 9. logistics_route
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS logistics_route (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        route_type TEXT NOT NULL DEFAULT 'DELIVERY',
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        origin_facility_id TEXT,
        destination_facility_id TEXT,
        distance_km REAL DEFAULT 0,
        estimated_duration_hours REAL DEFAULT 0,
        cost_estimate REAL DEFAULT 0,
        waypoints_json TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_route_tenant ON logistics_route(tenant_id);`);

    // ------------------------------------------------------------------
    // 10. logistics_event
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS logistics_event (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        event_type TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'INFO',
        source TEXT,
        message TEXT NOT NULL,
        entity_type TEXT,
        entity_id TEXT,
        metadata_json TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_event_tenant ON logistics_event(tenant_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_event_type ON logistics_event(event_type);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_event_created ON logistics_event(created_at DESC);`);

    // Execute all DDL
    for (const sql of migrationSQL) {
      await db.run(sql);
    }

    // ------------------------------------------------------------------
    // SEED DATA — only if tables are empty
    // ------------------------------------------------------------------
    const facilityCount = await db.get<{ cnt: number }>('SELECT COUNT(*) as cnt FROM logistics_facility');
    if (facilityCount && facilityCount.cnt === 0) {
      console.log('[Migration-004] Seeding logistics domain with initial data...');
      await LogisticsDomainMigration.seedData(db);
    }

    console.log('[Migration-004] Logistics Domain migration complete');
  }

  private static async seedData(db: DatabaseCore): Promise<void> {
    const now = new Date().toISOString();

    // Facilities
    const facilities = [
      ['fac-001', 'ketraco', 'Mombasa Port Depot', 'DEPOT-MBS', 'DEPOT', 'ACTIVE', 'Mombasa', 'Mombasa', 'Kenya', -4.0435, 39.6682, 50000, 38200, '06:00-18:00'],
      ['fac-002', 'ketraco', 'Nairobi Central Warehouse', 'WH-NRB', 'WAREHOUSE', 'ACTIVE', 'Industrial Area', 'Nairobi', 'Kenya', -1.2921, 36.8219, 100000, 67450, '07:00-17:00'],
      ['fac-003', 'ketraco', 'Eldoret Distribution Center', 'DC-ELD', 'DISTRIBUTION_CENTER', 'ACTIVE', 'Eldoret', 'Eldoret', 'Kenya', 0.5143, 35.2698, 75000, 42100, '07:00-17:00'],
      ['fac-004', 'ketraco', 'Mombasa Inland Depot', 'DEPOT-MIK', 'DEPOT', 'ACTIVE', 'Mikindani', 'Mombasa', 'Kenya', -4.0619, 39.6398, 40000, 22800, '06:00-18:00'],
      ['fac-005', 'ketraco', 'Nakuru Project Yard', 'YD-NKR', 'DEPOT', 'MAINTENANCE', 'Nakuru', 'Nakuru', 'Kenya', -0.3031, 36.0800, 30000, 8900, '08:00-16:00'],
    ];
    for (const f of facilities) {
      await db.run(
        `INSERT INTO logistics_facility (id, tenant_id, name, code, facility_type, status, address, city, country, latitude, longitude, capacity, current_stock, operating_hours, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [...f, now, now]
      );
    }

    // Products
    const products = [
      ['prod-001', 'ketraco', 'HTLS Conductor', 'COND-HTLS', 'GENERAL', 'Conductors', 'M', 2.4, 0, 450.00, 'ACTIVE'],
      ['prod-002', 'ketraco', 'Composite Insulator', 'INS-COMP', 'GENERAL', 'Insulators', 'PCS', 8.5, 0, 185.00, 'ACTIVE'],
      ['prod-003', 'ketraco', 'Transmission Tower Section', 'TWR-STD', 'GENERAL', 'Structures', 'PCS', 1200.0, 0, 8500.00, 'ACTIVE'],
      ['prod-004', 'ketraco', 'XLPE Cable 132kV', 'CAB-XLPE132', 'GENERAL', 'Cables', 'M', 12.0, 0, 320.00, 'ACTIVE'],
      ['prod-005', 'ketraco', 'Distribution Transformer 500kVA', 'TRF-500', 'GENERAL', 'Transformers', 'PCS', 1800.0, 0, 12500.00, 'ACTIVE'],
      ['prod-006', 'ketraco', 'Galvanized Steel Wire', 'WIRE-GSW', 'GENERAL', 'Conductors', 'KG', 1.0, 0, 8.50, 'ACTIVE'],
      ['prod-007', 'ketraco', 'Suspension Clamp Set', 'CLP-SUS', 'GENERAL', 'Fittings', 'SET', 3.2, 0, 45.00, 'ACTIVE'],
      ['prod-008', 'ketraco', 'Sacrificial Zinc Anode', 'ANOD-ZN', 'HAZMAT', 'Protection', 'PCS', 12.0, 0, 95.00, 'ACTIVE'],
    ];
    for (const p of products) {
      await db.run(
        `INSERT INTO logistics_product (id, tenant_id, name, sku, product_type, category, unit_of_measure, unit_weight, unit_volume, unit_cost, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [...p, now, now]
      );
    }

    // Vehicles
    const vehicles = [
      ['veh-001', 'ketraco', 'Truck Alpha-1', 'TRK-A01', 'TRUCK', 'IN_TRANSIT', 'KBA 123X', 12000, 35, 'DIESEL', 'Scania', 'P400', 2022],
      ['veh-002', 'ketraco', 'Truck Alpha-2', 'TRK-A02', 'TRUCK', 'AVAILABLE', 'KBA 234Y', 12000, 35, 'DIESEL', 'Scania', 'P400', 2023],
      ['veh-003', 'ketraco', 'Flatbed Beta-1', 'FLT-B01', 'TRUCK', 'IN_TRANSIT', 'KBB 345Z', 15000, 40, 'DIESEL', 'Volvo', 'FH16', 2021],
      ['veh-004', 'ketraco', 'Van Charlie-1', 'VAN-C01', 'VAN', 'AVAILABLE', 'KBC 456A', 3000, 12, 'DIESEL', 'Toyota', 'Hiace', 2023],
      ['veh-005', 'ketraco', 'Container Carrier', 'CTR-D01', 'TRUCK', 'MAINTENANCE', 'KBD 567B', 20000, 60, 'DIESEL', 'Mercedes', 'Actros', 2020],
      ['veh-006', 'ketraco', 'Crane Truck', 'CRN-E01', 'TRUCK', 'AVAILABLE', 'KBE 678C', 8000, 25, 'DIESEL', 'Liebherr', 'LTM1060', 2021],
      ['veh-007', 'ketraco', 'Pickup Utility', 'PKU-F01', 'VAN', 'AVAILABLE', 'KBF 789D', 1500, 4, 'DIESEL', 'Toyota', 'Hilux', 2024],
      ['veh-008', 'ketraco', 'Tanker Fuel', 'TNK-G01', 'TRUCK', 'IN_TRANSIT', 'KCA 890E', 25000, 30, 'DIESEL', 'Scania', 'P450', 2022],
    ];
    for (const v of vehicles) {
      await db.run(
        `INSERT INTO logistics_vehicle (id, tenant_id, name, code, vehicle_type, status, license_plate, capacity_weight, capacity_volume, fuel_type, make, model, year, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [...v, now, now]
      );
    }

    // Drivers
    const drivers = [
      ['drv-001', 'ketraco', 'James Mwangi', 'EMP-001', 'DL-12345678', 'C', 'AVAILABLE', '+254712345678', 'veh-001'],
      ['drv-002', 'ketraco', 'Peter Ochieng', 'EMP-002', 'DL-23456789', 'C', 'ON_DUTY', '+254723456789', 'veh-003'],
      ['drv-003', 'ketraco', 'Sarah Wanjiku', 'EMP-003', 'DL-34567890', 'B', 'AVAILABLE', '+254734567890', 'veh-004'],
      ['drv-004', 'ketraco', 'David Kipchoge', 'EMP-004', 'DL-45678901', 'C', 'ON_DUTY', '+254745678901', 'veh-008'],
      ['drv-005', 'ketraco', 'Grace Auma', 'EMP-005', 'DL-56789012', 'B', 'OFF_DUTY', '+254756789012', null],
    ];
    for (const d of drivers) {
      await db.run(
        `INSERT INTO logistics_driver (id, tenant_id, name, employee_id, license_number, license_type, status, phone, assigned_vehicle_id, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [...d, now, now]
      );
    }

    // Routes
    const routes = [
      ['rte-001', 'ketraco', 'Mombasa-Nairobi Highway', 'RT-MBS-NRB', 'DELIVERY', 'ACTIVE', 'fac-001', 'fac-002', 485, 8.5, 85000],
      ['rte-002', 'ketraco', 'Nairobi-Eldoret Expressway', 'RT-NRB-ELD', 'DELIVERY', 'ACTIVE', 'fac-002', 'fac-003', 310, 5.5, 52000],
      ['rte-003', 'ketraco', 'Mombasa Inland-Nairobi', 'RT-MIK-NRB', 'TRANSFER', 'ACTIVE', 'fac-004', 'fac-002', 470, 8.0, 80000],
      ['rte-004', 'ketraco', 'Nakuru-Nairobi', 'RT-NKR-NRB', 'DELIVERY', 'ACTIVE', 'fac-005', 'fac-002', 160, 2.5, 28000],
      ['rte-005', 'ketraco', 'Mombasa-Eldoret Direct', 'RT-MBS-ELD', 'DELIVERY', 'INACTIVE', 'fac-001', 'fac-003', 720, 12.0, 120000],
    ];
    for (const r of routes) {
      await db.run(
        `INSERT INTO logistics_route (id, tenant_id, name, code, route_type, status, origin_facility_id, destination_facility_id, distance_km, estimated_duration_hours, cost_estimate, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [...r, now, now]
      );
    }

    // Orders
    const orders = [
      ['ord-001', 'ketraco', 'PO-2026-0891', 'PURCHASE', 'IN_TRANSIT', 'HIGH', 'fac-001', 'fac-002', 'sup-001', 156, 2840, '2026-08-28T06:00:00Z', '2026-09-01T18:00:00Z'],
      ['ord-002', 'ketraco', 'PO-2026-0892', 'PURCHASE', 'DELIVERED', 'URGENT', 'fac-004', 'fac-002', 'sup-002', 89, 1560, '2026-08-25T07:00:00Z', '2026-08-30T14:00:00Z'],
      ['ord-003', 'ketraco', 'PO-2026-0893', 'PURCHASE', 'PENDING', 'CRITICAL', 'fac-001', 'fac-003', 'sup-001', 234, 4120, '2026-09-03T05:00:00Z', '2026-09-08T16:00:00Z'],
      ['ord-004', 'ketraco', 'TRF-2026-0041', 'TRANSFER', 'CONFIRMED', 'NORMAL', 'fac-002', 'fac-005', null, 45, 680, '2026-09-02T08:00:00Z', '2026-09-03T12:00:00Z'],
      ['ord-005', 'ketraco', 'PO-2026-0894', 'PURCHASE', 'DISPATCHED', 'NORMAL', 'fac-004', 'fac-003', 'sup-003', 178, 3200, '2026-09-01T06:00:00Z', '2026-09-05T18:00:00Z'],
      ['ord-006', 'ketraco', 'PO-2026-0895', 'PURCHASE', 'PENDING', 'LOW', 'fac-001', 'fac-002', 'sup-002', 56, 890, '2026-09-10T07:00:00Z', '2026-09-15T16:00:00Z'],
    ];
    for (const o of orders) {
      await db.run(
        `INSERT INTO logistics_order (id, tenant_id, order_number, order_type, status, priority, origin_facility_id, destination_facility_id, supplier_id, total_items, total_weight, estimated_departure, estimated_arrival, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [...o, now, now]
      );
    }

    // Movements
    const movements = [
      ['mov-001', 'ketraco', 'MOV-2026-0101', 'OUTBOUND', 'IN_TRANSIT', 'ord-001', 'veh-001', 'drv-001', 'rte-001', 'fac-001', 'fac-002', 2840, 18, 156, '2026-08-28T06:00:00Z', '2026-09-01T18:00:00Z'],
      ['mov-002', 'ketraco', 'MOV-2026-0102', 'OUTBOUND', 'COMPLETED', 'ord-002', 'veh-004', 'drv-003', 'rte-003', 'fac-004', 'fac-002', 1560, 10, 89, '2026-08-25T07:00:00Z', '2026-08-30T14:00:00Z'],
      ['mov-003', 'ketraco', 'MOV-2026-0103', 'OUTBOUND', 'IN_TRANSIT', 'ord-005', 'veh-003', 'drv-002', 'rte-003', 'fac-004', 'fac-003', 3200, 22, 178, '2026-09-01T06:00:00Z', '2026-09-05T18:00:00Z'],
      ['mov-004', 'ketraco', 'MOV-2026-0104', 'OUTBOUND', 'IN_TRANSIT', 'ord-001', 'veh-008', 'drv-004', 'rte-001', 'fac-001', 'fac-002', 8500, 28, 12, '2026-08-29T06:00:00Z', '2026-09-02T18:00:00Z'],
    ];
    for (const m of movements) {
      await db.run(
        `INSERT INTO logistics_movement (id, tenant_id, movement_number, movement_type, status, order_id, vehicle_id, driver_id, route_id, origin_facility_id, destination_facility_id, cargo_weight, cargo_volume, item_count, planned_departure, planned_arrival, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [...m, now, now]
      );
    }

    // Events
    const events = [
      ['evt-001', 'ketraco', 'SHIPMENT_DEPARTED', 'INFO', 'gps_tracker', 'Shipment departed from Mombasa Port Depot en route to Nairobi', 'movement', 'mov-001'],
      ['evt-002', 'ketraco', 'INVENTORY_LOW', 'WARNING', 'inventory_system', 'Stock below reorder threshold for XLPE Cable 132kV at Nairobi Warehouse', 'stock', 'stk-001'],
      ['evt-003', 'ketraco', 'VEHICLE_BREAKDOWN', 'CRITICAL', 'fleet_monitor', 'Truck Alpha-1 experiencing engine overheating on Mombasa-Nairobi highway near Voi', 'vehicle', 'veh-001'],
      ['evt-004', 'ketraco', 'MOVEMENT_DELAYED', 'WARNING', 'route_optimizer', 'Movement MOV-2026-0103 delayed 4 hours due to road conditions on Mombasa-Nairobi route', 'movement', 'mov-003'],
      ['evt-005', 'ketraco', 'MAINTENANCE_COMPLETED', 'INFO', 'maintenance_system', 'Container Carrier completed scheduled brake inspection and oil change', 'vehicle', 'veh-005'],
      ['evt-006', 'ketraco', 'ORDER_RECEIVED', 'INFO', 'order_system', 'Purchase order PO-2026-0895 received from Nakuru Project Yard for tower components', 'order', 'ord-006'],
      ['evt-007', 'ketraco', 'STOCK_RECEIVED', 'INFO', 'warehouse_system', '89 units of Composite Insulator received at Nairobi Central Warehouse from Mombasa', 'stock', 'stk-002'],
      ['evt-008', 'ketraco', 'ROUTE_DISRUPTION', 'WARNING', 'weather_service', 'Heavy rainfall expected along Nairobi-Eldoret corridor, ETA delays likely', 'route', 'rte-002'],
    ];
    for (const e of events) {
      await db.run(
        `INSERT INTO logistics_event (id, tenant_id, event_type, severity, source, message, entity_type, entity_id, created_at) VALUES (?,?,?,?,?,?,?,?,?)`,
        [...e, now]
      );
    }

    // Stock
    const stocks = [
      ['stk-001', 'ketraco', 'fac-002', 'prod-004', 4200, 800, 'AVAILABLE'],
      ['stk-002', 'ketraco', 'fac-002', 'prod-002', 1250, 200, 'AVAILABLE'],
      ['stk-003', 'ketraco', 'fac-001', 'prod-001', 8400, 1500, 'AVAILABLE'],
      ['stk-004', 'ketraco', 'fac-001', 'prod-003', 45, 10, 'AVAILABLE'],
      ['stk-005', 'ketraco', 'fac-003', 'prod-005', 120, 30, 'AVAILABLE'],
      ['stk-006', 'ketraco', 'fac-003', 'prod-007', 890, 150, 'AVAILABLE'],
      ['stk-007', 'ketraco', 'fac-004', 'prod-006', 15600, 3000, 'AVAILABLE'],
      ['stk-008', 'ketraco', 'fac-004', 'prod-008', 340, 0, 'AVAILABLE'],
      ['stk-009', 'ketraco', 'fac-002', 'prod-001', 2100, 600, 'AVAILABLE'],
      ['stk-010', 'ketraco', 'fac-005', 'prod-003', 8, 2, 'RESERVED'],
    ];
    for (const s of stocks) {
      await db.run(
        `INSERT INTO logistics_stock (id, tenant_id, facility_id, product_id, quantity, reserved, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)`,
        [...s, now, now]
      );
    }

    console.log('[Migration-004] Seed data inserted: 5 facilities, 8 products, 8 vehicles, 5 drivers, 5 routes, 6 orders, 4 movements, 8 events, 10 stock records');
  }
}
