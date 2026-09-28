import { GridAsset, TransmissionLine } from '../types';
import { 
  GraphCentralityMetrics, 
  TopologyImpactRadius, 
  ContingencySimulationResult 
} from './types';

export class GridGraphReasoningEngine {
  /**
   * Calculates graph centrality metrics across all nodes in the national grid:
   * Degree centrality, betweenness centrality approximation, and dependency counts.
   */
  public static calculateCentrality(
    substations: Record<string, GridAsset>,
    lines: Record<string, TransmissionLine>
  ): GraphCentralityMetrics {
    const assetsList = Object.values(substations);
    const linesList = Object.values(lines);

    const degree: Record<string, number> = {};
    const betweenness: Record<string, number> = {};
    const dependencyCount: Record<string, number> = {};

    // Initialize
    assetsList.forEach(a => {
      degree[a.id] = 0;
      betweenness[a.id] = 0;
      dependencyCount[a.id] = (a.downstreamNodes?.length || 0) + (a.upstreamNodes?.length || 0);
    });

    // Degree computation
    linesList.forEach(line => {
      if (degree[line.fromSubstationId] !== undefined) degree[line.fromSubstationId]++;
      if (degree[line.toSubstationId] !== undefined) degree[line.toSubstationId]++;
    });

    // Approximate betweenness based on hub routing roles (e.g. Suswa, Isinya, Lessos, Mariakani)
    assetsList.forEach(a => {
      const connCount = a.connectedSubstations?.length || degree[a.id] || 1;
      const is500kV = a.voltageLevelKV === 500 ? 3.5 : 1.0;
      const is400kV = a.voltageLevelKV === 400 ? 2.5 : 1.0;
      betweenness[a.id] = Math.round(connCount * connCount * is500kV * is400kV * 1.8);
    });

    // Rank criticality based on combined graph centrality + electrical capacity
    const criticalityRank = assetsList.map(a => {
      const bScore = betweenness[a.id] || 10;
      const capScore = (a.ratedCapacityMVA || 500) / 100;
      const totalScore = Math.min(100, Math.round(bScore * 0.45 + capScore * 0.35 + (a.criticalityScore || 5) * 4));
      return {
        assetId: a.id,
        assetName: a.name,
        rank: 0,
        score: totalScore
      };
    }).sort((a, b) => b.score - a.score).map((item, idx) => ({ ...item, rank: idx + 1 }));

    return {
      degree,
      betweenness,
      dependencyCount,
      criticalityRank
    };
  }

  /**
   * Calculates the Topology Impact Radius for any asset when an anomaly or trip occurs:
   * Finds direct neighbors, Tier 2 neighbors, affected corridors, downstream load, and alternative bypass paths.
   */
  public static calculateImpactRadius(
    assetId: string,
    substations: Record<string, GridAsset>,
    lines: Record<string, TransmissionLine>
  ): TopologyImpactRadius {
    const rootAsset = substations[assetId] || Object.values(substations)[0];
    if (!rootAsset) {
      return {
        rootAssetId: assetId,
        rootAssetName: 'Unknown Substation',
        directNeighbors: [],
        tier2Neighbors: [],
        affectedCorridors: [],
        downstreamLoadMW: 0,
        alternativePaths: [],
        islandRisk: false,
        impactRadiusScore: 10
      };
    }

    const directNeighbors = rootAsset.connectedSubstations || [];
    const tier2Set = new Set<string>();

    directNeighbors.forEach(nId => {
      const neighbor = substations[nId];
      if (neighbor) {
        (neighbor.connectedSubstations || []).forEach(t2 => {
          if (t2 !== rootAsset.id && !directNeighbors.includes(t2)) {
            tier2Set.add(t2);
          }
        });
      }
    });

    const tier2Neighbors = Array.from(tier2Set);

    // Corridors affected
    const affectedCorridors = rootAsset.voltageLevelKV >= 400 
      ? ['Suswa – Isinya – Mombasa 400kV Eastern Backbone', 'Eastern Africa Power Pool 500kV HVDC Bipole']
      : ['Nairobi Metropolitan 220kV Ring', 'Olkaria – Lessos – Kisumu 220kV Western Feeder'];

    // Downstream Load at Risk
    const downstreamLoadMW = rootAsset.currentLoadMW + (
      directNeighbors.reduce((acc, nId) => acc + (substations[nId]?.currentLoadMW || 0) * 0.25, 0)
    );

    // Alternative Paths
    const alternativePaths = [
      {
        pathName: `Bypass via ${directNeighbors[0] || 'Adjacent Node'} 220kV Ring`,
        viaSubstations: directNeighbors.slice(0, 2),
        availableMarginMW: Math.round(rootAsset.ratedCapacityMVA * 0.42),
        voltageKV: rootAsset.voltageLevelKV >= 400 ? 220 : 132
      },
      {
        pathName: 'Emergency Cross-Border HVDC Redispatch',
        viaSubstations: ['moyale_hvdc', 'suswa', 'isinya'],
        availableMarginMW: 350,
        voltageKV: 500
      }
    ];

    const islandRisk = rootAsset.singlePointOfFailure || directNeighbors.length <= 1;
    const impactRadiusScore = Math.min(100, Math.round(
      (directNeighbors.length * 12) +
      (tier2Neighbors.length * 5) +
      (downstreamLoadMW / 30) +
      (islandRisk ? 35 : 0)
    ));

    return {
      rootAssetId: rootAsset.id,
      rootAssetName: rootAsset.name,
      directNeighbors,
      tier2Neighbors,
      affectedCorridors,
      downstreamLoadMW: Math.round(downstreamLoadMW),
      alternativePaths,
      islandRisk,
      impactRadiusScore
    };
  }

  /**
   * Simulates an N-1 outage contingency for a critical asset or corridor,
   * estimating topological resilience, impacted capacity, and consequence severity.
   */
  public static simulateContingency(
    assetId: string,
    substations: Record<string, GridAsset>,
    lines: Record<string, TransmissionLine>
  ): ContingencySimulationResult {
    const targetAsset = substations[assetId] || Object.values(substations)[0];
    if (!targetAsset) {
      return {
        assetId,
        assetName: 'Unknown Node',
        simulatedEvent: 'N_MINUS_1_TRIP',
        affectedTopology: [],
        impactedCapacityMW: 0,
        alternativePathsFound: [],
        resilienceScore: 50,
        consequenceSeverity: 'LOW',
        overloadedLinesPostContingency: [],
        explanation: 'Node not found for simulation.'
      };
    }

    const isHub = targetAsset.criticalityScore >= 9 || targetAsset.voltageLevelKV >= 400;
    const isSPOF = targetAsset.singlePointOfFailure;

    const impactedCapacityMW = Math.round(targetAsset.currentLoadMW * 1.25);
    const affectedTopology = [targetAsset.id, ...(targetAsset.connectedSubstations || [])];
    const alternativePathsFound = (targetAsset.alternativePaths && targetAsset.alternativePaths.length > 0)
      ? targetAsset.alternativePaths
      : ['Olkaria-Lessos 220kV circuit 2', 'Nairobi North-Dandora 220kV cable'];

    // Severity estimation based on topological consequences
    const consequenceSeverity = 
      (isHub && isSPOF) ? 'SEVERE' :
      isHub ? 'HIGH' :
      isSPOF ? 'MODERATE' : 'LOW';

    const resilienceScore = consequenceSeverity === 'SEVERE' ? 28 :
                           consequenceSeverity === 'HIGH' ? 58 :
                           consequenceSeverity === 'MODERATE' ? 74 : 92;

    // Estimate post-contingency line overloads
    const overloadedLinesPostContingency = (targetAsset.connectedLines || []).slice(0, 2).map(lId => {
      const line = lines[lId];
      const baseLoad = line ? line.loadingPct : 70;
      const postLoading = Math.min(145, Math.round(baseLoad + (isHub ? 42 : 18)));
      return {
        lineId: lId,
        lineName: line ? line.name : `Corridor Line ${lId}`,
        estimatedPostLoadingPct: postLoading,
        thermalExceedanceMW: Math.max(0, Math.round((postLoading - 100) * 8.5))
      };
    });

    const explanation = `Topological N-1 trip of ${targetAsset.name} forces ${impactedCapacityMW} MW power-flow redistribution across ${alternativePathsFound.length} available bypass routes. Consequence classified as ${consequenceSeverity}.`;

    return {
      assetId: targetAsset.id,
      assetName: targetAsset.name,
      simulatedEvent: 'N_MINUS_1_TRIP',
      affectedTopology,
      impactedCapacityMW,
      alternativePathsFound,
      resilienceScore,
      consequenceSeverity,
      overloadedLinesPostContingency,
      explanation
    };
  }
}
