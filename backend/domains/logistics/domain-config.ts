/**
 * KETRACO Logistics Domain Configuration
 * Implements Section 02, 03, 08 Configurable Domain Data
 */

export interface VehicleTypeDefinition {
  id: string;
  name: string;
  category: 'LIGHT_TRANSPORT' | 'MEDIUM_SERVICE' | 'HEAVY_TRANSPORT' | 'SPECIALIZED_PLANT';
  defaultGrossWeightKg: number;
  maxPayloadKg: number;
  maxVolumeM3: number;
  axles: number;
  fuelType: 'DIESEL' | 'PETROL' | 'HYBRID' | 'ELECTRIC';
  requiredLicenseClass: string;
  specializedClearanceRequired: boolean;
  canCarryHighVoltageTransformers: boolean;
  canCarryPylonsConductors: boolean;
  speedLimitHighwayKmh: number;
  speedLimitUrbanKmh: number;
  iconName: string;
}

export interface CorridorBottleneck {
  id: string;
  name: string;
  corridorName: string;
  lat: number;
  lng: number;
  maxWeightTons: number;
  maxClearanceM: number;
  maxGradientPct: number;
  restrictionType: 'BRIDGE_LIMIT' | 'STEEP_ESCARPMENT' | 'TUNNEL_CLEARANCE' | 'WEIGHBRIDGE' | 'WILDLIFE_CORRIDOR';
  requiresPoliceEscortAboveTons: number;
  notes: string;
}

export interface KETRACOSubstationNode {
  code: string;
  name: string;
  voltageKv: number;
  region: string;
  lat: number;
  lng: number;
  isConverterStation: boolean;
  laydownCapacitySqm: number;
  accessRoadCondition: 'PAVED_ALL_WEATHER' | 'GRADED_MURRAM' | 'ROUGH_TERRAIN_REQUIRES_4X4';
}

export const KETRACO_VEHICLE_TYPES: VehicleTypeDefinition[] = [
  {
    id: 'PICKUP',
    name: 'Field Pickup (4x4 Utility)',
    category: 'LIGHT_TRANSPORT',
    defaultGrossWeightKg: 3200,
    maxPayloadKg: 1100,
    maxVolumeM3: 2.5,
    axles: 2,
    fuelType: 'DIESEL',
    requiredLicenseClass: 'CLASS_B',
    specializedClearanceRequired: false,
    canCarryHighVoltageTransformers: false,
    canCarryPylonsConductors: false,
    speedLimitHighwayKmh: 100,
    speedLimitUrbanKmh: 50,
    iconName: 'Car'
  },
  {
    id: 'SUV',
    name: 'Executive & Inspection SUV',
    category: 'LIGHT_TRANSPORT',
    defaultGrossWeightKg: 2800,
    maxPayloadKg: 650,
    maxVolumeM3: 1.8,
    axles: 2,
    fuelType: 'DIESEL',
    requiredLicenseClass: 'CLASS_B',
    specializedClearanceRequired: false,
    canCarryHighVoltageTransformers: false,
    canCarryPylonsConductors: false,
    speedLimitHighwayKmh: 100,
    speedLimitUrbanKmh: 50,
    iconName: 'Car'
  },
  {
    id: 'SERVICE_VEHICLE',
    name: 'Transmission Line Service Van',
    category: 'MEDIUM_SERVICE',
    defaultGrossWeightKg: 5500,
    maxPayloadKg: 2500,
    maxVolumeM3: 12.0,
    axles: 2,
    fuelType: 'DIESEL',
    requiredLicenseClass: 'CLASS_C',
    specializedClearanceRequired: true,
    canCarryHighVoltageTransformers: false,
    canCarryPylonsConductors: false,
    speedLimitHighwayKmh: 80,
    speedLimitUrbanKmh: 50,
    iconName: 'Wrench'
  },
  {
    id: 'TRUCK',
    name: 'Medium Spares Cargo Truck',
    category: 'MEDIUM_SERVICE',
    defaultGrossWeightKg: 12000,
    maxPayloadKg: 7500,
    maxVolumeM3: 28.0,
    axles: 2,
    fuelType: 'DIESEL',
    requiredLicenseClass: 'CLASS_C',
    specializedClearanceRequired: false,
    canCarryHighVoltageTransformers: false,
    canCarryPylonsConductors: true,
    speedLimitHighwayKmh: 80,
    speedLimitUrbanKmh: 50,
    iconName: 'Truck'
  },
  {
    id: 'HEAVY_TRUCK',
    name: 'Heavy Pylon & Conductor Hauler (6x4)',
    category: 'HEAVY_TRANSPORT',
    defaultGrossWeightKg: 28000,
    maxPayloadKg: 18000,
    maxVolumeM3: 45.0,
    axles: 3,
    fuelType: 'DIESEL',
    requiredLicenseClass: 'CLASS_CE',
    specializedClearanceRequired: true,
    canCarryHighVoltageTransformers: false,
    canCarryPylonsConductors: true,
    speedLimitHighwayKmh: 80,
    speedLimitUrbanKmh: 40,
    iconName: 'Truck'
  },
  {
    id: 'TRACTOR',
    name: 'Prime Mover Heavy Tractor Unit',
    category: 'HEAVY_TRANSPORT',
    defaultGrossWeightKg: 44000,
    maxPayloadKg: 32000,
    maxVolumeM3: 60.0,
    axles: 3,
    fuelType: 'DIESEL',
    requiredLicenseClass: 'CLASS_CE',
    specializedClearanceRequired: true,
    canCarryHighVoltageTransformers: false,
    canCarryPylonsConductors: true,
    speedLimitHighwayKmh: 70,
    speedLimitUrbanKmh: 40,
    iconName: 'Truck'
  },
  {
    id: 'TRAILER',
    name: 'Flatbed Transmission Spares Semi-Trailer',
    category: 'HEAVY_TRANSPORT',
    defaultGrossWeightKg: 36000,
    maxPayloadKg: 28000,
    maxVolumeM3: 75.0,
    axles: 3,
    fuelType: 'DIESEL',
    requiredLicenseClass: 'CLASS_CE',
    specializedClearanceRequired: false,
    canCarryHighVoltageTransformers: false,
    canCarryPylonsConductors: true,
    speedLimitHighwayKmh: 70,
    speedLimitUrbanKmh: 40,
    iconName: 'Truck'
  },
  {
    id: 'LOW_LOADER',
    name: 'Multi-Axle Super-Load Low-Loader',
    category: 'HEAVY_TRANSPORT',
    defaultGrossWeightKg: 180000,
    maxPayloadKg: 140000,
    maxVolumeM3: 120.0,
    axles: 8,
    fuelType: 'DIESEL',
    requiredLicenseClass: 'CLASS_E_HEAVY_ARTICULATED',
    specializedClearanceRequired: true,
    canCarryHighVoltageTransformers: true,
    canCarryPylonsConductors: true,
    speedLimitHighwayKmh: 50,
    speedLimitUrbanKmh: 30,
    iconName: 'ShieldAlert'
  },
  {
    id: 'CRANE',
    name: 'Substation Mobile All-Terrain Crane (120T)',
    category: 'SPECIALIZED_PLANT',
    defaultGrossWeightKg: 60000,
    maxPayloadKg: 120000,
    maxVolumeM3: 15.0,
    axles: 5,
    fuelType: 'DIESEL',
    requiredLicenseClass: 'CLASS_SPECIAL_PLANT',
    specializedClearanceRequired: true,
    canCarryHighVoltageTransformers: true,
    canCarryPylonsConductors: false,
    speedLimitHighwayKmh: 60,
    speedLimitUrbanKmh: 30,
    iconName: 'Wrench'
  },
  {
    id: 'SPECIALIZED_TRANSMISSION_EQUIPMENT',
    name: 'Hydraulic Cable Tensioner & Puller Rig',
    category: 'SPECIALIZED_PLANT',
    defaultGrossWeightKg: 18500,
    maxPayloadKg: 10000,
    maxVolumeM3: 20.0,
    axles: 2,
    fuelType: 'DIESEL',
    requiredLicenseClass: 'CLASS_CE',
    specializedClearanceRequired: true,
    canCarryHighVoltageTransformers: false,
    canCarryPylonsConductors: true,
    speedLimitHighwayKmh: 70,
    speedLimitUrbanKmh: 40,
    iconName: 'Cpu'
  },
  {
    id: 'EMERGENCY_VEHICLE',
    name: 'Substation Fire & Black-Start Rapid Response',
    category: 'LIGHT_TRANSPORT',
    defaultGrossWeightKg: 8500,
    maxPayloadKg: 3500,
    maxVolumeM3: 15.0,
    axles: 2,
    fuelType: 'DIESEL',
    requiredLicenseClass: 'CLASS_C',
    specializedClearanceRequired: true,
    canCarryHighVoltageTransformers: false,
    canCarryPylonsConductors: false,
    speedLimitHighwayKmh: 100,
    speedLimitUrbanKmh: 60,
    iconName: 'AlertTriangle'
  },
  {
    id: 'CONTRACTOR_VEHICLE',
    name: 'EPC Contractor Heavy Transport Unit',
    category: 'HEAVY_TRANSPORT',
    defaultGrossWeightKg: 34000,
    maxPayloadKg: 24000,
    maxVolumeM3: 50.0,
    axles: 3,
    fuelType: 'DIESEL',
    requiredLicenseClass: 'CLASS_CE',
    specializedClearanceRequired: true,
    canCarryHighVoltageTransformers: true,
    canCarryPylonsConductors: true,
    speedLimitHighwayKmh: 80,
    speedLimitUrbanKmh: 50,
    iconName: 'Truck'
  }
];

export const KETRACO_OPERATING_REGIONS = [
  { id: 'NAIROBI_METRO', name: 'Nairobi Metropolitan & Central Hub', dispatchCenter: 'Embakasi Grid Operations' },
  { id: 'RIFT_VALLEY', name: 'Rift Valley Regional Network', dispatchCenter: 'Nakuru Substation Office' },
  { id: 'WESTERN_LAKE', name: 'Western & Lake Basin Grid', dispatchCenter: 'Lessos Regional Control' },
  { id: 'COASTAL', name: 'Coast & Maritime Interconnection', dispatchCenter: 'Rabai Substation Control' },
  { id: 'MOUNT_KENYA', name: 'Mount Kenya & Upper Eastern', dispatchCenter: 'Nanyuki Regional Yard' },
  { id: 'NORTHERN_FRONTIER', name: 'Northern Frontier & Ethiopia HVDC Link', dispatchCenter: 'Suswa Interconnector HQ' }
];

export const KETRACO_DEPOTS = [
  { id: 'DEP-ISINYA', name: 'Isinya Primary Logistics Hub', code: 'ISN-HUB', city: 'Isinya', lat: -1.6705, lng: 36.8520, capacitySqm: 25000 },
  { id: 'DEP-SUSWA', name: 'Suswa HVDC Converter Yard Depot', code: 'SSW-YRD', city: 'Suswa', lat: -1.0543, lng: 36.3512, capacitySqm: 35000 },
  { id: 'DEP-EMBAKASI', name: 'Embakasi Central Engineering Stores', code: 'EMB-STR', city: 'Nairobi', lat: -1.3218, lng: 36.8950, capacitySqm: 18000 },
  { id: 'DEP-NAKURU', name: 'Nakuru Regional Transmission Depot', code: 'NKR-DPT', city: 'Nakuru', lat: -0.2833, lng: 36.0667, capacitySqm: 12000 },
  { id: 'DEP-MOMBASA', name: 'Mombasa Port Deep-Water Receiving Yard', code: 'MSA-YRD', city: 'Mombasa', lat: -4.0435, lng: 39.6682, capacitySqm: 40000 },
  { id: 'DEP-LESSOS', name: 'Lessos 220kV Grid Intertie Depot', code: 'LSS-DPT', city: 'Lessos', lat: 0.2094, lng: 35.2983, capacitySqm: 15000 },
  { id: 'DEP-MARSABIT', name: 'Marsabit Wind Corridor Staging Base', code: 'MBT-STG', city: 'Marsabit', lat: 2.3344, lng: 37.9904, capacitySqm: 10000 }
];

export const KETRACO_SUBSTATIONS: KETRACOSubstationNode[] = [
  { code: 'SS-ISINYA-400', name: 'Isinya 400/220kV Substation', voltageKv: 400, region: 'NAIROBI_METRO', lat: -1.6705, lng: 36.8520, isConverterStation: false, laydownCapacitySqm: 15000, accessRoadCondition: 'PAVED_ALL_WEATHER' },
  { code: 'SS-SUSWA-500', name: 'Suswa 500kV HVDC Converter Station', voltageKv: 500, region: 'RIFT_VALLEY', lat: -1.0543, lng: 36.3512, isConverterStation: true, laydownCapacitySqm: 28000, accessRoadCondition: 'PAVED_ALL_WEATHER' },
  { code: 'SS-OLKARIA-220', name: 'Olkaria Geothermal Switching Yard', voltageKv: 220, region: 'RIFT_VALLEY', lat: -0.8920, lng: 36.3140, isConverterStation: false, laydownCapacitySqm: 9000, accessRoadCondition: 'PAVED_ALL_WEATHER' },
  { code: 'SS-LESSOS-400', name: 'Lessos 400/220/132kV Substation', voltageKv: 400, region: 'WESTERN_LAKE', lat: 0.2094, lng: 35.2983, isConverterStation: false, laydownCapacitySqm: 12000, accessRoadCondition: 'PAVED_ALL_WEATHER' },
  { code: 'SS-RABAI-400', name: 'Rabai 400/220/132kV Coastal Hub', voltageKv: 400, region: 'COASTAL', lat: -3.9295, lng: 39.5630, isConverterStation: false, laydownCapacitySqm: 16000, accessRoadCondition: 'PAVED_ALL_WEATHER' },
  { code: 'SS-MARIAKANI-400', name: 'Mariakani 400kV Bulk Supply Point', voltageKv: 400, region: 'COASTAL', lat: -3.8640, lng: 39.4750, isConverterStation: false, laydownCapacitySqm: 14000, accessRoadCondition: 'PAVED_ALL_WEATHER' },
  { code: 'SS-LOYANGALANI-400', name: 'Loiyangalani Lake Turkana Substation', voltageKv: 400, region: 'NORTHERN_FRONTIER', lat: 2.7533, lng: 36.7118, isConverterStation: false, laydownCapacitySqm: 8000, accessRoadCondition: 'ROUGH_TERRAIN_REQUIRES_4X4' },
  { code: 'SS-DANDORA-220', name: 'Dandora 220/66kV Bulk Substation', voltageKv: 220, region: 'NAIROBI_METRO', lat: -1.2580, lng: 36.8850, isConverterStation: false, laydownCapacitySqm: 6000, accessRoadCondition: 'PAVED_ALL_WEATHER' },
  { code: 'SS-KISUMU-220', name: 'Mamboleo 220/132kV Kisumu Substation', voltageKv: 220, region: 'WESTERN_LAKE', lat: -0.0680, lng: 34.7820, isConverterStation: false, laydownCapacitySqm: 7500, accessRoadCondition: 'PAVED_ALL_WEATHER' }
];

export const CORRIDOR_BOTTLENECKS: CorridorBottleneck[] = [
  {
    id: 'BN-ATHI-RIVER',
    name: 'Athi River Super-Bridge (A109 / Isinya bypass)',
    corridorName: 'Mombasa-Nairobi-Isinya Heavy Haul Corridor',
    lat: -1.4552,
    lng: 36.9821,
    maxWeightTons: 120,
    maxClearanceM: 5.2,
    maxGradientPct: 3.5,
    restrictionType: 'BRIDGE_LIMIT',
    requiresPoliceEscortAboveTons: 50,
    notes: 'Load limit strictly enforced by KeNHA bridge sensors. Axle spacing verification required before crossing.'
  },
  {
    id: 'BN-MAI-MAHIU',
    name: 'Mai Mahiu Great Rift Escarpment S-Bends',
    corridorName: 'Nairobi-Suswa-Naivasha Mountain Corridor',
    lat: -1.0125,
    lng: 36.5780,
    maxWeightTons: 90,
    maxClearanceM: 5.5,
    maxGradientPct: 8.8,
    restrictionType: 'STEEP_ESCARPMENT',
    requiresPoliceEscortAboveTons: 40,
    notes: 'Severe 8.8% downgrade. Low-loaders with transformers over 60T must use rear hydraulic brake pusher vehicle.'
  },
  {
    id: 'BN-GILGIL-WB',
    name: 'Gilgil National Weighbridge & Inspection Station',
    corridorName: 'Northern Corridor A104',
    lat: -0.4912,
    lng: 36.2845,
    maxWeightTons: 140,
    maxClearanceM: 6.0,
    maxGradientPct: 2.0,
    restrictionType: 'WEIGHBRIDGE',
    requiresPoliceEscortAboveTons: 60,
    notes: 'Mandatory KeNHA electronic clearance scan. Special permit required for out-of-gauge equipment exceeding 3.2m width.'
  },
  {
    id: 'BN-TIMBOROA',
    name: 'Timboroa Summit Pass (Elevation 2,750m)',
    corridorName: 'Nakuru-Eldoret-Lessos Mountain Pass',
    lat: 0.0631,
    lng: 35.5390,
    maxWeightTons: 85,
    maxClearanceM: 5.0,
    maxGradientPct: 7.2,
    restrictionType: 'STEEP_ESCARPMENT',
    requiresPoliceEscortAboveTons: 45,
    notes: 'High altitude engine oxygen starvation. Heavy condensation fog from 17:00 to 07:00 requires convoy slow crawl.'
  },
  {
    id: 'BN-TSAVO-PARK',
    name: 'Tsavo National Park Wildlife Highway Corridor',
    corridorName: 'Mombasa Road A109',
    lat: -3.0120,
    lng: 38.3840,
    maxWeightTons: 150,
    maxClearanceM: 6.5,
    maxGradientPct: 1.5,
    restrictionType: 'WILDLIFE_CORRIDOR',
    requiresPoliceEscortAboveTons: 70,
    notes: 'Night movement curfew: heavy cargo transport restricted between 21:00 and 05:00 for elephant migration protection.'
  }
];

export const KETRACO_TRANSMISSION_PROJECTS = [
  { id: 'PRJ-SUSWA-ISINYA', name: '400kV Suswa-Isinya Transmission Interconnector', targetSubstation: 'Isinya 400kV Substation', status: 'ACTIVE_CONSTRUCTION', criticalMilestone: 'Transformer Energization Q4 2026' },
  { id: 'PRJ-ETH-KEN-HVDC', name: '500kV HVDC Ethiopia-Kenya Power Highway', targetSubstation: 'Suswa 500kV Converter Station', status: 'OPERATIONAL_UPGRADE', criticalMilestone: 'Valve Hall Expansion' },
  { id: 'PRJ-OLKARIA-LESSOS', name: '400kV Olkaria-Lessos-Kisumu Line', targetSubstation: 'Lessos 400kV Substation', status: 'ACTIVE_CONSTRUCTION', criticalMilestone: 'Conductor Stringing Segment 4' },
  { id: 'PRJ-LOIYANGALANI', name: '400kV Loiyangalani-Suswa Wind Line', targetSubstation: 'Loiyangalani Substation', status: 'MAINTENANCE_OVERHAUL', criticalMilestone: 'Composite Insulator Replacement' },
  { id: 'PRJ-NAIROBI-RING', name: '400kV Nairobi Metropolitan Ring', targetSubstation: 'Dandora 220kV Substation', status: 'ACTIVE_CONSTRUCTION', criticalMilestone: 'Underground XLPE Cable Pulling' },
  { id: 'PRJ-MARIAKANI-DUDU', name: '400kV Mariakani-Dongo Kundu Special Economic Zone', targetSubstation: 'Mariakani 400kV Substation', status: 'ACTIVE_CONSTRUCTION', criticalMilestone: 'Heavy Switchgear Installation' }
];
