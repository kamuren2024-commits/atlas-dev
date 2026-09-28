import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CANONICAL_SUBSTATIONS, CANONICAL_LINES } from './grid-canonical-data';
import { GridAsset, TransmissionLine, MapLayerKey, OperationalViewMode } from './types';
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

// Backward compatibility alias for the type
export type GridMapProviderStatus = MapProviderState;
// Backward compatibility alias for the value
export { MapProviderState as GridMapProviderStatusValue };

const MAP_STATUS_DETAILS: Record<MapProviderState, { label: string; color: string; message: string }> = {
  [MapProviderState.LOADING]: {
    label: 'LOADING',
    color: '#FFA500',
    message: 'Initializing Google Maps...'
  },
  [MapProviderState.READY]: {
    label: 'GOOGLE MAPS: READY',
    color: '#00AA00',
    message: 'Map initialized. Data mode: REFERENCE (not LIVE). Digital Twin and SCADA not connected.'
  },
  [MapProviderState.ERROR_KEY_MISSING]: {
    label: 'ERROR: KEY MISSING',
    color: '#CC0000',
    message: 'Google Maps API key not found in environment (VITE_GOOGLE_MAPS_API_KEY)'
  },
  [MapProviderState.ERROR_AUTHENTICATION]: {
    label: 'ERROR: AUTHENTICATION',
    color: '#CC0000',
    message: 'Google Maps API key authentication failed. Check key validity and quota.'
  },
  [MapProviderState.ERROR_NETWORK]: {
    label: 'ERROR: NETWORK',
    color: '#CC0000',
    message: 'Network error loading Google Maps. Check internet connection.'
  },
  [MapProviderState.ERROR_LIBRARY]: {
    label: 'ERROR: LIBRARY',
    color: '#CC0000',
    message: 'Failed to load Google Maps library. Retry or contact support.'
  },
  [MapProviderState.ERROR_MAP_INIT]: {
    label: 'ERROR: MAP INIT',
    color: '#CC0000',
    message: 'Failed to initialize map on canvas element.'
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
}

export const GridMapCanvas: React.FC<GridMapCanvasProps> = ({
  substations = CANONICAL_SUBSTATIONS,
  lines = CANONICAL_LINES,
  selectedAssetId,
  onSelectAsset,
  visibleLayers = new Set(['SUBSTATIONS', 'TRANSMISSION_LINES']),
  viewMode = 'REFERENCE'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const overlaysRef = useRef<Map<string, google.maps.OverlayView>>(new Map());
  const polylinesRef = useRef<Map<string, google.maps.Polyline>>(new Map());
  const [mapState, setMapState] = useState<MapProviderState>(MapProviderState.LOADING);
  const [networkStats, setNetworkStats] = useState({ substationCount: 0, lineCount: 0 });

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
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
            zoom: 7,
            center: { lat: -1.2921, lng: 36.8219 },
            mapTypeId: 'roadmap',
            disableDefaultUI: false,
            fullscreenControl: true,
            zoomControl: true,
            streetViewControl: false
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

  // Render markers and polylines
  useEffect(() => {
    if (mapState !== MapProviderState.READY || !mapRef.current) return;

    // Clear existing overlays and polylines
    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current.clear();
    polylinesRef.current.forEach((polyline) => polyline.setMap(null));
    polylinesRef.current.clear();

    // Render substations
    if (visibleLayers.has('SUBSTATIONS')) {
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

    // Render transmission lines
    if (visibleLayers.has('TRANSMISSION_LINES')) {
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
  }, [mapState, substations, lines, selectedAssetId, visibleLayers, onSelectAsset]);

  // Fit bounds on initial load (NATIONAL preset)
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
          position: 'relative'
        }}
      />
      
      <div className="map-status-bar" style={{ backgroundColor: statusDetail.color }}>
        <span className="status-label">{statusDetail.label}</span>
        <span className="status-message">{statusDetail.message}</span>
        {mapState === MapProviderState.READY && (
          <>
            <span className="data-mode">DATA MODE: REFERENCE</span>
            <span className="digital-twin-status">DIGITAL TWIN: NOT CONNECTED TO MAP</span>
            <span className="scada-status">SCADA/EMS: NOT CONNECTED</span>
            <span className="network-stats">
              Substations: {networkStats.substationCount} | Lines: {networkStats.lineCount}
            </span>
          </>
        )}
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

export default GridMapCanvas;
