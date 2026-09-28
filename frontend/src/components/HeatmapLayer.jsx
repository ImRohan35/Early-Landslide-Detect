import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { riskLocations } from '../data/riskLocations';

/**
 * Risk Heatmap overlay using Leaflet Canvas / Circle visual blending.
 * Risk intensity is strictly derived from the location's risk score (0-100).
 */
export default function HeatmapLayer({ visible }) {
  const map = useMap();

  useEffect(() => {
    if (!visible) return;

    const layerGroup = L.layerGroup();

    riskLocations.forEach((loc) => {
      const score = Number(loc.riskScore || 50);
      // Determine radius and color intensity based on risk score
      const radiusMeters = 25000 + (score / 100) * 45000;
      
      let baseColor = '#3daa6b'; // Low
      if (score > 75) baseColor = '#d63f45'; // Critical
      else if (score > 50) baseColor = '#e67d27'; // High
      else if (score > 25) baseColor = '#e0bd23'; // Moderate

      // Outer halo
      const outerCircle = L.circle([loc.latitude, loc.longitude], {
        radius: radiusMeters,
        color: 'transparent',
        fillColor: baseColor,
        fillOpacity: Math.min(0.25, 0.05 + (score / 100) * 0.2),
        interactive: false,
      });

      // Medium concentration
      const midCircle = L.circle([loc.latitude, loc.longitude], {
        radius: radiusMeters * 0.6,
        color: 'transparent',
        fillColor: baseColor,
        fillOpacity: Math.min(0.4, 0.12 + (score / 100) * 0.28),
        interactive: false,
      });

      // Core hotspot
      const innerCircle = L.circle([loc.latitude, loc.longitude], {
        radius: radiusMeters * 0.25,
        color: 'transparent',
        fillColor: baseColor,
        fillOpacity: Math.min(0.65, 0.25 + (score / 100) * 0.4),
        interactive: false,
      });

      outerCircle.addTo(layerGroup);
      midCircle.addTo(layerGroup);
      innerCircle.addTo(layerGroup);
    });

    layerGroup.addTo(map);

    return () => {
      layerGroup.remove();
    };
  }, [map, visible]);

  return null;
}
