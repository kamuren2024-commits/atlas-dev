import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { CANONICAL_SUBSTATIONS, CANONICAL_LINES } from './grid-canonical-data';
import { GridAsset, TransmissionLine, GridAlarm, GridEvent, MapLayerKey, OperationalViewMode, ViewCameraPreset } from './types';
import { loadGoogleMaps, subscribeToGoogleMapsAuthFailure } from './google-maps-loader';
import './GridMapCanvas.css';

export enum MapProviderState {
  LOADING = 'LOADING',
  READY = 'READY',
  ERROR_KEY_MISSING = 'ERROR_KEY_MISSING',
  ERROR_AUTHENTICATION = 'ERROR_AUTHENTICATION',
  ERROR_NETWORK = 'ERROR_NETWORK',
  ERROR_LIBRARY = 'ERROR_LIBRARY',
  ERROR_MAP_INIT = 'ERROR_MAP_INIT'
}

export type GridMapProviderStatus = MapProviderState;
export { MapProviderState as GridMapProviderStatusValue };

const MAP_STATUS_DETAILS: Record<MapProviderState, { label: string; color: string; message: string }> = {
  [MapProviderState.LOADING]: {
    label: 'CONNECTING',
    color: '#0F172A',
    message: 'Establishing the national-grid connection.'
  },
  [MapProviderState.READY]: {
    label: 'CONNECTED',
    color: '#0F172A',
    message: 'National grid context is connected.'
  },
  [MapProviderState.ERROR_KEY_MISSING]: {
    label: 'OFFLINE',
    color: '#7C2D12',
    message: 'Grid context unavailable; using local topology fallback.'
  },
  [MapProviderState.ERROR_AUTHENTICATION]: {
    label: 'OFFLINE',
    color: '#7C2D12',
    message: 'Grid context unavailable; using local topology fallback.'
  },
  [MapProviderState.ERROR_NETWORK]: {
    label: 'OFFLINE',
    color: '#7C2D12',
    message: 'Grid context unavailable; using local topology fallback.'
  },
  [MapProviderState.ERROR_LIBRARY]: {
    label: 'OFFLINE',
    color: '#7C2D12',
    message: 'Grid context unavailable; using local topology fallback.'
  },
  [MapProviderState.ERROR_MAP_INIT]: {
    label: 'OFFLINE',
    color: '#7C2D12',
    message: 'Grid context unavailable; using local topology fallback.'
  }
};

interface GridSubstationOverlayProps {
  substation: GridAsset;
  map: google.maps.Map;
  onSelect: (assetId: string) => void;
  isSelected: boolean;
  isConnected: boolean;
  isNeighbor: boolean;
}

function createGridSubstationOverlay(
  { substation, map, onSelect, isSelected, isConnected, isNeighbor }: GridSubstationOverlayProps
): google.maps.OverlayView {
  class GridSubstationOverlay extends google.maps.OverlayView {
    private substation: GridAsset;
    private div: HTMLDivElement | null = null;
    private onSelect: (assetId: string) => void;
    private isSelected: boolean;
    private isConnected: boolean;
    private isNeighbor: boolean;

    constructor(props: GridSubstationOverlayProps) {
      super();
      this.substation = props.substation;
      this.onSelect = props.onSelect;
      this.isSelected = props.isSelected;
      this.isConnected = props.isConnected;
      this.isNeighbor = props.isNeighbor;
      this.setMap(props.map);
    }

    onAdd() {
      this.div = document.createElement('div');
      this.div.style.position = 'absolute';
      this.div.style.cursor = 'pointer';

      const button = document.createElement('button');
      button.className = `substation-marker ${this.isSelected ? 'selected' : ''}`;
      button.title = this.substation.name;
      button.innerHTML = '●';
      button.style.width = this.isSelected ? '18px' : '14px';
      button.style.height = this.isSelected ? '18px' : '14px';
      button.style.borderRadius = '50%';
      button.style.border = this.isSelected ? '2px solid #FF6B6B' : this.isConnected || this.isNeighbor ? '2px solid #22D3EE' : '1px solid #444';
      button.style.background = this.getVoltageColor(this.substation.voltageLevelKV);
      button.style.padding = '0';
      button.style.cursor = 'pointer';
      button.style.boxShadow = this.isSelected ? '0 0 10px rgba(255, 107, 107, 0.8)' : this.isConnected || this.isNeighbor ? '0 0 8px rgba(34, 211, 238, 0.5)' : 'none';
      button.style.opacity = this.isSelected ? '1' : this.isConnected || this.isNeighbor ? '0.95' : '0.6';

      button.addEventListener('click', () => {
        this.onSelect(this.substation.id);
      });

      this.div.appendChild(button);
      const panes = this.getPanes() as any;
      if (panes && panes.overlayImage) {
        panes.overlayImage.appendChild(this.div);
      }
    }

    draw() {
      if (!this.div) return;

      const position = new google.maps.LatLng(
        this.substation.latitude,
        this.substation.longitude
      );
      const projection = this.getProjection();
      if (!projection) return;

      const point = projection.fromLatLngToDivPixel(position);
      if (point) {
        this.div.style.left = point.x - 8 + 'px';
        this.div.style.top = point.y - 8 + 'px';
      }
    }

    onRemove() {
      if (this.div && this.div.parentNode) {
        this.div.parentNode.removeChild(this.div);
        this.div = null;
      }
    }

    private getVoltageColor(voltageKV: number): string {
      if (voltageKV >= 400) return '#00CCFF';
      if (voltageKV >= 200) return '#AA00FF';
      if (voltageKV >= 100) return '#00AA00';
      return '#FFAA00';
    }
  }

  const overlayProps: GridSubstationOverlayProps = {
    substation,
    map,
    onSelect,
    isSelected,
    isConnected,
    isNeighbor,
  };

  return new GridSubstationOverlay(overlayProps);
}

interface GridMapCanvasProps {
  substations?: Record<string, GridAsset>;
  lines?: Record<string, TransmissionLine>;
  alarms?: GridAlarm[];
  events?: GridEvent[];
  selectedAssetId?: string | null;
  onSelectAsset?: (assetId: string) => void;
  onClearSelection?: () => void;
  focusSignal?: number;
  visibleLayers?: Set<MapLayerKey>;
  onToggleLayer?: (layerKey: MapLayerKey) => void;
  viewMode?: OperationalViewMode;
  activeLayers?: Record<MapLayerKey, boolean>;
  operationalMode?: OperationalViewMode;
  onSetOperationalMode?: (mode: OperationalViewMode) => void;
  cameraPreset?: ViewCameraPreset;
  onSetCameraPreset?: (preset: ViewCameraPreset) => void;
  highlightedPath?: string[];
  onMapProviderStatusChange?: (status: MapProviderState) => void;
}

const mapCameraPresets: Record<ViewCameraPreset, { center: google.maps.LatLngLiteral; zoom: number }> = {
  NATIONAL: { center: { lat: -0.37, lng: 37.8 }, zoom: 6 },
  CENTRAL_RIFT: { center: { lat: -0.9, lng: 36.7 }, zoom: 7.3 },
  NAIROBI_METRO: { center: { lat: -1.29, lng: 36.82 }, zoom: 9.2 },
  COASTAL_CORRIDOR: { center: { lat: -3.8, lng: 39.6 }, zoom: 7.8 },
  WESTERN_INTERCONNECT: { center: { lat: 0.08, lng: 34.75 }, zoom: 7.8 },
  NORTHERN_HVDC: { center: { lat: 1.7, lng: 38.0 }, zoom: 7.2 }
};

export const GridMapCanvas: React.FC<GridMapCanvasProps> = ({
  substations = CANONICAL_SUBSTATIONS,
  lines = CANONICAL_LINES,
  alarms = [],
  events = [],
  selectedAssetId,
  onSelectAsset,
  onClearSelection,
  focusSignal = 0,
  visibleLayers,
  onToggleLayer,
  viewMode = 'NORMAL',
  activeLayers,
  operationalMode,
  onSetOperationalMode,
  cameraPreset = 'NATIONAL',
  onSetCameraPreset,
  highlightedPath = [],
  onMapProviderStatusChange
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const previousCameraRef = useRef<{ center: google.maps.LatLngLiteral; zoom: number } | null>(null);
  const overlaysRef = useRef<Map<string, google.maps.OverlayView | google.maps.Marker>>(new Map());
  const polylinesRef = useRef<Map<string, google.maps.Polyline>>(new Map());
  const [mapState, setMapState] = useState<MapProviderState>(MapProviderState.LOADING);
  const [networkStats, setNetworkStats] = useState({ substationCount: 0, lineCount: 0 });

  const resolvedVisibleLayers = useMemo(() => {
    const base = visibleLayers ?? new Set<MapLayerKey>(['SUBSTATIONS', 'LINES', 'TRANSMISSION']);
    const merged = new Set<MapLayerKey>(base);

    if (activeLayers) {
      (Object.keys(activeLayers) as MapLayerKey[]).forEach((key) => {
        if (activeLayers[key]) {
          merged.add(key);
        } else {
          merged.delete(key);
        }
      });
    }

    return merged;
  }, [visibleLayers, activeLayers]);

  const mapLayerControls = useMemo(() => [
    { key: 'SUBSTATIONS' as const, label: 'Substations' },
    { key: 'TRANSMISSION' as const, label: 'Transmission' },
    { key: 'OUTAGES' as const, label: 'Outages' },
    { key: 'ALARMS' as const, label: 'Alarms' },
    { key: 'RISK' as const, label: 'Risk' },
    { key: 'ASSET_HEALTH' as const, label: 'Health' },
    { key: 'PROJECTS' as const, label: 'Projects' }
  ], []);

  const mapLegend = useMemo(() => {
    const groups: Array<{ title: string; items: Array<{ color: string; label: string }> }> = [];

    if (resolvedVisibleLayers.has('TRANSMISSION') || resolvedVisibleLayers.has('LINES')) {
      groups.push({
        title: 'TRANSMISSION',
        items: [
          { color: '#00CCFF', label: '400 kV' },
          { color: '#AA00FF', label: '220 kV' },
          { color: '#00AA00', label: '132 kV' }
        ]
      });
    }

    if (resolvedVisibleLayers.has('SUBSTATIONS')) {
      groups.push({
        title: 'ASSETS',
        items: [{ color: '#38bdf8', label: 'Substation' }]
      });
    }

    const hasOperationalLayers = [
      resolvedVisibleLayers.has('OUTAGES'),
      resolvedVisibleLayers.has('ALARMS'),
      resolvedVisibleLayers.has('RISK'),
      resolvedVisibleLayers.has('ASSET_HEALTH')
    ].some(Boolean);

    if (hasOperationalLayers) {
      const opsItems: Array<{ color: string; label: string }> = [];
      if (resolvedVisibleLayers.has('OUTAGES')) opsItems.push({ color: '#ef4444', label: 'Outage' });
      if (resolvedVisibleLayers.has('ALARMS')) opsItems.push({ color: '#f59e0b', label: 'Warning' });
      if (resolvedVisibleLayers.has('RISK')) opsItems.push({ color: '#a855f7', label: 'Risk' });
      if (resolvedVisibleLayers.has('ASSET_HEALTH')) opsItems.push({ color: '#22c55e', label: 'Normal' });
      groups.push({ title: 'OPERATIONS', items: opsItems });
    }

    if (resolvedVisibleLayers.has('PROJECTS')) {
      groups.push({
        title: 'PROJECTS',
        items: [{ color: '#fbbf24', label: 'Planned' }]
      });
    }

    return groups;
  }, [resolvedVisibleLayers]);

  useEffect(() => {
    onMapProviderStatusChange?.(mapState);
  }, [mapState, onMapProviderStatusChange]);

  const fallbackTopology = useMemo(() => {
    const entries = Object.values(substations);
    const lats = entries.map((asset) => asset.latitude).filter((value) => Number.isFinite(value));
    const lons = entries.map((asset) => asset.longitude).filter((value) => Number.isFinite(value));
    const minLat = Math.min(...lats, -5.0);
    const maxLat = Math.max(...lats, 5.0);
    const minLon = Math.min(...lons, 33.0);
    const maxLon = Math.max(...lons, 42.0);
    const width = 920;
    const height = 560;

    const project = (lat: number, lon: number) => ({
      x: ((lon - minLon) / (maxLon - minLon || 1)) * width,
      y: height - ((lat - minLat) / (maxLat - minLat || 1)) * height
    });

    const fallbackLines = Object.values(lines)
      .filter((line) => line.pathCoordinates && line.pathCoordinates.length > 1)
      .map((line) => {
        const from = substations[line.fromSubstationId];
        const to = substations[line.toSubstationId];
        if (!from || !to) return null;
        const fromPoint = project(from.latitude, from.longitude);
        const toPoint = project(to.latitude, to.longitude);
        return {
          id: line.id,
          fromAssetId: from.id,
          toAssetId: to.id,
          points: `M ${fromPoint.x} ${fromPoint.y} L ${toPoint.x} ${toPoint.y}`,
          voltageKV: line.voltageKV,
          selected: selectedAssetId === line.id
        };
      })
      .filter(Boolean) as Array<{ id: string; fromAssetId: string; toAssetId: string; points: string; voltageKV: number; selected: boolean }>; 

    const fallbackNodes = entries.map((asset) => {
      const projected = project(asset.latitude, asset.longitude);
      return {
        ...asset,
        x: projected.x,
        y: projected.y,
        isSelected: selectedAssetId === asset.id
      };
    });

    return { fallbackLines, fallbackNodes, width, height };
  }, [substations, lines, selectedAssetId]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
    if (!apiKey) {
      setMapState(MapProviderState.ERROR_KEY_MISSING);
      return;
    }

    let isMounted = true;
    const authFailureUnsubscribe = subscribeToGoogleMapsAuthFailure(() => {
      if (isMounted) {
        setMapState(MapProviderState.ERROR_AUTHENTICATION);
      }
    });

    loadGoogleMaps(apiKey)
      .then(() => {
        if (!isMounted || !mapContainerRef.current) return;

        try {
          mapRef.current = new google.maps.Map(mapContainerRef.current, {
            zoom: mapCameraPresets[cameraPreset].zoom,
            center: mapCameraPresets[cameraPreset].center,
            mapTypeId: 'roadmap',
            disableDefaultUI: false,
            fullscreenControl: true,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            gestureHandling: 'greedy',
            keyboardShortcuts: true,
            clickableIcons: false,
          });

          mapRef.current.addListener('click', () => {
            if (onClearSelection) {
              onClearSelection();
            }
          });

          setMapState(MapProviderState.READY);
        } catch (err) {
          if (isMounted) {
            console.error('Map initialization error:', err);
            setMapState(MapProviderState.ERROR_MAP_INIT);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Google Maps loading error:', err);
          if (err?.message?.includes('auth')) {
            setMapState(MapProviderState.ERROR_AUTHENTICATION);
          } else if (err?.message?.includes('network')) {
            setMapState(MapProviderState.ERROR_NETWORK);
          } else {
            setMapState(MapProviderState.ERROR_LIBRARY);
          }
        }
      });

    return () => {
      isMounted = false;
      authFailureUnsubscribe();
    };
  }, []);

  const selectedAsset = selectedAssetId ? substations[selectedAssetId] : null;
  const selectedConnectedLineIds = useMemo(() => {
    if (!selectedAsset) return new Set<string>();
    return new Set<string>(selectedAsset.connectedLines.filter(Boolean));
  }, [selectedAsset]);
  const selectedNeighborIds = useMemo(() => {
    if (!selectedAsset) return new Set<string>();
    return new Set<string>(selectedAsset.connectedSubstations.filter(Boolean));
  }, [selectedAsset]);

  useEffect(() => {
    if (mapState !== MapProviderState.READY || !mapRef.current) return;

    const currentZoom = mapRef.current.getZoom() ?? mapCameraPresets[cameraPreset].zoom;
    const mapZoomThreshold = 6.8;
    const shouldHideDenseMarkers = currentZoom < mapZoomThreshold;

    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current.clear();
    polylinesRef.current.forEach((polyline) => polyline.setMap(null));
    polylinesRef.current.clear();

    const hasSubstations = resolvedVisibleLayers.has('SUBSTATIONS');
    const hasTransmissionLines = resolvedVisibleLayers.has('TRANSMISSION') || resolvedVisibleLayers.has('LINES');
    const hasOutages = resolvedVisibleLayers.has('OUTAGES');
    const hasAlarms = resolvedVisibleLayers.has('ALARMS');
    const hasRisk = resolvedVisibleLayers.has('RISK');
    const hasAssetHealth = resolvedVisibleLayers.has('ASSET_HEALTH');

    if (hasSubstations) {
      Object.values(substations).forEach((substation) => {
        const isSelected = selectedAssetId === substation.id;
        const isConnected = selectedAssetId ? selectedConnectedLineIds.has(substation.id) || selectedNeighborIds.has(substation.id) : false;
        const shouldDisplayMarker = !shouldHideDenseMarkers || Number.isFinite(substation.latitude) && Number.isFinite(substation.longitude);
        if (!shouldDisplayMarker) {
          return;
        }

        const stateColor = getOperationalBadgeColor(substation.state, substation.riskScore, substation.healthScore);
        const overlay = createGridSubstationOverlay({
          substation,
          map: mapRef.current!,
          onSelect: onSelectAsset || (() => {}),
          isSelected,
          isConnected,
          isNeighbor: selectedNeighborIds.has(substation.id)
        });
        overlaysRef.current.set(substation.id, overlay);

        if (hasRisk || hasAssetHealth || hasAlarms || hasOutages) {
          const statusMarker = new google.maps.Marker({
            position: { lat: substation.latitude, lng: substation.longitude },
            map: mapRef.current!,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: stateColor,
              fillOpacity: hasOutages && substation.state === 'OUT_OF_SERVICE' ? 1 : 0.9,
              strokeColor: '#f8fafc',
              strokeWeight: isSelected ? 2.5 : 1.5,
              scale: isSelected ? 8 : 6,
            },
            title: `${substation.name} — ${substation.state}`,
            zIndex: isSelected ? 1200 : 1000,
          });
          statusMarker.addListener('click', () => onSelectAsset?.(substation.id));
          overlaysRef.current.set(`status-${substation.id}`, statusMarker as unknown as google.maps.OverlayView);
        }
      });
    }

    if (hasTransmissionLines) {
      Object.values(lines).forEach((line) => {
        if (!line.pathCoordinates || line.pathCoordinates.length < 2) {
          return;
        }

        const lineColor = getLineColor(line.voltageKV);
        const strokeColor = getOperationalLineColor(line, alarms, hasOutages, hasAlarms, hasRisk);
        const isLocalLine = selectedAssetId
          ? line.id === selectedAssetId
            || selectedConnectedLineIds.has(line.id)
            || line.fromSubstationId === selectedAssetId
            || line.toSubstationId === selectedAssetId
          : false;

        const polyline = new google.maps.Polyline({
          path: line.pathCoordinates.map(([lng, lat]) => ({ lat, lng })),
          geodesic: true,
          strokeColor,
          strokeOpacity: isLocalLine ? 1 : currentZoom < 7 ? 0.45 : 0.8,
          strokeWeight: isLocalLine ? 4 : currentZoom < 7 ? 1.4 : 2,
          map: mapRef.current!
        });

        polyline.addListener('click', () => {
          if (onSelectAsset) {
            onSelectAsset(line.id);
          }
        });

        polylinesRef.current.set(line.id, polyline);
      });
    }

    setNetworkStats({
      substationCount: Object.keys(substations).length,
      lineCount: Object.keys(lines).length
    });
  }, [mapState, substations, lines, alarms, selectedAssetId, resolvedVisibleLayers, onSelectAsset, cameraPreset, selectedConnectedLineIds, selectedNeighborIds]);

  useEffect(() => {
    if (mapState !== MapProviderState.READY || !mapRef.current) return;

    const bounds = new google.maps.LatLngBounds();
    let hasValidBounds = false;

    Object.values(substations).forEach((substation) => {
      if (!Number.isFinite(substation.latitude) || !Number.isFinite(substation.longitude)) return;
      const latLng = new google.maps.LatLng(substation.latitude, substation.longitude);
      bounds.extend(latLng);
      hasValidBounds = true;
    });

    if (hasValidBounds) {
      if (selectedAssetId) {
        const selectedAsset = substations[selectedAssetId];
        if (selectedAsset && Number.isFinite(selectedAsset.latitude) && Number.isFinite(selectedAsset.longitude)) {
          const target = new google.maps.LatLng(selectedAsset.latitude, selectedAsset.longitude);
          mapRef.current.panTo(target);
          mapRef.current.setZoom(Math.max(mapRef.current.getZoom() ?? 6, 8.5));
          return;
        }
      }

      mapRef.current.fitBounds(bounds, { top: 80, right: 20, bottom: 20, left: 20 });
    }
  }, [mapState, substations, selectedAssetId]);

  useEffect(() => {
    if (mapState !== MapProviderState.READY || !mapRef.current || selectedAssetId) return;

    const preset = mapCameraPresets[cameraPreset] ?? mapCameraPresets.NATIONAL;
    const currentZoom = mapRef.current.getZoom() ?? preset.zoom;

    mapRef.current.panTo(preset.center);
    if (Math.abs(currentZoom - preset.zoom) > 0.2) {
      mapRef.current.setZoom(preset.zoom);
    }
  }, [mapState, cameraPreset, selectedAssetId]);

  const handleSelectAsset = useCallback((assetId: string) => {
    if (onSelectAsset) {
      onSelectAsset(assetId);
    }
  }, [onSelectAsset]);

  useEffect(() => {
    if (mapState !== MapProviderState.READY || !mapRef.current) return;

    if (!selectedAssetId || !selectedAsset) {
      if (selectedAssetId === null || selectedAssetId === undefined) {
        if (previousCameraRef.current && mapRef.current) {
          mapRef.current.panTo(previousCameraRef.current.center);
          mapRef.current.setZoom(previousCameraRef.current.zoom);
          previousCameraRef.current = null;
        }
      }
      return;
    }

    if (!Number.isFinite(selectedAsset.latitude) || !Number.isFinite(selectedAsset.longitude)) return;

    const target = new google.maps.LatLng(selectedAsset.latitude, selectedAsset.longitude);
    if (!previousCameraRef.current) {
      previousCameraRef.current = {
        center: mapRef.current.getCenter()?.toJSON() ?? mapCameraPresets[cameraPreset].center,
        zoom: mapRef.current.getZoom() ?? mapCameraPresets[cameraPreset].zoom
      };
    }

    mapRef.current.panTo(target);
    mapRef.current.setZoom(Math.max(mapRef.current.getZoom() ?? 8, 8.5));
  }, [mapState, cameraPreset, selectedAssetId, selectedAsset]);

  const statusDetail = MAP_STATUS_DETAILS[mapState];

  return (
    <div className="grid-map-canvas-container">
      <div
        ref={mapContainerRef}
        className="grid-map-canvas"
        style={{
          width: '100%',
          height: '100%',
          display: mapState === MapProviderState.READY ? 'block' : 'none',
          position: 'relative'
        }}
      />

      {mapState !== MapProviderState.READY && (
        <div className="grid-map-canvas" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#f8fafc' }}>
          <svg viewBox={`0 0 ${fallbackTopology.width} ${fallbackTopology.height}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
            <defs>
              <pattern id="gridFallback" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gridFallback)" />
            {fallbackTopology.fallbackLines.map((line) => (
              <path
                key={line.id}
                d={line.points}
                stroke={getOperationalLineColor(line as any, alarms, resolvedVisibleLayers.has('OUTAGES'), resolvedVisibleLayers.has('ALARMS'), resolvedVisibleLayers.has('RISK'))}
                strokeWidth={line.selected ? 4 : 2.4}
                fill="none"
                strokeOpacity={0.9}
                strokeLinecap="round"
              />
            ))}
            {fallbackTopology.fallbackNodes.map((asset) => (
              <g key={asset.id} onClick={() => handleSelectAsset(asset.id)} style={{ cursor: 'pointer' }}>
                <circle
                  cx={asset.x}
                  cy={asset.y}
                  r={asset.isSelected ? 8 : 6}
                  fill={getOperationalBadgeColor(asset.state, asset.riskScore, asset.healthScore)}
                  stroke={asset.isSelected ? '#f8fafc' : '#0f172a'}
                  strokeWidth={asset.isSelected ? 2.4 : 1.2}
                  opacity={0.95}
                />
                {asset.isSelected && (
                  <circle cx={asset.x} cy={asset.y} r={14} fill="none" stroke="#f8fafc" strokeOpacity={0.5} strokeWidth={1.1} />
                )}
              </g>
            ))}
          </svg>
        </div>
      )}

      <div className="map-layer-legend" aria-label="Map legend">
        {mapLegend.map((group) => (
          <div key={group.title} className="legend-group">
            <div className="legend-title">{group.title}</div>
            <div className="legend-items">
              {group.items.map((item) => (
                <div key={`${group.title}-${item.label}`} className="legend-item">
                  <span className="legend-dot" style={{ background: item.color }} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {onToggleLayer && (
        <div className="map-layer-controls" aria-label="Operational map layers">
          {mapLayerControls.map((layer) => { const active = resolvedVisibleLayers.has(layer.key); return (
            <button
              key={layer.key}
              type="button"
              className={`map-layer-toggle ${active ? 'active' : ''}`}
              onClick={() => onToggleLayer(layer.key)}
              title={layer.label}
            >
              {layer.label}
            </button>
          ); })}
        </div>
      )}

      <div className="map-status-bar" style={{ backgroundColor: statusDetail.color }}>
        <span className="status-label">{statusDetail.label}</span>
        <span className="status-message">{statusDetail.message}</span>
        <span className="network-stats">
          Substations: {mapState === MapProviderState.READY ? networkStats.substationCount : Object.keys(substations).length} | Lines: {mapState === MapProviderState.READY ? networkStats.lineCount : Object.keys(lines).length}
        </span>
      </div>
    </div>
  );
};

function getLineColor(voltageKV: number): string {
  if (voltageKV >= 400) return '#00CCFF';
  if (voltageKV >= 200) return '#AA00FF';
  if (voltageKV >= 100) return '#00AA00';
  return '#FFAA00';
}

function getVoltageColor(voltageKV: number): string {
  if (voltageKV >= 400) return '#00CCFF';
  if (voltageKV >= 200) return '#AA00FF';
  if (voltageKV >= 100) return '#00AA00';
  return '#FFAA00';
}

function getOperationalBadgeColor(state: string, riskScore: number, healthScore: number): string {
  if (state === 'OUT_OF_SERVICE' || state === 'OFFLINE' || state === 'CRITICAL') return '#ef4444';
  if (state === 'WARNING' || state === 'CONGESTED' || riskScore > 65) return '#f59e0b';
  if (state === 'MAINTENANCE') return '#8b5cf6';
  if (healthScore < 60) return '#ef4444';
  return '#22c55e';
}

function getOperationalLineColor(
  line: Pick<TransmissionLine, 'id' | 'voltageKV' | 'state' | 'loadingPct' | 'nMinusOneRisk'>,
  alarms: GridAlarm[],
  hasOutages: boolean,
  hasAlarms: boolean,
  hasRisk: boolean
): string {
  const alarmed = alarms.some((alarm) => alarm.assetId === line.id || alarm.assetName === line.id || alarm.affectedEquipments.includes(line.id));
  if (hasOutages && line.state === 'OUT_OF_SERVICE') return '#ef4444';
  if (hasAlarms && alarmed) return '#f59e0b';
  if (hasRisk && (line.nMinusOneRisk || line.loadingPct > 75)) return '#a855f7';
  return getLineColor(line.voltageKV);
}

export default GridMapCanvas;
