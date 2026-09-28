import React, { useRef, useEffect, useState } from 'react';
import { 
  CameraState, NetworkNode3D, Connection3D, Point3D, AmbientParticle 
} from './types';
import { drawGridEnvironment, project3D } from './GridEnvironment';
import { drawNetworkNode } from './NetworkNode';
import { drawConnectionMesh } from './ConnectionMesh';
import { 
  Compass, Eye, Play, Sparkles, Navigation2, RefreshCw, Layers 
} from 'lucide-react';

interface TopologyLayerProps {
  selectedNodeId: string;
  setSelectedNodeId: (id: string) => void;
  selectedTime: 'live' | '24h' | '7d' | '30d' | 'forecast' | 'simulation';
  activeLayer: 'grid' | 'projects' | 'procurement' | 'contracts' | 'suppliers';
  onAskCopilot: (prompt: string) => void;
}

export default function TopologyLayer({
  selectedNodeId,
  setSelectedNodeId,
  selectedTime,
  activeLayer,
  onAskCopilot
}: TopologyLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // --- 1. CORE TELEMETRY DATABASES (3D COORDINATION) ---
  const initialNodes: NetworkNode3D[] = [
    {
      id: 'lessos',
      name: 'Lessos Substation',
      pos: { x: -300, y: -190, z: 20 },
      voltage: '220kV / 132kV',
      capacity: '500 MVA',
      load: '290 MW',
      status: 'healthy',
      riskScore: 24,
      healthScore: 92,
      type: 'secondary',
      activityPulse: 0,
      phaseOffset: 0
    },
    {
      id: 'olkaria',
      name: 'Olkaria Geothermal',
      pos: { x: -180, y: -30, z: 45 },
      voltage: '400kV / 220kV Generation',
      capacity: '1200 MVA',
      load: '890 MW',
      status: 'healthy',
      riskScore: 12,
      healthScore: 97,
      type: 'primary',
      activityPulse: 0,
      phaseOffset: 1.2
    },
    {
      id: 'suswa',
      name: 'Suswa Substation',
      pos: { x: -20, y: 30, z: 70 }, // Centered power dispatcher elevated high
      voltage: '500kV / 400kV Dual Trunk',
      capacity: '1000 MVA',
      load: '740 MW',
      status: 'warning', // default warning, turns critical in simulation
      riskScore: 45,
      healthScore: 94,
      type: 'primary',
      activityPulse: 0,
      phaseOffset: 2.3
    },
    {
      id: 'nairobi_ring',
      name: 'Nairobi Ring Hub',
      pos: { x: 140, y: -110, z: 50 },
      voltage: '400kV / 220kV Distribution',
      capacity: '1500 MVA',
      load: '1120 MW',
      status: 'healthy',
      riskScore: 52,
      healthScore: 88,
      type: 'primary',
      activityPulse: 0,
      phaseOffset: 3.5
    },
    {
      id: 'isinya',
      name: 'Isinya Substation',
      pos: { x: 260, y: 110, z: 30 },
      voltage: '500kV / 400kV Interconnect',
      capacity: '800 MVA',
      load: '480 MW',
      status: 'healthy',
      riskScore: 15,
      healthScore: 95,
      type: 'secondary',
      activityPulse: 0,
      phaseOffset: 4.8
    },
    {
      id: 'rabai',
      name: 'Rabai Substation',
      pos: { x: 480, y: 250, z: 15 }, // Coastal Hub further East
      voltage: '400kV / 220kV Coastal Hub',
      capacity: '600 MVA',
      load: '510 MW',
      status: 'critical',
      riskScore: 78,
      healthScore: 64,
      type: 'secondary',
      activityPulse: 0,
      phaseOffset: 5.9
    }
  ];

  const initialConnections: Connection3D[] = [
    { fromId: 'lessos', toId: 'olkaria', voltage: 220, status: 'nominal', loadFactor: 0.58, pulseSpeed: 0.012 },
    { fromId: 'olkaria', toId: 'suswa', voltage: 400, status: 'nominal', loadFactor: 0.74, pulseSpeed: 0.018 },
    { fromId: 'suswa', toId: 'nairobi_ring', voltage: 400, status: 'nominal', loadFactor: 0.75, pulseSpeed: 0.02 },
    { fromId: 'suswa', toId: 'isinya', voltage: 500, status: 'nominal', loadFactor: 0.48, pulseSpeed: 0.01 },
    { fromId: 'isinya', toId: 'nairobi_ring', voltage: 220, status: 'nominal', loadFactor: 0.6, pulseSpeed: 0.014 },
    { fromId: 'isinya', toId: 'rabai', voltage: 400, status: 'nominal', loadFactor: 0.85, pulseSpeed: 0.025 }
  ];

  // --- 2. INTERACTIVE CAMERA PERSPECTIVE STATES ---
  const [camera, setCamera] = useState<CameraState>({
    panX: -20, // Pan coordinates
    panY: 30,
    zoom: 1.1, // Zoom
    pitch: 0.75, // Tilted perspective (0 for 2D, ~0.65 for tactical 3D)
    yaw: -0.3, // Orbit spin angle

    targetPanX: -20,
    targetPanY: 30,
    targetZoom: 1.1,
    targetPitch: 0.75,
    targetYaw: -0.3
  });

  const [dimension, setDimension] = useState({ width: 800, height: 480 });
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');

  // Interactive UI panel hover states
  const [hoveredOverlay, setHoveredOverlay] = useState<string | null>(null);

  // --- 3. RUNTIME ASSETS AND ANIMATION POOLS ---
  const particlesRef = useRef<{ progress: number; connectionIdx: number; speed: number }[]>([]);
  const ambientRef = useRef<AmbientParticle[]>([]);
  const frameIdRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Mouse event holding triggers
  const mouseState = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    clickTarget: null as string | null,
    dragged: false
  });

  // Load baseline simulation flow particles
  useEffect(() => {
    // Generate streaming electrons traveling down trunk roads
    const pArr = [];
    for (let cIdx = 0; cIdx < initialConnections.length; cIdx++) {
      const conn = initialConnections[cIdx];
      const count = conn.voltage === 500 ? 5 : conn.voltage === 400 ? 4 : 3;
      for (let i = 0; i < count; i++) {
        pArr.push({
          progress: i / count + Math.random() * 0.1,
          connectionIdx: cIdx,
          speed: conn.pulseSpeed * (0.85 + Math.random() * 0.3)
        });
      }
    }
    particlesRef.current = pArr;

    // Generate drift dust particles
    const dots: AmbientParticle[] = [];
    for (let i = 0; i < 45; i++) {
      dots.push({
        x: (Math.random() - 0.5) * 1200,
        y: (Math.random() - 0.5) * 1000,
        z: Math.random() * 180,
        size: Math.random() * 1.5 + 0.5,
        speedZ: Math.random() * 0.15 + 0.05,
        opacity: Math.random() * 0.35 + 0.1
      });
    }
    ambientRef.current = dots;
  }, []);

  // Update canvas bounds on resize
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimension({
          width: Math.max(400, width),
          height: Math.max(300, height)
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Camera tracking focus triggers (Auto Center node zooms)
  useEffect(() => {
    const matchedNode = initialNodes.find(n => n.id === selectedNodeId);
    if (matchedNode) {
      setCamera(prev => ({
        ...prev,
        targetPanX: matchedNode.pos.x,
        targetPanY: matchedNode.pos.y,
        // Zoom-in tightly to highlight inspection details
        targetZoom: 1.35
      }));
    }
  }, [selectedNodeId]);

  // Adjust camera profiles for TACTICAL 3D vs top-down ORTHO 2D
  const toggleViewMode = () => {
    if (viewMode === '3D') {
      setViewMode('2D');
      setCamera(prev => ({
        ...prev,
        targetPitch: 0.001, // Completely flat
        targetYaw: 0,
        targetZoom: 0.95
      }));
    } else {
      setViewMode('3D');
      setCamera(prev => ({
        ...prev,
        targetPitch: 0.75, // tilted isometric elevation layout
        targetYaw: -0.3,
        targetZoom: 1.1
      }));
    }
  };

  // Reset Camera to complete baseline
  const resetCamera = () => {
    setViewMode('3D');
    setCamera({
      panX: -20,
      panY: 30,
      zoom: 1.1,
      pitch: 0.75,
      yaw: -0.3,

      targetPanX: -20,
      targetPanY: 30,
      targetZoom: 1.1,
      targetPitch: 0.75,
      targetYaw: -0.3
    });
  };

  // --- 4. EXQUISITE CANVAS RENDERER PIPELINE (60 FPS) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Local copy of nodes dynamically adjusted for simulation alerts
    const activeNodes = initialNodes.map(node => {
      const copy = { ...node };
      
      // Override values based on Time State parameters
      if (selectedTime === 'forecast') {
        const mt = 1.15;
        copy.load = `${Math.round(parseInt(node.load) * mt)} MW`;
        copy.riskScore = Math.min(100, Math.round(node.riskScore * 1.2));
      } else if (selectedTime === 'simulation') {
        const mt = 1.35;
        copy.load = `${Math.round(parseInt(node.load) * mt)} MW`;
        
        ctx.save();
        if (node.id === 'suswa' || node.id === 'nairobi_ring' || node.id === 'rabai') {
          copy.status = 'critical';
          copy.riskScore = Math.min(100, Math.round(node.riskScore * 1.8));
          copy.healthScore = Math.max(10, Math.round(node.healthScore * 0.7));
        }
        ctx.restore();
      }
      return copy;
    });

    const activeConns = initialConnections.map(conn => {
      const copy = { ...conn };
      if (selectedTime === 'simulation' && (conn.fromId === 'suswa' || conn.toId === 'nairobi_ring')) {
        copy.status = 'overloaded';
        copy.pulseSpeed = conn.pulseSpeed * 2.8; // Electrons speed up dramatically
      }
      return copy;
    });

    const render = () => {
      timeRef.current += 1 / 60;
      const tSec = timeRef.current;

      // 4A. SMOOTH INTERPOLATIVE LERP (INERTIA CAMERA)
      const lerpSpeed = 0.08;
      setCamera(prev => {
        const panX = prev.panX + (prev.targetPanX - prev.panX) * lerpSpeed;
        const panY = prev.panY + (prev.targetPanY - prev.panY) * lerpSpeed;
        const zoom = prev.zoom + (prev.targetZoom - prev.zoom) * lerpSpeed;
        const pitch = prev.pitch + (prev.targetPitch - prev.pitch) * lerpSpeed;
        const yaw = prev.yaw + (prev.targetYaw - prev.yaw) * lerpSpeed;

        return {
          ...prev,
          panX, panY, zoom, pitch, yaw
        };
      });

      // Scale multiplier support
      const currentCamera: CameraState = {
        ...camera,
        targetPanX: camera.targetPanX, targetPanY: camera.targetPanY,
        targetZoom: camera.targetZoom, targetPitch: camera.targetPitch,
        targetYaw: camera.targetYaw
      };

      // Draw baseline digital space grid
      drawGridEnvironment({ ctx, camera: currentCamera, width: dimension.width, height: dimension.height });

      // 4B. AMBIENT DRIFT PARTICLES (Fog of War ambient lighting)
      ctx.save();
      ambientRef.current.forEach(dot => {
        dot.z += dot.speedZ;
        if (dot.z > 200) {
          dot.z = 0;
          dot.x = (Math.random() - 0.5) * 1200;
          dot.y = (Math.random() - 0.5) * 1050;
        }

        const devPt = { x: dot.x, y: dot.y, z: dot.z };
        const pr = project3D(devPt, currentCamera, dimension.width, dimension.height);
        if (pr.visible) {
          ctx.fillStyle = `rgba(56, 189, 248, ${dot.opacity * pr.scale})`;
          ctx.beginPath();
          ctx.arc(pr.x, pr.y, dot.size * pr.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();

      // 4C. DRAW TRANSMISSION LINK MESHES
      particlesRef.current.forEach(p => {
        const conn = activeConns[p.connectionIdx];
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;
      });

      activeConns.forEach((conn, index) => {
        const fromNode = activeNodes.find(n => n.id === conn.fromId);
        const toNode = activeNodes.find(n => n.id === conn.toId);
        if (fromNode && toNode) {
          const matchingParticles = particlesRef.current
            .filter(p => p.connectionIdx === index)
            .map(p => p.progress);

          drawConnectionMesh({
            ctx,
            camera: currentCamera,
            width: dimension.width,
            height: dimension.height,
            connection: conn,
            fromNodePos: fromNode.pos,
            toNodePos: toNode.pos,
            particles: matchingParticles
          });
        }
      });

      // 4D. CORE SUBSTATION NETWORK GRAPHICS
      activeNodes.forEach(node => {
        drawNetworkNode({
          ctx,
          camera: currentCamera,
          width: dimension.width,
          height: dimension.height,
          node,
          isSelected: selectedNodeId === node.id,
          timeSec: tSec
        });
      });

      // --- 4E. ACTIVE SCM LAYER OVERLAY INJECTS ---

      // I. Suppliers Maritime Convoy Path
      if (activeLayer === 'suppliers') {
        ctx.save();
        // Ocean shipping path coordinates from Mombasa port Rabai further East
        const shipPathPoints: Point3D[] = [
          { x: 480, y: 250, z: 15 }, // Rabai Substation Mombasa
          { x: 550, y: 280, z: 0 },
          { x: 620, y: 320, z: 0 },
          { x: 740, y: 390, z: 0 }  // Indian Ocean entrance
        ];

        // Draw dotted vector marine channel
        ctx.strokeStyle = '#0891b2';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        let firstPos = true;
        shipPathPoints.forEach(p => {
          const pr = project3D(p, currentCamera, dimension.width, dimension.height);
          if (pr.visible) {
            if (firstPos) { ctx.moveTo(pr.x, pr.y); firstPos = false; }
            else ctx.lineTo(pr.x, pr.y);
          }
        });
        ctx.stroke();

        // Animate Container Ship along shipping lanes (oscillates nicely)
        const shipProg = (tSec * 0.05) % 1;
        const ptIdx = Math.floor(shipProg * (shipPathPoints.length - 1));
        const subT = (shipProg * (shipPathPoints.length - 1)) % 1;
        
        const p1 = shipPathPoints[ptIdx];
        const p2 = shipPathPoints[ptIdx + 1];
        if (p1 && p2) {
          const shipCoord = {
            x: p1.x + (p2.x - p1.x) * subT,
            y: p1.y + (p2.y - p1.y) * subT,
            z: 0
          };
          const prShip = project3D(shipCoord, currentCamera, dimension.width, dimension.height);
          if (prShip.visible) {
            // Draw flashing vessel radar coordinate
            ctx.fillStyle = '#22d3ee';
            ctx.shadowColor = '#22d3ee';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(prShip.x, prShip.y, 6 * prShip.scale, 0, Math.PI * 2);
            ctx.fill();

            // Shipping telemetry tag
            ctx.fillStyle = '#22d3ee';
            ctx.font = 'bold 8px "JetBrains Mono", monospace';
            ctx.shadowBlur = 0;
            ctx.textAlign = 'left';
            ctx.fillText('🚢 Cargo Vessel (Shanghai → Mombasa)', prShip.x + 10, prShip.y + 3);

            // Container box drawing overlay if hovered
            const mouseX = mouseState.current.startX;
            const mouseY = mouseState.current.startY;
            const dx = mouseX - prShip.x;
            const dy = mouseY - prShip.y;
            if (Math.sqrt(dx * dx + dy * dy) < 25) {
              setHoveredOverlay('cargo_ship');
            }
          }
        }
        ctx.restore();
      }

      // II. Procurement Tender Markers
      if (activeLayer === 'procurement') {
        ctx.save();
        // Draw auxiliary floating bidding targets
        const tenders = [
          { pos: { x: -20, y: 80, z: 30 }, name: 'SCM-SPEC-2026-A Transformers', value: 'KES 480M' },
          { pos: { x: 140, y: -50, z: 20 }, name: 'INS-COMP-8 Core Insulators', value: 'KES 120M' }
        ];

        tenders.forEach(t => {
          const pr = project3D(t.pos, currentCamera, dimension.width, dimension.height);
          if (pr.visible) {
            // Yellow pulse halo
            ctx.fillStyle = 'rgba(234, 179, 8, 0.15)';
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(pr.x, pr.y, 10 * pr.scale + Math.sin(tSec * 4) * 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Floating target text
            ctx.fillStyle = '#fef08a';
            ctx.font = 'bold 8px "JetBrains Mono", monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`📄 TENDER: ${t.name} (${t.value})`, pr.x + 12, pr.y + 3);
          }
        });
        ctx.restore();
      }

      // III. Project Expansions
      if (activeLayer === 'projects') {
        ctx.save();
        // Add animated blueprint grids wrapping construction zones in Suswa
        const suswaNode = activeNodes.find(n => n.id === 'suswa');
        if (suswaNode) {
          const pr = project3D(suswaNode.pos, currentCamera, dimension.width, dimension.height);
          if (pr.visible) {
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 5]);
            ctx.beginPath();
            ctx.arc(pr.x, pr.y, 24 * pr.scale, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#a5b4fc';
            ctx.font = 'bold 7px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('⚡ ACTIVE EXPANSION: TR-041 CAPACITOR', pr.x, pr.y - 42 * pr.scale);
          }
        }
        ctx.restore();
      }

      // IV. Active Contracts
      if (activeLayer === 'contracts') {
        ctx.save();
        const contracts = [
          { pos: { x: -100, y: 0, z: 25 }, label: 'Siemens SLA 98%' },
          { pos: { x: 300, y: 150, z: 20 }, label: 'Elsewedy Penalty Bounds' }
        ];

        contracts.forEach(c => {
          const pr = project3D(c.pos, currentCamera, dimension.width, dimension.height);
          if (pr.visible) {
            ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
            ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
            ctx.beginPath();
            ctx.rect(pr.x - 15, pr.y - 15, 30, 30);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#86efac';
            ctx.font = '7px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`✍️ ${c.label}`, pr.x, pr.y - 18);
          }
        });
        ctx.restore();
      }

      frameIdRef.current = requestAnimationFrame(render);
    };

    frameIdRef.current = requestAnimationFrame(render);
    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
    };
  }, [camera, selectedNodeId, selectedTime, activeLayer, dimension]);

  // --- 5. MOUSE INTERACTIVE SHORTCUTS ---
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseState.current = {
      isDragging: true,
      startX: x,
      startY: y,
      clickTarget: null,
      dragged: false
    };

    // Calculate if we clicked on any substation node
    // To do this, we project current positions and check circle distances
    let clickedId: string | null = null;
    initialNodes.forEach(node => {
      const proj = project3D(node.pos, camera, dimension.width, dimension.height);
      if (proj.visible) {
        const dx = x - proj.x;
        const dy = y - proj.y;
        const radius = (node.type === 'primary' ? 14 : 10) * proj.scale;
        if (Math.sqrt(dx * dx + dy * dy) < radius + 15) {
          clickedId = node.id;
        }
      }
    });

    mouseState.current.clickTarget = clickedId;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!mouseState.current.isDragging) {
      // Just record positions for hovers
      mouseState.current.startX = x;
      mouseState.current.startY = y;
      return;
    }

    const dx = x - mouseState.current.startX;
    const dy = y - mouseState.current.startY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      mouseState.current.dragged = true;
    }

    // A. ORBIT ROTATION (Dragging with standard left click drag rotates camera view)
    if (!mouseState.current.clickTarget) {
      // Shift key or right drag can pan, standard drag rotates/yaw orbits
      if (e.shiftKey || e.button === 1) {
        // Pan
        const speed = 0.8 / camera.zoom;
        setCamera(prev => ({
          ...prev,
          targetPanX: prev.targetPanX - dx * speed,
          targetPanY: prev.targetPanY - dy * speed
        }));
      } else {
        // Rotates pitch and yaw angles
        setCamera(prev => {
          let nextPitch = prev.targetPitch + dy * 0.003;
          // Constrain pitch to avoid camera going completely overhead or underground
          nextPitch = Math.max(0.001, Math.min(1.15, nextPitch));
          const nextYaw = prev.targetYaw - dx * 0.005;

          return {
            ...prev,
            targetPitch: nextPitch,
            targetYaw: nextYaw
          };
        });
      }
    }

    mouseState.current.startX = x;
    mouseState.current.startY = y;
  };

  const handleMouseUp = () => {
    mouseState.current.isDragging = false;
    
    // Treat as click only if we didn't drag much
    if (!mouseState.current.dragged && mouseState.current.clickTarget) {
      setSelectedNodeId(mouseState.current.clickTarget);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    // Zoom centering
    const zoomFactor = e.deltaY > 0 ? -0.1 : 0.1;
    setCamera(prev => {
      const nextZoom = Math.max(0.5, Math.min(3.0, prev.targetZoom + zoomFactor));
      return {
        ...prev,
        targetZoom: nextZoom
      };
    });
  };

  return (
    <div 
      className="flex-1 w-full h-full relative flex flex-col items-stretch overflow-hidden select-none"
      ref={containerRef}
      id="3d-topology-container"
    >
      {/* 1. TACTICAL OVERLAY WIDGET HEADERS - PALANTIR-FOUNDRY STYLE */}
      <div className="absolute bottom-16 left-4 z-20 pointer-events-auto bg-slate-950/85 hover:bg-slate-950 border border-slate-800/80 backdrop-blur-md p-3.5 rounded-xl max-w-xs space-y-2.5 transition-all text-xs leading-relaxed text-slate-300">
        <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
          <span className="font-mono text-[9px] font-bold text-cyan-400 tracking-wider flex items-center gap-1">
            <Compass className="w-3 h-3 text-cyan-400 rotate-45" /> TACTICAL GRAPH OPERATING SYSTEM
          </span>
          <span className="text-[7.5px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300">INTERACTIVE</span>
        </div>
        <p className="font-sans text-[10px] leading-relaxed text-slate-400">
          Hold <kbd className="bg-slate-900 px-1 border border-slate-700 rounded text-[9px]">Shift+Drag</kbd> to pan the canvas floor. Drag background to orbit and change pitch elevation angle. Rotate wheel to zoom.
        </p>

        {hoveredOverlay === 'cargo_ship' && activeLayer === 'suppliers' && (
          <div className="p-2 bg-indigo-950/40 rounded-lg border border-cyan-500/20 text-[9px] font-mono text-cyan-300 animate-fade-in">
            <strong>MOMBASA PORT PIPELINE DELAY RISK:</strong>
            <p className="text-slate-400 mt-1 leading-normal">Mombasa custom is withholding auxiliary line insulators and steel guy wire packages. Impact: Suswa hub.</p>
            <button
              onClick={() => onAskCopilot("Audit ocean shipping container delays for primary insulator packages current custom checks at Mombasa port terminal.")}
              className="mt-1.5 text-cyan-200 hover:underline font-bold"
            >
              Ask AI Audit &rarr;
            </button>
          </div>
        )}
      </div>

      {/* 2. HUD CAMERA PRESET VIEW CONTROLLERS */}
      <div className="absolute top-16 left-4 z-20 flex gap-2 items-center pointer-events-auto">
        <button
          onClick={toggleViewMode}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded-xl text-[9.5px] font-mono text-slate-300 font-bold transition-all shadow-lg cursor-pointer"
          title="Shifts pitch camera angles"
        >
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
          VIEW: {viewMode} MODE
        </button>
        <button
          onClick={resetCamera}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded-xl text-[9.5px] font-mono text-slate-300 font-bold transition-all shadow-lg cursor-pointer"
          title="Aligns camera and focal parameters back to center"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          RESET VIEW
        </button>
      </div>

      {/* 3. CORE GEOGRAPHIC GRAPH CANVAS ENGINE */}
      <canvas
        ref={canvasRef}
        width={dimension.width}
        height={dimension.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="flex-1 w-full h-full bg-[#020512] cursor-grab active:cursor-grabbing block transition-opacity duration-300 relative z-10"
      />
    </div>
  );
}
