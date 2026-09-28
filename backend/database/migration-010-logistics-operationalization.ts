/**
 * PHASE 10: DATABASE MIGRATION 010 — KETRACO LOGISTICS OPERATIONALIZATION
 * Implements Section 03, 05, 09, 11, 12, 13, 15, 17, 20
 */

import { DatabaseCore } from './db-core';

export class LogisticsOperationalizationMigration {
  public static async apply(db: DatabaseCore): Promise<void> {
    console.log('[Migration-010] Applying KETRACO Logistics Operationalization schema...');

    // 1. Safe Column Alterations on logistics_vehicle_v2
    const vehicleColsToAdd = [
      { col: 'ownership', type: "TEXT DEFAULT 'KETRACO_OWNED'" },
      { col: 'department', type: "TEXT DEFAULT 'TRANSMISSION_SUBSTATIONS'" },
      { col: 'operating_region', type: "TEXT DEFAULT 'RIFT_VALLEY'" },
      { col: 'assigned_depot', type: "TEXT DEFAULT 'ISINYA_PRIMARY_DEPOT'" },
      { col: 'assigned_project_id', type: "TEXT DEFAULT 'PRJ-SUSWA-ISINYA'" },
      { col: 'dimensions_length_m', type: "REAL DEFAULT 12.5" },
      { col: 'dimensions_width_m', type: "REAL DEFAULT 2.8" },
      { col: 'dimensions_height_m', type: "REAL DEFAULT 3.8" },
      { col: 'axles', type: "INTEGER DEFAULT 3" },
      { col: 'insurance_policy', type: "TEXT DEFAULT 'Jubilee Fleet Cover #POL-KET-2026-88'" },
      { col: 'insurance_expiry', type: "TEXT DEFAULT '2026-12-31'" },
      { col: 'inspection_status', type: "TEXT DEFAULT 'CURRENT'" },
      { col: 'inspection_expiry', type: "TEXT DEFAULT '2026-11-15'" },
      { col: 'service_status', type: "TEXT DEFAULT 'NOMINAL'" },
      { col: 'next_service_due_km', type: "REAL DEFAULT 85000" },
      { col: 'next_service_due_date', type: "TEXT DEFAULT '2026-10-30'" },
      { col: 'location_name', type: "TEXT DEFAULT 'Kenyan National Highway Corridor'" }
    ];

    for (const c of vehicleColsToAdd) {
      try {
        await db.run(`ALTER TABLE logistics_vehicle_v2 ADD COLUMN ${c.col} ${c.type};`);
      } catch (err: any) {
        // Ignore duplicate column errors if migration re-runs
      }
    }

    // 2. Safe Column Alterations on logistics_driver_v2
    const driverColsToAdd = [
      { col: 'contract_type', type: "TEXT DEFAULT 'PERMANENT_STAFF'" },
      { col: 'duty_hours_week', type: "REAL DEFAULT 28.5" },
      { col: 'certifications', type: "TEXT DEFAULT 'Defensive Driving, Substation Entry Clearance, Hazmat Spares'" },
      { col: 'safety_score', type: "REAL DEFAULT 96.0" },
      { col: 'on_time_delivery_rate', type: "REAL DEFAULT 98.2" },
      { col: 'harsh_braking_events', type: "INTEGER DEFAULT 0" },
      { col: 'license_expiry', type: "TEXT DEFAULT '2027-04-18'" }
    ];

    for (const c of driverColsToAdd) {
      try {
        await db.run(`ALTER TABLE logistics_driver_v2 ADD COLUMN ${c.col} ${c.type};`);
      } catch (err: any) {
        // Ignore duplicate column errors
      }
    }

    // 3. Telemetry History Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS logistics_telemetry_history (
        id TEXT PRIMARY KEY,
        vehicle_id TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        speed_kmh REAL DEFAULT 0,
        heading REAL DEFAULT 0,
        fuel_level_pct REAL DEFAULT 100,
        odometer_km REAL DEFAULT 0,
        engine_hours REAL DEFAULT 0,
        ignition INTEGER DEFAULT 1,
        road_name TEXT,
        recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_telemetry_veh_time ON logistics_telemetry_history(vehicle_id, recorded_at);

      CREATE TABLE IF NOT EXISTS logistics_dispatch_audit (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        mission_id TEXT NOT NULL,
        vehicle_id TEXT,
        driver_id TEXT,
        route_id TEXT,
        step_completed TEXT NOT NULL,
        operator_id TEXT NOT NULL DEFAULT 'DISPATCH_OFFICER_01',
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_dispatch_msn ON logistics_dispatch_audit(mission_id);

      CREATE TABLE IF NOT EXISTS logistics_route_deviation (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        vehicle_id TEXT NOT NULL,
        mission_id TEXT,
        planned_corridor TEXT NOT NULL,
        deviation_km REAL NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        investigation_outcome TEXT NOT NULL DEFAULT 'PENDING_INVESTIGATION',
        severity TEXT NOT NULL DEFAULT 'WARNING',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS logistics_warehouse_zone (
        id TEXT PRIMARY KEY,
        warehouse_id TEXT NOT NULL,
        zone_code TEXT NOT NULL,
        zone_name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'GENERAL',
        capacity_sqm REAL NOT NULL,
        utilized_sqm REAL NOT NULL DEFAULT 0,
        temperature_controlled INTEGER DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'OPERATIONAL'
      );
    `);

    // 4. Seed / Enrich representative operational vehicles covering all 12 configurable types
    const operationalVehicles = [
      {
        id: 'veh-ops-01',
        code: 'KET-FLT-101',
        name: 'Toyota Hilux 4x4 Quick Response',
        vehicle_type: 'PICKUP',
        status: 'AVAILABLE',
        license_plate: 'KDA 301A',
        make: 'Toyota',
        model: 'Hilux Double Cab 2.8GD-6',
        year: 2023,
        capacity_weight: 1100,
        capacity_volume: 2.5,
        current_mileage: 42150,
        current_speed: 0,
        current_heading: 0,
        fuel_level_pct: 88,
        engine_hours: 1420,
        latitude: -1.2864,
        longitude: 36.8172,
        ownership: 'KETRACO_OWNED',
        department: 'LINE_MAINTENANCE',
        operating_region: 'NAIROBI_METRO',
        assigned_depot: 'EMBAKASI_CENTRAL_STORES',
        assigned_project_id: 'PRJ-NAIROBI-RING',
        dimensions_length_m: 5.3,
        dimensions_width_m: 1.85,
        dimensions_height_m: 1.82,
        axles: 2,
        service_status: 'NOMINAL',
        location_name: 'Embakasi Central Engineering Stores'
      },
      {
        id: 'veh-ops-02',
        code: 'KET-FLT-204',
        name: 'Toyota Land Cruiser Prado Inspection Unit',
        vehicle_type: 'SUV',
        status: 'IN_TRANSIT',
        license_plate: 'KDA 488B',
        make: 'Toyota',
        model: 'Land Cruiser Prado TX',
        year: 2022,
        capacity_weight: 650,
        capacity_volume: 1.8,
        current_mileage: 68400,
        current_speed: 62,
        current_heading: 290,
        fuel_level_pct: 76,
        engine_hours: 2100,
        latitude: -1.0250,
        longitude: 36.5620,
        ownership: 'KETRACO_OWNED',
        department: 'WAYLEAVE_ACQUISITION',
        operating_region: 'RIFT_VALLEY',
        assigned_depot: 'SUSWA_HVDC_BASE',
        assigned_project_id: 'PRJ-SUSWA-ISINYA',
        dimensions_length_m: 4.8,
        dimensions_width_m: 1.88,
        dimensions_height_m: 1.89,
        axles: 2,
        service_status: 'NOMINAL',
        location_name: 'Mai Mahiu Escarpment Approach (B3)'
      },
      {
        id: 'veh-ops-03',
        code: 'KET-FLT-309',
        name: 'Isuzu NPS 4x4 High-Voltage Service Rig',
        vehicle_type: 'SERVICE_VEHICLE',
        status: 'AVAILABLE',
        license_plate: 'KDA 712C',
        make: 'Isuzu',
        model: 'NPS 75 4x4 Crew Cab',
        year: 2021,
        capacity_weight: 3500,
        capacity_volume: 14.0,
        current_mileage: 89300,
        current_speed: 0,
        current_heading: 0,
        fuel_level_pct: 92,
        engine_hours: 3250,
        latitude: -1.6705,
        longitude: 36.8520,
        ownership: 'KETRACO_OWNED',
        department: 'SUBSTATION_MAINTENANCE',
        operating_region: 'RIFT_VALLEY',
        assigned_depot: 'ISINYA_PRIMARY_DEPOT',
        assigned_project_id: 'PRJ-SUSWA-ISINYA',
        dimensions_length_m: 6.8,
        dimensions_width_m: 2.2,
        dimensions_height_m: 2.9,
        axles: 2,
        service_status: 'NOMINAL',
        location_name: 'Isinya 400kV Substation Maintenance Bay'
      },
      {
        id: 'veh-ops-04',
        code: 'KET-FLT-420',
        name: 'Mercedes-Benz Actros 3340 Heavy Pylon Hauler',
        vehicle_type: 'HEAVY_TRUCK',
        status: 'IN_TRANSIT',
        license_plate: 'KDA 890D',
        make: 'Mercedes-Benz',
        model: 'Actros 3340 6x4',
        year: 2021,
        capacity_weight: 26000,
        capacity_volume: 48.0,
        current_mileage: 145000,
        current_speed: 55,
        current_heading: 145,
        fuel_level_pct: 64,
        engine_hours: 5800,
        latitude: -1.4552,
        longitude: 36.9821,
        ownership: 'KETRACO_OWNED',
        department: 'TRANSMISSION_SUBSTATIONS',
        operating_region: 'NAIROBI_METRO',
        assigned_depot: 'ISINYA_PRIMARY_DEPOT',
        assigned_project_id: 'PRJ-SUSWA-ISINYA',
        dimensions_length_m: 14.2,
        dimensions_width_m: 2.55,
        dimensions_height_m: 3.8,
        axles: 3,
        service_status: 'NOMINAL',
        location_name: 'Athi River Super-Bridge Corridor (A109)'
      },
      {
        id: 'veh-ops-05',
        code: 'KET-FLT-550',
        name: 'Nicolas 8-Axle Hydraulic Multi-Trailer Low-Loader',
        vehicle_type: 'LOW_LOADER',
        status: 'IN_TRANSIT',
        license_plate: 'KDA 991E',
        make: 'Nicolas / MAN',
        model: 'TGX 41.640 Heavy Hauler + Nicolas 8-Axle Platform',
        year: 2020,
        capacity_weight: 180000,
        capacity_volume: 120.0,
        current_mileage: 112000,
        current_speed: 38,
        current_heading: 320,
        fuel_level_pct: 54,
        engine_hours: 6400,
        latitude: -1.0543,
        longitude: 36.3512,
        ownership: 'KETRACO_OWNED',
        department: 'HEAVY_TRANSPORT_LOGISTICS',
        operating_region: 'RIFT_VALLEY',
        assigned_depot: 'SUSWA_HVDC_BASE',
        assigned_project_id: 'PRJ-ETH-KEN-HVDC',
        dimensions_length_m: 28.5,
        dimensions_width_m: 3.65,
        dimensions_height_m: 4.85,
        axles: 8,
        service_status: 'SERVICE_DUE',
        next_service_due_km: 115000,
        next_service_due_date: '2026-09-25',
        location_name: 'Suswa 500kV HVDC Converter Station Yard'
      },
      {
        id: 'veh-ops-06',
        code: 'KET-FLT-610',
        name: 'Liebherr LTM 1120-4.1 All-Terrain Mobile Crane',
        vehicle_type: 'CRANE',
        status: 'AVAILABLE',
        license_plate: 'KDA 115F',
        make: 'Liebherr',
        model: 'LTM 1120-4.1 (120 Tonne)',
        year: 2021,
        capacity_weight: 120000,
        capacity_volume: 18.0,
        current_mileage: 38900,
        current_speed: 0,
        current_heading: 0,
        fuel_level_pct: 82,
        engine_hours: 4900,
        latitude: -1.6705,
        longitude: 36.8520,
        ownership: 'KETRACO_OWNED',
        department: 'SUBSTATION_CONSTRUCTION',
        operating_region: 'RIFT_VALLEY',
        assigned_depot: 'ISINYA_PRIMARY_DEPOT',
        assigned_project_id: 'PRJ-SUSWA-ISINYA',
        dimensions_length_m: 14.8,
        dimensions_width_m: 2.75,
        dimensions_height_m: 4.0,
        axles: 4,
        service_status: 'NOMINAL',
        location_name: 'Isinya 400kV Substation Heavy Laydown Apron'
      },
      {
        id: 'veh-ops-07',
        code: 'KET-FLT-730',
        name: 'Tesmec Hydraulic Conductor Tensioner & Puller Unit',
        vehicle_type: 'SPECIALIZED_TRANSMISSION_EQUIPMENT',
        status: 'AVAILABLE',
        license_plate: 'KDA 730G',
        make: 'Tesmec',
        model: 'PT1250 Hydraulic Puller-Tensioner',
        year: 2022,
        capacity_weight: 15000,
        capacity_volume: 22.0,
        current_mileage: 24500,
        current_speed: 0,
        current_heading: 0,
        fuel_level_pct: 95,
        engine_hours: 1850,
        latitude: 0.2094,
        longitude: 35.2983,
        ownership: 'KETRACO_OWNED',
        department: 'LINE_CONSTRUCTION',
        operating_region: 'WESTERN_LAKE',
        assigned_depot: 'LESSOS_GRID_DEPOT',
        assigned_project_id: 'PRJ-OLKARIA-LESSOS',
        dimensions_length_m: 8.5,
        dimensions_width_m: 2.5,
        dimensions_height_m: 3.2,
        axles: 2,
        service_status: 'NOMINAL',
        location_name: 'Lessos 400kV Grid Intertie Depot'
      },
      {
        id: 'veh-ops-08',
        code: 'KET-FLT-802',
        name: 'Scania P380 High-Voltage Rapid Emergency Tender',
        vehicle_type: 'EMERGENCY_VEHICLE',
        status: 'AVAILABLE',
        license_plate: 'KDA 802H',
        make: 'Scania',
        model: 'P380 4x2 Dual-Cab Emergency Unit',
        year: 2023,
        capacity_weight: 8500,
        capacity_volume: 16.0,
        current_mileage: 18200,
        current_speed: 0,
        current_heading: 0,
        fuel_level_pct: 100,
        engine_hours: 920,
        latitude: -1.2864,
        longitude: 36.8172,
        ownership: 'KETRACO_OWNED',
        department: 'EMERGENCY_RESPONSE',
        operating_region: 'NAIROBI_METRO',
        assigned_depot: 'EMBAKASI_CENTRAL_STORES',
        assigned_project_id: 'PRJ-NAIROBI-RING',
        dimensions_length_m: 7.9,
        dimensions_width_m: 2.5,
        dimensions_height_m: 3.1,
        axles: 2,
        service_status: 'NOMINAL',
        location_name: 'Nairobi Central Grid Operations Control'
      },
      {
        id: 'veh-ops-09',
        code: 'KET-FLT-915',
        name: 'Sinotruk HOWO 371 EPC Contractor Heavy Hauler',
        vehicle_type: 'CONTRACTOR_VEHICLE',
        status: 'MAINTENANCE',
        license_plate: 'KBZ 915J',
        make: 'Sinotruk',
        model: 'HOWO 371 6x4 Prime Mover',
        year: 2019,
        capacity_weight: 34000,
        capacity_volume: 50.0,
        current_mileage: 215000,
        current_speed: 0,
        current_heading: 0,
        fuel_level_pct: 35,
        engine_hours: 8900,
        latitude: -0.2833,
        longitude: 36.0667,
        ownership: 'CONTRACTOR_LEASED',
        department: 'PROJECT_SUPPLY_CHAIN',
        operating_region: 'RIFT_VALLEY',
        assigned_depot: 'NAKURU_REGIONAL_STORES',
        assigned_project_id: 'PRJ-OLKARIA-LESSOS',
        dimensions_length_m: 13.5,
        dimensions_width_m: 2.5,
        dimensions_height_m: 3.6,
        axles: 3,
        service_status: 'SAFETY_DEFECT',
        next_service_due_km: 210000,
        next_service_due_date: '2026-09-10',
        location_name: 'Nakuru Regional Workshop (Axle Differential Service)'
      }
    ];

    const now = new Date().toISOString();
    for (const v of operationalVehicles) {
      await db.run(`
        INSERT OR REPLACE INTO logistics_vehicle_v2
        (id, tenant_id, code, name, vehicle_type, status, license_plate, make, model, year,
         capacity_weight, capacity_volume, current_mileage, current_speed, current_heading,
         fuel_level_pct, engine_hours, latitude, longitude, ownership, department, operating_region,
         assigned_depot, assigned_project_id, dimensions_length_m, dimensions_width_m, dimensions_height_m,
         axles, service_status, next_service_due_km, next_service_due_date, location_name, updated_at)
        VALUES (?, 'ketraco', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        v.id, v.code, v.name, v.vehicle_type, v.status, v.license_plate, v.make, v.model, v.year,
        v.capacity_weight, v.capacity_volume, v.current_mileage, v.current_speed, v.current_heading,
        v.fuel_level_pct, v.engine_hours, v.latitude, v.longitude, v.ownership, v.department, v.operating_region,
        v.assigned_depot, v.assigned_project_id, v.dimensions_length_m, v.dimensions_width_m, v.dimensions_height_m,
        v.axles, v.service_status, v.next_service_due_km || 90000, v.next_service_due_date || '2026-11-01', v.location_name, now
      ]);
    }

    // 5. Enrich Drivers
    const operationalDrivers = [
      { id: 'drv-01', name: 'Musa Kiprono', empId: 'EMP-KET-801', lic: 'CLASS_E_HEAVY_ARTICULATED', licNum: 'DL-KE-40918-M', vehId: 'veh-ops-05', hours: 5.5, week: 32.0, cert: 'Defensive Driving, Super-Load Escort, 500kV Substation Clearance', score: 98.4, rate: 99.1 },
      { id: 'drv-02', name: 'Peter Kariuki', empId: 'EMP-KET-802', lic: 'CLASS_CE', licNum: 'DL-KE-51829-K', vehId: 'veh-ops-04', hours: 4.0, week: 26.5, cert: 'Defensive Driving, Hazmat Spares Handling', score: 96.0, rate: 97.5 },
      { id: 'drv-03', name: 'Sammy Ochieng', empId: 'EMP-KET-803', lic: 'CLASS_SPECIAL_PLANT', licNum: 'DL-KE-62734-O', vehId: 'veh-ops-06', hours: 2.0, week: 18.0, cert: 'Heavy Crane Plant Operator, High Voltage Yard Lifting', score: 99.0, rate: 100.0 },
      { id: 'drv-04', name: 'Fatuma Hassan', empId: 'EMP-KET-804', lic: 'CLASS_B', licNum: 'DL-KE-73841-H', vehId: 'veh-ops-02', hours: 3.5, week: 24.0, cert: 'Off-Road 4x4 Terrain Navigation, Project Inspection Lead', score: 97.8, rate: 98.8 },
      { id: 'drv-05', name: 'David Mutua', empId: 'EMP-KET-805', lic: 'CLASS_C', licNum: 'DL-KE-84952-M', vehId: 'veh-ops-03', hours: 1.5, week: 14.5, cert: 'Transmission Emergency Response, First Aid Level 3', score: 95.5, rate: 96.0 }
    ];

    for (const d of operationalDrivers) {
      await db.run(`
        INSERT OR REPLACE INTO logistics_driver_v2
        (id, tenant_id, name, employee_id, license_number, license_type, status, duty_hours_today,
         duty_hours_week, certifications, safety_score, on_time_delivery_rate, assigned_vehicle_id, updated_at)
        VALUES (?, 'ketraco', ?, ?, ?, ?, 'AVAILABLE', ?, ?, ?, ?, ?, ?, ?)
      `, [d.id, d.name, d.empId, d.licNum, d.lic, d.hours, d.week, d.cert, d.score, d.rate, d.vehId, now]);

      // Connect driver to vehicle
      await db.run(`
        UPDATE logistics_vehicle_v2 SET assigned_driver_id = ? WHERE id = ?
      `, [d.id, d.vehId]);
    }

    // 6. Seed Warehouse Zones
    const zones = [
      { id: 'zn-01', whId: 'wh-01', code: 'ZN-HV-YRD', name: 'High-Voltage Transformer Laydown Apron', cat: 'HEAVY_EQUIPMENT', cap: 12000, util: 9800 },
      { id: 'zn-02', whId: 'wh-01', code: 'ZN-INS-RCK', name: 'Polymer & Glass Insulators Indoor Rack', cat: 'SUBSTATION_SPARES', cap: 6000, util: 4200 },
      { id: 'zn-03', whId: 'wh-02', code: 'ZN-CND-DRM', name: 'Conductor & Optical Ground Wire (OPGW) Drum Yard', cat: 'CONDUCTORS', cap: 15000, util: 13500 },
      { id: 'zn-04', whId: 'wh-03', code: 'ZN-SWG-BAY', name: 'Gas-Insulated Switchgear (GIS) Secure Bay', cat: 'SPECIALIZED_ELECTRICAL', cap: 8000, util: 5400 }
    ];

    for (const z of zones) {
      await db.run(`
        INSERT OR REPLACE INTO logistics_warehouse_zone
        (id, warehouse_id, zone_code, zone_name, category, capacity_sqm, utilized_sqm, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'OPERATIONAL')
      `, [z.id, z.whId, z.code, z.name, z.cat, z.cap, z.util]);
    }

    console.log('[Migration-010] Schema applied and KETRACO fleet operational data initialized successfully.');
  }
}
