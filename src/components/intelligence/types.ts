export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface CameraState {
  panX: number;
  panY: number;
  zoom: number;
  pitch: number; // 0 (2D) to 1.1 (Isometric Tactical)
  yaw: number;   // Orbit rotation angle

  targetPanX: number;
  targetPanY: number;
  targetZoom: number;
  targetPitch: number;
  targetYaw: number;
}

export interface NetworkNode3D {
  id: string;
  name: string;
  pos: Point3D;
  voltage: string;
  capacity: string;
  load: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  riskScore: number;
  healthScore: number;
  type: 'primary' | 'secondary' | 'micro';
  activityPulse: number; // oscillating factor 0..1
  phaseOffset: number;   // random offsets for distinct pulses
}

export interface Connection3D {
  fromId: string;
  toId: string;
  voltage: number; // 500, 400, 220, 132
  status: 'nominal' | 'warning' | 'overloaded' | 'offline';
  loadFactor: number; // 0..1
  pulseSpeed: number;
}

export interface Particle3D {
  progress: number; // 0..1 progress along connection path
  speed: number;
  size: number;
  color: string;
  connectionIdx: number;
}

export interface AmbientParticle {
  x: number;
  y: number;
  z: number;
  size: number;
  speedZ: number;
  opacity: number;
}
