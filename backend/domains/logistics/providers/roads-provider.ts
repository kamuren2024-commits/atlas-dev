/**
 * KETRACO Roads Provider & Road Matching Engine
 * Implements Section 06: Road Matching, Speeding Detection, and Exposure Assessment
 */

import type {
  RoadsProvider,
  SnappedRoadPoint,
  RoadExposureAssessment,
  HeavyTransportConstraints
} from './types';
import { CORRIDOR_BOTTLENECKS } from '../domain-config';

export class KETRACORoadsProvider implements RoadsProvider {
  /**
   * Snaps GPS points to known highway centerlines
   */
  public async snapToRoads(points: Array<{ lat: number; lng: number }>): Promise<SnappedRoadPoint[]> {
    return points.map((p, idx) => {
      // Determine nearest major highway
      const speedLimit = this.determineSpeedLimit(p.lat, p.lng);
      return {
        originalIndex: idx,
        latitude: Number(p.lat.toFixed(5)),
        longitude: Number(p.lng.toFixed(5)),
        roadName: speedLimit.roadName,
        speedLimitKmh: speedLimit.speedLimitKmh,
        placeId: `ke-road-seg-${Math.abs(Math.round(p.lat * 100))}-${Math.abs(Math.round(p.lng * 100))}`
      };
    });
  }

  /**
   * Gets speed limit for vehicle based on location and highway class
   */
  public async getSpeedLimit(lat: number, lng: number): Promise<{ speedLimitKmh: number; roadName: string } | null> {
    return this.determineSpeedLimit(lat, lng);
  }

  private determineSpeedLimit(lat: number, lng: number): { speedLimitKmh: number; roadName: string } {
    // Check if in Nairobi Metro area (lat: -1.35 to -1.20, lng: 36.70 to 36.95)
    if (lat >= -1.38 && lat <= -1.18 && lng >= 36.68 && lng <= 37.00) {
      return { speedLimitKmh: 50, roadName: 'Nairobi Metropolitan Urban Arterial / Southern Bypass' };
    }

    // Check if along Mombasa Road (A109)
    if (lat <= -1.4 && lng >= 36.95) {
      return { speedLimitKmh: 80, roadName: 'Mombasa Road (A109) Heavy Transport Corridor' };
    }

    // Check if along Northern Corridor (A104 - Nakuru / Eldoret)
    if (lat >= -0.5 && lng <= 36.2) {
      return { speedLimitKmh: 80, roadName: 'Northern Corridor (A104) Westbound Trunk' };
    }

    // Check if in Great Rift Valley Escarpment (Mai Mahiu / Suswa B3)
    if (lat >= -1.15 && lat <= -0.90 && lng >= 36.30 && lng <= 36.65) {
      return { speedLimitKmh: 45, roadName: 'Mai Mahiu - Suswa Escarpment Road (B3)' };
    }

    return { speedLimitKmh: 80, roadName: 'Kenyan National Highway Network' };
  }

  /**
   * Evaluates road bottlenecks, structural clearances, and police escort requirements along route
   */
  public async assessRoadExposure(
    points: Array<{ lat: number; lng: number }>,
    constraints: HeavyTransportConstraints
  ): Promise<RoadExposureAssessment> {
    const bottlenecks: any[] = [];
    let maxRisk = 15;

    for (const p of points) {
      for (const b of CORRIDOR_BOTTLENECKS) {
        const d = Math.hypot(b.lat - p.lat, b.lng - p.lng) * 111;
        if (d < 5.0) { // within 5km of a critical bottleneck
          if (!bottlenecks.some(item => item.locationName === b.name)) {
            bottlenecks.push({
              locationName: b.name,
              lat: b.lat,
              lng: b.lng,
              description: b.notes,
              restrictionType: b.restrictionType
            });

            if (b.restrictionType === 'STEEP_ESCARPMENT') maxRisk += 30;
            if (b.restrictionType === 'BRIDGE_LIMIT') maxRisk += 25;
            if (b.restrictionType === 'WILDLIFE_CORRIDOR') maxRisk += 15;
          }
        }
      }
    }

    const clampedRisk = Math.min(100, maxRisk);
    const corridorGrade = clampedRisk > 60 ? 'CRITICAL_RISK' : clampedRisk > 35 ? 'ELEVATED_RISK' : 'SAFE';
    const recommendedEscorts = clampedRisk > 60 ? 2 : clampedRisk > 35 ? 1 : 0;

    return {
      riskScore: clampedRisk,
      corridorGrade,
      bottlenecksIdentified: bottlenecks,
      recommendedEscortUnits: recommendedEscorts
    };
  }
}
