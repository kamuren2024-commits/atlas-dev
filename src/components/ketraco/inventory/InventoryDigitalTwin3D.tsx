import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import useSWR from 'swr';
import { AlertTriangle, Focus, LoaderCircle, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { fetchTwinReferenceCatalog, type TwinReferenceAsset } from './api';

type SceneStatus = 'loading' | 'ready' | 'unavailable';

type SceneContext = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  markerRoot: THREE.Group;
  frameId: number;
};

const TYPE_COLORS: Record<string, number> = {
  POWER_TRANSFORMER: 0xf59e0b,
  TRANSFORMER: 0xf59e0b,
  CIRCUIT_BREAKER: 0x38bdf8,
  BREAKER: 0x38bdf8,
  SUBSTATION: 0xa78bfa,
  TRANSMISSION_LINE: 0x22d3ee,
  LINE: 0x22d3ee,
};

function material(color: number, options: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.68, metalness: 0.28, ...options });
}

function addBox(scene: THREE.Scene, position: THREE.Vector3, size: [number, number, number], mat: THREE.Material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat);
  mesh.position.copy(position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function addBeam(scene: THREE.Scene, start: THREE.Vector3, end: THREE.Vector3, radius: number, mat: THREE.Material) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), 8), mat);
  beam.position.copy(start).add(end).multiplyScalar(0.5);
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  beam.castShadow = true;
  scene.add(beam);
  return beam;
}

function addGantry(scene: THREE.Scene, x: number, z: number, steel: THREE.Material, ceramic: THREE.Material) {
  const height = 13;
  const width = 13;
  const left = new THREE.Vector3(x - width / 2, 0, z);
  const right = new THREE.Vector3(x + width / 2, 0, z);
  addBeam(scene, left, left.clone().setY(height), 0.2, steel);
  addBeam(scene, right, right.clone().setY(height), 0.2, steel);
  addBeam(scene, new THREE.Vector3(x - width / 2 - 0.8, height, z), new THREE.Vector3(x + width / 2 + 0.8, height, z), 0.28, steel);
  addBeam(scene, new THREE.Vector3(x - width / 2, 4, z), new THREE.Vector3(x + width / 2, height - 1, z), 0.1, steel);
  addBeam(scene, new THREE.Vector3(x + width / 2, 4, z), new THREE.Vector3(x - width / 2, height - 1, z), 0.1, steel);
  for (let index = 0; index < 4; index += 1) {
    const insulatorX = x - 4.2 + index * 2.8;
    addBeam(scene, new THREE.Vector3(insulatorX, height - 0.15, z), new THREE.Vector3(insulatorX, height - 2.8, z), 0.13, ceramic);
  }
}

function buildYard(scene: THREE.Scene) {
  const ground = material(0x0a1422, { roughness: 0.92, metalness: 0.08 });
  const concrete = material(0x18283a, { roughness: 0.88 });
  const steel = material(0x526779, { roughness: 0.44, metalness: 0.82 });
  const ceramic = material(0x9bb8c8, { roughness: 0.34, metalness: 0.18 });
  const copper = material(0x29c9db, { color: 0x29c9db, emissive: 0x075a6b, emissiveIntensity: 0.38, metalness: 0.84, roughness: 0.28 });
  const transformer = material(0x586a78, { roughness: 0.48, metalness: 0.7 });
  const glass = material(0x12334a, { roughness: 0.28, metalness: 0.42, emissive: 0x082337, emissiveIntensity: 0.34 });

  addBox(scene, new THREE.Vector3(0, -0.5, 0), [68, 0.8, 48], ground);
  const grid = new THREE.GridHelper(68, 34, 0x1b6774, 0x173148);
  grid.position.y = 0.02;
  const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
  for (const gridMaterial of gridMaterials) {
    gridMaterial.transparent = true;
    gridMaterial.opacity = 0.24;
  }
  scene.add(grid);

  addBox(scene, new THREE.Vector3(0, 0.02, -23), [68, 0.12, 0.22], steel);
  addBox(scene, new THREE.Vector3(0, 0.02, 23), [68, 0.12, 0.22], steel);
  addBox(scene, new THREE.Vector3(-33.8, 0.02, 0), [0.22, 0.12, 46], steel);
  addBox(scene, new THREE.Vector3(33.8, 0.02, 0), [0.22, 0.12, 46], steel);
  for (let x = -32; x <= 32; x += 4) {
    addBeam(scene, new THREE.Vector3(x, 0, -23), new THREE.Vector3(x, 1.8, -23), 0.08, steel);
    addBeam(scene, new THREE.Vector3(x, 0, 23), new THREE.Vector3(x, 1.8, 23), 0.08, steel);
  }
  for (let z = -20; z <= 20; z += 4) {
    addBeam(scene, new THREE.Vector3(-34, 0, z), new THREE.Vector3(-34, 1.8, z), 0.08, steel);
    addBeam(scene, new THREE.Vector3(34, 0, z), new THREE.Vector3(34, 1.8, z), 0.08, steel);
  }

  addGantry(scene, -21, -12, steel, ceramic);
  addGantry(scene, 0, -12, steel, ceramic);
  addGantry(scene, 21, -12, steel, ceramic);
  addGantry(scene, -21, 12, steel, ceramic);
  addGantry(scene, 0, 12, steel, ceramic);
  addGantry(scene, 21, 12, steel, ceramic);

  for (const z of [-12, 0, 12]) {
    addBeam(scene, new THREE.Vector3(-28, 11.5, z), new THREE.Vector3(28, 11.5, z), 0.16, copper);
    addBeam(scene, new THREE.Vector3(-28, 10.8, z + 1.2), new THREE.Vector3(28, 10.8, z + 1.2), 0.1, copper);
  }

  for (const [x, z] of [[-12, -2], [5, 4], [18, -1]] as const) {
    addBox(scene, new THREE.Vector3(x, 2.1, z), [5.4, 3.8, 4.6], transformer);
    addBox(scene, new THREE.Vector3(x, 4.2, z), [4.2, 0.45, 3.4], concrete);
    for (let side = -1; side <= 1; side += 2) {
      for (let fin = 0; fin < 5; fin += 1) {
        addBox(scene, new THREE.Vector3(x + side * 3.2, 2.1, z - 1.5 + fin * 0.75), [0.7, 3, 0.28], steel);
      }
    }
    for (let bushing = -1; bushing <= 1; bushing += 1) {
      addBeam(scene, new THREE.Vector3(x + bushing * 1.45, 4.2, z - 0.7), new THREE.Vector3(x + bushing * 1.45, 7.8, z - 0.7), 0.22, ceramic);
      addBeam(scene, new THREE.Vector3(x + bushing * 1.45, 7.8, z - 0.7), new THREE.Vector3(x + bushing * 1.45, 9.8, z - 0.7), 0.12, copper);
    }
  }

  for (const [x, z] of [[-22, 1], [-2, 1], [13, 1], [25, 1]] as const) {
    addBeam(scene, new THREE.Vector3(x, 0.3, z), new THREE.Vector3(x, 4.8, z), 0.15, steel);
    addBeam(scene, new THREE.Vector3(x - 1, 2.8, z), new THREE.Vector3(x + 1, 2.8, z), 0.12, ceramic);
    addBeam(scene, new THREE.Vector3(x - 0.8, 3.5, z), new THREE.Vector3(x + 0.8, 3.5, z), 0.12, ceramic);
  }

  addBox(scene, new THREE.Vector3(-26, 2.1, 16), [9, 4.2, 7], concrete);
  addBox(scene, new THREE.Vector3(-26, 4.35, 16), [9.8, 0.35, 7.7], steel);
  for (let index = 0; index < 4; index += 1) {
    addBox(scene, new THREE.Vector3(-29 + index * 2, 2.1, 12.42), [1.2, 1.15, 0.12], glass);
  }
  addBox(scene, new THREE.Vector3(-26, 0.04, 16), [13, 0.1, 11], concrete);

  for (const x of [-30, 30]) {
    const footA = new THREE.Vector3(x - 3, 0, -18);
    const footB = new THREE.Vector3(x + 3, 0, -18);
    const topA = new THREE.Vector3(x - 0.7, 15, -18);
    const topB = new THREE.Vector3(x + 0.7, 15, -18);
    addBeam(scene, footA, topB, 0.12, steel);
    addBeam(scene, footB, topA, 0.12, steel);
    addBeam(scene, topA, topB, 0.15, steel);
    addBeam(scene, new THREE.Vector3(x - 4, 11, -18), new THREE.Vector3(x + 4, 11, -18), 0.16, steel);
    addBeam(scene, new THREE.Vector3(x - 3, 6, -18), new THREE.Vector3(x + 3, 6, -18), 0.13, steel);
    for (let level = 0; level < 3; level += 1) {
      const y = 6 + level * 2.4;
      addBeam(scene, new THREE.Vector3(x - 2.2, y, -18), new THREE.Vector3(x - 2.2, y - 1.1, -18), 0.1, ceramic);
      addBeam(scene, new THREE.Vector3(x + 2.2, y, -18), new THREE.Vector3(x + 2.2, y - 1.1, -18), 0.1, ceramic);
    }
  }

  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x28d6e9, transparent: true, opacity: 0.55 });
  for (const startX of [-30, 30]) {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(startX, 15, -18),
      new THREE.Vector3(startX * 0.72, 13.5, -16),
      new THREE.Vector3(startX * 0.3, 12.2, -12),
      new THREE.Vector3(0, 11.5, -12),
    ]);
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(path.getPoints(32)), lineMaterial));
  }
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    for (const item of materials) {
      const mappedMaterial = item as THREE.Material & { map?: THREE.Texture | null };
      mappedMaterial.map?.dispose();
      item.dispose();
    }
  });
}

function markerPosition(asset: TwinReferenceAsset, index: number): THREE.Vector3 {
  const type = asset.asset_type.toUpperCase();
  const lane = index % 8;
  const row = Math.floor(index / 8) % 5;
  if (type.includes('SUBSTATION')) return new THREE.Vector3(0, 15.8, 18 - row * 2.2);
  if (type.includes('TRANSFORMER')) return new THREE.Vector3(-13 + (lane % 4) * 8, 8.8, -2 + row * 2.2);
  if (type.includes('BREAKER') || type.includes('DISCONNECTOR')) return new THREE.Vector3(-22 + lane * 6.2, 5.2, -7 + row * 2.4);
  if (type.includes('LINE') || type.includes('BUS')) return new THREE.Vector3(-25 + lane * 7, 12.7, -12 + row * 6);
  return new THREE.Vector3(-24 + lane * 6.8, 4.2 + row * 0.4, 7 + row * 2.8);
}

function labelSprite(label: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.fillStyle = 'rgba(4, 12, 24, 0.92)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = 'rgba(34, 211, 238, 0.8)';
  context.lineWidth = 3;
  context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
  context.fillStyle = '#dffaff';
  context.font = '600 30px Geist, sans-serif';
  context.fillText(label.slice(0, 28), 18, 58);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  sprite.scale.set(7, 1.3, 1);
  sprite.position.set(0, 1.5, 0);
  return sprite;
}

function typeColor(type: string): number {
  const normalized = type.toUpperCase();
  return TYPE_COLORS[normalized] || (normalized.includes('TRANSFORMER') ? 0xf59e0b : normalized.includes('BREAKER') ? 0x38bdf8 : 0x22d3ee);
}

export default function InventoryDigitalTwin3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneContext | null>(null);
  const markerPositionsRef = useRef(new Map<string, THREE.Vector3>());
  const selectAssetRef = useRef<(assetId: string) => void>(() => undefined);
  const [sceneStatus, setSceneStatus] = useState<SceneStatus>('loading');
  const [sceneError, setSceneError] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { data: catalog, error: catalogError, isLoading: catalogLoading, mutate: reloadCatalog } = useSWR(
    'inventory-twin-reference-catalog',
    () => fetchTwinReferenceCatalog(),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  const assets = catalog?.assets || [];
  const typeOptions = useMemo(() => [...new Set(assets.map((asset) => asset.asset_type).filter(Boolean))].sort(), [assets]);
  const statusOptions = useMemo(() => [...new Set(assets.map((asset) => asset.operational_status).filter((value): value is string => Boolean(value)))].sort(), [assets]);
  const filteredAssets = useMemo(() => assets.filter((asset) => {
    if (typeFilter !== 'ALL' && asset.asset_type !== typeFilter) return false;
    if (statusFilter !== 'ALL' && (asset.operational_status || 'NOT_RECORDED') !== statusFilter) return false;
    return true;
  }), [assets, typeFilter, statusFilter]);
  const selectedAsset = assets.find((asset) => asset.asset_id === selectedAssetId) || null;

  useEffect(() => {
    if (selectedAssetId && !filteredAssets.some((asset) => asset.asset_id === selectedAssetId)) setSelectedAssetId(null);
  }, [filteredAssets, selectedAssetId]);

  const focusAsset = useCallback((assetId: string) => {
    const context = sceneRef.current;
    const position = markerPositionsRef.current.get(assetId);
    if (!context || !position) return;
    context.controls.target.copy(position);
    context.camera.position.copy(position).add(new THREE.Vector3(13, 8, 16));
    context.controls.update();
    setSelectedAssetId(assetId);
  }, []);

  selectAssetRef.current = focusAsset;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let context: SceneContext | null = null;
    let observer: ResizeObserver | null = null;
    let clickStart: { x: number; y: number } | null = null;

    try {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x07111d);
      scene.fog = new THREE.Fog(0x07111d, 62, 112);

      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 180);
      camera.position.set(42, 29, 44);
      camera.lookAt(0, 4.5, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = false;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.className = 'block h-full w-full touch-none';
      renderer.domElement.setAttribute('aria-label', 'Interactive schematic substation scene. Drag to orbit, right-drag to pan, and scroll to zoom.');
      mount.replaceChildren(renderer.domElement);

      scene.add(new THREE.HemisphereLight(0xb7d9ed, 0x09121f, 1.75));
      const keyLight = new THREE.DirectionalLight(0xb8e9ff, 2.2);
      keyLight.position.set(-24, 38, 18);
      scene.add(keyLight);
      const rimLight = new THREE.PointLight(0x18b6ce, 18, 72, 2);
      rimLight.position.set(18, 17, -4);
      scene.add(rimLight);
      buildYard(scene);

      const markerRoot = new THREE.Group();
      markerRoot.name = 'reference-asset-markers';
      scene.add(markerRoot);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 4.5, 0);
      controls.enableDamping = true;
      controls.dampingFactor = 0.075;
      controls.minDistance = 18;
      controls.maxDistance = 92;
      controls.maxPolarAngle = Math.PI * 0.48;
      controls.screenSpacePanning = true;

      let frameId = 0;
      const animate = () => {
        frameId = window.requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      const resize = () => {
        if (!mount.clientWidth || !mount.clientHeight) return;
        camera.aspect = mount.clientWidth / mount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mount.clientWidth, mount.clientHeight);
      };
      observer = new ResizeObserver(resize);
      observer.observe(mount);

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      const onPointerDown = (event: PointerEvent) => { clickStart = { x: event.clientX, y: event.clientY }; };
      const onPointerUp = (event: PointerEvent) => {
        if (!clickStart || Math.hypot(event.clientX - clickStart.x, event.clientY - clickStart.y) > 5) {
          clickStart = null;
          return;
        }
        clickStart = null;
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(markerRoot.children, true)[0];
        if (!hit) return;
        let target: THREE.Object3D | null = hit.object;
        while (target && typeof target.userData.assetId !== 'string') target = target.parent;
        if (target?.userData.assetId) selectAssetRef.current(String(target.userData.assetId));
      };
      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      renderer.domElement.addEventListener('pointerup', onPointerUp);

      context = { scene, camera, renderer, controls, markerRoot, frameId };
      sceneRef.current = context;
      setSceneStatus('ready');
      setSceneError('');

      return () => {
        observer?.disconnect();
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        renderer.domElement.removeEventListener('pointerup', onPointerUp);
        window.cancelAnimationFrame(frameId);
        controls.dispose();
        disposeObject(scene);
        renderer.dispose();
        renderer.domElement.remove();
        sceneRef.current = null;
        markerPositionsRef.current.clear();
      };
    } catch {
      if (context) {
        window.cancelAnimationFrame(context.frameId);
        context.controls.dispose();
        disposeObject(context.scene);
        context.renderer.dispose();
      }
      setSceneStatus('unavailable');
      setSceneError('WebGL could not initialize in this browser. The reference asset list remains available below.');
      return () => {
        observer?.disconnect();
        sceneRef.current = null;
      };
    }
  }, []);

  useEffect(() => {
    const context = sceneRef.current;
    if (!context) return;
    for (const child of [...context.markerRoot.children]) disposeObject(child);
    context.markerRoot.clear();
    markerPositionsRef.current.clear();

    const markerAssets = filteredAssets.slice(0, 120);
    markerAssets.forEach((asset, index) => {
      const position = markerPosition(asset, index);
      markerPositionsRef.current.set(asset.asset_id, position);
      const color = typeColor(asset.asset_type);
      const marker = new THREE.Group();
      marker.position.copy(position);
      marker.userData.assetId = asset.asset_id;

      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(asset.asset_id === selectedAssetId ? 0.78 : 0.56, 16, 12),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 }),
      );
      dot.userData.assetId = asset.asset_id;
      marker.add(dot);

      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(asset.asset_id === selectedAssetId ? 1.12 : 0.84, 0.075, 6, 24),
        new THREE.MeshBasicMaterial({ color: asset.asset_id === selectedAssetId ? 0xffffff : color, transparent: true, opacity: 0.86 }),
      );
      halo.rotation.x = Math.PI / 2;
      halo.userData.assetId = asset.asset_id;
      marker.add(halo);

      if (asset.asset_id === selectedAssetId) {
        const label = labelSprite(asset.name);
        if (label) marker.add(label);
      }
      context.markerRoot.add(marker);
    });
  }, [filteredAssets, selectedAssetId]);

  const resetCamera = () => {
    const context = sceneRef.current;
    if (!context) return;
    context.controls.target.set(0, 4.5, 0);
    context.camera.position.set(42, 29, 44);
    context.controls.update();
  };

  const zoomCamera = (direction: -1 | 1) => {
    const context = sceneRef.current;
    if (!context) return;
    const offset = context.camera.position.clone().sub(context.controls.target);
    const distance = THREE.MathUtils.clamp(offset.length() + direction * 8, 18, 92);
    context.camera.position.copy(context.controls.target).add(offset.normalize().multiplyScalar(distance));
    context.controls.update();
  };

  const selectedCatalogStatus = selectedAsset?.operational_status?.trim() || 'Not recorded';
  const visibleAssets = filteredAssets.slice(0, 8);

  return (
    <section className="overflow-hidden rounded-2xl border border-cyan-500/20 bg-[#07101d] shadow-[0_18px_60px_rgba(0,0,0,0.28)]" aria-label="Inventory digital twin">
      <div className="flex flex-wrap items-center gap-3 border-b border-cyan-500/15 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-cyan-400">Atlas twin reference catalog</p>
          <h2 className="text-sm font-semibold text-white">Substation yard · illustrative layout</h2>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-amber-400/25 bg-amber-400/5 px-2 py-1 text-[9px] font-mono text-amber-200">REFERENCE DATA · NOT LIVE</span>
          <span className="text-[10px] font-mono text-slate-400">{catalogLoading ? 'CATALOG LOADING' : catalogError ? 'CATALOG UNAVAILABLE' : `${assets.length} catalog records`}</span>
          <button type="button" onClick={() => void reloadCatalog()} className="rounded-md border border-slate-700 px-2 py-1 text-[10px] font-mono text-slate-300 hover:border-cyan-400/60 hover:text-white" aria-label="Refresh reference asset catalog">REFRESH</button>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 px-3 py-2">
            <label className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              Equipment type
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] text-slate-200" aria-label="Filter twin assets by equipment type">
                <option value="ALL">All types</option>
                {typeOptions.map((type) => <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              Catalog state
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] text-slate-200" aria-label="Filter twin assets by reference catalog state">
                <option value="ALL">All states</option>
                {statusOptions.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
                {!statusOptions.length && <option value="NOT_RECORDED">Not recorded</option>}
              </select>
            </label>
            <span className="ml-auto text-[9px] font-mono text-slate-500">{filteredAssets.length} reference markers</span>
          </div>

          {sceneStatus === 'loading' && (
            <div className="flex items-center justify-center gap-2 bg-[#07101d] text-xs font-mono text-cyan-200" style={{ height: 'clamp(18rem, 38vw, 30rem)' }} role="status">
              <LoaderCircle className="size-4 animate-spin" /> Building interactive scene…
            </div>
          )}
          {sceneStatus === 'ready' && <div ref={mountRef} className="w-full bg-[#07101d]" style={{ height: 'clamp(18rem, 38vw, 30rem)' }} />}
          {sceneStatus === 'unavailable' && (
            <div className="flex flex-col items-center justify-center gap-3 bg-[#07101d] px-6 text-center" style={{ height: 'clamp(18rem, 38vw, 30rem)' }} role="status">
              <AlertTriangle className="size-5 text-amber-300" />
              <p className="max-w-md text-xs text-slate-300">{sceneError}</p>
              <p className="text-[10px] font-mono text-slate-500">No live position, health, or telemetry is inferred from the schematic.</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-800/80 px-3 py-2">
            <span className="mr-1 text-[9px] font-mono text-slate-500">DRAG ORBIT · RIGHT DRAG PAN · WHEEL ZOOM</span>
            <button type="button" onClick={() => zoomCamera(-1)} disabled={sceneStatus !== 'ready'} className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-[10px] text-slate-300 hover:border-cyan-400/50 disabled:opacity-40" aria-label="Zoom out"><ZoomOut className="size-3" /> Zoom out</button>
            <button type="button" onClick={() => zoomCamera(1)} disabled={sceneStatus !== 'ready'} className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-[10px] text-slate-300 hover:border-cyan-400/50 disabled:opacity-40" aria-label="Zoom in"><ZoomIn className="size-3" /> Zoom in</button>
            <button type="button" onClick={resetCamera} disabled={sceneStatus !== 'ready'} className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-[10px] text-slate-300 hover:border-cyan-400/50 disabled:opacity-40"><RotateCcw className="size-3" /> Reset camera</button>
          </div>
          <p className="px-3 pb-3 text-[9px] font-mono leading-relaxed text-slate-500">Yard geometry and marker placement are illustrative, not surveyed coordinates or live topology. The catalog endpoint identifies reference assets only; equipment health and SCADA telemetry are not connected here.</p>
        </div>

        <aside className="flex min-h-0 flex-col border-t border-slate-800/80 xl:border-l xl:border-t-0" aria-label="Reference asset details">
          <div className="border-b border-slate-800/80 px-3 py-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-200">Asset catalog</h3>
            <p className="mt-1 text-[9px] font-mono text-slate-500">Select a marker or list item to focus the scene.</p>
          </div>
          {catalogLoading && <p className="flex items-center gap-2 px-3 py-4 text-[10px] font-mono text-cyan-200"><LoaderCircle className="size-3 animate-spin" /> Loading reference assets</p>}
          {catalogError && <p className="px-3 py-4 text-[10px] text-amber-200">Reference asset catalog unavailable. The schematic remains illustrative.</p>}
          {!catalogLoading && !catalogError && assets.length === 0 && <p className="px-3 py-4 text-[10px] text-slate-400">No reference assets are available.</p>}
          {visibleAssets.length > 0 && (
            <ul className="max-h-48 divide-y divide-slate-800/70 overflow-y-auto xl:max-h-56">
              {visibleAssets.map((asset) => (
                <li key={asset.asset_id}>
                  <button type="button" onClick={() => focusAsset(asset.asset_id)} aria-pressed={selectedAssetId === asset.asset_id}
                    className={`flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-cyan-500/5 ${selectedAssetId === asset.asset_id ? 'bg-cyan-500/10' : ''}`}>
                    <span className="mt-1 size-2 shrink-0 rounded-full" style={{ backgroundColor: `#${typeColor(asset.asset_type).toString(16).padStart(6, '0')}` }} />
                    <span className="min-w-0"><span className="block truncate text-[10px] font-medium text-slate-200">{asset.name}</span><span className="block truncate font-mono text-[9px] text-slate-500">{asset.asset_id} · {asset.asset_type.replaceAll('_', ' ')}</span></span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {filteredAssets.length > visibleAssets.length && <p className="px-3 py-1 text-[9px] font-mono text-slate-500">Showing first {visibleAssets.length} of {filteredAssets.length} filtered records.</p>}
          {selectedAsset && (
            <div className="mt-auto border-t border-cyan-500/15 bg-[#091523] p-3" aria-live="polite">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0"><p className="truncate text-[11px] font-semibold text-white">{selectedAsset.name}</p><p className="mt-0.5 break-all font-mono text-[9px] text-cyan-300">{selectedAsset.asset_id}</p></div>
                <button type="button" onClick={() => focusAsset(selectedAsset.asset_id)} className="rounded-md border border-cyan-500/30 p-1.5 text-cyan-200 hover:bg-cyan-500/10" aria-label="Focus camera on selected asset"><Focus className="size-3" /></button>
              </div>
              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[9px]">
                <dt className="text-slate-500">Equipment</dt><dd className="text-right text-slate-300">{selectedAsset.asset_type.replaceAll('_', ' ')}</dd>
                <dt className="text-slate-500">Voltage class</dt><dd className="text-right text-slate-300">{selectedAsset.voltage_level || 'Not recorded'}</dd>
                <dt className="text-slate-500">Reference state</dt><dd className="text-right text-amber-200">{selectedCatalogStatus}</dd>
                {selectedAsset.substation_id && <><dt className="text-slate-500">Substation link</dt><dd className="truncate text-right text-slate-300">{selectedAsset.substation_id}</dd></>}
              </dl>
              <p className="mt-2 border-t border-slate-800 pt-2 text-[9px] leading-relaxed text-slate-500">Reference catalog only; this is not current operating state. No verified material or work-order relationship is available for this record.</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
