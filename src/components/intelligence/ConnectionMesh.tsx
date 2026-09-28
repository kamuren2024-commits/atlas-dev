import React from 'react';
import { CameraState, Point3D, Connection3D } from './types';
import { project3D } from './GridEnvironment';

// Quadratic Bezier interpolation in 3D space
export function getBezierPoint3D(p1: Point3D, ctrl: Point3D, p2: Point3D, t: number): Point3D {
  const mt = 1 - t;
  return {
    x: mt * mt * p1.x + 2 * mt * t * ctrl.x + t * t * p2.x,
    y: mt * mt * p1.y + 2 * mt * t * ctrl.y + t * t * p2.y,
    z: mt * mt * p1.z + 2 * mt * t * ctrl.z + t * t * p2.z
  };
}

interface MeshProps {
  ctx: CanvasRenderingContext2D;
  camera: CameraState;
  width: number;
  height: number;
  connection: Connection3D;
  fromNodePos: Point3D;
  toNodePos: Point3D;
  particles: number[]; // progress coordinates of particles on this connection
}

export function drawConnectionMesh({
  ctx,
  camera,
  width,
  height,
  connection,
  fromNodePos,
  toNodePos,
  particles
}: MeshProps) {
  // 1. CALCULATE 3D CONTROL POINT FOR ARCHED CATENARY EFFECT
  // We place the control point halfway between endpoints and arch it upwards along Z-axis
  const midX = (fromNodePos.x + toNodePos.x) / 2;
  const midY = (fromNodePos.y + toNodePos.y) / 2;
  const maxZ = Math.max(fromNodePos.z, toNodePos.z);
  
  // Arch height depends slightly on line length relative to ground floor
  const dx = fromNodePos.x - toNodePos.x;
  const dy = fromNodePos.y - toNodePos.y;
  const lineDistance = Math.sqrt(dx * dx + dy * dy);
  const archZ = maxZ + Math.min(100, lineDistance * 0.15); // Sag/arch value

  const ctrlPoint: Point3D = { x: midX, y: midY, z: archZ };

  // 2. CONFIG COLORATION AND WEIGHTS BY VOLTAGE CLASS
  let strokeColor = 'rgba(6, 182, 212, 0.2)'; // 220kV default soft cyan
  let strokeFlowColor = '#06b6d4';
  let isOverloaded = connection.status === 'overloaded';

  if (connection.voltage === 500) {
    strokeColor = 'rgba(234, 179, 8, 0.25)'; // Golden
    strokeFlowColor = '#eab308';
  } else if (connection.voltage === 400) {
    if (isOverloaded) {
      strokeColor = 'rgba(239, 68, 68, 0.3)'; // Red alert
      strokeFlowColor = '#ef4444';
    } else {
      strokeColor = 'rgba(37, 99, 235, 0.28)'; // Electric blue
      strokeFlowColor = '#2563eb';
    }
  } else if (connection.voltage === 132) {
    strokeColor = 'rgba(100, 116, 139, 0.15)'; // Slate gray lines
    strokeFlowColor = '#64748b';
  }

  // 3. DRAW CURVED PATH SEGMENTS IN 3D PERSPECTIVE
  const numSegments = 24;
  ctx.save();
  ctx.beginPath();
  
  let first = true;
  for (let i = 0; i <= numSegments; i++) {
    const t = i / numSegments;
    const pt = getBezierPoint3D(fromNodePos, ctrlPoint, toNodePos, t);
    const proj = project3D(pt, camera, width, height);
    if (!proj.visible) continue;

    if (first) {
      ctx.moveTo(proj.x, proj.y);
      first = false;
    } else {
      ctx.lineTo(proj.x, proj.y);
    }
  }

  // Set line width based on load factor and distance projection scaling
  const baseWidth = connection.voltage === 500 ? 5 : connection.voltage === 400 ? 3.5 : 2;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = baseWidth * camera.zoom;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Glow line core overlay
  ctx.strokeStyle = strokeFlowColor;
  ctx.lineWidth = baseWidth * 0.4 * camera.zoom;
  ctx.globalAlpha = isOverloaded ? 0.8 : 0.45;
  ctx.stroke();
  ctx.restore();

  // 4. DRAW STREAMING PAYLOAD PARTICLES (ELECTRONS)
  particles.forEach(progress => {
    // Determine 3D coordination coordinates along connection path
    const particlePt = getBezierPoint3D(fromNodePos, ctrlPoint, toNodePos, progress);
    const proj = project3D(particlePt, camera, width, height);

    if (proj.visible) {
      ctx.save();
      // Glowing particle circle
      ctx.fillStyle = isOverloaded ? '#ffffff' : strokeFlowColor;
      ctx.shadowColor = strokeFlowColor;
      ctx.shadowBlur = 8;
      
      const pSize = (connection.voltage === 500 ? 3.5 : 2.5) * proj.scale;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, pSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });
}
