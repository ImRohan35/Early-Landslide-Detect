import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Compass,
  RotateCcw,
  Layers,
  Mountain,
  Sparkles,
  TrendingUp,
  Box,
  Eye,
  Radio,
  Play,
  Pause,
  Maximize2,
  X,
} from 'lucide-react';
import { riskLocations, riskColors } from '../data/riskLocations';
import { roadsData } from '../data/roadsData';
import './ThreeDMap.css';

// North Eastern Region Geographic Extents
const LON_MIN = 88.0;
const LON_MAX = 97.5;
const LAT_MIN = 21.5;
const LAT_MAX = 29.5;

const TERRAIN_WIDTH = 260;
const TERRAIN_DEPTH = 220;

// Coordinate transformation: (lon, lat) -> (X, Z) in 3D scene
function geoToWorld(lon, lat) {
  const normX = (lon - LON_MIN) / (LON_MAX - LON_MIN);
  const normZ = (lat - LAT_MIN) / (LAT_MAX - LAT_MIN);
  const x = (normX - 0.5) * TERRAIN_WIDTH;
  const z = -(normZ - 0.5) * TERRAIN_DEPTH;
  return { x, z };
}

// Procedural Himalayan & North Eastern Region elevation model (meters: 50m - 4500m)
function getRegionalElevation(lon, lat) {
  // Check if near known station for pinpoint accuracy
  for (let i = 0; i < riskLocations.length; i++) {
    const loc = riskLocations[i];
    const distSq = (loc.longitude - lon) ** 2 + (loc.latitude - lat) ** 2;
    if (distSq < 0.08) {
      return loc.elevation || 1200;
    }
  }

  // Regional macro features
  // 1. High Himalayas in North/North-West (Sikkim & Arunachal)
  const northHimalaya = Math.max(0, (lat - 26.8) * 600);
  const sikkimPeak = Math.max(0, 1 - Math.hypot(lon - 88.5, lat - 27.6) / 1.5) * 3200;
  const tawangRidge = Math.max(0, 1 - Math.hypot(lon - 91.8, lat - 27.6) / 1.8) * 2800;

  // 2. Meghalaya Plateau / Shillong Horst
  const meghalayaPlat = Math.max(0, 1 - Math.hypot(lon - 91.8, lat - 25.5) / 1.6) * 1650;

  // 3. Patkai & Naga Range in East
  const nagaRange = Math.max(0, 1 - Math.hypot(lon - 94.4, lat - 26.0) / 2.0) * 1900;

  // 4. Mizo / Lushai Hills in South (North-South folded ranges)
  const mizoFolding = Math.max(0, 1 - Math.hypot(lon - 92.8, lat - 23.3) / 1.6) * 1400 * (0.6 + 0.4 * Math.sin(lon * 24));

  // 5. Central Assam Brahmaputra depression
  const assamVal = Math.max(0, 1 - Math.abs(lat - 26.3) / 0.8) * -900;

  // Base undulating topography noise
  const baseNoise =
    Math.sin(lon * 2.8 + lat * 1.5) * 350 +
    Math.cos(lat * 3.4 - lon * 1.2) * 220 +
    Math.sin(lon * 6.0 + lat * 5.0) * 120;

  const rawElev = 250 + northHimalaya + sikkimPeak + tawangRidge + meghalayaPlat + nagaRange + mizoFolding + assamVal + baseNoise;
  return Math.max(60, Math.min(4800, rawElev));
}

export default function ThreeDMap({
  selectedLocation,
  onLocationSelect,
  theme = 'dark',
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const reqAnimRef = useRef(null);
  const beaconMeshesRef = useRef([]);

  const [activeStation, setActiveStation] = useState(selectedLocation || riskLocations[0]);
  const [elevationScale, setElevationScale] = useState(1.8);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showWireframe, setShowWireframe] = useState(false);
  const [showRoads, setShowRoads] = useState(true);
  const [showHeatGlow, setShowHeatGlow] = useState(true);
  const [cameraPreset, setCameraPreset] = useState('iso'); // 'iso' | 'horizon' | 'top'

  // Update active station if prop changes
  useEffect(() => {
    if (selectedLocation) {
      setActiveStation(selectedLocation);
    }
  }, [selectedLocation]);

  // Init Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // 1. Scene & Background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme === 'dark' ? 0x05130b : 0x0b1c14);
    scene.fog = new THREE.FogExp2(theme === 'dark' ? 0x05130b : 0x0b1c14, 0.0018);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    camera.position.set(0, 160, 240);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.04; // Don't flip below terrain
    controls.minDistance = 30;
    controls.maxDistance = 550;
    controls.target.set(0, 15, 0);
    controlsRef.current = controls;

    // 5. Lighting: Ambient + Directional Sun with soft shadow
    const hemiLight = new THREE.HemisphereLight(0xdcfce7, 0x064e3b, 0.65);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    sunLight.position.set(140, 220, 120);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 700;
    const d = 160;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    // 6. Terrain Generation: 140x120 vertices
    const segX = 140;
    const segZ = 120;
    const geom = new THREE.PlaneGeometry(TERRAIN_WIDTH, TERRAIN_DEPTH, segX, segZ);
    geom.rotateX(-Math.PI / 2);

    const posAttr = geom.attributes.position;
    const colors = [];
    const color = new THREE.Color();

    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);

      // Map (x, z) to (lon, lat)
      const normLon = vx / TERRAIN_WIDTH + 0.5;
      const normLat = -(vz / TERRAIN_DEPTH) + 0.5;
      const lon = LON_MIN + normLon * (LON_MAX - LON_MIN);
      const lat = LAT_MIN + normLat * (LAT_MAX - LAT_MIN);

      const elevMeters = getRegionalElevation(lon, lat);
      // Normalized height in 3D world units
      const vy = (elevMeters / 4500) * 42 * elevationScale;
      posAttr.setY(i, vy);

      // Elevation-based realistic color ramping
      if (elevMeters > 3000) {
        // Snow and icy high ridges
        color.setHSL(0.55, 0.25, 0.92);
      } else if (elevMeters > 2000) {
        // Alpine rocky mountain ridges
        color.setRGB(0.55, 0.48, 0.38);
      } else if (elevMeters > 1100) {
        // High steep escarpments / Khasi-Naga plateau
        color.setRGB(0.18, 0.44, 0.28);
      } else if (elevMeters > 400) {
        // Pine forest slopes and foothills
        color.setRGB(0.09, 0.35, 0.20);
      } else {
        // Brahmaputra river basin & low valleys
        color.setRGB(0.04, 0.22, 0.13);
      }
      colors.push(color.r, color.g, color.b);
    }

    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.78,
      metalness: 0.08,
      flatShading: true,
    });

    const terrainMesh = new THREE.Mesh(geom, terrainMat);
    terrainMesh.receiveShadow = true;
    terrainMesh.name = 'terrainMesh';
    scene.add(terrainMesh);

    // Contours Wireframe Overlay
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const wireMesh = new THREE.Mesh(geom.clone(), wireframeMat);
    wireMesh.position.y += 0.15;
    wireMesh.name = 'wireMesh';
    wireMesh.visible = showWireframe;
    scene.add(wireMesh);

    // Bedrock Base pedestal
    const baseGeom = new THREE.BoxGeometry(TERRAIN_WIDTH + 6, 8, TERRAIN_DEPTH + 6);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x06180f, roughness: 0.9 });
    const baseMesh = new THREE.Mesh(baseGeom, baseMat);
    baseMesh.position.y = -4;
    scene.add(baseMesh);

    // 7. 3D Risk Station Pillars & Pulsing Beacons
    const beaconsGroup = new THREE.Group();
    beaconsGroup.name = 'beaconsGroup';
    const beaconMeshes = [];

    riskLocations.forEach((loc) => {
      const { x, z } = geoToWorld(loc.longitude, loc.latitude);
      const elev = loc.elevation || getRegionalElevation(loc.longitude, loc.latitude);
      const y = (elev / 4500) * 42 * elevationScale;

      // Color based on risk
      let riskHex = 0x10b981; // Low
      if (loc.riskLevel === 'Critical') riskHex = 0xef4444;
      else if (loc.riskLevel === 'High') riskHex = 0xf97316;
      else if (loc.riskLevel === 'Moderate') riskHex = 0xeab308;

      const stationGroup = new THREE.Group();
      stationGroup.position.set(x, y, z);
      stationGroup.userData = { location: loc };

      // Vertical Laser Beam Pillar
      const beamHeight = 16 + (loc.riskScore / 100) * 14;
      const beamGeom = new THREE.CylinderGeometry(0.35, 0.65, beamHeight, 8);
      const beamMat = new THREE.MeshBasicMaterial({
        color: riskHex,
        transparent: true,
        opacity: 0.75,
      });
      const beamMesh = new THREE.Mesh(beamGeom, beamMat);
      beamMesh.position.y = beamHeight / 2;
      stationGroup.add(beamMesh);

      // Glowing Sphere at Beacon Top
      const sphereGeom = new THREE.SphereGeometry(1.6, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: riskHex,
        emissive: riskHex,
        emissiveIntensity: 0.85,
        roughness: 0.2,
      });
      const sphereMesh = new THREE.Mesh(sphereGeom, sphereMat);
      sphereMesh.position.y = beamHeight;
      stationGroup.add(sphereMesh);

      // Pulsing Radar Ring
      const ringGeom = new THREE.RingGeometry(1.4, 2.2, 24);
      ringGeom.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: riskHex,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.position.y = beamHeight;
      stationGroup.add(ringMesh);

      beaconsGroup.add(stationGroup);
      beaconMeshes.push({ group: stationGroup, ring: ringMesh, beamHeight, initialY: beamHeight, loc });
    });

    scene.add(beaconsGroup);
    beaconMeshesRef.current = beaconMeshes;

    // 8. 3D Highway Corridors Layer
    const roadsGroup = new THREE.Group();
    roadsGroup.name = 'roadsGroup';

    roadsData.forEach((road) => {
      const points = [];
      road.coordinates.forEach(([lat, lon]) => {
        const { x, z } = geoToWorld(lon, lat);
        const elev = getRegionalElevation(lon, lat);
        const y = (elev / 4500) * 42 * elevationScale + 0.8;
        points.push(new THREE.Vector3(x, y, z));
      });

      if (points.length >= 2) {
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeom = new THREE.TubeGeometry(curve, points.length * 4, 0.75, 6, false);
        const roadColor = road.status === 'Blocked' ? 0xef4444 : road.status === 'Caution' ? 0xeab308 : 0x22c55e;

        const roadMat = new THREE.MeshBasicMaterial({
          color: roadColor,
          transparent: true,
          opacity: 0.9,
        });
        const tubeMesh = new THREE.Mesh(tubeGeom, roadMat);
        roadsGroup.add(tubeMesh);
      }
    });

    scene.add(roadsGroup);

    // 9. Interactive Raycaster for Picking Station in 3D
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(beaconsGroup.children, true);

      if (intersects.length > 0) {
        let curr = intersects[0].object;
        while (curr && !curr.userData?.location && curr.parent) {
          curr = curr.parent;
        }
        if (curr?.userData?.location) {
          const loc = curr.userData.location;
          setActiveStation(loc);
          if (onLocationSelect) onLocationSelect(loc);

          // Fly camera to focus on selected mountain station
          const targetPos = curr.position;
          controls.target.lerp(new THREE.Vector3(targetPos.x, targetPos.y + 6, targetPos.z), 0.7);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 10. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 11. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      reqAnimRef.current = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Pulsing radar rings on beacons
      beaconMeshes.forEach((item, idx) => {
        const pulse = 1 + 0.35 * Math.sin(elapsedTime * 3 + idx);
        item.ring.scale.set(pulse, pulse, pulse);
        item.ring.rotation.y = elapsedTime * 0.8;
      });

      // Subtle atmospheric cloud drift / lighting
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 0.8;
      controls.update();

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (reqAnimRef.current) cancelAnimationFrame(reqAnimRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.dispose();
      geom.dispose();
      terrainMat.dispose();
    };
  }, [elevationScale, theme, autoRotate]);

  // Handle Preset Camera Angles
  const applyCameraPreset = (preset) => {
    setCameraPreset(preset);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    if (preset === 'iso') {
      camera.position.set(0, 160, 240);
      controls.target.set(0, 15, 0);
    } else if (preset === 'horizon') {
      camera.position.set(0, 48, 260);
      controls.target.set(0, 24, 0);
    } else if (preset === 'top') {
      camera.position.set(0, 320, 1);
      controls.target.set(0, 0, 0);
    }
    controls.update();
  };

  // Fly to Active Station smoothly
  const focusOnStation = (loc) => {
    if (!loc) return;
    setActiveStation(loc);
    if (onLocationSelect) onLocationSelect(loc);

    const { x, z } = geoToWorld(loc.longitude, loc.latitude);
    const elev = loc.elevation || getRegionalElevation(loc.longitude, loc.latitude);
    const y = (elev / 4500) * 42 * elevationScale;

    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (camera && controls) {
      controls.target.set(x, y + 4, z);
      camera.position.set(x + 35, y + 40, z + 50);
      controls.update();
    }
  };

  // Toggle wireframe layer dynamically
  const toggleWireframe = () => {
    setShowWireframe((prev) => {
      const next = !prev;
      const wire = sceneRef.current?.getObjectByName('wireMesh');
      if (wire) wire.visible = next;
      return next;
    });
  };

  // Toggle roads layer dynamically
  const toggleRoads = () => {
    setShowRoads((prev) => {
      const next = !prev;
      const roads = sceneRef.current?.getObjectByName('roadsGroup');
      if (roads) roads.visible = next;
      return next;
    });
  };

  return (
    <div className="threed-map-wrapper">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="threed-canvas-container" tabIndex={0} />

      {/* Floating HUD Controls (Top Left) */}
      <div className="threed-hud-toolbar">
        {/* Preset Angle Selector */}
        <div className="threed-hud-group">
          <button
            className={`threed-hud-btn ${cameraPreset === 'iso' ? 'active' : ''}`}
            onClick={() => applyCameraPreset('iso')}
            title="45° Isometric Mountain View"
          >
            <Mountain size={13} />
            <span>3D Mountain View</span>
          </button>

          <button
            className={`threed-hud-btn ${cameraPreset === 'horizon' ? 'active' : ''}`}
            onClick={() => applyCameraPreset('horizon')}
            title="Low Horizon Ridge Silhouette"
          >
            <Eye size={13} />
            <span>Horizon</span>
          </button>

          <button
            className={`threed-hud-btn ${cameraPreset === 'top' ? 'active' : ''}`}
            onClick={() => applyCameraPreset('top')}
            title="Plan Top-Down View"
          >
            <Compass size={13} />
            <span>Top-Down</span>
          </button>
        </div>

        {/* Feature Toggles */}
        <div className="threed-hud-group">
          <button
            className={`threed-hud-btn ${autoRotate ? 'active' : ''}`}
            onClick={() => setAutoRotate(!autoRotate)}
            title="Auto-Orbit Cinematic View"
          >
            {autoRotate ? <Pause size={13} /> : <Play size={13} />}
            <span>{autoRotate ? 'Stop Orbit' : 'Cinematic Tour'}</span>
          </button>

          <button
            className={`threed-hud-btn ${showRoads ? 'active' : ''}`}
            onClick={toggleRoads}
            title="Toggle 3D Highway Corridors"
          >
            <TrendingUp size={13} />
            <span>3D Highways</span>
          </button>

          <button
            className={`threed-hud-btn ${showWireframe ? 'active' : ''}`}
            onClick={toggleWireframe}
            title="Toggle Topographic Elevation Contours"
          >
            <Layers size={13} />
            <span>Contours</span>
          </button>

          {/* Elevation Exaggeration Toggle */}
          <button
            className="threed-hud-btn"
            onClick={() => setElevationScale((prev) => (prev === 1.2 ? 1.8 : prev === 1.8 ? 2.4 : 1.2))}
            title="Toggle Elevation Relief Exaggeration"
          >
            <Sparkles size={13} />
            <span>Relief: {elevationScale}x</span>
          </button>
        </div>
      </div>

      {/* Floating 3D Risk Station Card (Top Right) */}
      {activeStation && (
        <div className="threed-station-card">
          <div className="threed-station-header">
            <div>
              <div className="threed-station-name">{activeStation.locationName}</div>
              <div className="threed-station-sub">
                {activeStation.district ? `${activeStation.district}, ` : ''}{activeStation.state}
              </div>
            </div>
            <span
              className="threed-station-badge"
              style={{
                background:
                  activeStation.riskLevel === 'Critical'
                    ? 'rgba(239, 68, 68, 0.2)'
                    : activeStation.riskLevel === 'High'
                    ? 'rgba(249, 115, 22, 0.2)'
                    : activeStation.riskLevel === 'Moderate'
                    ? 'rgba(234, 179, 8, 0.2)'
                    : 'rgba(16, 185, 129, 0.2)',
                color:
                  activeStation.riskLevel === 'Critical'
                    ? '#f87171'
                    : activeStation.riskLevel === 'High'
                    ? '#fb923c'
                    : activeStation.riskLevel === 'Moderate'
                    ? '#facc15'
                    : '#34d399',
                border: `1px solid ${
                  activeStation.riskLevel === 'Critical'
                    ? '#ef4444'
                    : activeStation.riskLevel === 'High'
                    ? '#f97316'
                    : activeStation.riskLevel === 'Moderate'
                    ? '#eab308'
                    : '#10b981'
                }`,
              }}
            >
              {activeStation.riskLevel} · {activeStation.riskScore}
            </span>
          </div>

          <div className="threed-station-stats">
            <div className="threed-stat-box">
              <div className="threed-stat-lbl">Elevation</div>
              <div className="threed-stat-val">{activeStation.elevation || 1200} m</div>
            </div>
            <div className="threed-stat-box">
              <div className="threed-stat-lbl">Slope Incline</div>
              <div className="threed-stat-val">{activeStation.slope || 28}°</div>
            </div>
            <div className="threed-stat-box">
              <div className="threed-stat-lbl">24h Rainfall</div>
              <div className="threed-stat-val">{activeStation.rainfall24h || 45} mm</div>
            </div>
            <div className="threed-stat-box">
              <div className="threed-stat-lbl">Coordinates</div>
              <div className="threed-stat-val" style={{ fontSize: '0.75rem' }}>
                {activeStation.latitude.toFixed(2)}°N, {activeStation.longitude.toFixed(2)}°E
              </div>
            </div>
          </div>

          <button
            className="threed-select-btn"
            onClick={() => focusOnStation(activeStation)}
          >
            <Radio size={14} />
            <span>Focus 3D Mountain Camera</span>
          </button>
        </div>
      )}

      {/* Floating 3D Legend (Bottom Left) */}
      <div className="threed-legend">
        <div className="threed-legend-title">
          <Box size={14} />
          <span>3D Landslide Risk Pillars</span>
        </div>
        <div className="threed-legend-row">
          <span className="threed-legend-pip" style={{ background: '#ef4444', color: '#ef4444' }} />
          <span>Critical Risk Beacons (76–100)</span>
        </div>
        <div className="threed-legend-row">
          <span className="threed-legend-pip" style={{ background: '#f97316', color: '#f97316' }} />
          <span>High Risk Beacons (51–75)</span>
        </div>
        <div className="threed-legend-row">
          <span className="threed-legend-pip" style={{ background: '#eab308', color: '#eab308' }} />
          <span>Moderate Risk (26–50)</span>
        </div>
        <div className="threed-legend-row">
          <span className="threed-legend-pip" style={{ background: '#10b981', color: '#10b981' }} />
          <span>Low Risk (0–25)</span>
        </div>
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.7rem' }}>
          💡 Click any station pillar or drag with mouse to orbit & tilt in 3D.
        </div>
      </div>

      {/* Camera Reset & Zoom Buttons (Bottom Right) */}
      <div className="threed-camera-controls">
        <button
          className="threed-cam-btn"
          onClick={() => applyCameraPreset('iso')}
          title="Reset 3D View"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}
