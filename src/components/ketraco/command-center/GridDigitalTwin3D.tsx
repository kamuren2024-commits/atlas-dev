import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Maximize2, RotateCcw, Eye, ShieldAlert, Zap, 
  Flame, CheckCircle2, Sliders, Info, Layers, Wrench,
  Activity, AlertTriangle, Compass, Thermometer, Cpu, Gauge
} from 'lucide-react';
import { GridAsset, DigitalTwinEquipmentMode, SelectedEquipmentContext } from './types';

interface GridDigitalTwin3DProps {
  selectedAsset: GridAsset;
  onClose?: () => void;
}

interface EquipmentData {
  id: string;
  name: string;
  type: 'TRANSFORMER' | 'BREAKER' | 'DISCONNECTOR' | 'BUSBAR' | 'ARRESTER' | 'VALVE_HALL' | 'RELAY_PANEL';
  voltageKV: number;
  healthScore: number;
  riskScore: number;
  tempC: number;
  status: 'OPTIMAL' | 'NORMAL' | 'WARNING' | 'CRITICAL';
  telemetry: Record<string, string | number>;
  details: string;
}

export default function GridDigitalTwin3D({ selectedAsset, onClose }: GridDigitalTwin3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [twinMode, setTwinMode] = useState<DigitalTwinEquipmentMode>('NORMAL');
  const [coronaEffect, setCoronaEffect] = useState(true);
  const [cameraPreset, setCameraPreset] = useState<'ISOMETRIC' | 'TRANSFORMER_BAY' | 'BREAKER_BAY' | 'HVDC_VALVE' | 'OVERHEAD'>('ISOMETRIC');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentData | null>(null);

  // Equipment List for the Substation Switchyard Twin
  const equipmentInventory: EquipmentData[] = [
    {
      id: 'tx-01',
      name: 'Auto-Transformer T1 (330 MVA 400/220/33kV)',
      type: 'TRANSFORMER',
      voltageKV: 400,
      healthScore: 92,
      riskScore: 18,
      tempC: Number(selectedAsset.telemetry.transformerOilTempC?.value || 68.5),
      status: 'NORMAL',
      telemetry: {
        'Top Oil Temp': `${selectedAsset.telemetry.transformerOilTempC?.value || 68.5} °C`,
        'Winding Temp': '74.2 °C',
        'Load Rating': '82.4%',
        'Dissolved H2': '14 ppm (Normal)',
        'Dissolved C2H2': '0.2 ppm (Healthy)',
        'Tap Position': '14 of 27 (+1.25%)',
        'Cooling Stage': 'ONAF Bank 1 Active'
      },
      details: 'Primary interbus tie transformer connecting 400kV Suswa backbone to 220kV regional transmission network.'
    },
    {
      id: 'tx-02',
      name: 'Auto-Transformer T2 (330 MVA 400/220/33kV)',
      type: 'TRANSFORMER',
      voltageKV: 400,
      healthScore: 96,
      riskScore: 12,
      tempC: 62.1,
      status: 'OPTIMAL',
      telemetry: {
        'Top Oil Temp': '62.1 °C',
        'Winding Temp': '66.8 °C',
        'Load Rating': '76.0%',
        'Dissolved H2': '9 ppm (Normal)',
        'Tap Position': '14 of 27',
        'Cooling Stage': 'ONAN (Natural Circulation)'
      },
      details: 'Secondary interbus tie transformer operating in parallel with N-1 capability.'
    },
    {
      id: 'cb-501',
      name: 'SF6 Live Tank Circuit Breaker CB-501',
      type: 'BREAKER',
      voltageKV: 400,
      healthScore: 89,
      riskScore: 22,
      tempC: 38.4,
      status: 'NORMAL',
      telemetry: {
        'SF6 Gas Pressure': `${selectedAsset.telemetry.sf6PressureBar?.value || 6.2} bar`,
        'Contact Wear Index': '14.2%',
        'Trip Count Total': '128 operations',
        'Mechanism Energy': 'Spring Charged (100%)',
        'Interrupting Cap': '50 kA / 3-cycle',
        'Status Position': 'CLOSED'
      },
      details: 'High-speed single-pole tripping SF6 interrupter protecting 400kV Isinya Corridor #1.'
    },
    {
      id: 'hvdc-valve',
      name: '500kV HVDC Converter Valve Stack (SOT-01)',
      type: 'VALVE_HALL',
      voltageKV: 500,
      healthScore: 94,
      riskScore: 15,
      tempC: 46.8,
      status: 'OPTIMAL',
      telemetry: {
        'DC Voltage': '±500.0 kV',
        'DC Current': '1,980 A',
        'Transfer Power': '990 MW (Import)',
        'Thyristor Temp': '46.8 °C',
        'De-ionized Water Flow': '48.2 L/s',
        'Firing Angle Alpha': '15.4°'
      },
      details: 'Line Commutated Converter (LCC) bidirectional valve stack linking Ethiopia-Kenya HVDC Interconnector.'
    },
    {
      id: 'bus-main-a',
      name: '400kV Main Busbar Section A',
      type: 'BUSBAR',
      voltageKV: 400,
      healthScore: 99,
      riskScore: 5,
      tempC: 34.2,
      status: 'OPTIMAL',
      telemetry: {
        'Phase A Voltage': '232.8 kV (L-N)',
        'Phase B Voltage': '232.5 kV (L-N)',
        'Phase C Voltage': '233.1 kV (L-N)',
        'Frequency': '50.01 Hz',
        'Total Current': '2,420 A',
        'Bus Differential': '0.02 A (Restrained)'
      },
      details: 'Quad-bundled ACSR Curlew conductor with 3,150A continuous thermal rating.'
    },
    {
      id: 'disc-401',
      name: 'Motorized Pantograph Disconnector DS-401',
      type: 'DISCONNECTOR',
      voltageKV: 400,
      healthScore: 88,
      riskScore: 24,
      tempC: 41.5,
      status: 'NORMAL',
      telemetry: {
        'Position': 'CLOSED / INTERLOCKED',
        'Motor Run Time': '12.4s (Nominal)',
        'Contact Resistance': '28 µΩ',
        'Earth Switch ES-401': 'OPEN / LOCKED'
      },
      details: 'Vertical break pantograph isolator providing galvanic air clearance for bay maintenance.'
    }
  ];

  // Set default selection
  useEffect(() => {
    if (!selectedEquipment) {
      setSelectedEquipment(equipmentInventory[0]);
    }
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 520;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(
      twinMode === 'THERMAL' ? 0x030712 :
      twinMode === 'ELECTRICAL' ? 0x020617 :
      twinMode === 'RISK' ? 0x09050d : 0x060c18
    );
    scene.fog = new THREE.FogExp2(
      twinMode === 'THERMAL' ? 0x030712 : 0x060c18, 
      0.012
    );

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    
    // Position camera based on preset
    if (cameraPreset === 'ISOMETRIC') {
      camera.position.set(38, 28, 42);
      camera.lookAt(0, 4, 0);
    } else if (cameraPreset === 'TRANSFORMER_BAY') {
      camera.position.set(-8, 12, 18);
      camera.lookAt(-10, 4, 0);
    } else if (cameraPreset === 'BREAKER_BAY') {
      camera.position.set(4, 10, 24);
      camera.lookAt(0, 3, 10);
    } else if (cameraPreset === 'HVDC_VALVE') {
      camera.position.set(28, 18, -10);
      camera.lookAt(22, 8, -10);
    } else if (cameraPreset === 'OVERHEAD') {
      camera.position.set(0, 55, 0.1);
      camera.lookAt(0, 0, 0);
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(
      twinMode === 'THERMAL' ? 0x1e1b4b :
      twinMode === 'ELECTRICAL' ? 0x082f49 : 0x1e293b, 
      twinMode === 'THERMAL' ? 1.2 : 2.0
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(
      twinMode === 'THERMAL' ? 0xec4899 :
      twinMode === 'ELECTRICAL' ? 0x06b6d4 : 0x38bdf8, 
      2.5
    );
    sunLight.position.set(30, 45, 25);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Ground Concrete Foundation
    const groundGeo = new THREE.BoxGeometry(64, 0.6, 52);
    const groundMat = new THREE.MeshStandardMaterial({
      color: twinMode === 'THERMAL' ? 0x0f172a : 0x0b1320,
      roughness: 0.85,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.3;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid Floor Overlay
    const gridColor = 
      twinMode === 'THERMAL' ? 0x4f46e5 :
      twinMode === 'ELECTRICAL' ? 0x00e1ff :
      twinMode === 'RISK' ? 0xf43f5e : 0x1e293b;
    const gridHelper = new THREE.GridHelper(80, 40, gridColor, 0x111c2d);
    gridHelper.position.y = 0.02;
    scene.add(gridHelper);

    // Material Library based on Mode
    const getEquipmentMat = (type: string, baseColor: number, thermalHotspot = false, riskHigh = false) => {
      if (twinMode === 'THERMAL') {
        const tColor = thermalHotspot ? 0xf43f5e : thermalHotspot === false ? 0x38bdf8 : 0xf59e0b;
        return new THREE.MeshStandardMaterial({
          color: tColor,
          emissive: tColor,
          emissiveIntensity: 0.35,
          roughness: 0.3,
          metalness: 0.2
        });
      }
      if (twinMode === 'RISK') {
        const rColor = riskHigh ? 0xe11d48 : 0x10b981;
        return new THREE.MeshStandardMaterial({
          color: rColor,
          emissive: rColor,
          emissiveIntensity: 0.25,
          roughness: 0.4
        });
      }
      if (twinMode === 'ELECTRICAL') {
        return new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          emissive: 0x0369a1,
          emissiveIntensity: 0.4,
          roughness: 0.2,
          metalness: 0.9
        });
      }
      if (twinMode === 'MAINTENANCE') {
        return new THREE.MeshStandardMaterial({
          color: 0x334155,
          roughness: 0.6,
          metalness: 0.5
        });
      }
      // NORMAL Mode
      return new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.35,
        metalness: 0.8
      });
    };

    // 1. Gantry Steel Lattice Structures
    const steelMat = getEquipmentMat('STEEL', 0x475569);
    const createGantry = (x: number, z: number, span = 14, height = 18) => {
      const group = new THREE.Group();
      // Legs
      const legGeo = new THREE.CylinderGeometry(0.2, 0.45, height, 6);
      const leg1 = new THREE.Mesh(legGeo, steelMat);
      leg1.position.set(-span / 2, height / 2, 0);
      group.add(leg1);

      const leg2 = new THREE.Mesh(legGeo, steelMat);
      leg2.position.set(span / 2, height / 2, 0);
      group.add(leg2);

      // Top Crossbeam
      const beamGeo = new THREE.BoxGeometry(span + 2, 0.7, 0.7);
      const beam = new THREE.Mesh(beamGeo, steelMat);
      beam.position.set(0, height - 0.5, 0);
      group.add(beam);

      // Suspended Insulator Strings
      const insMat = new THREE.MeshStandardMaterial({
        color: twinMode === 'ELECTRICAL' ? 0x38bdf8 : 0x93c5fd,
        emissive: twinMode === 'ELECTRICAL' ? 0x0284c7 : 0x000000,
        roughness: 0.1
      });
      for (let offset = -span / 2 + 3; offset <= span / 2 - 3; offset += (span - 6) / 3) {
        const insGeo = new THREE.CylinderGeometry(0.18, 0.18, 4.2, 8);
        const ins = new THREE.Mesh(insGeo, insMat);
        ins.position.set(offset, height - 3.2, 0);
        group.add(ins);
      }

      group.position.set(x, 0, z);
      scene.add(group);
    };

    // Construct Switchyard Gantries
    createGantry(-16, -14, 16, 18);
    createGantry(16, -14, 16, 18);
    createGantry(-16, 14, 16, 18);
    createGantry(16, 14, 16, 18);

    // 2. High Voltage Overhead Busbars
    const busMat = new THREE.MeshStandardMaterial({
      color: twinMode === 'ELECTRICAL' ? 0x38bdf8 : 0x00e1ff,
      emissive: twinMode === 'ELECTRICAL' ? 0x00d9ff : 0x005577,
      emissiveIntensity: twinMode === 'ELECTRICAL' ? 0.9 : 0.4,
      metalness: 0.95
    });

    for (let b = -4; b <= 4; b += 4) {
      const busGeo = new THREE.CylinderGeometry(0.1, 0.1, 46, 8);
      const bus = new THREE.Mesh(busGeo, busMat);
      bus.rotation.z = Math.PI / 2;
      bus.position.set(0, 16.5, -14 + b * 0.5);
      scene.add(bus);
    }

    // 3. Auto-Transformers (T1 and T2)
    const createTransformer = (x: number, z: number, isHotspot = false, isRisk = false) => {
      const group = new THREE.Group();
      const tankMat = getEquipmentMat('TANK', 0x1e293b, isHotspot, isRisk);

      // Main Tank Body
      const tankGeo = new THREE.BoxGeometry(5.2, 5.0, 6.8);
      const tank = new THREE.Mesh(tankGeo, tankMat);
      tank.position.y = 2.7;
      tank.castShadow = true;
      group.add(tank);

      // Cooling Radiator Fins (Left & Right)
      const radMat = getEquipmentMat('RADIATOR', 0x334155, isHotspot);
      const radGeo = new THREE.BoxGeometry(0.3, 3.8, 5.5);
      const rad1 = new THREE.Mesh(radGeo, radMat);
      rad1.position.set(-3.1, 2.5, 0);
      group.add(rad1);

      const rad2 = new THREE.Mesh(radGeo, radMat);
      rad2.position.set(3.1, 2.5, 0);
      group.add(rad2);

      // Oil Conservator Tank on top
      const consGeo = new THREE.CylinderGeometry(0.85, 0.85, 4.8, 14);
      const cons = new THREE.Mesh(consGeo, tankMat);
      cons.rotation.z = Math.PI / 2;
      cons.position.set(0, 6.0, 1.2);
      group.add(cons);

      // Buchholz Relay Pipe Connection
      const pipeGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.4, 8);
      const pipe = new THREE.Mesh(pipeGeo, steelMat);
      pipe.position.set(0, 5.5, 0.2);
      pipe.rotation.x = Math.PI / 4;
      group.add(pipe);

      // 400kV HV Bushings (Top front)
      const bushMat = new THREE.MeshStandardMaterial({
        color: twinMode === 'ELECTRICAL' ? 0x00e1ff : 0x93c5fd,
        emissive: twinMode === 'ELECTRICAL' ? 0x0088cc : 0x000000,
        roughness: 0.1
      });

      [-1.4, 0, 1.4].forEach((bX) => {
        const bushGeo = new THREE.CylinderGeometry(0.22, 0.35, 2.8, 8);
        const bush = new THREE.Mesh(bushGeo, bushMat);
        bush.position.set(bX, 6.2, -1.8);
        bush.rotation.x = -0.35;
        group.add(bush);

        // Corona Ring on top of bushing
        const ringGeo = new THREE.TorusGeometry(0.4, 0.05, 8, 16);
        const ring = new THREE.Mesh(ringGeo, busMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(bX, 7.5, -2.2);
        group.add(ring);
      });

      group.position.set(x, 0, z);
      scene.add(group);
      return group;
    };

    // Place Transformers
    createTransformer(-12, -2, twinMode === 'THERMAL', false);
    createTransformer(0, -2, false, false);

    // 4. 500kV HVDC Converter Valve Hall Building (East Wing)
    const valveGroup = new THREE.Group();
    const valveHallGeo = new THREE.BoxGeometry(14, 10, 18);
    const valveHallMat = new THREE.MeshStandardMaterial({
      color: twinMode === 'ELECTRICAL' ? 0x0369a1 : 0x0f1d32,
      roughness: 0.5,
      metalness: 0.7,
      transparent: true,
      opacity: 0.85
    });
    const valveHall = new THREE.Mesh(valveHallGeo, valveHallMat);
    valveHall.position.set(22, 5.2, -2);
    valveGroup.add(valveHall);

    // Wall HVDC Bushing Lead-throughs
    for (let d = -4; d <= 4; d += 8) {
      const hvdcBushGeo = new THREE.CylinderGeometry(0.4, 0.5, 5.5, 12);
      const hvdcBush = new THREE.Mesh(hvdcBushGeo, busMat);
      hvdcBush.rotation.z = Math.PI / 2;
      hvdcBush.position.set(14.5, 6.5, -2 + d);
      valveGroup.add(hvdcBush);
    }
    scene.add(valveGroup);

    // 5. 400kV SF6 Circuit Breakers
    const breakerGroup = new THREE.Group();
    [-14, -6, 2, 10].forEach((posX) => {
      const cbMat = getEquipmentMat('BREAKER', 0x334155, false, posX === -14 && twinMode === 'RISK');
      
      // 3 Poles (Phases A, B, C)
      [-1.0, 0, 1.0].forEach((pZ) => {
        const poleGeo = new THREE.CylinderGeometry(0.28, 0.28, 3.2, 10);
        const pole = new THREE.Mesh(poleGeo, cbMat);
        pole.position.set(posX, 2.2, 10 + pZ * 1.6);
        breakerGroup.add(pole);

        // Interrupter Double-Break Chamber Head
        const headGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.6, 8);
        const head = new THREE.Mesh(headGeo, cbMat);
        head.rotation.x = Math.PI / 2;
        head.position.set(posX, 4.0, 10 + pZ * 1.6);
        breakerGroup.add(head);
      });

      // Operating Mechanism Box
      const mechGeo = new THREE.BoxGeometry(1.6, 1.2, 3.8);
      const mech = new THREE.Mesh(mechGeo, steelMat);
      mech.position.set(posX, 0.6, 10);
      breakerGroup.add(mech);
    });
    scene.add(breakerGroup);

    // 6. Pantograph Disconnectors & Earthing Switches
    const discGroup = new THREE.Group();
    [-14, -6, 2, 10].forEach((posX) => {
      const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.5, 6);
      const arm1 = new THREE.Mesh(armGeo, busMat);
      arm1.rotation.z = Math.PI / 6;
      arm1.position.set(posX - 0.6, 6.8, 10);
      discGroup.add(arm1);

      const arm2 = new THREE.Mesh(armGeo, busMat);
      arm2.rotation.z = -Math.PI / 6;
      arm2.position.set(posX + 0.6, 6.8, 10);
      discGroup.add(arm2);
    });
    scene.add(discGroup);

    // 7. Electromagnetic / Corona Particles Flow
    let particles: THREE.Points | null = null;
    const particleCount = twinMode === 'ELECTRICAL' ? 450 : 180;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 44;
      posArray[i + 1] = 14 + Math.random() * 4;
      posArray[i + 2] = (Math.random() - 0.5) * 32;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: twinMode === 'ELECTRICAL' ? 0.35 : 0.22,
      color: 
        twinMode === 'THERMAL' ? 0xf43f5e :
        twinMode === 'ELECTRICAL' ? 0x00e1ff :
        twinMode === 'RISK' ? 0xf59e0b : 0x38bdf8,
      transparent: true,
      opacity: coronaEffect ? 0.85 : 0.0,
      blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(particlesGeo, particleMat);
    scene.add(particles);

    // Mouse Interaction for Custom Drag-Orbit and Zoom
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      scene.rotation.y += deltaX * 0.006;
      camera.position.y = Math.max(5, Math.min(60, camera.position.y + deltaY * 0.1));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.05;
      camera.position.z = Math.max(12, Math.min(80, camera.position.z + zoomFactor));
    };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    mount.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Slow ambient hover rotation when not user-dragging
      if (!isDragging) {
        scene.rotation.y += 0.0008;
      }

      // Animate Particles along power path
      if (particles) {
        const positions = particlesGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount * 3; i += 3) {
          positions[i] += Math.sin(time * 2 + i) * 0.06;
          if (positions[i] > 22) positions[i] = -22;
        }
        particlesGeo.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      mount.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(animationId);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [twinMode, coronaEffect, cameraPreset]);

  return (
    <div className="flex-1 flex flex-col bg-[#050b14] overflow-hidden relative select-none font-mono">
      
      {/* Top 3D Digital Twin Toolbar */}
      <div className="p-2.5 px-4 bg-[#0c1626]/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wider">
                {selectedAsset.name.toUpperCase()} SWITCHYARD DIGITAL TWIN
              </span>
              <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                LOD-4 PHYSICAL APPARATUS
              </span>
            </div>
            <span className="text-[9.5px] text-slate-400">
              Voltage: {selectedAsset.voltageLevelKV}kV | SCADA Tag: {selectedAsset.scadaId || 'SCADA_SUSWA_400'} | Health: {selectedAsset.healthScore}/100
            </span>
          </div>
        </div>

        {/* 5 Physics Visualization Modes Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          {(['NORMAL', 'THERMAL', 'ELECTRICAL', 'RISK', 'MAINTENANCE'] as DigitalTwinEquipmentMode[]).map(mode => {
            const isActive = twinMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setTwinMode(mode)}
                className={`px-2.5 py-1 rounded text-[9.5px] font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive 
                    ? mode === 'THERMAL' ? 'bg-rose-950 border border-rose-500 text-rose-300 shadow-sm'
                    : mode === 'ELECTRICAL' ? 'bg-cyan-950 border border-cyan-500 text-cyan-300 shadow-sm'
                    : mode === 'RISK' ? 'bg-amber-950 border border-amber-500 text-amber-300 shadow-sm'
                    : mode === 'MAINTENANCE' ? 'bg-purple-950 border border-purple-500 text-purple-300 shadow-sm'
                    : 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode === 'THERMAL' && <Thermometer className="w-3 h-3 text-rose-400" />}
                {mode === 'ELECTRICAL' && <Zap className="w-3 h-3 text-cyan-400" />}
                {mode === 'RISK' && <ShieldAlert className="w-3 h-3 text-amber-400" />}
                {mode === 'MAINTENANCE' && <Wrench className="w-3 h-3 text-purple-400" />}
                {mode === 'NORMAL' && <Layers className="w-3 h-3 text-slate-400" />}
                <span>{mode}</span>
              </button>
            );
          })}
        </div>

        {/* Camera Views Preset Dropdown */}
        <div className="flex items-center gap-1.5">
          {(['ISOMETRIC', 'TRANSFORMER_BAY', 'BREAKER_BAY', 'HVDC_VALVE', 'OVERHEAD'] as const).map(preset => (
            <button
              key={preset}
              onClick={() => setCameraPreset(preset)}
              className={`px-2 py-1 rounded text-[9px] font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                cameraPreset === preset
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {preset.replace(/_/g, ' ')}
            </button>
          ))}
          
          <button
            onClick={() => setCoronaEffect(!coronaEffect)}
            className={`p-1.5 rounded border transition-all cursor-pointer ml-1 ${
              coronaEffect ? 'bg-cyan-950 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title="Toggle Corona Ionization"
          >
            <Zap className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Stage & Interactive Equipment HUD */}
      <div className="flex-1 w-full h-full relative" ref={mountRef}>
        
        {/* Left Side: Equipment Inventory Inspector */}
        <div className="absolute top-3 left-3 z-10 w-72 bg-[#0c1626]/95 border border-slate-700/80 rounded-xl p-3 backdrop-blur-xl shadow-2xl space-y-2.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5" /> Apparatus Hierarchy
            </span>
            <span className="text-[9px] text-emerald-400 font-bold">SCADA SYNC</span>
          </div>

          {/* Equipment selector buttons */}
          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
            {equipmentInventory.map(item => {
              const isSel = selectedEquipment?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedEquipment(item)}
                  className={`w-full text-left p-1.5 px-2 rounded-lg border text-[9.5px] transition-all cursor-pointer flex items-center justify-between ${
                    isSel 
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate font-semibold">{item.name}</span>
                  <span className={`text-[8.5px] px-1 rounded ml-1 font-bold ${
                    item.status === 'OPTIMAL' ? 'bg-emerald-950 text-emerald-300' : 'bg-cyan-950 text-cyan-300'
                  }`}>
                    {item.healthScore}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Apparatus Live Telemetry & Engineering Specs */}
          {selectedEquipment && (
            <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[9px]">
              <div className="text-slate-200 font-bold text-[10px] truncate">
                {selectedEquipment.name}
              </div>
              <p className="text-slate-400 text-[8.5px] leading-relaxed">
                {selectedEquipment.details}
              </p>

              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {Object.entries(selectedEquipment.telemetry).map(([key, val]) => (
                  <div key={key} className="bg-slate-900/90 p-1 px-1.5 rounded border border-slate-800/80">
                    <span className="text-slate-400 block text-[8px] uppercase">{key}</span>
                    <strong className="text-cyan-300 font-bold">{val}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Mode Specific Information Card */}
        <div className="absolute top-3 right-3 z-10 w-64 bg-[#0c1626]/95 border border-slate-700/80 rounded-xl p-3 backdrop-blur-xl shadow-2xl space-y-2 text-[9.5px]">
          <div className="text-slate-300 font-bold uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              {twinMode} Diagnostic Field
            </span>
            <span className="text-cyan-400 text-[8.5px]">LIVE SCADA</span>
          </div>

          {twinMode === 'THERMAL' && (
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Peak Thermal Hotspot:</span>
                <strong className="text-rose-400">74.2 °C (T1 Winding)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ambient Temperature:</span>
                <strong className="text-slate-200">23.8 °C</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cooling Efficiency:</span>
                <strong className="text-emerald-400">96.4% Optimal</strong>
              </div>
              {/* Thermography Gradient scale */}
              <div className="pt-1.5">
                <div className="h-2 rounded w-full bg-gradient-to-r from-blue-600 via-amber-500 to-rose-600" />
                <div className="flex justify-between text-[7.5px] text-slate-400 pt-0.5">
                  <span>20°C</span>
                  <span>50°C</span>
                  <span>80°C</span>
                  <span>100°C+</span>
                </div>
              </div>
            </div>
          )}

          {twinMode === 'ELECTRICAL' && (
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Electric Field Max:</span>
                <strong className="text-cyan-300">3.8 kV/m (Under 400kV Bus)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Corona Ionization Loss:</span>
                <strong className="text-slate-200">0.82 kW/km</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Voltage Angle:</span>
                <strong className="text-emerald-400">-12.4° (Stable)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Harmonic Distortion (THD):</span>
                <strong className="text-emerald-400">1.18% (IEEE-519 Pass)</strong>
              </div>
            </div>
          )}

          {twinMode === 'RISK' && (
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Failure Probability:</span>
                <strong className="text-emerald-400">0.0034 / year</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">DGA Health Index:</span>
                <strong className="text-emerald-400">Score 94 (Condition A)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Trip Redundancy:</span>
                <strong className="text-cyan-300">Main-1 + Main-2 Optic</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SPOF Classification:</span>
                <strong className="text-slate-200">N-1 Fully Redundant</strong>
              </div>
            </div>
          )}

          {twinMode === 'MAINTENANCE' && (
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Next Scheduled Major CBM:</span>
                <strong className="text-purple-300">42 days (T1 Oil DGA)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SF6 Top-up Interval:</span>
                <strong className="text-slate-200">18 months remaining</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Breaker Spring Test:</span>
                <strong className="text-emerald-400">Passed (22 days ago)</strong>
              </div>
            </div>
          )}

          {twinMode === 'NORMAL' && (
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Active Power Flow:</span>
                <strong className="text-cyan-300">{selectedAsset.currentLoadMW} MW</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thermal Capacity:</span>
                <strong className="text-slate-200">{selectedAsset.ratedCapacityMVA} MVA</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Grid Availability:</span>
                <strong className="text-emerald-400">100.0% Online</strong>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Orbit Navigation Helper */}
        <div className="absolute bottom-3 left-3 z-10 text-[9px] text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-md flex items-center gap-3">
          <span>🖱️ Left Drag: Orbit</span>
          <span>•</span>
          <span>Scroll: Zoom In/Out</span>
          <span>•</span>
          <span>Hold View: Real-Time Animated Telemetry</span>
        </div>
      </div>
    </div>
  );
}
