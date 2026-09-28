import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import {
  Circle,
  CircleMarker,
  GeoJSON,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Camera,
  Car,
  Compass,
  Expand,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  TriangleAlert,
  Box,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
} from 'lucide-react';
import ThreeDMap from './ThreeDMap';
import { riskColors, riskLocations } from '../data/riskLocations';
import { nerInfrastructureCorridors, nerStateBoundaries, nerEvacuationRoutes } from '../data/nerGeoJSON';
import { historicalLandslides } from '../data/historicalLandslides';
import { roadsData } from '../data/roadsData';
import HeatmapLayer from './HeatmapLayer';

const NER_CENTER = [26.2, 92.8];
const NER_DEFAULT_ZOOM = 6.4;

export const STATE_CENTERS = {
  'All States': { center: [26.2, 92.8], zoom: 6.4 },
  'Assam': { center: [26.2, 92.9], zoom: 7.5 },
  'Arunachal Pradesh': { center: [28.2, 94.7], zoom: 7.2 },
  'Meghalaya': { center: [25.5, 91.3], zoom: 8.5 },
  'Manipur': { center: [24.8, 93.9], zoom: 8.2 },
  'Mizoram': { center: [23.3, 92.8], zoom: 8.0 },
  'Nagaland': { center: [26.1, 94.4], zoom: 8.2 },
  'Tripura': { center: [23.8, 91.6], zoom: 8.8 },
  'Sikkim': { center: [27.5, 88.5], zoom: 8.8 },
};

// Fix default Leaflet icon issues with bundlers
const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `<div style="background:#2563eb;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(37,99,235,0.6);animation:pulse 2s infinite;"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const shelterIcon = L.divIcon({
  className: 'evac-shelter-marker',
  html: `<div style="background:#15803d;color:#fff;width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);">⛺</div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const hospitalIcon = L.divIcon({
  className: 'evac-hospital-marker',
  html: `<div style="background:#dc2626;color:#fff;width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);">✚</div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const historicalIcon = L.divIcon({
  className: 'historical-landslide-marker',
  html: `<div style="background:#b91c1c;color:#fff;width:24px;height:24px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);transform:rotate(45deg);"><span style="transform:rotate(-45deg);">⚠</span></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const incidentIcon = L.divIcon({
  className: 'incident-field-marker',
  html: `<div style="background:#f97316;color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;border:2px solid #fff;box-shadow:0 2px 8px rgba(249,115,22,0.6);">📷</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const villageIcon = L.divIcon({
  className: 'village-marker',
  html: `<div style="background:#10b981;color:#fff;width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function MapController({ selectedLocation, resetTrigger, userLocation, flyToTrigger, isFullscreen, selectedState }) {
  const map = useMap();
  const lastLocationIdRef = useRef(null);
  const lastStateRef = useRef(selectedState);

  useEffect(() => {
    // Invalidate size immediately so Leaflet calculates bounds correctly
    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 200);
    const t3 = setTimeout(() => map.invalidateSize(), 500);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', handleResize);
    };
  }, [map, isFullscreen]);

  useEffect(() => {
    if (resetTrigger) {
      map.flyTo(NER_CENTER, NER_DEFAULT_ZOOM, { duration: 0.8 });
    }
  }, [resetTrigger, map]);

  // When selectedState changes, smoothly fly map to that state's center and zoom
  useEffect(() => {
    if (selectedState && lastStateRef.current !== selectedState) {
      lastStateRef.current = selectedState;
      const target = STATE_CENTERS[selectedState] || STATE_CENTERS['All States'];
      if (target) {
        map.flyTo(target.center, target.zoom, { duration: 0.9 });
      }
    }
  }, [selectedState, map]);

  useEffect(() => {
    if (selectedLocation && selectedLocation.latitude && selectedLocation.longitude) {
      if (lastLocationIdRef.current !== selectedLocation.id || flyToTrigger) {
        lastLocationIdRef.current = selectedLocation.id;
        map.flyTo([selectedLocation.latitude, selectedLocation.longitude], 8, {
          duration: 0.75,
        });
      }
    }
  }, [selectedLocation?.id, flyToTrigger, map]);

  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.latitude, userLocation.longitude], 9, { duration: 0.8 });
    }
  }, [userLocation, map]);

  return null;
}

function MapLegend({ visibleLayers }) {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = () => {
      const container = L.DomUtil.create('div', 'map-legend');
      container.innerHTML = `
        <strong>Risk Levels</strong>
        <span><i style="background:${riskColors.Low}"></i> 🟢 Low (0–25)</span>
        <span><i style="background:${riskColors.Moderate}"></i> 🟡 Moderate (26–50)</span>
        <span><i style="background:${riskColors.High}"></i> 🟠 High (51–75)</span>
        <span><i style="background:${riskColors.Critical}"></i> 🔴 Critical (76–100)</span>
        ${visibleLayers.roads ? `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #e2e8f0;"><span><b style="color:#ef4444;margin-right:4px;">―</b> Blocked Road</span><br/><span><b style="color:#eab308;margin-right:4px;">―</b> Caution Road</span></div>` : ''}
        ${visibleLayers.historical ? `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #e2e8f0;"><span><b style="color:#b91c1c;margin-right:4px;">◆</b> Historical Landslide</span></div>` : ''}
        ${visibleLayers.incidents ? `<div style="margin-top:4px;"><span><b style="color:#f97316;margin-right:4px;">●</b> Citizen Report</span></div>` : ''}
      `;
      L.DomEvent.disableClickPropagation(container);
      return container;
    };

    legend.addTo(map);
    return () => legend.remove();
  }, [map, visibleLayers]);

  return null;
}

function MapNavigationWidget() {
  const map = useMap();

  const handlePan = (dx, dy) => {
    map.panBy([dx, dy], { animate: true, duration: 0.35 });
  };

  const handleZoomIn = () => {
    const curZoom = map.getZoom();
    const maxZ = map.getMaxZoom() || 18;
    const target = Math.min(maxZ, Math.round((curZoom + 0.8) * 4) / 4);
    map.setZoom(target, { animate: true });
  };

  const handleZoomOut = () => {
    const curZoom = map.getZoom();
    const minZ = map.getMinZoom() !== undefined ? map.getMinZoom() : 2;
    const target = Math.max(minZ, Math.round((curZoom - 0.8) * 4) / 4);
    map.setZoom(target, { animate: true });
  };

  const handleRecenter = () => {
    map.flyTo(NER_CENTER, NER_DEFAULT_ZOOM, { duration: 0.7 });
  };

  // Keyboard navigation: Arrow keys pan, + and - zoom
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        map.panBy([0, -130], { animate: true, duration: 0.25 });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        map.panBy([0, 130], { animate: true, duration: 0.25 });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        map.panBy([-130, 0], { animate: true, duration: 0.25 });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        map.panBy([130, 0], { animate: true, duration: 0.25 });
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [map]);

  return (
    <div
      className="leaflet-control map-nav-dpad-container"
      style={{
        position: 'absolute',
        top: 14,
        left: 14,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        pointerEvents: 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* 4-Way Compass Pan D-Pad */}
      <div
        style={{
          background: 'rgba(13, 24, 19, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          borderRadius: '50%',
          width: 98,
          height: 98,
          position: 'relative',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        {/* Pan Up / North */}
        <button
          type="button"
          onClick={() => handlePan(0, -140)}
          title="Pan Up / North (ArrowUp)"
          style={{
            position: 'absolute',
            top: 4,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'transparent',
            border: 'none',
            color: '#f8fafc',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#f97316')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#f8fafc')}
        >
          <ChevronUp size={22} strokeWidth={3} />
        </button>

        {/* Pan Left / West */}
        <button
          type="button"
          onClick={() => handlePan(-140, 0)}
          title="Pan Left / West (ArrowLeft)"
          style={{
            position: 'absolute',
            left: 4,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            color: '#f8fafc',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#f97316')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#f8fafc')}
        >
          <ChevronLeft size={22} strokeWidth={3} />
        </button>

        {/* Center Recenter Button */}
        <button
          type="button"
          onClick={handleRecenter}
          title="Recenter to North Eastern Region"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#ea580c',
            border: '2px solid rgba(255, 255, 255, 0.45)',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(234, 88, 12, 0.6)',
            transition: 'all 0.15s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.9)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Compass size={16} strokeWidth={2.4} />
        </button>

        {/* Pan Right / East */}
        <button
          type="button"
          onClick={() => handlePan(140, 0)}
          title="Pan Right / East (ArrowRight)"
          style={{
            position: 'absolute',
            right: 4,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            color: '#f8fafc',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#f97316')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#f8fafc')}
        >
          <ChevronRight size={22} strokeWidth={3} />
        </button>

        {/* Pan Down / South */}
        <button
          type="button"
          onClick={() => handlePan(0, 140)}
          title="Pan Down / South (ArrowDown)"
          style={{
            position: 'absolute',
            bottom: 4,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'transparent',
            border: 'none',
            color: '#f8fafc',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#f97316')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#f8fafc')}
        >
          <ChevronDown size={22} strokeWidth={3} />
        </button>
      </div>

      {/* Zoom In & Zoom Out (Zoom Less) Vertical Pill */}
      <div
        style={{
          background: 'rgba(13, 24, 19, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          borderRadius: 14,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 6px 18px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          width: 40,
        }}
      >
        {/* Zoom In (+) */}
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In (+ key)"
          style={{
            width: 40,
            height: 38,
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.14)',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Plus size={19} strokeWidth={2.6} />
        </button>

        {/* Zoom Out / Zoom Less (-) */}
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out / Less (- key)"
          style={{
            width: 40,
            height: 38,
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Minus size={19} strokeWidth={2.6} />
        </button>
      </div>
    </div>
  );
}

export default function Map({
  analysisStatus,
  onLocationSelect,
  selectedLocation,
  onToast,
  onInspectDetails,
  mapType = 'satellite',
  selectedState = 'All States',
}) {
  const [viewMode, setViewMode] = useState('2d'); // Default to 2D Satellite Map
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const [flyCount, setFlyCount] = useState(0);
  const [userCoords, setUserCoords] = useState(null);

  // Multi-layer visualization - Default to Satellite
  const [baseMap, setBaseMap] = useState('satellite'); // 'satellite' | 'osm' | 'terrain' | 'street'

  useEffect(() => {
    if (mapType) {
      setBaseMap(mapType === 'map' ? 'osm' : mapType);
    }
  }, [mapType]);
  const [layers, setLayers] = useState({
    markers: true,
    heatmap: false,
    boundaries: true,
    roads: true,
    evacuation: true,
    villages: true,
    incidents: true,
    historical: true,
    rainfall: false,
  });

  const toggleLayer = (layerKey) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const handleResetView = () => {
    setResetCount((c) => c + 1);
    if (onToast) onToast('Map view reset to North Eastern Region');
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen((f) => !f);
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      if (onToast) onToast('Geolocation is not supported by your browser.', 'error');
      return;
    }

    if (onToast) onToast('Requesting current browser location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy || 0);
        const coords = { latitude: lat, longitude: lon, accuracy };
        setUserCoords(coords);

        const inNER = lat >= 21.5 && lat <= 29.5 && lon >= 88.0 && lon <= 97.5;
        if (!inNER) {
          if (onToast) {
            onToast(
              `Current Location: ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E. Note: Location is outside the North-Eastern Region (NER). Landslide monitoring applies to Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, and Sikkim.`,
              'warning'
            );
          }
        } else {
          if (onToast) {
            onToast(`Located: ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E (within NER surveillance grid, accuracy ~${accuracy}m)`, 'success');
          }
        }
      },
      (error) => {
        let msg = 'Unable to retrieve current location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied by your browser.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable from your device.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        if (onToast) onToast(msg, 'warning');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // State boundary styling matching reference image colors and opacity
  const stateStyle = (feature) => ({
    fillColor: feature.properties.color || '#e89e35',
    weight: 1.5,
    opacity: 0.9,
    color: '#ffffff',
    fillOpacity: 0.62,
  });

  const STATE_LABELS = [
    { name: 'Arunachal Pradesh', coords: [28.1, 94.6] },
    { name: 'Assam', coords: [26.4, 92.4] },
    { name: 'Nagaland', coords: [26.15, 94.45] },
    { name: 'Manipur', coords: [24.75, 93.9] },
    { name: 'Mizoram', coords: [23.3, 92.85] },
    { name: 'Tripura', coords: [23.75, 91.65] },
    { name: 'Meghalaya', coords: [25.48, 91.35] },
    { name: 'Sikkim', coords: [27.5, 88.5] },
  ];

  return (
    <section
      className={`map-card ${isFullscreen ? 'map-fullscreen-mode' : ''}`}
      aria-label="Interactive landslide risk map"
    >
      <div className="map-title">
        <div className="map-title-left">
          <Compass size={18} className="map-icon-pulse" />
          <span>GIS Risk Surveillance &middot; North East India (NER)</span>
        </div>
        <div className="map-controls-toolbar">
          {/* 2D / 3D Mode Toggle Switcher */}
          <div className="map-view-switcher">
            <button
              type="button"
              className={`map-view-switch-btn ${viewMode === '3d' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('3d');
                if (onToast) onToast('Activated 3D Mountain Elevation & Terrain Grid', 'success');
              }}
              title="Switch to 3D Topographic Terrain View"
            >
              <Box size={13} />
              <span>3D Terrain</span>
            </button>
            <button
              type="button"
              className={`map-view-switch-btn ${viewMode === '2d' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('2d');
                if (onToast) onToast('Switched to 2D Planimetric Cartography Map');
              }}
              title="Switch to 2D Cartography View"
            >
              <Layers size={13} />
              <span>2D Map</span>
            </button>
          </div>

          <button
            className="map-toolbar-btn"
            onClick={handleResetView}
            title="Reset Map View"
            type="button"
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>

          <button
            className="map-toolbar-btn"
            onClick={handleMyLocation}
            title="My Current Location"
            type="button"
          >
            <MapPin size={15} />
            <span>My Location</span>
          </button>

          <div className="layer-picker-wrapper">
            <button
              className={`map-toolbar-btn ${layersOpen ? 'active' : ''}`}
              onClick={() => setLayersOpen((o) => !o)}
              title="Toggle Map Layers"
              type="button"
            >
              <Layers size={15} />
              <span>Layers</span>
            </button>

            {layersOpen && (
              <div className="layer-picker-dropdown" role="menu">
                <div className="layer-picker-header">
                  <strong>Map Layers</strong>
                  <button onClick={() => setLayersOpen(false)} type="button">&times;</button>
                </div>
                <div className="layer-picker-options">
                  <label className="layer-checkbox-item">
                    <input
                      type="checkbox"
                      checked={layers.markers}
                      onChange={() => toggleLayer('markers')}
                    />
                    <span>🟢🟡🟠🔴 Risk Stations</span>
                  </label>
                  <label className="layer-checkbox-item">
                    <input
                      type="checkbox"
                      checked={layers.heatmap}
                      onChange={() => toggleLayer('heatmap')}
                    />
                    <span>🔥 Risk Heatmap</span>
                  </label>
                  <label className="layer-checkbox-item">
                    <input
                      type="checkbox"
                      checked={layers.boundaries}
                      onChange={() => toggleLayer('boundaries')}
                    />
                    <span>🗺️ NER State Boundaries</span>
                  </label>
                  <label className="layer-checkbox-item">
                    <input
                      type="checkbox"
                      checked={layers.roads}
                      onChange={() => toggleLayer('roads')}
                    />
                    <span>🛣️ Vulnerable Highway Corridors</span>
                  </label>
                  <label className="layer-checkbox-item">
                    <input
                      type="checkbox"
                      checked={layers.villages}
                      onChange={() => toggleLayer('villages')}
                    />
                    <span>🏘️ Catchment Villages</span>
                  </label>
                  <label className="layer-checkbox-item">
                    <input
                      type="checkbox"
                      checked={layers.incidents}
                      onChange={() => toggleLayer('incidents')}
                    />
                    <span>📷 Citizen Ground Reports</span>
                  </label>
                  <label className="layer-checkbox-item">
                    <input
                      type="checkbox"
                      checked={layers.historical}
                      onChange={() => toggleLayer('historical')}
                    />
                    <span>⚠️ Historical Landslides</span>
                  </label>

                  <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                    <small style={{ fontWeight: 700, display: 'block', marginBottom: 6, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Cartography Style
                    </small>
                    <select
                      value={baseMap}
                      onChange={(e) => setBaseMap(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-app)',
                        color: 'var(--text-primary)',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      <option value="topo">Topographic Relief (Esri Topo)</option>
                      <option value="osm">Standard Cartography (OpenStreetMap)</option>
                      <option value="satellite">Satellite Imagery (Aerial Survey)</option>
                      <option value="street">Highways & Infrastructure (Esri)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            className="map-toolbar-btn"
            onClick={handleFullscreenToggle}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
            type="button"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {viewMode === '3d' ? (
        <ThreeDMap
          selectedLocation={selectedLocation}
          onLocationSelect={onLocationSelect}
        />
      ) : (
        <div className="map-canvas" style={{ flex: 1, width: '100%', height: '100%', minHeight: '520px', position: 'relative' }}>
          <MapContainer
            center={NER_CENTER}
            zoom={NER_DEFAULT_ZOOM}
            minZoom={2}
            maxZoom={18}
            zoomSnap={0.25}
            zoomDelta={0.5}
            wheelPxPerZoomLevel={80}
            wheelDebounceTime={40}
            zoomControl={false}
            scrollWheelZoom={true}
            doubleClickZoom={true}
            touchZoom={true}
            dragging={true}
            keyboard={true}
            className="leaflet-map"
            style={{ width: '100%', height: '100%', minHeight: '520px', cursor: 'grab' }}
          >
            <TileLayer
              key={baseMap}
              attribution="&copy; Esri &middot; Maxar &middot; Earthstar Geographics &middot; GIS Landslide Surveillance"
              url={
                baseMap === 'osm'
                  ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  : baseMap === 'terrain'
                  ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
                  : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
              }
              subdomains={baseMap === 'osm' || baseMap === 'terrain' ? 'abc' : ''}
              maxZoom={18}
            />
            {baseMap === 'satellite' && (
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                maxZoom={18}
              />
            )}

            <MapController
              selectedLocation={selectedLocation}
              selectedState={selectedState}
              resetTrigger={resetCount}
              userLocation={userCoords}
              flyToTrigger={flyCount}
              isFullscreen={isFullscreen}
            />

            {/* Comprehensive Easy Pan (Up, Down, Left, Right) & Zoom In / Zoom Out (Less) D-Pad Controller */}
            <MapNavigationWidget />

            <MapLegend visibleLayers={layers} />

          {/* USER DETECTED CURRENT LOCATION MARKER */}
          {userCoords && (
            <>
              <Marker position={[userCoords.latitude, userCoords.longitude]} icon={userLocationIcon}>
                <Popup>
                  <div style={{ padding: '4px 6px', minWidth: 210 }}>
                    <strong style={{ fontSize: 13, color: '#1d4ed8', display: 'block', marginBottom: 4 }}>
                      📍 Detected Current Location
                    </strong>
                    <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                      Latitude: <b>{userCoords.latitude.toFixed(5)}° N</b><br />
                      Longitude: <b>{userCoords.longitude.toFixed(5)}° E</b><br />
                      GPS Accuracy: ~{userCoords.accuracy} meters
                    </div>
                    {!(userCoords.latitude >= 21.5 && userCoords.latitude <= 29.5 && userCoords.longitude >= 88.0 && userCoords.longitude <= 97.5) ? (
                      <div style={{ marginTop: 8, padding: '6px 8px', background: '#fee2e2', color: '#991b1b', borderRadius: 4, fontSize: 11, lineHeight: 1.3 }}>
                        ⚠️ <b>Outside NER Coverage Zone</b><br />
                        Landslide monitoring coverage does not apply to this location.
                      </div>
                    ) : (
                      <div style={{ marginTop: 8, padding: '6px 8px', background: '#dcfce7', color: '#166534', borderRadius: 4, fontSize: 11 }}>
                        ✓ Within North-Eastern Region (NER) coverage.
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={[userCoords.latitude, userCoords.longitude]}
                radius={Math.max(500, userCoords.accuracy || 1000)}
                pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.15 }}
              />
            </>
          )}

          {/* LAYER 1: State Boundaries (GeoJSON) */}
          {layers.boundaries && (
            <>
              <GeoJSON
                data={nerStateBoundaries}
                style={stateStyle}
                onEachFeature={(feature, layer) => {
                  if (feature.properties && feature.properties.name) {
                    layer.bindTooltip(`<b>${feature.properties.name}</b>`, {
                      permanent: false,
                      direction: 'center',
                      className: 'state-boundary-tooltip',
                    });
                  }
                }}
              />
              {STATE_LABELS.map((sl) => (
                <Marker
                  key={sl.name}
                  position={sl.coords}
                  icon={L.divIcon({
                    className: 'state-map-label',
                    html: `<div style="font-weight:700;font-size:11.5px;color:#112217;text-shadow:0 1px 3px rgba(255,255,255,0.9), 0 0 5px #ffffff;white-space:nowrap;pointer-events:none;transform:translate(-50%, -50%);font-family:'Plus Jakarta Sans',sans-serif;">${sl.name}</div>`,
                    iconSize: [0, 0],
                  })}
                  interactive={false}
                />
              ))}
            </>
          )}

          {/* LAYER 2: Risk Heatmap */}
          <HeatmapLayer visible={layers.heatmap} />

          {/* LAYER 3: Vulnerable Road Corridors */}
          {layers.roads &&
            roadsData.map((road) => {
              const roadColor = road.status === 'Blocked' ? '#ef4444' : road.status === 'Caution' ? '#eab308' : '#22c55e';
              return (
                <Polyline
                  key={road.id}
                  positions={road.coordinates}
                  pathOptions={{
                    color: roadColor,
                    weight: 4.5,
                    opacity: 0.85,
                    dashArray: road.status === 'Caution' ? '6, 6' : undefined,
                  }}
                >
                  <Popup>
                    <div className="corridor-popup">
                      <h4>{road.roadName}</h4>
                      <p><b>State:</b> {road.state}</p>
                      <p><b>Status:</b> <span style={{ color: roadColor, fontWeight: 'bold' }}>{road.status.toUpperCase()}</span></p>
                      <p><b>Condition:</b> {road.conditionNotes}</p>
                      <small>Last updated: {road.lastUpdate}</small>
                    </div>
                  </Popup>
                </Polyline>
              );
            })}

          {/* LAYER: Disaster Evacuation Routes & Safe Bypasses */}
          {layers.evacuation &&
            (nerEvacuationRoutes || []).map((route) => (
              <div key={route.id}>
                {/* Blocked High-Risk Highway Segment */}
                <Polyline
                  positions={route.blockedSegment.coords}
                  pathOptions={{ color: '#dc2626', weight: 5, dashArray: '6, 8', opacity: 0.95 }}
                >
                  <Popup>
                    <div style={{ padding: '4px 6px', minWidth: 200 }}>
                      <strong style={{ color: '#dc2626', display: 'block', fontSize: 13 }}>
                        ⚠️ {route.blockedSegment.status}
                      </strong>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1a281e', marginTop: 4 }}>
                        {route.blockedSegment.name}
                      </div>
                      <small style={{ color: '#64748b', display: 'block', marginTop: 3 }}>
                        Passage restricted due to active landslide susceptibility.
                      </small>
                    </div>
                  </Popup>
                </Polyline>

                {/* Recommended Safe Bypass Route */}
                <Polyline
                  positions={route.safeBypassRoute.coords}
                  pathOptions={{ color: '#16a34a', weight: 5, opacity: 0.95 }}
                >
                  <Popup>
                    <div style={{ padding: '4px 6px', minWidth: 220 }}>
                      <strong style={{ color: '#16a34a', display: 'block', fontSize: 13 }}>
                        ✓ {route.safeBypassRoute.status}
                      </strong>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1a281e', marginTop: 4 }}>
                        {route.safeBypassRoute.name}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#334155', marginTop: 4 }}>
                        Distance: <b>{route.safeBypassRoute.distance}</b> &middot; Travel Time: <b>{route.safeBypassRoute.travelTime}</b>
                      </div>
                    </div>
                  </Popup>
                </Polyline>

                {/* Emergency Relief Shelter Pin */}
                <Marker position={route.emergencyShelter.coords} icon={shelterIcon}>
                  <Popup>
                    <div style={{ padding: '4px 6px', minWidth: 210 }}>
                      <strong style={{ color: '#15803d', display: 'block', fontSize: 13 }}>
                        ⛺ Emergency Relief Shelter
                      </strong>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1a281e', marginTop: 4 }}>
                        {route.emergencyShelter.name}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#334155', marginTop: 4, lineHeight: 1.4 }}>
                        Capacity: <b>{route.emergencyShelter.capacity}</b><br />
                        Emergency Phone: <b>{route.emergencyShelter.phone}</b>
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {/* Emergency Hospital Pin */}
                <Marker position={route.emergencyHospital.coords} icon={hospitalIcon}>
                  <Popup>
                    <div style={{ padding: '4px 6px', minWidth: 210 }}>
                      <strong style={{ color: '#dc2626', display: 'block', fontSize: 13 }}>
                        ✚ Disaster Trauma Hospital
                      </strong>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1a281e', marginTop: 4 }}>
                        {route.emergencyHospital.name}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#334155', marginTop: 4 }}>
                        Direct Hotline: <b>{route.emergencyHospital.phone}</b>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </div>
            ))}

          {/* LAYER 4: Monitored Catchment Villages */}
          {layers.villages &&
            riskLocations
              .filter((l) => l.village)
              .map((loc) => (
                <Marker
                  key={`vil-${loc.id}`}
                  position={[loc.latitude + 0.03, loc.longitude + 0.03]}
                  icon={villageIcon}
                >
                  <Popup>
                    <div className="village-popup">
                      <h4>🏘️ {loc.village}</h4>
                      <p><b>District:</b> {loc.district}, {loc.state}</p>
                      <p><b>Monitored Station:</b> {loc.locationName}</p>
                      <p><b>Slope Exposure:</b> {loc.slope}° incline</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

          {/* LAYER 5: Citizen Ground Reports */}
          {layers.incidents && [
            { id: 'rep-m1', lat: 24.72, lon: 93.63, title: 'Tupul Catchment Slide', type: 'Landslide', priority: 'Critical' },
            { id: 'rep-m2', lat: 27.08, lon: 88.45, title: 'Melli Road Tension Crack', type: 'Falling Rocks', priority: 'High' },
            { id: 'rep-m3', lat: 25.42, lon: 92.21, title: 'Sonapur Tunnel Sludge', type: 'Road Blockage', priority: 'Moderate' },
            { id: 'rep-m4', lat: 25.75, lon: 93.92, title: 'Chumukedima Subsidence', type: 'Slope Crack', priority: 'High' },
          ].map((rep) => (
            <Marker key={rep.id} position={[rep.lat, rep.lon]} icon={incidentIcon}>
              <Popup>
                <div className="incident-map-popup">
                  <span className="inc-tag">Citizen Field Report</span>
                  <h4>{rep.title}</h4>
                  <p><b>Classification:</b> {rep.type}</p>
                  <p><b>Priority:</b> <span style={{ color: rep.priority === 'Critical' ? '#ef4444' : '#f97316', fontWeight: 700 }}>{rep.priority}</span></p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* LAYER 6: Historical Landslides */}
          {layers.historical &&
            historicalLandslides.map((event) => (
              <Marker
                key={event.id}
                position={[event.latitude, event.longitude]}
                icon={historicalIcon}
              >
                <Popup>
                  <div className="historical-popup">
                    <span className="historical-tag">{event.dataType}</span>
                    <h3>{event.location}</h3>
                    <p className="historical-meta">
                      <b>Date:</b> {event.date} &middot; <b>State:</b> {event.state} ({event.district})
                    </p>
                    <div className="historical-severity-badge">
                      <span>Severity: <b>{event.severity}</b></span>
                      {event.casualties > 0 && <span>Casualties: <b>{event.casualties}</b></span>}
                    </div>
                    <p className="historical-summary">{event.summary}</p>
                    <div className="historical-tech">
                      <p><b>Rainfall Recorded:</b> {event.rainfallRecorded}</p>
                      <p><b>Source:</b> <em>{event.source}</em></p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* LAYER 7: Active Risk Markers with Comprehensive Popup */}
          {layers.markers &&
            riskLocations.map((location) => {
              const matchesState =
                !selectedState ||
                selectedState === 'All States' ||
                location.state.toLowerCase() === selectedState.toLowerCase();
              const isSelected = selectedLocation?.id === location.id;
              const displayLocation =
                isSelected && analysisStatus === 'success' ? selectedLocation : location;
              const color = riskColors[displayLocation.riskLevel] || '#3daa6b';

              return (
                <CircleMarker
                  center={[location.latitude, location.longitude]}
                  eventHandlers={{
                    click: () => onLocationSelect(location),
                  }}
                  key={location.id}
                  pathOptions={{
                    color: isSelected ? '#ffffff' : color,
                    fillColor: color,
                    fillOpacity: matchesState ? 0.95 : 0.25,
                    weight: isSelected ? 4 : matchesState ? 2.5 : 1,
                  }}
                  radius={isSelected ? 12 : matchesState ? 8.5 : 5}
                >
                  <Popup>
                    <div style={{ width: 230, padding: 0, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>
                          {displayLocation.locationName}, {displayLocation.state}
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 9999,
                            background:
                              displayLocation.riskLevel === 'Critical'
                                ? '#fee2e2'
                                : displayLocation.riskLevel === 'High'
                                ? '#ffedd5'
                                : displayLocation.riskLevel === 'Moderate'
                                ? '#fef9c3'
                                : '#dcfce7',
                            color:
                              displayLocation.riskLevel === 'Critical'
                                ? '#b91c1c'
                                : displayLocation.riskLevel === 'High'
                                ? '#c2410c'
                                : displayLocation.riskLevel === 'Moderate'
                                ? '#a16207'
                                : '#15803d',
                          }}
                        >
                          ● {displayLocation.riskLevel} Risk
                        </span>
                      </div>

                      {/* Thumbnail photo */}
                      <div
                        style={{
                          height: 75,
                          borderRadius: 8,
                          backgroundImage: `url('/meghalaya-hills.jpg')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          marginBottom: 8,
                        }}
                      />

                      {/* Weather Row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 12, fontWeight: 700 }}>
                        <span>🌧️</span>
                        <span>{displayLocation.temperature || 22}°C Light Rain</span>
                      </div>

                      {/* 4 Mini metrics */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 11, color: '#334155', marginBottom: 10 }}>
                        <div>💧 Rainfall: <b>{displayLocation.rainfall || 15} mm</b></div>
                        <div>🌿 Soil: <b>{displayLocation.soilMoisture || 82}%</b></div>
                        <div>⚠️ Slope: <b>{displayLocation.slope || 28}°</b></div>
                        <div>⛰️ Elev: <b>{(displayLocation.elevation || 1486).toLocaleString()} m</b></div>
                      </div>

                      <button
                        onClick={() => {
                          onLocationSelect(location);
                          if (onInspectDetails) onInspectDetails(location);
                        }}
                        style={{
                          width: '100%',
                          background: '#0d2818',
                          color: '#ffffff',
                          border: 'none',
                          padding: '7px 10px',
                          borderRadius: 8,
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 5,
                        }}
                      >
                        <span>View Details →</span>
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

          {/* User Geolocation Marker */}
          {userCoords && (
            <Marker
              position={[userCoords.latitude, userCoords.longitude]}
              icon={userLocationIcon}
            >
              <Popup>
                <div className="user-coords-popup">
                  <h4>Your Detected Location</h4>
                  <p><b>Coordinates:</b> {userCoords.latitude.toFixed(4)}, {userCoords.longitude.toFixed(4)}</p>
                  <small>Accuracy within ~{userCoords.accuracy} meters</small>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {analysisStatus === 'loading' && (
          <div className="prediction-overlay" role="status">
            <span className="loading-spinner" />
            <strong>Analyzing environmental conditions...</strong>
          </div>
        )}
      </div>
      )}
    </section>
  );
}
