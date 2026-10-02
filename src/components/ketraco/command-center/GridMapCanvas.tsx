import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { CANONICAL_SUBSTATIONS, CANONICAL_LINES } from './grid-canonical-data';
import { GridAsset, TransmissionLine, MapLayerKey, OperationalViewMode, ViewCameraPreset } from './types';
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
}

function createGridSubstationOverlay(
  { substation, map, onSelect, isSelected }: GridSubstationOverlayProps
): google.maps.OverlayView {
  class GridSubstationOverlay extends google.maps.OverlayView {
    private substation: GridAsset;
    private div: HTMLDivElement | null = null;
    private onSelect: (assetId: string) => void;
    private isSelected: boolean;

    constructor(props: GridSubstationOverlayProps) {
      super();
      this.substation = props.substation;
      this.onSelect = props.onSelect;
      this.isSelected = props.isSelected;
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
      button.style.width = '16px';
      button.style.height = '16px';
      button.style.borderRadius = '50%';
      button.style.border = this.isSelected ? '2px solid #FF6B6B' : '1px solid #444';
      button.style.background = this.getVoltageColor(this.substation.voltageLevelKV);
      button.style.padding = '0';
      button.style.cursor = 'pointer';
      button.style.boxShadow = this.isSelected ? '0 0 8px rgba(255, 107, 107, 0.8)' : 'none';

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

  return new GridSubstationOverlay({ substation, map, onSelect, isSelected });
}

interface GridMapCanvasProps {
  substations?: Record<string, GridAsset>;
  lines?: Record<string, TransmissionLine>;
  selectedAssetId?: string;
  onSelectAsset?: (assetId: string) => void;
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

export const GridMapCanvas: React.FC<GridMapCanvasProps> = ({
  substations = CANONICAL_SUBSTATIONS,
  lines = CANONICAL_LINES,
  selectedAssetId,
  onSelectAsset,
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
  const overlaysRef = useRef<Map<string, google.maps.OverlayView>>(new Map());
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
            zoom: 6,
            center: { lat: -0.37, lng: 37.8 },
            mapTypeId: 'roadmap',
            disableDefaultUI: false,
            fullscreenControl: true,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
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

  useEffect(() => {
    if (mapState !== MapProviderState.READY || !mapRef.current) return;

    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current.clear();
    polylinesRef.current.forEach((polyline) => polyline.setMap(null));
    polylinesRef.current.clear();

    const hasSubstations = resolvedVisibleLayers.has('SUBSTATIONS');
    const hasTransmissionLines = resolvedVisibleLayers.has('TRANSMISSION') || resolvedVisibleLayers.has('LINES');

    if (hasSubstations) {
      Object.values(substations).forEach((substation) => {
        const overlay = createGridSubstationOverlay({
          substation,
          map: mapRef.current!,
          onSelect: onSelectAsset || (() => {}),
          isSelected: selectedAssetId === substation.id
        });
        overlaysRef.current.set(substation.id, overlay);
      });
    }

    if (hasTransmissionLines) {
      Object.values(lines).forEach((line) => {
        if (!line.pathCoordinates || line.pathCoordinates.length < 2) {
          return;
        }

        const lineColor = getLineColor(line.voltageKV);
        const polyline = new google.maps.Polyline({
          path: line.pathCoordinates.map(([lng, lat]) => ({ lat, lng })),
          geodesic: true,
          strokeColor: lineColor,
          strokeOpacity: 0.8,
          strokeWeight: 2,
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
  }, [mapState, substations, lines, selectedAssetId, resolvedVisibleLayers, onSelectAsset]);

  useEffect(() => {
    if (mapState !== MapProviderState.READY || !mapRef.current) return;

    const bounds = new google.maps.LatLngBounds();
    let hasValidBounds = false;

    Object.values(substations).forEach((substation) => {
      const latLng = new google.maps.LatLng(substation.latitude, substation.longitude);
      bounds.extend(latLng);
      hasValidBounds = true;
    });

    if (hasValidBounds) {
      mapRef.current.fitBounds(bounds, { top: 80, right: 20, bottom: 20, left: 20 });
    }
  }, [mapState, substations]);

  const handleSelectAsset = useCallback((assetId: string) => {
    if (onSelectAsset) {
      onSelectAsset(assetId);
    }
  }, [onSelectAsset]);

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
                stroke={getLineColor(line.voltageKV)}
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
                  fill={getVoltageColor(asset.voltageLevelKV)}
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

export default GridMapCanvas;
