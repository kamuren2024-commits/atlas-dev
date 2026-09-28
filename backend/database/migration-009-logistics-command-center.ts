/**
 * PHASE 09: DATABASE MIGRATION 009 — ATLAS LOGISTICS COMMAND CENTER
 * 
 * Production-grade persistence for KETRACO National Grid Logistics Intelligence.
 * Implements the 15 Core Domain Entities with strict multi-tenancy, provenance,
 * audit metadata, simulation flags, and lifecycle constraints.
 * 
 * Entities:
 * 1. Vehicle (logistics_vehicle_v2)
 * 2. Driver (logistics_driver_v2)
 * 3. Mission (logistics_mission)
 * 4. MissionStop (logistics_mission_stop)
 * 5. Cargo (logistics_cargo)
 * 6. Warehouse (logistics_warehouse)
 * 7. HeavyEquipment (logistics_heavy_equipment)
 * 8. Route (logistics_route_v2)
 * 9. FuelTransaction (logistics_fuel_transaction)
 * 10. MaintenanceRecord (logistics_maintenance_record)
 * 11. Contractor (logistics_contractor)
 * 12. LogisticsIncident (logistics_incident)
 * 13. LogisticsException (logistics_exception)
 * 14. ProjectLogisticsRequirement (logistics_project_requirement)
 * 15. Delivery (logistics_delivery)
 */

import { DatabaseCore } from './db-core';

export class LogisticsCommandCenterMigration {
  public static async apply(db: DatabaseCore): Promise<void> {
    console.log('[Migration-009] Applying Atlas Logistics Command Center schema...');

    await db.exec(`
      -- 1. VEHICLE
      CREATE TABLE IF NOT EXISTS logistics_vehicle_v2 (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        vehicle_type TEXT NOT NULL DEFAULT 'TRUCK',
        status TEXT NOT NULL DEFAULT 'AVAILABLE',
        license_plate TEXT NOT NULL,
        make TEXT,
        model TEXT,
        year INTEGER,
        capacity_weight REAL DEFAULT 0,
        capacity_volume REAL DEFAULT 0,
        fuel_type TEXT DEFAULT 'DIESEL',
        current_mileage REAL DEFAULT 0,
        current_speed REAL DEFAULT 0,
        current_heading REAL DEFAULT 0,
        fuel_level_pct REAL DEFAULT 100,
        engine_hours REAL DEFAULT 0,
        latitude REAL,
        longitude REAL,
        assigned_driver_id TEXT,
        assigned_mission_id TEXT,
        source TEXT NOT NULL DEFAULT 'KETRACO_TELEMATICS_GATEWAY',
        audit_meta TEXT NOT NULL DEFAULT '{}',
        simulation_flag INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_veh2_tenant ON logistics_vehicle_v2(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_veh2_status ON logistics_vehicle_v2(status);
      CREATE INDEX IF NOT EXISTS idx_veh2_sim ON logistics_vehicle_v2(simulation_flag);

      -- 2. DRIVER
      CREATE TABLE IF NOT EXISTS logistics_driver_v2 (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        name TEXT NOT NULL,
        employee_id TEXT NOT NULL,
        license_number TEXT NOT NULL,
        license_type TEXT NOT NULL DEFAULT 'CLASS_E',
        status TEXT NOT NULL DEFAULT 'AVAILABLE',
        phone TEXT,
        email TEXT,
        duty_hours_today REAL DEFAULT 0,
        duty_threshold_approaching INTEGER DEFAULT 0,
        assigned_vehicle_id TEXT,
        source TEXT NOT NULL DEFAULT 'KETRACO_HR_REGISTRY',
        audit_meta TEXT NOT NULL DEFAULT '{}',
        simulation_flag INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_drv2_tenant ON logistics_driver_v2(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_drv2_status ON logistics_driver_v2(status);

      -- 3. MISSION
      CREATE TABLE IF NOT EXISTS logistics_mission (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        mission_code TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'CREATED',
        priority TEXT NOT NULL DEFAULT 'MEDIUM',
        vehicle_id TEXT,
        driver_id TEXT,
        route_id TEXT,
        origin_name TEXT NOT NULL,
        origin_lat REAL,
        origin_lng REAL,
        destination_name TEXT NOT NULL,
        destination_lat REAL,
        destination_lng REAL,
        planned_departure TEXT,
        planned_arrival TEXT,
        actual_departure TEXT,
        actual_arrival TEXT,
        eta TEXT,
        delay_minutes INTEGER DEFAULT 0,
        delay_reason TEXT,
        risk_level TEXT NOT NULL DEFAULT 'LOW',
        source TEXT NOT NULL DEFAULT 'ATLAS_MISSION_DISPATCH',
        audit_meta TEXT NOT NULL DEFAULT '{}',
        simulation_flag INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_msn_tenant ON logistics_mission(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_msn_status ON logistics_mission(status);
      CREATE INDEX IF NOT EXISTS idx_msn_priority ON logistics_mission(priority);
      CREATE INDEX IF NOT EXISTS idx_msn_sim ON logistics_mission(simulation_flag);

      -- 4. MISSION STOP
      CREATE TABLE IF NOT EXISTS logistics_mission_stop (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        mission_id TEXT NOT NULL,
        sequence INTEGER NOT NULL DEFAULT 1,
        location_name TEXT NOT NULL,
        facility_id TEXT,
        latitude REAL,
        longitude REAL,
        stop_type TEXT NOT NULL DEFAULT 'DELIVERY',
        planned_arrival TEXT,
        actual_arrival TEXT,
        status TEXT NOT NULL DEFAULT 'PENDING',
        notes TEXT,
        source TEXT NOT NULL DEFAULT 'ATLAS_MISSION_DISPATCH',
        audit_meta TEXT NOT NULL DEFAULT '{}',
        simulation_flag INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_mstop_mission ON logistics_mission_stop(mission_id);

      -- 5. CARGO
      CREATE TABLE IF NOT EXISTS logistics_cargo (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        cargo_code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        mission_id TEXT,
        category TEXT NOT NULL DEFAULT 'SUBSTATION_SPARE',
        weight_kg REAL DEFAULT 0,
        volume_m3 REAL DEFAULT 0,
        quantity INTEGER DEFAULT 1,
        unit TEXT DEFAULT 'PCS',
        value_kes REAL DEFAULT 0,
        hazmat INTEGER DEFAULT 0,
        temperature_controlled INTEGER DEFAULT 0,
        priority TEXT NOT NULL DEFAULT 'MEDIUM',
        status TEXT NOT NULL DEFAULT 'IN_TRANSIT',
        destination_site TEXT NOT NULL,
        source TEXT NOT NULL DEFAULT 'KETRACO_SCM_INVENTORY',
        audit_meta TEXT NOT NULL DEFAULT '{}',
        simulation_flag INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_cargo_mission ON logistics_cargo(mission_id);
      CREATE INDEX IF NOT EXISTS idx_cargo_status ON logistics_cargo(status);

      -- 6. WAREHOUSE
      CREATE TABLE IF NOT EXISTS logistics_warehouse (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        facility_type TEXT NOT NULL DEFAULT 'WAREHOUSE',
        status TEXT NOT NULL DEFAULT 'OPERATIONAL',
        city TEXT NOT NULL,
        address TEXT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        capacity_sqm INTEGER DEFAULT 10000,
        items_count INTEGER DEFAULT 0,
        stock_percentage INTEGER DEFAULT 50,
        min_stock_threshold INTEGER DEFAULT 35,
        stock_alert_flag INTEGER DEFAULT 0,
        source TEXT NOT NULL DEFAULT 'KETRACO_ESTATES_ASSET',
        audit_meta TEXT NOT NULL DEFAULT '{}',
        simulation_flag INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_wh_tenant ON logistics_warehouse(tenant_id);

      -- 7. HEAVY EQUIPMENT
      CREATE TABLE IF NOT EXISTS logistics_heavy_equipment (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        equipment_code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        capacity_tons REAL DEFAULT 0,
        current_location TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        status TEXT NOT NULL DEFAULT 'AVAILABLE',
        certification_expiry TEXT NOT NULL,
        inspection_due_days INTEGER DEFAULT 30,
        assigned_project TEXT,
        source TEXT NOT NULL DEFAULT 'KETRACO_PLANT_MANAGEMENT',
        audit_meta TEXT NOT NULL DEFAULT '{}',
        simulation_flag INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_he_tenant ON logistics_heavy_equipment(tenant_id);

      -- 8. ROUTE
      CREATE TABLE IF NOT EXISTS logistics_route_v2 (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        corridor_type TEXT NOT NULL DEFAULT 'TRANSMISSION_CORRIDOR',
        origin_name TEXT NOT NULL,
        destination_name TEXT NOT NULL,
        distance_km REAL DEFAULT 0,
        estimated_duration_hours REAL DEFAULT 0,
        road_condition TEXT NOT NULL DEFAULT 'CLEAR',
        weather_hazard_level TEXT NOT NULL DEFAULT 'LOW',
        waypoints_json TEXT NOT NULL DEFAULT '[]',
        source TEXT NOT NULL DEFAULT 'KENHA_ATLAS_GIS',
        audit_meta TEXT NOT NULL DEFAULT '{}',
        simulation_flag INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_rt2_tenant ON logistics_route_v2(tenant_id);

      -- 9. FUEL TRANSACTION
      CREATE TABLE IF NOT EXISTS logistics_fuel_transaction (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        transaction_code TEXT NOT NULL UNIQUE,
        vehicle_id TEXT NOT NULL,
        driver_id TEXT,
        mission_id TEXT,
        fuel_type TEXT NOT NULL DEFAULT 'DIESEL',
        liters REAL NOT NULL,
        cost_kes REAL NOT NULL,
        odometer REAL NOT NULL,
        location_name TEXT NOT NULL,
        consumption_rate_l_100km REAL,
        expected_rate_l_100km REAL,
        anomaly_flag INTEGER DEFAULT 0,
        anomaly_description TEXT,
        timestamp TEXT NOT NULL,
        source TEXT NOT NULL DEFAULT 'TOTAL_FLEET_CARD_API',
        audit_meta TEXT NOT NULL DEFAULT '{}',
        simulation_flag INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_ft_vehicle ON logistics_fuel_transaction(vehicle_id);

      -- 10. MAINTENANCE RECORD
      CREATE TABLE IF NOT EXISTS logistics_maintenance_record (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        record_code TEXT NOT NULL UNIQUE,
        vehicle_id TEXT NOT NULL,
        maintenance_type TEXT NOT NULL DEFAULT 'PREVENTIVE',
        status TEXT NOT NULL DEFAULT 'SCHEDULED',
        odometer_at_service REAL,
        due_mileage REAL,
        due_date TEXT,
        description TEXT NOT NULL,
        risk_detected_flag INTEGER DEFAULT 0,
        cost_kes REAL DEFAULT 0,
        service_provider TEXT,
        source TEXT NOT NULL DEFAULT 'KETRACO_FLEET_WORKSHOP',
        audit_meta TEXT NOT NULL DEFAULT '{}',
        simulation_flag INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_mr_vehicle ON logistics_maintenance_record(vehicle_id);

      -- 11. CONTRACTOR
      CREATE TABLE IF NOT EXISTS logistics_contractor (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        service_type TEXT NOT NULL,
        rating REAL DEFAULT 4.5,
        active_contracts_count INTEGER DEFAULT 1,
        compliance_status TEXT NOT NULL DEFAULT 'COMPLIANT',
        contact_person TEXT,
        phone TEXT,
        source TEXT NOT NULL DEFAULT 'KETRACO_PROCUREMENT_VENDOR_PORTAL',
        audit_meta TEXT NOT NULL DEFAULT '{}',
        simulation_flag INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_ct_tenant ON logistics_contractor(tenant_id);

      -- 12. LOGISTICS INCIDENT
      CREATE TABLE IF NOT EXISTS logistics_incident (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        incident_code TEXT NOT NULL UNIQUE,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'MEDIUM',
        category TEXT NOT NULL DEFAULT 'MECHANICAL',
        description TEXT NOT NULL,
        location_name TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        reported_at TEXT NOT NULL,
        resolved_at TEXT,
        status TEXT NOT NULL DEFAULT 'OPEN',
        source TEXT NOT NULL DEFAULT 'ATLAS_OPERATOR_REPORT',
        audit_meta TEXT NOT NULL DEFAULT '{}',
        simulation_flag INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_inc_tenant ON logistics_incident(tenant_id);

      -- 13. LOGISTICS EXCEPTION (AI Operations Feed items)
      CREATE TABLE IF NOT EXISTS logistics_exception (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        exception_code TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'MEDIUM',
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        entity_name TEXT NOT NULL,
        location_name TEXT,
        variance TEXT,
        probability_pct INTEGER DEFAULT 80,
        ai_recommendation TEXT,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        source TEXT NOT NULL DEFAULT 'AI_OPERATIONS_FEED_ENGINE',
        audit_meta TEXT NOT NULL DEFAULT '{}',
        simulation_flag INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_exc_tenant ON logistics_exception(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_exc_status ON logistics_exception(status);

      -- 14. PROJECT LOGISTICS REQUIREMENT
      CREATE TABLE IF NOT EXISTS logistics_project_requirement (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        requirement_code TEXT NOT NULL UNIQUE,
        project_id TEXT NOT NULL,
        project_name TEXT NOT NULL,
        substation_target TEXT NOT NULL,
        requirement_description TEXT NOT NULL,
        required_date TEXT NOT NULL,
        delivery_status TEXT NOT NULL DEFAULT 'ON_TRACK',
        progress_pct INTEGER NOT NULL DEFAULT 50,
        source TEXT NOT NULL DEFAULT 'KETRACO_PROJECT_DELIVERY_SYSTEM',
        audit_meta TEXT NOT NULL DEFAULT '{}',
        simulation_flag INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_plr_tenant ON logistics_project_requirement(tenant_id);

      -- 15. DELIVERY
      CREATE TABLE IF NOT EXISTS logistics_delivery (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        delivery_code TEXT NOT NULL UNIQUE,
        mission_id TEXT NOT NULL,
        cargo_id TEXT,
        recipient_name TEXT NOT NULL,
        recipient_role TEXT NOT NULL,
        destination_substation TEXT NOT NULL,
        delivered_at TEXT,
        signoff_signature TEXT,
        status TEXT NOT NULL DEFAULT 'IN_TRANSIT',
        source TEXT NOT NULL DEFAULT 'ELECTRONIC_PROOF_OF_DELIVERY',
        audit_meta TEXT NOT NULL DEFAULT '{}',
        simulation_flag INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_del_mission ON logistics_delivery(mission_id);

      -- 16. FLEET (Aggregate fleet groups)
      CREATE TABLE IF NOT EXISTS logistics_fleet (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        fleet_type TEXT NOT NULL DEFAULT 'HEAVY_TRANSPORT',
        region TEXT NOT NULL DEFAULT 'NATIONAL',
        manager_name TEXT,
        vehicle_count INTEGER DEFAULT 0,
        active_missions_count INTEGER DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        source_type TEXT NOT NULL DEFAULT 'FLEET_REGISTRY',
        source_system TEXT NOT NULL DEFAULT 'ATLAS_LOGISTICS_FABRIC',
        audit_meta TEXT NOT NULL DEFAULT '{}',
        simulation_flag INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_flt_tenant ON logistics_fleet(tenant_id);

      -- 17. CARGO ITEM (Manifest level line-items)
      CREATE TABLE IF NOT EXISTS logistics_cargo_item (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        cargo_id TEXT NOT NULL,
        item_code TEXT NOT NULL,
        description TEXT NOT NULL,
        serial_number TEXT,
        quantity INTEGER DEFAULT 1,
        unit TEXT DEFAULT 'PCS',
        weight_kg REAL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'PACKAGED',
        source_type TEXT NOT NULL DEFAULT 'ERP_INVENTORY_LINE',
        source_system TEXT NOT NULL DEFAULT 'KETRACO_SCM_INVENTORY',
        audit_meta TEXT NOT NULL DEFAULT '{}',
        simulation_flag INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_citem_cargo ON logistics_cargo_item(cargo_id);
    `);

    // Ensure columns exist on logistics_vehicle_v2
    try {
      await db.run(`ALTER TABLE logistics_vehicle_v2 ADD COLUMN project_id TEXT`);
    } catch { /* exists */ }
    try {
      await db.run(`ALTER TABLE logistics_vehicle_v2 ADD COLUMN maintenance_status TEXT DEFAULT 'NORMAL'`);
    } catch { /* exists */ }
    try {
      await db.run(`ALTER TABLE logistics_vehicle_v2 ADD COLUMN compliance_status TEXT DEFAULT 'COMPLIANT'`);
    } catch { /* exists */ }
    try {
      await db.run(`ALTER TABLE logistics_vehicle_v2 ADD COLUMN last_telemetry_at TEXT`);
    } catch { /* exists */ }
    try {
      await db.run(`ALTER TABLE logistics_vehicle_v2 ADD COLUMN fuel_consumption REAL DEFAULT 32.5`);
    } catch { /* exists */ }
    try {
      await db.run(`ALTER TABLE logistics_vehicle_v2 ADD COLUMN source_type TEXT DEFAULT 'TELEMATICS'`);
    } catch { /* exists */ }
    try {
      await db.run(`ALTER TABLE logistics_vehicle_v2 ADD COLUMN source_system TEXT DEFAULT 'KETRACO_FLEET_GATEWAY'`);
    } catch { /* exists */ }

    // Ensure columns exist on logistics_mission
    try {
      await db.run(`ALTER TABLE logistics_mission ADD COLUMN objective TEXT`);
    } catch { /* exists */ }
    try {
      await db.run(`ALTER TABLE logistics_mission ADD COLUMN crew TEXT DEFAULT '[]'`);
    } catch { /* exists */ }
    try {
      await db.run(`ALTER TABLE logistics_mission ADD COLUMN cargo_ids TEXT DEFAULT '[]'`);
    } catch { /* exists */ }
    try {
      await db.run(`ALTER TABLE logistics_mission ADD COLUMN project_id TEXT`);
    } catch { /* exists */ }
    try {
      await db.run(`ALTER TABLE logistics_mission ADD COLUMN asset_id TEXT`);
    } catch { /* exists */ }
    try {
      await db.run(`ALTER TABLE logistics_mission ADD COLUMN planned_eta TEXT`);
    } catch { /* exists */ }
    try {
      await db.run(`ALTER TABLE logistics_mission ADD COLUMN current_eta TEXT`);
    } catch { /* exists */ }
    try {
      await db.run(`ALTER TABLE logistics_mission ADD COLUMN cost REAL DEFAULT 0`);
    } catch { /* exists */ }
    try {
      await db.run(`ALTER TABLE logistics_mission ADD COLUMN source_type TEXT DEFAULT 'DISPATCH_ORDER'`);
    } catch { /* exists */ }
    try {
      await db.run(`ALTER TABLE logistics_mission ADD COLUMN source_system TEXT DEFAULT 'ATLAS_MISSION_DISPATCH'`);
    } catch { /* exists */ }

    // Seed realistic operational data matching the visual blueprint if empty
    const check = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM logistics_warehouse`);
    if (!check || check.count === 0) {
      await LogisticsCommandCenterMigration.seedBaselineData(db);
    } else {
      // Seed fleet & cargo items if empty
      await LogisticsCommandCenterMigration.seedFleetsAndItems(db);
    }

    console.log('[Migration-009] Atlas Logistics Command Center schema applied successfully.');
  }

  public static async seedFleetsAndItems(db: DatabaseCore): Promise<void> {
    const now = new Date().toISOString();
    const auditMeta = JSON.stringify({ verifiedBy: 'SCM_DISPATCH_DIRECTORATE', iso42001: true });

    const fleetCheck = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM logistics_fleet`);
    if (!fleetCheck || fleetCheck.count === 0) {
      const fleets = [
        { id: 'flt-01', code: 'FLT-HV-01', name: 'Heavy Haul & Substation Transport Fleet', type: 'HEAVY_TRANSPORT', region: 'CENTRAL_RIFT', mgr: 'Eng. J. Kiprono', count: 28, active: 14 },
        { id: 'flt-02', code: 'FLT-ER-02', name: 'Rapid Emergency & Line Repair Fleet', type: 'EMERGENCY_REPAIR', region: 'WESTERN_COAST', mgr: 'Eng. A. Wanjiku', count: 32, active: 6 },
        { id: 'flt-03', code: 'FLT-SP-03', name: 'Spares & Consumables Distribution Fleet', type: 'DISTRIBUTION', region: 'NATIONAL', mgr: 'D. Mwangi', count: 18, active: 2 },
        { id: 'flt-04', code: 'FLT-PL-04', name: 'Plant & Heavy Lifting Carrier Fleet', type: 'RIGGING_PLANT', region: 'SUSWA_TURKWEL', mgr: 'K. Omondi', count: 9, active: 1 },
      ];
      for (const f of fleets) {
        await db.run(`
          INSERT OR REPLACE INTO logistics_fleet
          (id, tenant_id, code, name, fleet_type, region, manager_name, vehicle_count, active_missions_count, status, source_type, source_system, audit_meta, simulation_flag, created_at, updated_at)
          VALUES (?, 'ketraco', ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 'FLEET_REGISTRY', 'ATLAS_LOGISTICS_FABRIC', ?, 0, ?, ?)
        `, [f.id, f.code, f.name, f.type, f.region, f.mgr, f.count, f.active, auditMeta, now, now]);
      }
    }

    const itemCheck = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM logistics_cargo_item`);
    if (!itemCheck || itemCheck.count === 0) {
      const sampleItems = [
        { id: 'ci-01', cargoId: 'crg-1', code: 'ITM-BSH-400', desc: '400kV RIP Condenser Bushing Assembly', sn: 'SN-BSH-2026-081', qty: 2, unit: 'SET', kg: 1450 },
        { id: 'ci-02', cargoId: 'crg-1', code: 'ITM-OIL-CL5', desc: 'Dialan-B Naphthenic Transformer Inhibited Oil Drum', sn: 'LOT-OIL-4412', qty: 12, unit: 'DRUM', kg: 2520 },
        { id: 'ci-03', cargoId: 'crg-2', code: 'ITM-FIT-TNS', desc: 'Quad-bundle tension clamp assembly (400kV Suswa line)', sn: 'LOT-FIT-9921', qty: 48, unit: 'PCS', kg: 860 },
        { id: 'ci-04', cargoId: 'crg-3', code: 'ITM-CND-HTLS', desc: 'HTLS ACCC Casablanca High-Temp Low-Sag Conductor Reel', sn: 'RL-ACCC-4091', qty: 2, unit: 'REEL', kg: 4200 },
        { id: 'ci-05', cargoId: 'crg-4', code: 'ITM-TWR-STL', desc: 'Galvanized 400kV Double Circuit Lattice Tower Legs Part-A', sn: 'BDL-STL-1102', qty: 24, unit: 'BUNDLE', kg: 6800 },
      ];
      for (const it of sampleItems) {
        await db.run(`
          INSERT OR REPLACE INTO logistics_cargo_item
          (id, tenant_id, cargo_id, item_code, description, serial_number, quantity, unit, weight_kg, status, source_type, source_system, audit_meta, simulation_flag, created_at, updated_at)
          VALUES (?, 'ketraco', ?, ?, ?, ?, ?, ?, ?, 'PACKAGED', 'ERP_INVENTORY_LINE', 'KETRACO_SCM_INVENTORY', ?, 0, ?, ?)
        `, [it.id, it.cargoId, it.code, it.desc, it.sn, it.qty, it.unit, it.kg, auditMeta, now, now]);
      }
    }
  }

  private static async seedBaselineData(db: DatabaseCore): Promise<void> {
    console.log('[Migration-009] Seeding baseline KETRACO grid logistics dataset...');
    const now = new Date().toISOString();
    const auditMeta = JSON.stringify({ verifiedBy: 'SCM_DISPATCH_DIRECTORATE', iso42001: true, confidence: 0.98 });

    // 1. Warehouses (matching 6 facilities from blueprint)
    const warehouses = [
      { id: 'wh-01', code: 'WH-APX', name: 'Apex (Nairobi)', facility_type: 'CENTRAL_WAREHOUSE', status: 'OPERATIONAL', city: 'Nairobi', address: 'Embakasi Central Stores', lat: -1.3195, lng: 36.8872, capacity_sqm: 25000, items: 12430, stock_pct: 78, min: 30, alert: 0 },
      { id: 'wh-02', code: 'WH-NKR', name: 'Nakuru Regional Store', facility_type: 'REGIONAL_STORE', status: 'LOW_STOCK', city: 'Nakuru', address: 'Nakuru Industrial Yard', lat: -0.3031, lng: 36.0800, capacity_sqm: 12000, items: 4210, stock_pct: 42, min: 50, alert: 1 },
      { id: 'wh-03', code: 'WH-ELD', name: 'Eldoret Distribution Center', facility_type: 'DISTRIBUTION_CENTER', status: 'OPERATIONAL', city: 'Eldoret', address: 'Eldoret Substation Depot', lat: 0.5143, lng: 35.2698, capacity_sqm: 18000, items: 8950, stock_pct: 67, min: 35, alert: 0 },
      { id: 'wh-04', code: 'WH-MBS', name: 'Mombasa Port Depot', facility_type: 'PORT_DEPOT', status: 'LOW_STOCK', city: 'Mombasa', address: 'Kilindini Gate 5 Yard', lat: -4.0435, lng: 39.6682, capacity_sqm: 20000, items: 2110, stock_pct: 33, min: 40, alert: 1 },
      { id: 'wh-05', code: 'WH-ISL', name: 'Isiolo Forward Depot', facility_type: 'FORWARD_DEPOT', status: 'OPERATIONAL', city: 'Isiolo', address: 'Northern Corridor Depot', lat: 0.3546, lng: 37.5822, capacity_sqm: 14000, items: 6740, stock_pct: 56, min: 30, alert: 0 },
      { id: 'wh-06', code: 'WH-KSM', name: 'Kisumu Western Store', facility_type: 'REGIONAL_STORE', status: 'OPERATIONAL', city: 'Kisumu', address: 'Mamboleo Grid Depot', lat: -0.0917, lng: 34.7680, capacity_sqm: 15000, items: 7220, stock_pct: 61, min: 35, alert: 0 },
    ];

    for (const w of warehouses) {
      await db.run(`
        INSERT OR REPLACE INTO logistics_warehouse
        (id, tenant_id, code, name, facility_type, status, city, address, latitude, longitude, capacity_sqm, items_count, stock_percentage, min_stock_threshold, stock_alert_flag, source, audit_meta, simulation_flag, created_at, updated_at)
        VALUES (?, 'ketraco', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'KETRACO_ESTATES_ASSET', ?, 0, ?, ?)
      `, [w.id, w.code, w.name, w.facility_type, w.status, w.city, w.address, w.lat, w.lng, w.capacity_sqm, w.items, w.stock_pct, w.min, w.alert, auditMeta, now, now]);
    }

    // 2. Heavy Equipment (including KET-006 Crane expiring in 9 days)
    const equipment = [
      { id: 'he-01', code: 'KET-006', name: 'Mobile Crane 60T (Liebherr)', category: 'MOBILE_CRANE', tons: 60, loc: 'Suswa Substation Yard', lat: -1.0456, lng: 36.3567, status: 'INSPECTION_DUE', exp: '2026-09-24', days: 9, prj: 'Suswa-Isinya 400kV' },
      { id: 'he-02', code: 'KET-EQ-02', name: 'Hydraulic Tensioner 180kN', category: 'TENSIONER', tons: 18, loc: 'Turkwel Corridor', lat: 1.9167, lng: 35.3333, status: 'DEPLOYED', exp: '2026-12-15', days: 91, prj: 'Turkwel 400kV' },
      { id: 'he-03', code: 'KET-EQ-03', name: 'Hydraulic Pulling Machine 200kN', category: 'PULLING_MACHINE', tons: 22, loc: 'Olkaria Substation', lat: -0.8931, lng: 36.2981, status: 'AVAILABLE', exp: '2027-02-10', days: 148, prj: 'Olkaria-Lessos' },
      { id: 'he-04', code: 'KET-EQ-04', name: 'Heavy Forklift 16T (Kalmar)', category: 'FORKLIFT', tons: 16, loc: 'Apex Warehouse Nairobi', lat: -1.3195, lng: 36.8872, status: 'AVAILABLE', exp: '2026-11-30', days: 76, prj: 'Depot Operations' },
      { id: 'he-05', code: 'KET-EQ-05', name: 'All-Terrain Excavator 25T', category: 'EXCAVATOR', tons: 25, loc: 'Meru Corridor', lat: 0.0463, lng: 37.6559, status: 'DEPLOYED', exp: '2027-01-20', days: 127, prj: 'Meru 220kV' },
    ];

    for (const e of equipment) {
      await db.run(`
        INSERT OR REPLACE INTO logistics_heavy_equipment
        (id, tenant_id, equipment_code, name, category, capacity_tons, current_location, latitude, longitude, status, certification_expiry, inspection_due_days, assigned_project, source, audit_meta, simulation_flag, created_at, updated_at)
        VALUES (?, 'ketraco', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'KETRACO_PLANT_MANAGEMENT', ?, 0, ?, ?)
      `, [e.id, e.code, e.name, e.category, e.tons, e.loc, e.lat, e.lng, e.status, e.exp, e.days, e.prj, auditMeta, now, now]);
    }

    // 3. Vehicles (Key vehicles highlighted in UI + fleet balance: 87 total)
    const keyVehicles = [
      { id: 'veh-042', code: 'KET-042', name: 'Heavy Scania P450 Heavy Haul', type: 'HEAVY_HAULER', status: 'IN_TRANSIT', plate: 'KDC 942K', make: 'Scania', model: 'P450 6x4', year: 2023, cap_w: 60000, cap_v: 45, fuel: 'DIESEL', odo: 84320, spd: 48, hdg: 135, fuel_pct: 64, eng_hrs: 1940, lat: -1.4520, lng: 36.7840 },
      { id: 'veh-017', code: 'KET-017', name: 'Mercedes Actros 3340 Flatbed', type: 'FLATBED_TRUCK', status: 'IN_TRANSIT', plate: 'KDA 017M', make: 'Mercedes', model: 'Actros 3340', year: 2021, cap_w: 28000, cap_v: 35, fuel: 'DIESEL', odo: 142100, spd: 56, hdg: 310, fuel_pct: 42, eng_hrs: 3820, lat: -0.4210, lng: 36.1200 },
      { id: 'veh-031', code: 'KET-031', name: 'Toyota Hiace Technical Van', type: 'SUPPORT_VAN', status: 'AVAILABLE', plate: 'KDB 031V', make: 'Toyota', model: 'Hiace 3.0D', year: 2024, cap_w: 3500, cap_v: 12, fuel: 'DIESEL', odo: 38400, spd: 0, hdg: 0, fuel_pct: 88, eng_hrs: 920, lat: -1.3195, lng: 36.8872 },
      { id: 'veh-019', code: 'KET-019', name: 'Isuzu FSR Cargo Box Truck', type: 'BOX_TRUCK', status: 'AVAILABLE', plate: 'KCZ 019B', make: 'Isuzu', model: 'FSR 33', year: 2022, cap_w: 12000, cap_v: 28, fuel: 'DIESEL', odo: 76200, spd: 0, hdg: 0, fuel_pct: 79, eng_hrs: 1840, lat: 0.5143, lng: 35.2698 },
      { id: 'veh-006v', code: 'KET-006V', name: 'Liebherr Carrier Unit', type: 'CRANE_CARRIER', status: 'MAINTENANCE', plate: 'KCA 006C', make: 'Liebherr', model: 'LTM1060', year: 2021, cap_w: 8000, cap_v: 20, fuel: 'DIESEL', odo: 48900, spd: 0, hdg: 0, fuel_pct: 55, eng_hrs: 2410, lat: -1.0456, lng: 36.3567 },
    ];

    for (const v of keyVehicles) {
      await db.run(`
        INSERT OR REPLACE INTO logistics_vehicle_v2
        (id, tenant_id, code, name, vehicle_type, status, license_plate, make, model, year, capacity_weight, capacity_volume, fuel_type, current_mileage, current_speed, current_heading, fuel_level_pct, engine_hours, latitude, longitude, source, audit_meta, simulation_flag, created_at, updated_at)
        VALUES (?, 'ketraco', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'KETRACO_TELEMATICS_GATEWAY', ?, 0, ?, ?)
      `, [v.id, v.code, v.name, v.type, v.status, v.plate, v.make, v.model, v.year, v.cap_w, v.cap_v, v.fuel, v.odo, v.spd, v.hdg, v.fuel_pct, v.eng_hrs, v.lat, v.lng, auditMeta, now, now]);
    }

    // Seed remaining fleet to reach exactly 87 units (61 moving, 14 available, 7 maintenance, 5 offline)
    const kenyaLocations = [
      { lat: -1.2921, lng: 36.8219 }, // Nairobi
      { lat: -4.0435, lng: 39.6682 }, // Mombasa
      { lat: -0.3031, lng: 36.0800 }, // Nakuru
      { lat: 0.5143, lng: 35.2698 },  // Eldoret
      { lat: -0.0917, lng: 34.7680 }, // Kisumu
      { lat: -0.8931, lng: 36.2981 }, // Naivasha
      { lat: -1.5833, lng: 36.8500 }, // Isinya
      { lat: 1.9167, lng: 35.3333 },  // Turkwel
      { lat: 0.0463, lng: 37.6559 },  // Meru
      { lat: -0.5333, lng: 37.4500 }, // Embu
    ];

    for (let i = 6; i <= 87; i++) {
      const code = `KET-${String(i).padStart(3, '0')}`;
      let status = 'IN_TRANSIT';
      let speed = 45 + (i % 30);
      if (i > 61 && i <= 75) { status = 'AVAILABLE'; speed = 0; }
      else if (i > 75 && i <= 82) { status = 'MAINTENANCE'; speed = 0; }
      else if (i > 82) { status = 'OFFLINE'; speed = 0; }

      const loc = kenyaLocations[i % kenyaLocations.length];
      const jitterLat = loc.lat + (Math.sin(i) * 0.15);
      const jitterLng = loc.lng + (Math.cos(i) * 0.15);

      await db.run(`
        INSERT OR REPLACE INTO logistics_vehicle_v2
        (id, tenant_id, code, name, vehicle_type, status, license_plate, make, model, year, capacity_weight, capacity_volume, fuel_type, current_mileage, current_speed, current_heading, fuel_level_pct, engine_hours, latitude, longitude, source, audit_meta, simulation_flag, created_at, updated_at)
        VALUES (?, 'ketraco', ?, ?, 'TRUCK', ?, ?, 'Scania', 'G410', 2022, 32000, 40, 'DIESEL', ?, ?, ?, ?, ?, ?, ?, 'KETRACO_TELEMATICS_GATEWAY', ?, 0, ?, ?)
      `, [
        `veh-${i}`,
        code,
        `Fleet Unit ${code}`,
        status,
        `KDB ${100 + i}K`,
        50000 + (i * 1200),
        speed,
        (i * 47) % 360,
        50 + (i % 45),
        1500 + (i * 30),
        jitterLat,
        jitterLng,
        auditMeta,
        now,
        now
      ]);
    }

    // 4. Drivers
    const drivers = [
      { id: 'drv-01', name: 'Peter Ochieng', emp: 'KTR-D-104', lic: 'DL-A48291', status: 'DRIVING', hrs: 4.2, thresh: 0, veh: 'veh-042' },
      { id: 'drv-02', name: 'John Kibet', emp: 'KTR-D-088', lic: 'DL-B82912', status: 'DRIVING', hrs: 5.8, thresh: 0, veh: 'veh-017' },
      { id: 'drv-03', name: 'James Mwangi', emp: 'KTR-D-031', lic: 'DL-C19203', status: 'ON_DUTY', hrs: 7.6, thresh: 1, veh: 'veh-031' },
      { id: 'drv-04', name: 'David Mutua', emp: 'KTR-D-062', lic: 'DL-D92817', status: 'AVAILABLE', hrs: 2.1, thresh: 0, veh: 'veh-019' },
      { id: 'drv-05', name: 'Samuel Kamau', emp: 'KTR-D-115', lic: 'DL-E73812', status: 'RESTING', hrs: 8.0, thresh: 1, veh: null },
    ];

    for (const d of drivers) {
      await db.run(`
        INSERT OR REPLACE INTO logistics_driver_v2
        (id, tenant_id, name, employee_id, license_number, license_type, status, phone, email, duty_hours_today, duty_threshold_approaching, assigned_vehicle_id, source, audit_meta, simulation_flag, created_at, updated_at)
        VALUES (?, 'ketraco', ?, ?, ?, 'CLASS_E', ?, '+254711000000', 'dispatch@ketraco.co.ke', ?, ?, ?, 'KETRACO_HR_REGISTRY', ?, 0, ?, ?)
      `, [d.id, d.name, d.emp, d.lic, d.status, d.hrs, d.thresh, d.veh, auditMeta, now, now]);
    }

    // 5. Missions (matching Recent Missions table from image + active missions breakdown: 23 total missions)
    const primaryMissions = [
      { id: 'msn-942', code: 'LM-2026-00942', title: 'Transformer accessories', desc: 'Critical 400kV bushing and oil cooling skid escort', status: 'EN_ROUTE', priority: 'CRITICAL', veh: 'veh-042', origin: 'Mombasa Port', dest: 'Isinya Substation', eta: '16:24', delay: 46, risk: 'HIGH' },
      { id: 'msn-941', code: 'LM-2026-00941', title: 'Line hardware', desc: 'Conductor fittings and tension hardware sets', status: 'ON_SITE', priority: 'HIGH', veh: 'veh-017', origin: 'Nakuru Store', dest: 'Nyahururu Substation', eta: '18:03', delay: 0, risk: 'LOW' },
      { id: 'msn-940', code: 'LM-2026-00940', title: 'Conductor reels', desc: 'HTLS 400kV aluminum conductor heavy reels', status: 'DELAYED', priority: 'HIGH', veh: 'veh-019', origin: 'Apex Warehouse', dest: 'Suswa Substation', eta: '17:45', delay: 35, risk: 'HIGH' },
      { id: 'msn-939', code: 'LM-2026-00939', title: 'Tower materials', desc: 'Galvanized lattice tower structural steel angles', status: 'EN_ROUTE', priority: 'MEDIUM', veh: 'veh-001', origin: 'Apex Warehouse', dest: 'Embu Substation', eta: '20:12', delay: 0, risk: 'LOW' },
      { id: 'msn-938', code: 'LM-2026-00938', title: 'Substation equipment', desc: 'Current transformers and lightning arresters', status: 'LOADING', priority: 'MEDIUM', veh: 'veh-002', origin: 'Eldoret Center', dest: 'Kisumu Substation', eta: '15:20', delay: 0, risk: 'LOW' },
      { id: 'msn-937', code: 'LM-2026-00937', title: 'Fuel delivery', desc: 'Bulk diesel supply for standby substation gen-sets', status: 'COMPLETED', priority: 'LOW', veh: 'veh-003', origin: 'Mombasa Port', dest: 'Isinya Substation', eta: '13:10', delay: 0, risk: 'LOW' },
    ];

    for (const m of primaryMissions) {
      await db.run(`
        INSERT OR REPLACE INTO logistics_mission
        (id, tenant_id, mission_code, title, description, status, priority, vehicle_id, origin_name, destination_name, eta, delay_minutes, risk_level, source, audit_meta, simulation_flag, created_at, updated_at)
        VALUES (?, 'ketraco', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ATLAS_MISSION_DISPATCH', ?, 0, ?, ?)
      `, [m.id, m.code, m.title, m.desc, m.status, m.priority, m.veh, m.origin, m.dest, m.eta, m.delay, m.risk, auditMeta, now, now]);
    }

    // Seed additional missions to reach exactly 23 total active missions (4 critical, 3 delayed, 2 at risk, 14 normal)
    for (let i = 1; i <= 17; i++) {
      const code = `LM-2026-${String(920 + i).padStart(5, '0')}`;
      let status = 'EN_ROUTE';
      let priority = 'MEDIUM';
      let delay = 0;
      let risk = 'LOW';

      if (i <= 3) {
        priority = 'CRITICAL';
        risk = 'HIGH';
      } else if (i <= 5) {
        status = 'DELAYED';
        priority = 'HIGH';
        delay = 25 + (i * 10);
        risk = 'HIGH';
      } else if (i <= 7) {
        risk = 'MEDIUM';
        priority = 'HIGH';
      }

      await db.run(`
        INSERT OR REPLACE INTO logistics_mission
        (id, tenant_id, mission_code, title, description, status, priority, vehicle_id, origin_name, destination_name, eta, delay_minutes, risk_level, source, audit_meta, simulation_flag, created_at, updated_at)
        VALUES (?, 'ketraco', ?, ?, ?, ?, ?, ?, 'Apex Warehouse (Nairobi)', 'Grid Regional Substation', '19:00', ?, ?, 'ATLAS_MISSION_DISPATCH', ?, 0, ?, ?)
      `, [
        `msn-${920 + i}`,
        code,
        `Grid Supply Mission ${code}`,
        `Standard dispatch of transmission spares and maintenance consumables`,
        status,
        priority,
        `veh-${10 + i}`,
        delay,
        risk,
        auditMeta,
        now,
        now
      ]);
    }

    // 6. Active Exceptions (Matching the 7 Active Exceptions in AI Operations Feed)
    const exceptions = [
      {
        id: 'exc-01', code: 'EXC-2026-001', category: 'DELAY', severity: 'CRITICAL',
        title: 'Transformer movement delayed',
        msg: 'Isinya Substation · ETA +46 min due to Escort Permit check',
        type: 'MISSION', entity_id: 'msn-942', entity_name: 'KET-042 / LM-2026-00942',
        loc: 'Isinya Substation Corridor', variance: '+46m delay', prob: 94,
        rec: 'Authorize Mai Mahiu bypass clearance and notify Isinya crane standby crew.'
      },
      {
        id: 'exc-02', code: 'EXC-2026-002', category: 'FUEL_ANOMALY', severity: 'HIGH',
        title: 'Vehicle KET-017 abnormal fuel consumption',
        msg: '13.9 L/100km (expected 8.4) · Possible mechanical issue',
        type: 'VEHICLE', entity_id: 'veh-017', entity_name: 'KET-017 (Actros 3340)',
        loc: 'Nakuru-Nyahururu Highway', variance: '+65% consumption', prob: 88,
        rec: 'Instruct driver to check turbo manifold pressure at Nyahururu station.'
      },
      {
        id: 'exc-03', code: 'EXC-2026-003', category: 'COMPLIANCE', severity: 'HIGH',
        title: 'Crane certification expires in 9 days',
        msg: 'KET-006 · Heavy Equipment statutory inspection due',
        type: 'EQUIPMENT', entity_id: 'he-01', entity_name: 'KET-006 (Liebherr Crane)',
        loc: 'Suswa Substation Yard', variance: '9 days remaining', prob: 95,
        rec: 'Schedule DOSHS third-party certification inspector before September 24.'
      },
      {
        id: 'exc-04', code: 'EXC-2026-004', category: 'INVENTORY_SHORTAGE', severity: 'MEDIUM',
        title: 'Regional store stock below requirement',
        msg: 'Nakuru Regional Store · 42% of required minimum',
        type: 'WAREHOUSE', entity_id: 'wh-02', entity_name: 'Nakuru Regional Store',
        loc: 'Nakuru Industrial Area', variance: '-18% below buffer', prob: 79,
        rec: 'Initiate stock transfer of 150 suspension insulator sets from Apex Nairobi.'
      },
      {
        id: 'exc-05', code: 'EXC-2026-005', category: 'DUTY_LIMIT', severity: 'MEDIUM',
        title: 'Driver approaching duty-time threshold',
        msg: 'KET-031 · 4h 12m continuous driving',
        type: 'DRIVER', entity_id: 'drv-03', entity_name: 'James Mwangi (KET-031)',
        loc: 'Apex Loading Bay Nairobi', variance: '48 min to limit', prob: 82,
        rec: 'Require mandatory 45-minute rest break before proceeding with evening dispatch.'
      },
      {
        id: 'exc-06', code: 'EXC-2026-006', category: 'UTILIZATION', severity: 'LOW',
        title: 'Vehicle utilization below target',
        msg: 'KET-019 · 36% utilization against 70% benchmark',
        type: 'VEHICLE', entity_id: 'veh-019', entity_name: 'KET-019 (Isuzu FSR)',
        loc: 'Eldoret Substation Depot', variance: '-34% utilization', prob: 71,
        rec: 'Assign vehicle to Eldoret-Kitale feeder line maintenance run tomorrow.'
      },
      {
        id: 'exc-07', code: 'EXC-2026-007', category: 'ROUTE_HAZARD', severity: 'INFO',
        title: 'Route re-optimized due to weather',
        msg: 'KET-042 · New ETA 16:24 via Escarpment bypass',
        type: 'ROUTE', entity_id: 'rt-01', entity_name: 'Corridor A104',
        loc: 'Rift Valley Escarpment', variance: '-12 min recovered', prob: 91,
        rec: 'Route telemetry synchronized with KeNHA flood alert system.'
      },
    ];

    for (const exc of exceptions) {
      await db.run(`
        INSERT OR REPLACE INTO logistics_exception
        (id, tenant_id, exception_code, category, severity, title, message, entity_type, entity_id, entity_name, location_name, variance, probability_pct, ai_recommendation, status, source, audit_meta, simulation_flag, created_at, updated_at)
        VALUES (?, 'ketraco', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 'AI_OPERATIONS_FEED_ENGINE', ?, 0, ?, ?)
      `, [exc.id, exc.code, exc.category, exc.severity, exc.title, exc.msg, exc.type, exc.entity_id, exc.entity_name, exc.loc, exc.variance, exc.prob, exc.rec, auditMeta, now, now]);
    }

    // 7. Projects (matching the 6 Projects in the Project Progress widget)
    const projects = [
      { id: 'prj-01', code: 'PRJ-ISN', name: 'Isinya 400/220kV', sub: 'Isinya Substation', req: 'Auto-Transformer Bushings & Control Panels', date: '2026-10-15', status: 'ON_TRACK', pct: 78 },
      { id: 'prj-02', code: 'PRJ-TRK', name: 'Turkwel 400kV', sub: 'Turkwel Substation', req: 'High-Tensile Guyed Tower Steel Sections', date: '2026-11-01', status: 'AT_RISK', pct: 65 },
      { id: 'prj-03', code: 'PRJ-TNR', name: 'Tana River Line', sub: 'Tana River Station', req: 'River-Crossing OPGW Optical Fibre Cable', date: '2026-09-30', status: 'DELAYED', pct: 42 },
      { id: 'prj-04', code: 'PRJ-MRU', name: 'Meru 220kV', sub: 'Meru Substation', req: 'Composite Line Post Insulators', date: '2026-10-20', status: 'ON_TRACK', pct: 91 },
      { id: 'prj-05', code: 'PRJ-EMB', name: 'Embu 220kV', sub: 'Embu Substation', req: 'Capacitor Voltage Transformers (CVT)', date: '2026-10-28', status: 'ON_TRACK', pct: 58 },
      { id: 'prj-06', code: 'PRJ-KSI', name: 'Kisii 220kV', sub: 'Kisii Substation', req: 'Circuit Breaker SF6 Gas Refill Cylinders', date: '2026-09-25', status: 'AT_RISK', pct: 33 },
    ];

    for (const p of projects) {
      await db.run(`
        INSERT OR REPLACE INTO logistics_project_requirement
        (id, tenant_id, requirement_code, project_id, project_name, substation_target, requirement_description, required_date, delivery_status, progress_pct, source, audit_meta, simulation_flag, created_at, updated_at)
        VALUES (?, 'ketraco', ?, ?, ?, ?, ?, ?, ?, ?, 'KETRACO_PROJECT_DELIVERY_SYSTEM', ?, 0, ?, ?)
      `, [p.id, p.code, p.id, p.name, p.sub, p.req, p.date, p.status, p.pct, auditMeta, now, now]);
    }

    // 8. Fuel Transactions (matching Fuel Intelligence metrics)
    const fuelData = [
      { id: 'ft-01', code: 'FT-2026-081', veh: 'veh-042', lit: 480, cost: 96000, odo: 84320, rate: 38.2, exp_rate: 35.0, anom: 0, desc: 'Normal heavy haulage rate' },
      { id: 'ft-02', code: 'FT-2026-082', veh: 'veh-017', lit: 310, cost: 62000, odo: 142100, rate: 13.9, exp_rate: 8.4, anom: 1, desc: 'Abnormal consumption rate (+65%)' },
      { id: 'ft-03', code: 'FT-2026-083', veh: 'veh-031', lit: 65, cost: 13000, odo: 38400, rate: 8.2, exp_rate: 8.5, anom: 0, desc: 'Normal support van delivery' },
      { id: 'ft-04', code: 'FT-2026-084', veh: 'veh-019', lit: 140, cost: 28000, odo: 76200, rate: 14.5, exp_rate: 15.0, anom: 0, desc: 'Standard box truck run' },
    ];

    for (const f of fuelData) {
      await db.run(`
        INSERT OR REPLACE INTO logistics_fuel_transaction
        (id, tenant_id, transaction_code, vehicle_id, driver_id, mission_id, fuel_type, liters, cost_kes, odometer, location_name, consumption_rate_l_100km, expected_rate_l_100km, anomaly_flag, anomaly_description, timestamp, source, audit_meta, simulation_flag, created_at, updated_at)
        VALUES (?, 'ketraco', ?, ?, 'drv-01', 'msn-942', 'DIESEL', ?, ?, ?, 'Nairobi Commercial Fuel Dep', ?, ?, ?, ?, ?, 'TOTAL_FLEET_CARD_API', ?, 0, ?, ?)
      `, [f.id, f.code, f.veh, f.lit, f.cost, f.odo, f.rate, f.exp_rate, f.anom, f.desc, now, auditMeta, now, now]);
    }

    // 9. Live Events (matching the bottom live events ticker)
    const liveEvents = [
      { id: 'lev-01', type: 'vehicle.status_changed', sev: 'INFO', msg: 'KET-031 arrived at loading bay (Apex Warehouse · 14:32)', entity: 'VEHICLE', eid: 'veh-031' },
      { id: 'lev-02', type: 'mission.dispatched', sev: 'INFO', msg: 'Mission LM-2026-00941 dispatched (Nakuru → Nyahururu · 14:18)', entity: 'MISSION', eid: 'msn-941' },
      { id: 'lev-03', type: 'logistics.exception.created', sev: 'WARNING', msg: 'Weather alert - heavy rain (Nakuru County · 13:55)', entity: 'ROUTE', eid: 'rt-01' },
      { id: 'lev-04', type: 'maintenance.risk_detected', sev: 'WARNING', msg: 'Maintenance due in 1,284 km (KET-042 · 13:32)', entity: 'VEHICLE', eid: 'veh-042' },
      { id: 'lev-05', type: 'fuel.anomaly_detected', sev: 'INFO', msg: 'Fuel anomaly resolved (KET-017 · 12:47)', entity: 'VEHICLE', eid: 'veh-017' },
      { id: 'lev-06', type: 'cargo.delivered', sev: 'INFO', msg: 'Cargo delivered (Isinya Substation · 11:26)', entity: 'CARGO', eid: 'crg-01' },
    ];

    for (const ev of liveEvents) {
      await db.run(`
        INSERT OR REPLACE INTO logistics_event
        (id, tenant_id, event_type, severity, source, message, entity_type, entity_id, metadata_json, created_at)
        VALUES (?, 'ketraco', ?, ?, 'ATLAS_LOGISTICS_FABRIC', ?, ?, ?, ?, ?)
      `, [ev.id, ev.type, ev.sev, ev.msg, ev.entity, ev.eid, JSON.stringify({ audit: true }), now]);
    }

    // 10. Cargo Items (matching 56 Shipments in Transit)
    for (let c = 1; c <= 56; c++) {
      const code = `CRG-2026-${String(c).padStart(4, '0')}`;
      const isHighPriority = c <= 12;
      await db.run(`
        INSERT OR REPLACE INTO logistics_cargo
        (id, tenant_id, cargo_code, name, description, mission_id, category, weight_kg, volume_m3, quantity, unit, value_kes, hazmat, temperature_controlled, priority, status, destination_site, source, audit_meta, simulation_flag, created_at, updated_at)
        VALUES (?, 'ketraco', ?, ?, 'High voltage substation spare parts and transmission line fittings', 'msn-942', 'SUBSTATION_SPARE', ?, ?, ?, 'PCS', ?, ?, 0, ?, 'IN_TRANSIT', 'Isinya Substation', 'KETRACO_SCM_INVENTORY', ?, 0, ?, ?)
      `, [
        `crg-${c}`,
        code,
        `Consignment ${code}`,
        1500 + (c * 200),
        5 + (c * 0.5),
        10 + (c % 50),
        2500000 + (c * 500000),
        c % 8 === 0 ? 1 : 0,
        isHighPriority ? 'HIGH' : 'MEDIUM',
        auditMeta,
        now,
        now
      ]);
    }

    console.log('[Migration-009] Baseline dataset seeded successfully.');
  }
}
