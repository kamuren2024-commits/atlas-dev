import React from 'react';
import { CameraState, Point3D } from './types';

// Mathematical projection helper
export function project3D(
  pt: Point3D,
  camera: CameraState,
  width: number,
  height: number
) {
  // Translate point relative to pan focal point
  const x = pt.x - camera.panX;
  const y = pt.y - camera.panY;
  const z = pt.z;

  // Orbit rotation around center (yaw)
  const cosY = Math.cos(camera.yaw);
  const sinY = Math.sin(camera.yaw);
  const rx = x * cosY - y * sinY;
  const ry = x * sinY + y * cosY;
  const rz = z;

  // Pitch rotation (tilt angle)
  const cosP = Math.cos(camera.pitch);
  const sinP = Math.sin(camera.pitch);
  const finalY = ry * cosP - rz * sinP;
  const finalZ = ry * sinP + rz * cosP;

  // Perspective calculation scale
  const d = 1000; // Focal depth constant
  const scale = (d / (d + finalZ)) * camera.zoom;

  const screenX = width / 2 + rx * scale;
  const screenY = height / 2 + finalY * scale;

  return {
    x: screenX,
    y: screenY,
    scale,
    depth: finalZ,
    visible: finalZ > -d // Cull behind camera
  };
}

interface GridProps {
  ctx: CanvasRenderingContext2D;
  camera: CameraState;
  width: number;
  height: number;
}

export function drawGridEnvironment({ ctx, camera, width, height }: GridProps) {
  // Clear with rich deep space navy backdrop gradient
  const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, Math.max(width, height) * 0.8);
  bgGrad.addColorStop(0, '#040b21');
  bgGrad.addColorStop(0.5, '#020616');
  bgGrad.addColorStop(1, '#01030a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 1. HORIZON ATMOSPHERIC GLOW & FOG
  // Drawing horizontal atmospheric bands and fading grids into the distance (Z-depth)
  const is3D = camera.pitch > 0.15;
  if (is3D) {
    const fogGrad = ctx.createLinearGradient(0, 0, 0, height);
    fogGrad.addColorStop(0, 'rgba(67, 56, 202, 0.08)');
    fogGrad.addColorStop(0.3, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, 0, width, height * 0.4);
  }

  // 2. PRIMARY INFRASTRUCTURE GRID (Z = 0)
  const gridSize = 1600;
  const majorSpacing = 200;
  const minorSpacing = 50;

  // Drawn using helper lines
  ctx.lineWidth = 1;

  // Minor lines (high frequency, very low alpha)
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.025)';
  for (let c = -gridSize; c <= gridSize; c += minorSpacing) {
    if (c % majorSpacing === 0) continue; // let major override
    
    // Horizontal line segment parallel to X axis
    drawLine3D(ctx, camera, width, height, { x: -gridSize, y: c, z: 0 }, { x: gridSize, y: c, z: 0 });
    // Vertical line segment parallel to Y axis
    drawLine3D(ctx, camera, width, height, { x: c, y: -gridSize, z: 0 }, { x: c, y: gridSize, z: 0 });
  }

  // Major lines (structural spacing, glowing cyan/purple)
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
  for (let c = -gridSize; c <= gridSize; c += majorSpacing) {
    if (c === 0) {
      // Primary origin axis axes
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.2)';
    } else {
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
    }
    drawLine3D(ctx, camera, width, height, { x: -gridSize, y: c, z: 0 }, { x: gridSize, y: c, z: 0 });
    drawLine3D(ctx, camera, width, height, { x: c, y: -gridSize, z: 0 }, { x: c, y: gridSize, z: 0 });
  }

  // 3. SECURE TACTICAL ORIGIN RADAR RING OVERLAYS at x:0, y:0 on floor
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
  for (let r = 100; r <= 400; r += 100) {
    drawCircle3D(ctx, camera, width, height, { x: 0, y: 0, z: 0 }, r);
  }

  // origin dot
  const originProj = project3D({ x: 0, y: 0, z: 0 }, camera, width, height);
  if (originProj.visible) {
    ctx.fillStyle = 'rgba(14, 165, 233, 0.5)';
    ctx.beginPath();
    ctx.arc(originProj.x, originProj.y, 2 * originProj.scale, 0, Math.PI * 2);
    ctx.fill();

    // Origin text label
    ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.font = `${Math.floor(8 * originProj.scale)}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('NEXUS ORIGIN [N_00]', originProj.x, originProj.y + 12 * originProj.scale);
  }

  // 4. COORDINATE TICK LABELS (Simulating tactical geospatial coordinate grid)
  const tickCoordinates = [
    { x: -450, y: -210, label: '34.25°E / 1.12°N' },
    { x: -330, y: -45, label: '35.40°E / 0.50°S' },
    { x: -165, y: 30, label: '36.82°E / 1.30°S' },
    { x: 60, y: -105, label: '38.10°E / 0.90°S' },
    { x: 195, y: 105, label: '39.60°E / 2.10°S' },
    { x: 450, y: 240, label: '40.15°E / 4.05°S' }
  ];

  ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
  ctx.font = '8px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';

  tickCoordinates.forEach(tc => {
    const proj = project3D({ x: tc.x, y: tc.y, z: 0 }, camera, width, height);
    if (proj.visible) {
      // Draw a tiny plus icon on the grid floor
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.beginPath();
      ctx.moveTo(proj.x - 4, proj.y);
      ctx.lineTo(proj.x + 4, proj.y);
      ctx.moveTo(proj.x, proj.y - 4);
      ctx.lineTo(proj.x, proj.y + 4);
      ctx.stroke();

      ctx.fillText(tc.label, proj.x + 8, proj.y + 3);
    }
  });
}

// Draw a line segment in 3D perspective
export function drawLine3D(
  ctx: CanvasRenderingContext2D,
  camera: CameraState,
  width: number,
  height: number,
  p1: Point3D,
  p2: Point3D
) {
  const pr1 = project3D(p1, camera, width, height);
  const pr2 = project3D(p2, camera, width, height);

  if (pr1.visible && pr2.visible) {
    // Check fog fading based on depth (Z axis coordinate)
    // Larger depth (closer to fog horizon limit) is faded out more
    const maxDepth = 600;
    const avgDepth = (pr1.depth + pr2.depth) / 2;
    let depthAlpha = 1 - Math.max(0, Math.min(1, avgDepth / maxDepth));
    
    // Enhance alpha for top-down 2D modes so lines aren't overly faded
    if (camera.pitch < 0.15) depthAlpha = 1;

    ctx.save();
    ctx.globalAlpha *= depthAlpha;
    ctx.beginPath();
    ctx.moveTo(pr1.x, pr1.y);
    ctx.lineTo(pr2.x, pr2.y);
    ctx.stroke();
    ctx.restore();
  }
}

// Draw a 3D horizontal circle on the Z plane
export function drawCircle3D(
  ctx: CanvasRenderingContext2D,
  camera: CameraState,
  width: number,
  height: number,
  center: Point3D,
  radius: number
) {
  const segments = 64;
  ctx.beginPath();
  let first = true;

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const pt: Point3D = {
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
      z: center.z
    };
    const proj = project3D(pt, camera, width, height);
    if (!proj.visible) continue;

    if (first) {
      ctx.moveTo(proj.x, proj.y);
      first = false;
    } else {
      ctx.lineTo(proj.x, proj.y);
    }
  }
  ctx.stroke();
}
