import { GridAsset, TransmissionLine } from '../types';
import { GridIntegrityReport } from './types';

export class GridIntegrityValidator {
  /**
   * Continuous deep validation engine that scans the active canonical state
   * and reports exact failed entities for all failure categories.
   */
  public static validateGrid(
    substations: Record<string, GridAsset>,
    lines: Record<string, TransmissionLine>
  ): GridIntegrityReport {
    const assetsList = Object.values(substations);
    const linesList = Object.values(lines);

    const duplicates: GridIntegrityReport['duplicates'] = [];
    const missingAssets: GridIntegrityReport['missingAssets'] = [];
    const invalidCoordinates: GridIntegrityReport['invalidCoordinates'] = [];
    const brokenTopology: GridIntegrityReport['brokenTopology'] = [];
    const voltageMismatches: GridIntegrityReport['voltageMismatches'] = [];
    const scadaGisMismatches: GridIntegrityReport['scadaGisMismatches'] = [];
    const scadaEamMismatches: GridIntegrityReport['scadaEamMismatches'] = [];
    const staleTelemetry: GridIntegrityReport['staleTelemetry'] = [];
    const conflictingStates: GridIntegrityReport['conflictingStates'] = [];

    // 1. Detect Duplicate Assets (by name, coordinate collision, or SCADA ID)
    const seenNames = new Map<string, string>();
    const seenCoords = new Map<string, string>();
    const seenScada = new Map<string, string>();

    assetsList.forEach(asset => {
      // Name collision check
      const normName = asset.name.toLowerCase().trim();
      if (seenNames.has(normName)) {
        duplicates.push({
          id: asset.id,
          name: asset.name,
          duplicateKey: 'NAME',
          reason: `Duplicate substation name matches existing entity '${seenNames.get(normName)}'.`
        });
      } else {
        seenNames.set(normName, asset.id);
      }

      // Coordinate collision check (exact duplicate location)
      const coordKey = `${asset.latitude.toFixed(4)},${asset.longitude.toFixed(4)}`;
      if (seenCoords.has(coordKey)) {
        duplicates.push({
          id: asset.id,
          name: asset.name,
          duplicateKey: 'GEOMETRY',
          reason: `Spatial coordinate exactly overlaps asset '${seenCoords.get(coordKey)}'.`
        });
      } else {
        seenCoords.set(coordKey, asset.id);
      }

      // SCADA Tag collision check
      if (asset.scadaId) {
        if (seenScada.has(asset.scadaId)) {
          duplicates.push({
            id: asset.id,
            name: asset.name,
            duplicateKey: 'SCADA_TAG',
            reason: `SCADA tag '${asset.scadaId}' already assigned to '${seenScada.get(asset.scadaId)}'.`
          });
        } else {
          seenScada.set(asset.scadaId, asset.id);
        }
      }

      // 2. Validate Geodetic Coordinates
      if (
        isNaN(asset.latitude) || 
        isNaN(asset.longitude) || 
        asset.latitude < -4.85 || 
        asset.latitude > 5.15 || 
        asset.longitude < 33.7 || 
        asset.longitude > 42.1
      ) {
        invalidCoordinates.push({
          id: asset.id,
          name: asset.name,
          lat: asset.latitude,
          lon: asset.longitude,
          error: 'Coordinates outside valid Kenyan national geodetic bounding box.'
        });
      }

      // 3. Check for Voltage Telemetry vs Rated Nameplate Mismatch
      const measuredKV = asset.telemetry?.voltageKV?.value ?? asset.voltageLevelKV;
      const nominalKV = asset.voltageLevelKV;
      if (Math.abs(measuredKV - nominalKV) / nominalKV > 0.18) {
        voltageMismatches.push({
          id: asset.id,
          name: asset.name,
          details: `Telemetry voltage ${measuredKV.toFixed(1)}kV deviates >18% from nominal rating ${nominalKV}kV.`,
          expectedKV: nominalKV,
          measuredKV: measuredKV
        });
      }

      // 4. Broken Topology Check (Dangling lines or unlinked substations)
      asset.connectedLines.forEach(lId => {
        if (!lines[lId]) {
          brokenTopology.push({
            id: asset.id,
            name: asset.name,
            error: `Line reference '${lId}' does not exist in active transmission network.`,
            missingNeighborId: lId
          });
        }
      });

      // 5. Stale Telemetry Check
      if (asset.telemetry) {
        const lastUpdatedDate = new Date(asset.lastUpdated).getTime();
        const now = Date.now();
        const ageSec = Math.floor((now - lastUpdatedDate) / 1000);
        if (ageSec > 300) { // stale if > 5 minutes
          staleTelemetry.push({
            id: asset.id,
            name: asset.name,
            signal: 'BUS_ACTIVE_POWER',
            ageSec: ageSec,
            lastValue: `${asset.currentLoadMW} MW`
          });
        }
      }

      // 6. Conflicting Operational States Check
      if (asset.state === 'CRITICAL' && asset.riskScore < 30) {
        conflictingStates.push({
          id: asset.id,
          name: asset.name,
          details: `Substation state marked 'CRITICAL' but risk index is low (${asset.riskScore}/100).`
        });
      } else if (asset.state === 'NORMAL' && asset.riskScore > 85) {
        conflictingStates.push({
          id: asset.id,
          name: asset.name,
          details: `Substation state marked 'NORMAL' but risk index is critical (${asset.riskScore}/100).`
        });
      }
    });

    // Check lines for SCADA/GIS parameter mismatches
    linesList.forEach(line => {
      if (line.lengthKM <= 0) {
        scadaGisMismatches.push({
          id: line.id,
          name: line.name,
          parameter: 'LENGTH_KM',
          scadaVal: 'UNSPECIFIED',
          gisVal: line.lengthKM
        });
      }
      if (line.thermalRatingMVA < 10) {
        scadaEamMismatches.push({
          id: line.id,
          name: line.name,
          parameter: 'MVA_RATING',
          scadaVal: line.thermalRatingMVA,
          eamVal: 'NOT_FOUND'
        });
      }
    });

    const totalFailedEntities = 
      duplicates.length +
      missingAssets.length +
      invalidCoordinates.length +
      brokenTopology.length +
      voltageMismatches.length +
      scadaGisMismatches.length +
      scadaEamMismatches.length +
      staleTelemetry.length +
      conflictingStates.length;

    // Calculate integrity score (100 minus penalty per defect)
    const integrityPenalty = Math.min(60, totalFailedEntities * 2.5);
    const integrityScore = Math.max(40, parseFloat((100 - integrityPenalty).toFixed(1)));

    return {
      integrityScore,
      duplicates,
      missingAssets,
      invalidCoordinates,
      brokenTopology,
      voltageMismatches,
      scadaGisMismatches,
      scadaEamMismatches,
      staleTelemetry,
      conflictingStates,
      totalFailedEntities,
      timestamp: new Date().toISOString()
    };
  }
}
